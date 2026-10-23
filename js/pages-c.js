// ==================== F2 我的物品 ====================
function renderInventory() {
  const inv = S.inventory;
  const using = inv.filter(i => i.status !== 'sold'), sold = inv.filter(i => i.status === 'sold');
  const spent = inv.reduce((s, i) => s + (Number(i.price) || 0), 0);
  const back = sold.reduce((s, i) => s + (Number(i.soldPrice) || 0), 0);
  const row = i => `
    <li class="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0">
      <span class="text-2xl flex-shrink-0" aria-hidden="true">${i.emoji || getEmoji(i.name)}</span>
      <div class="min-w-0 flex-1">
        <div class="font-medium text-stone-900 truncate">${escapeHtml(i.name)}</div>
        <div class="text-xs text-stone-600 mt-0.5">入手 ${yuan(i.price)}${i.boughtAt ? ' · ' + escapeHtml(i.boughtAt) : ''} · ${escapeHtml(i.weight || '轻')}物${i.status === 'sold' ? ` · <span class="text-primary-700 font-medium">卖了 ${yuan(i.soldPrice)}</span>` : ''}</div>
      </div>
      ${i.status !== 'sold'
        ? `<button type="button" onclick="invMarkSold('${i.id}')" class="text-xs px-2.5 py-1.5 rounded-lg bg-primary-50 text-primary-800 border border-primary-200 flex-shrink-0">已卖出</button>
           <a href="#/moving" onclick="pickFromInventory('${i.id}')" class="text-xs px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-800 flex-shrink-0">写文案</a>`
        : ''}
      <button type="button" onclick="invDelete('${i.id}')" class="text-stone-500 p-1 flex-shrink-0" aria-label="删除 ${escapeHtml(i.name)}">${icon('trash', 16)}</button>
    </li>`;
  return `
    <div class="page">
      ${pageHeader('我的物品', '买了什么记一笔，退租时一键清算')}
      <div class="grid grid-cols-3 gap-2 mb-4 text-center">
        <div class="bg-white rounded-2xl p-3 border border-stone-200"><div class="text-lg font-bold text-stone-900">${using.length}</div><div class="text-xs text-stone-600">在用</div></div>
        <div class="bg-white rounded-2xl p-3 border border-stone-200"><div class="text-lg font-bold text-stone-900">${yuan(spent)}</div><div class="text-xs text-stone-600">累计投入</div></div>
        <div class="bg-white rounded-2xl p-3 border border-stone-200"><div class="text-lg font-bold text-primary-700">${yuan(back)}</div><div class="text-xs text-stone-600">已卖回</div></div>
      </div>
      ${card(`
        <h2 class="text-sm font-semibold text-stone-800 mb-3">添加物品</h2>
        <label for="invName" class="sr-only">物品名称</label>
        <input id="invName" type="text" maxlength="20" placeholder="物品名称，如：折叠桌" class="input w-full">
        ${fieldError('invName')}
        <div class="grid grid-cols-3 gap-2 mt-2">
          <div><label for="invPrice" class="text-xs text-stone-600">入手价</label><input id="invPrice" type="number" min="1" inputmode="numeric" class="input w-full mt-1"></div>
          <div><label for="invDate" class="text-xs text-stone-600">购买日期</label><input id="invDate" type="date" value="${todayStr()}" class="input w-full mt-1 px-2"></div>
          <div><label for="invWeight" class="text-xs text-stone-600">搬起来</label><select id="invWeight" class="input w-full mt-1 bg-white px-2"><option value="轻">轻</option><option value="中">中</option><option value="重">重</option></select></div>
        </div>
        ${fieldError('invPrice')}
        <button type="button" onclick="invAdd()" class="btn-press w-full mt-3 bg-primary-600 text-white py-3 rounded-xl font-semibold">加入</button>`)}
      ${card(`
        <h2 class="text-sm font-semibold text-stone-800 mb-1">全部物品</h2>
        ${inv.length ? `<ul>${inv.map(row).join('')}</ul>` : `<p class="text-sm text-stone-600 py-6 text-center">还没有记录。在入住清单结果页点“买了，记进我的物品”也会自动加进来。</p>`}`)}
      ${using.length ? `<a href="#/settle" class="btn-press block text-center gradient-card text-white py-3.5 rounded-2xl font-bold">退租清算 ›</a>` : ''}
    </div>`;
}

