// ==================== 交互处理：所有改动都 saveState() ====================
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function commit(rerender = true) { saveState(); if (rerender) render(); }

// 滑块拖动时只更新旁边的数字，不整页重绘（避免失焦）；松手(change)后再整页刷新
function updateRangeLabel(id, text) {
  const label = document.querySelector(`label[for="${id}"] span`);
  if (label) label.textContent = text;
}

// ---------- 入住清单 ----------
function recStep(n) { S.recommend.step = Math.min(3, Math.max(1, n)); commit(); window.scrollTo(0, 0); }
function recSet(key, val) {
  S.recommend[key] = num(val);
  if (key === 'rentMonths') updateRangeLabel('rentMonths', `${S.recommend.rentMonths} 个月`);
  if (key === 'budget') updateRangeLabel('budget', yuan(S.recommend.budget));
  commit(false);
}
function toggleRoomTag(t) {
  const tags = S.recommend.roomTags;
  const group = ROOM_GROUPS.find(g => g.tags.includes(t));
  if (tags.includes(t)) S.recommend.roomTags = tags.filter(x => x !== t);
  else {
    // 同组互斥（如 整租/合租、独卫/公卫），朝向组允许多选
    const exclusive = group && group.single;
    S.recommend.roomTags = exclusive ? tags.filter(x => !group.tags.includes(x)).concat(t) : tags.concat(t);
  }
  commit();
}
function toggleHabit(id) {
  const h = S.recommend.habits;
  S.recommend.habits = h.includes(id) ? h.filter(x => x !== id) : h.concat(id);
  commit();
}
function addCustomHabit() {
  const el = document.getElementById('customHabitInput');
  const v = (el?.value || '').trim();
  if (!v) return showFieldError('customHabitInput', '先写个习惯');
  if (S.recommend.customHabits.includes(v)) return showFieldError('customHabitInput', '已经加过了');
  S.recommend.customHabits.push(v.slice(0, 12));
  commit(); toast('已添加');
}
function removeCustomHabit(i) { S.recommend.customHabits.splice(i, 1); commit(); }
function addCustomItem() {
  const name = (document.getElementById('customItemName')?.value || '').trim();
  const price = num(document.getElementById('customItemPrice')?.value);
  const type = document.getElementById('customItemType')?.value || 'must';
  showFieldError('customItemName', ''); showFieldError('customItemPrice', '');
  if (!name) return showFieldError('customItemName', '写一下物品名称');
  if (!(price > 0) || price > 100000) return showFieldError('customItemPrice', '价格填 1 到 100000 之间的数字');
  S.recommend.customItems.push({ name: name.slice(0, 20), price: Math.round(price), emoji: getEmoji(name), mustBuy: type === 'must', reason: '你自己加的' });
  commit(); toast('已添加到' + (type === 'must' ? '必买' : '可缓'));
}
function removeCustomItem(i) { S.recommend.customItems.splice(i, 1); commit(); }
function generateRecommend() { S.recommend.showResults = true; commit(); window.scrollTo(0, 0); }
function recommendReset() { S.recommend.showResults = false; S.recommend.step = 1; commit(); window.scrollTo(0, 0); }
function addToInventoryFromRec(id) {
  const g = goodsDatabase.find(x => x.id === id);
  if (!g) return;
  if (S.inventory.some(i => i.goodsId === id && i.status !== 'sold')) return toast('物品库里已经有了');
  S.inventory.push({ id: uid(), goodsId: id, name: g.name, emoji: g.emoji, price: goodsPrice(g), boughtAt: todayStr(), weight: g.weight, soldPrice: 0, status: 'using' });
  commit(false); toast('✓ 已记进我的物品');
}

// ---------- 买还是租 ----------
function borSelect(id) {
  S.buyOrRent.selectedId = id; S.buyOrRent.showResult = false; commit();
  setTimeout(() => document.getElementById('borSettings')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 30);
}
function borToggleAdd(open) { S.buyOrRent.showAdd = open ?? !S.buyOrRent.showAdd; commit(); if (S.buyOrRent.showAdd) setTimeout(() => document.getElementById('borNewName')?.focus(), 30); }
function borAddCustom() {
  const v = id => document.getElementById(id)?.value ?? '';
  const name = v('borNewName').trim();
  const buyPrice = num(v('borNewBuy')), rentPrice = num(v('borNewRent'));
  const storageDiff = v('borNewSize') || '低';
  const resaleValue = Math.min(90, Math.max(0, num(v('borNewResale'), 40)));
  const maintainCost = Math.max(0, num(v('borNewMaintain'), 0));
  ['borNewName', 'borNewBuy', 'borNewRent'].forEach(id => showFieldError(id, ''));
  if (!name) return showFieldError('borNewName', '写一下物品名称');
  if (borItems().some(i => i.name === name.slice(0, 16))) return showFieldError('borNewName', '已经有这件了，直接在上面选');
  if (!(buyPrice > 0) || buyPrice > 1000000) return showFieldError('borNewBuy', '买价填大于 0 的数字');
  if (!(rentPrice > 0) || rentPrice > 100000) return showFieldError('borNewRent', '单次租金填大于 0 的数字');
  const id = 'c' + uid();
  S.buyOrRent.customItems.push({ id, name: name.slice(0, 16), icon: getEmoji(name), buyPrice: Math.round(buyPrice), rentPrice: Math.round(rentPrice), maintainCost: Math.round(maintainCost), storageDiff, resaleValue: Math.round(resaleValue), custom: true });
  Object.assign(S.buyOrRent, { selectedId: id, showAdd: false, showResult: false });
  commit(); toast('✓ 已添加并选中');
}
function borRemoveCustom(id) {
  const it = S.buyOrRent.customItems.find(i => i.id === id);
  if (!it || !window.confirm(`删除自定义物品「${it.name}」？`)) return;
  S.buyOrRent.customItems = S.buyOrRent.customItems.filter(i => i.id !== id);
  delete S.priceOverrides['rb:' + id]; delete S.priceOverrides['rr:' + id];
  if (S.buyOrRent.selectedId === id) { S.buyOrRent.selectedId = null; S.buyOrRent.showResult = false; }
  commit(); toast('已删除');
}
function borSet(key, val) {
  S.buyOrRent[key] = num(val);
  if (key === 'months') updateRangeLabel('borMonths', `${S.buyOrRent.months} 个月`);
  if (key === 'useCount') updateRangeLabel('borUse', `${S.buyOrRent.useCount} 次`);
  commit(false);
}
function borCalc() {
  if (S.buyOrRent.months == null) S.buyOrRent.months = S.recommend.rentMonths;
  S.buyOrRent.showResult = true; commit(); window.scrollTo(0, 0);
}
function borReset() { S.buyOrRent.showResult = false; commit(); window.scrollTo(0, 0); }
function setOverride(key, val) {
  const n = num(val);
  if (n > 0 && n <= 1000000) { S.priceOverrides[key] = Math.round(n); toast('已改成你的价格'); }
  else { delete S.priceOverrides[key]; toast('已恢复估算价'); }
  commit();
}

// ---------- 转卖文案 ----------
function mvSet(key, val, rerender = false) {
  S.moving[key] = key === 'condition' ? num(val, 8) : val;
  if (key === 'condition') { updateRangeLabel('mvCond', `${S.moving.condition}/10`); commit(false); return; }
  commit(rerender);
}
function generateMoving() {
  const m = S.moving;
  const ok = showFieldError('mvName', m.itemName.trim() ? '' : '写一下卖什么')
    && showFieldError('mvPrice', num(m.originalPrice) > 0 ? '' : '原价要大于 0')
    && showFieldError('mvMonths', m.useMonths !== '' && num(m.useMonths, -1) >= 0 && num(m.useMonths) <= 240 ? '' : '填 0 到 240 之间的月数');
  if (!ok) return;
  m.itemName = m.itemName.trim().slice(0, 30);
  m.showResult = true; commit(); window.scrollTo(0, 0);
}
function movingReset() { S.moving.showResult = false; commit(); window.scrollTo(0, 0); }
function copyListing(part) {
  const o = LAST_LISTING || buildListing(S.moving);
  const tags = o.tags.map(t => '#' + t).join(' ');
  const text = part === 'title' ? o.title : part === 'body' ? o.body : `${o.title}\n\n${o.body}\n\n${tags}`;
  copyText(text, part === 'title' ? '标题已复制' : part === 'body' ? '正文已复制' : '全部已复制，去闲鱼粘贴吧');
}
function pickFromInventory(id) {
  const i = S.inventory.find(x => String(x.id) === String(id));
  if (!i) return;
  const used = i.boughtAt ? Math.max(0, Math.round(daysBetween(i.boughtAt, todayStr()) / 30)) : '';
  Object.assign(S.moving, { itemName: i.name, originalPrice: String(i.price), useMonths: String(used), showResult: false });
  saveState();
  if (location.hash !== '#/moving') location.hash = '#/moving'; else render();
}