// ==================== F3 退租清算 ====================
function renderSettle() {
  const r = computeSettlement(S.inventory, S.recommend.rentMonths);
  if (!S.inventory.length) {
    return `<div class="page">${pageHeader('退租清算', '卖什么、带什么、回多少钱')}
      ${card(`<p class="text-sm text-stone-700 text-center py-4">物品库还是空的，先记下你买过的东西。</p>
      <a href="#/inventory" class="btn-press block text-center bg-primary-600 text-white py-3 rounded-xl font-semibold">去记录</a>`)}</div>`;
  }
  const line = (x, tone) => `
    <li class="flex items-center gap-3 py-2.5 border-b border-stone-100 last:border-0">
      <span class="text-xl flex-shrink-0" aria-hidden="true">${x.emoji || getEmoji(x.name)}</span>
      <div class="min-w-0 flex-1"><div class="text-sm font-medium text-stone-900 truncate">${escapeHtml(x.name)}</div>
        <div class="text-xs text-stone-600">用了约 ${x.usedMonths} 个月 · ${tone === 'sell' ? `建议挂 ${yuan(x.suggested)}` : `搬走约 ${yuan(x.move)}`}</div></div>
      ${tone === 'sell' ? `<a href="#/moving" onclick="pickFromInventory('${x.id}')" class="text-xs px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-800 flex-shrink-0">写文案</a>` : ''}
    </li>`;
  return `
    <div class="page">
      ${pageHeader('退租清算', '卖什么、带什么、回多少钱', '/inventory')}
      <div class="gradient-card rounded-2xl p-5 text-white mb-4 shadow-lg" role="status">
        <div class="text-sm text-primary-100">这次退租预计能卖回</div>
        <div class="text-4xl font-bold my-1">${yuan(r.expectIncome)}</div>
        <div class="text-xs text-primary-100">带走的东西搬家约 ${yuan(r.takeCost)} · 已实际卖回 ${yuan(r.actualIncome)} / 累计投入 ${yuan(r.spent)}</div>
      </div>
      ${card(`<h2 class="font-semibold text-stone-900 mb-1">建议卖掉（${r.sell.length}）</h2>
        ${r.sell.length ? `<ul>${r.sell.map(x => line(x, 'sell')).join('')}</ul>` : '<p class="text-sm text-stone-600">没有特别建议卖的</p>'}`)}
      ${card(`<h2 class="font-semibold text-stone-900 mb-1">建议带走（${r.take.length}）</h2>
        ${r.take.length ? `<ul>${r.take.map(x => line(x, 'take')).join('')}</ul>` : '<p class="text-sm text-stone-600">没有需要带走的</p>'}`)}
      <button type="button" onclick="copySettleListings()" class="btn-press w-full gradient-card text-white py-3.5 rounded-2xl font-bold mb-2">复制全部转卖文案</button>
      ${hint('判断口径：按 7 成新估价；重物，或者卖回的钱超过搬运成本 2 倍的，建议卖掉；其余建议带走。卖出后回“我的物品”点“已卖出”记下实际价格。')}
    </div>`;
}

// ==================== F4 退租倒计时 ====================
function renderLease() {
  const l = S.lease, r = computeLease(l);
  const color = !r ? '' : r.left <= 7 ? 'rose' : r.left <= 30 ? 'amber' : 'primary';
  return `
    <div class="page">
      ${pageHeader('退租倒计时', '到点提醒你卖东西、约搬家、退押金')}
      ${card(`
        <div class="grid grid-cols-2 gap-3">
          <div><label for="leaseIn" class="text-sm font-medium text-stone-700">入住日期</label><input id="leaseIn" type="date" value="${escapeHtml(l.moveIn)}" onchange="leaseSet('moveIn', this.value)" class="input w-full mt-1 px-2"></div>
          <div><label for="leaseOut" class="text-sm font-medium text-stone-700">退租日期</label><input id="leaseOut" type="date" value="${escapeHtml(l.moveOut)}" onchange="leaseSet('moveOut', this.value)" class="input w-full mt-1 px-2"></div>
          <div><label for="leaseRent" class="text-sm font-medium text-stone-700">月租（元）</label><input id="leaseRent" type="number" min="0" inputmode="numeric" value="${escapeHtml(l.rent)}" onchange="leaseSet('rent', this.value)" class="input w-full mt-1"></div>
          <div><label for="leaseDep" class="text-sm font-medium text-stone-700">押金（元）</label><input id="leaseDep" type="number" min="0" inputmode="numeric" value="${escapeHtml(l.deposit)}" onchange="leaseSet('deposit', this.value)" class="input w-full mt-1"></div>
        </div>
        ${fieldError('leaseOut')}`)}
      ${!r ? card('<p class="text-sm text-stone-600 text-center py-3">填上退租日期就开始倒计时。</p>') : `
        <div class="rounded-2xl p-5 mb-4 text-center bg-${color}-50 border border-${color}-200" role="status">
          <div class="text-sm text-${color}-800">${r.left > 0 ? '距离退租还有' : r.left === 0 ? '今天退租' : '已过退租日'}</div>
          <div class="text-5xl font-bold text-${color}-800 my-1">${Math.abs(r.left)}<span class="text-lg ml-1">天</span></div>
          ${r.progress !== null ? `<div class="h-2 bg-white rounded-full overflow-hidden mt-3" aria-label="租期已过 ${r.progress}%"><div class="h-full bg-${color}-500" style="width:${r.progress}%"></div></div><div class="text-xs text-${color}-800 mt-1">租期已过 ${r.progress}%</div>` : ''}
          ${Number(l.deposit) > 0 ? `<div class="text-xs text-${color}-800 mt-2">押金 ${yuan(l.deposit)} 待退，交接前对照验房清单拍照</div>` : ''}
        </div>
        ${card(`<h2 class="font-semibold text-stone-900 mb-2">行动清单</h2>
          <ol class="space-y-0">${LEASE_MILESTONES.map(m => { const due = r.left <= m.days; return `
            <li class="flex items-start gap-3 py-2.5 border-b border-stone-100 last:border-0">
              <span class="text-xs font-bold w-14 flex-shrink-0 pt-0.5 ${due ? 'text-' + color + '-700' : 'text-stone-500'}">剩${m.days}天</span>
              <span class="text-sm ${due ? 'text-stone-900 font-medium' : 'text-stone-600'}">${escapeHtml(m.text)}</span>
            </li>`; }).join('')}</ol>`)}
        <div class="grid grid-cols-3 gap-2">
          <a href="#/settle" class="btn-press text-center bg-white border border-stone-300 rounded-xl py-3 text-sm font-medium text-stone-800">退租清算</a>
          <a href="#/move-cost" class="btn-press text-center bg-white border border-stone-300 rounded-xl py-3 text-sm font-medium text-stone-800">搬家估算</a>
          <a href="#/inspect" class="btn-press text-center bg-white border border-stone-300 rounded-xl py-3 text-sm font-medium text-stone-800">验房清单</a>
        </div>`}
    </div>`;
}