// ---------- 我的物品 / 退租清算 ----------
function invAdd() {
  const name = (document.getElementById('invName')?.value || '').trim();
  const price = num(document.getElementById('invPrice')?.value);
  const date = document.getElementById('invDate')?.value || todayStr();
  const weight = document.getElementById('invWeight')?.value || '轻';
  showFieldError('invName', ''); showFieldError('invPrice', '');
  if (!name) return showFieldError('invName', '写一下物品名称');
  if (!(price > 0) || price > 1000000) return showFieldError('invPrice', '入手价要大于 0');
  S.inventory.unshift({ id: uid(), name: name.slice(0, 20), emoji: getEmoji(name), price: Math.round(price), boughtAt: date, weight, soldPrice: 0, status: 'using' });
  commit(); toast('✓ 已加入');
}
function invMarkSold(id) {
  const i = S.inventory.find(x => String(x.id) === String(id));
  if (!i) return;
  const used = i.boughtAt ? Math.round(daysBetween(i.boughtAt, todayStr()) / 30) : 6;
  const guess = computeResale(i.price, used, 7).suggested;
  const v = window.prompt(`「${i.name}」实际卖了多少钱？`, String(guess));
  if (v === null) return;
  const n = num(v, -1);
  if (n < 0) return toast('请输入数字');
  i.soldPrice = Math.round(n); i.status = 'sold';
  commit(); toast('✓ 已记录卖出');
}
function invDelete(id) {
  const i = S.inventory.find(x => String(x.id) === String(id));
  if (!i || !window.confirm(`删除「${i.name}」？`)) return;
  S.inventory = S.inventory.filter(x => x !== i);
  commit(); toast('已删除');
}
function copySettleListings() {
  const r = computeSettlement(S.inventory, S.recommend.rentMonths);
  if (!r.sell.length) return toast('没有建议卖的物品');
  const text = r.sell.map((x, k) => {
    const o = buildListing({ itemName: x.name, originalPrice: x.price, useMonths: x.usedMonths, condition: 7, tone: 'casual' });
    return `【${k + 1}】${o.title}\n${o.body}`;
  }).join('\n\n———\n\n');
  copyText(text, `已复制 ${r.sell.length} 条转卖文案`);
}

// ---------- 退租倒计时 / 验房 / 搬家 ----------
function leaseSet(key, val) {
  S.lease[key] = val;
  const { moveIn, moveOut } = S.lease;
  showFieldError('leaseOut', moveIn && moveOut && moveOut <= moveIn ? '退租日期要晚于入住日期' : '');
  commit();
}
function inspectToggle(k) {
  if (S.inspect[k]) delete S.inspect[k]; else S.inspect[k] = true;
  commit();
}
function inspectReset() {
  if (!Object.keys(S.inspect).length) return toast('还没有勾选');
  if (!window.confirm('清空所有勾选？')) return;
  S.inspect = {}; commit(); toast('已清空');
}
function moveSet(key, val) {
  if (key === 'mode') S.moveCalc.mode = val;
  else S.moveCalc[key] = Math.max(0, num(val));
  commit();
}

// ---------- 设置 ----------
function exportData() { copyText(JSON.stringify(S), '备份已复制，粘贴到备忘录保存'); }
let resetArmed = 0;
function resetData() {
  if (Date.now() - resetArmed > 3000) { resetArmed = Date.now(); return toast('再点一次确认清空（不可恢复）'); }
  resetArmed = 0; clearAllData(); saveState(); render(); toast('已清空全部数据');
}