// ==================== F5 验房清单 ====================
function renderInspect() {
  const done = S.inspect;
  const total = INSPECT_LIST.reduce((s, g) => s + g.items.length, 0);
  const checked = INSPECT_LIST.reduce((s, g) => s + g.items.filter(it => done[g.group + '|' + it]).length, 0);
  const pct = Math.round(checked / total * 100);
  return `
    <div class="page">
      ${pageHeader('验房清单', '入住拍一遍、退租对一遍，押金才拿得回')}
      <div class="sticky-summary bg-white rounded-2xl p-4 mb-4 border border-stone-200 shadow-sm">
        <div class="flex justify-between text-sm"><span class="font-semibold text-stone-800">已完成 ${checked}/${total}</span><span class="text-stone-600">${pct}%</span></div>
        <div class="h-2 bg-stone-100 rounded-full mt-2 overflow-hidden"><div class="h-full bg-primary-500" style="width:${pct}%"></div></div>
      </div>
      ${INSPECT_LIST.map(g => card(`
        <h2 class="font-semibold text-stone-900 mb-1">${escapeHtml(g.group)}</h2>
        <ul>${g.items.map((it, i) => { const k = g.group + '|' + it, on = !!done[k], id = 'ck-' + INSPECT_LIST.indexOf(g) + '-' + i; return `
          <li class="border-b border-stone-100 last:border-0"><label for="${id}" class="flex items-start gap-3 py-2.5 cursor-pointer">
            <input id="${id}" type="checkbox" ${on ? 'checked' : ''} onchange="inspectToggle(${JSON.stringify(k).replace(/"/g, '&quot;')})" class="mt-0.5 w-5 h-5 accent-emerald-600 flex-shrink-0">
            <span class="text-sm leading-snug ${on ? 'text-stone-500 line-through' : 'text-stone-800'}">${escapeHtml(it)}</span></label></li>`; }).join('')}</ul>`)).join('')}
      <button type="button" onclick="inspectReset()" class="btn-press w-full bg-white text-stone-800 py-3 rounded-2xl font-semibold border border-stone-300">清空勾选（换房子时用）</button>
      ${hint('照片比勾选更重要：每一项拍照或录视频，发给房东留底。')}
    </div>`;
}

// ==================== F6 搬家估算 ====================
function renderMoveCost() {
  const mc = S.moveCalc, r = computeMoveCost(mc);
  const num = (id, key, label, max, unit) => `
    <div><label for="${id}" class="text-sm font-medium text-stone-700">${label}</label>
      <div class="flex items-center gap-2 mt-1"><input id="${id}" type="number" min="0" max="${max}" inputmode="numeric" value="${escapeHtml(mc[key])}" onchange="moveSet('${key}', this.value)" class="input w-full"><span class="text-sm text-stone-600 flex-shrink-0">${unit}</span></div></div>`;
  const rows = [['运输费', r.transport], ['纸箱 / 打包材料', r.materials], ['大件搬运', r.bulkyFee], ['无电梯楼层费', r.floorFee], ['请假成本', r.dayOff]].filter(x => x[1] > 0);
  return `
    <div class="page">
      ${pageHeader('搬家估算', '搬一次到底花多少，先算再决定买不买大件')}
      ${card(`
        <div class="text-sm font-medium text-stone-700 mb-2" id="mode-label">搬家方式</div>
        <div class="space-y-2" role="radiogroup" aria-labelledby="mode-label">
          ${MOVE_PARAMS.modes.map(m => `<button type="button" role="radio" aria-checked="${mc.mode === m.id}" onclick="moveSet('mode', '${m.id}')" class="w-full p-3 rounded-xl text-left border-2 btn-press ${mc.mode === m.id ? 'border-primary-500 bg-primary-50' : 'border-transparent bg-stone-50'}">
            <div class="font-semibold text-stone-900 text-sm">${m.label}</div><div class="text-xs text-stone-600 mt-0.5">${m.note}</div></button>`).join('')}
        </div>
        <div class="grid grid-cols-2 gap-3 mt-4">
          ${num('mcKm', 'km', '距离', 500, '公里')}${num('mcBoxes', 'boxes', '箱子数', 100, '箱')}
          ${num('mcBulky', 'bulky', '大件数', 30, '件')}${num('mcFloors', 'floors', '无电梯楼层', 30, '层')}
        </div>
        <div class="mt-3">${num('mcDay', 'dayOff', '请假 / 误工成本（可选）', 99999, '元')}</div>`)}
      <div class="gradient-card rounded-2xl p-5 text-white mb-4 shadow-lg" role="status">
        <div class="text-sm text-primary-100">预计这次搬家花</div>
        <div class="text-4xl font-bold my-1">${yuan(r.total)}</div>
        <div class="space-y-1 mt-3 text-sm">${rows.map(([k, v]) => `<div class="flex justify-between"><span class="text-primary-100">${k}</span><span class="font-semibold">${yuan(v)}</span></div>`).join('')}</div>
      </div>
      ${card(`<p class="text-sm text-stone-700 leading-relaxed">平摊到你 ${S.recommend.rentMonths} 个月的租期，每月约 <strong>${yuan(r.total / Math.max(1, S.recommend.rentMonths))}</strong>。每多一件大件，搬一次就多约 ${yuan(MOVE_PARAMS.bulkyFee)}。</p>
        ${hint('均为估算：起步价、每公里价、楼层费按一线城市常见报价取中位，实际以平台报价为准。')}`)}
    </div>`;
}

// ==================== 价格与数据设置（D1） ====================
function renderSettings() {
  const overrides = Object.keys(S.priceOverrides).filter(k => S.priceOverrides[k] > 0).length;
  return `
    <div class="page">
      ${pageHeader('价格与数据', '价格从哪来、怎么改、数据存在哪')}
      ${card(`<h2 class="font-semibold text-stone-900 mb-2">价格来源</h2>
        <p class="text-sm text-stone-700 leading-relaxed">${escapeHtml(PRICE_META.source)}</p>
        <p class="text-xs text-stone-600 mt-1">更新于 ${escapeHtml(PRICE_META.updated)} · 闲鱼成交价不公开，二手价为估算比例</p>`)}
      ${card(`<h2 class="font-semibold text-stone-900 mb-1">改成你看到的价格</h2>
        <p class="text-xs text-stone-600 mb-3">留空 = 用估算价。改过 ${overrides} 项。</p>
        <ul class="divide-y divide-stone-100 max-h-[60vh] overflow-y-auto">
          ${goodsDatabase.map(g => `<li class="flex items-center gap-2 py-2">
            <span aria-hidden="true">${g.emoji}</span>
            <label for="ov-${g.id}" class="text-sm text-stone-800 flex-1 min-w-0 truncate">${escapeHtml(g.name)}</label>
            <input id="ov-${g.id}" type="number" min="1" inputmode="numeric" placeholder="${remotePrices?.goods?.[g.id]?.price || g.price}" value="${S.priceOverrides['g:' + g.id] || ''}" onchange="setOverride('g:${g.id}', this.value)" class="input w-24 py-2 text-right ${isOverridden('g:' + g.id) ? 'border-primary-400' : ''}">
          </li>`).join('')}
        </ul>`)}
      ${card(`<h2 class="font-semibold text-stone-900 mb-2">你的数据</h2>
        <p class="text-sm text-stone-700 leading-relaxed">所有设定、物品和勾选只保存在这台设备的浏览器里，不上传任何服务器。换手机或清浏览器缓存会丢失。</p>
        <div class="grid grid-cols-2 gap-2 mt-3">
          <button type="button" onclick="exportData()" class="btn-press bg-white border border-stone-300 rounded-xl py-3 text-sm font-medium text-stone-800">复制备份</button>
          <button type="button" onclick="resetData()" class="btn-press bg-white border border-rose-300 rounded-xl py-3 text-sm font-medium text-rose-700">清空全部数据</button>
        </div>`)}
    </div>`;
}
