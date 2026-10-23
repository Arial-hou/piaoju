// ==================== 买还是租 ====================
function renderBuyOrRent() {
  const st = S.buyOrRent;
  const item = buyOrRentItems.find(i => i.id === st.selectedId) || null;
  const months = st.months ?? S.recommend.rentMonths;

  if (st.showResult && item) {
    const r = computeBuyOrRent(item, months, st.useCount);
    const advice = { close: '差不多，看心情', buy: '建议购买', rent: '建议租用' }[r.verdict];
    const tone = { close: 'bg-stone-700', buy: 'gradient-card', rent: 'bg-amber-600' }[r.verdict];
    const reason = r.closeCall
      ? `在你住的 ${months} 个月里，两种方式只差 ${yuan(Math.abs(r.diff))}。东西大、存放难就租；想随时用就买。`
      : r.diff > 0
        ? `住 ${months} 个月约用 ${r.uses} 次，租要 ${yuan(r.rentTotal)}；买下来扣掉退租卖回的 ${yuan(r.resale)}，实际只花 ${yuan(r.buyNet)}，买比租省 ${yuan(r.diff)}。`
        : `住 ${months} 个月约用 ${r.uses} 次，租只要 ${yuan(r.rentTotal)}；买下来即使卖回 ${yuan(r.resale)}，实际也要 ${yuan(r.buyNet)}，租比买省 ${yuan(-r.diff)}。`;
    const row = (k, v, cls = 'text-stone-800') => `<div class="flex justify-between"><span class="text-stone-600">${k}</span><span class="font-semibold ${cls}">${v}</span></div>`;
    return `
      <div class="page">
        ${pageHeader('买还是租', '算上退租转卖和搬家，看哪个真省钱')}
        <div class="${tone} rounded-2xl p-5 text-center mb-4 shadow-lg text-white" role="status">
          <div class="text-4xl mb-1" aria-hidden="true">${item.icon}</div>
          <div class="text-sm opacity-90">${escapeHtml(item.name)} · 住 ${months} 个月 · 约用 ${r.uses} 次</div>
          <div class="text-3xl font-bold my-2">${advice}</div>
          <p class="text-sm opacity-95 leading-relaxed">${reason}</p>
        </div>
        <div class="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 mb-4">
          <div class="bg-white rounded-2xl p-4 shadow-sm border ${r.verdict === 'buy' ? 'border-primary-400 ring-2 ring-primary-100' : 'border-stone-200'}">
            <div class="text-xs font-medium text-stone-600 mb-1">买（实际花费）</div>
            <div class="text-2xl font-bold text-stone-900">${yuan(r.buyNet)}</div>
            <div class="mt-3 pt-3 border-t border-stone-100 space-y-1.5 text-xs">
              ${row('买入', yuan(r.buyPrice))}${row('退租卖回', '−' + yuan(r.resale), 'text-primary-700')}${row('维护', '+' + yuan(r.maintain))}${row('搬家', '+' + yuan(r.moveCost))}${row('每次合', '¥' + r.perUseBuy.toFixed(1))}
            </div>
          </div>
          <div class="bg-white rounded-2xl p-4 shadow-sm border ${r.verdict === 'rent' ? 'border-amber-400 ring-2 ring-amber-100' : 'border-stone-200'}">
            <div class="text-xs font-medium text-stone-600 mb-1">租（实际花费）</div>
            <div class="text-2xl font-bold text-stone-900">${yuan(r.rentTotal)}</div>
            <div class="mt-3 pt-3 border-t border-stone-100 space-y-1.5 text-xs">
              ${row('单次租金', yuan(r.rentPrice))}${row('次数', '×' + r.uses)}${row('存放/搬家', '无负担')}
            </div>
          </div>
        </div>
        ${card(`
          <h2 class="font-semibold text-stone-900 mb-2">换个角度看</h2>
          <ul class="space-y-2 text-sm text-stone-700">
            <li>• 用满 <strong class="text-stone-900">${r.breakEven} 次</strong>，买就比租划算；你预计用 ${r.uses} 次。</li>
            <li>• 存放难度<strong class="text-stone-900">${item.storageDiff}</strong>，${item.storageDiff === '高' ? '每次搬家都很麻烦，短租更要慎重' : item.storageDiff === '中' ? '搬家需要单独打包' : '搬家塞进行李就走'}。</li>
          </ul>
          ${hint(`口径：买 = 买入 − 退租转卖 + 维护 + 搬家；租 = 单次租金 × 次数。价格为估算${isOverridden('rb:' + item.id) || isOverridden('rr:' + item.id) ? '（已用你改过的价格）' : ''}。`)}`)}
        <button type="button" onclick="borReset()" class="btn-press w-full bg-white text-primary-700 py-3.5 rounded-2xl font-semibold border-2 border-primary-200">换一件算</button>
      </div>`;
  }

  const prices = item ? rentItemPrices(item) : null;
  return `
    <div class="page">
      ${pageHeader('买还是租', '算上退租转卖和搬家，看哪个真省钱')}
      ${card(`
        <div class="text-sm font-medium text-stone-700 mb-3" id="bor-label">选择物品</div>
        <div class="grid grid-cols-2 min-[400px]:grid-cols-3 gap-2" role="radiogroup" aria-labelledby="bor-label">
          ${buyOrRentItems.map(it => { const p = rentItemPrices(it); const sel = st.selectedId === it.id; return `
            <button type="button" role="radio" aria-checked="${sel}" onclick="borSelect(${it.id})" class="p-3 rounded-xl text-left border-2 btn-press ${sel ? 'border-primary-500 bg-primary-50' : 'border-transparent bg-stone-50'}">
              <div class="text-2xl mb-1" aria-hidden="true">${it.icon}</div>
              <div class="text-sm font-semibold text-stone-900">${escapeHtml(it.name)}</div>
              <div class="text-xs text-stone-600 mt-0.5">买${yuan(p.buyPrice)} / 租${yuan(p.rentPrice)}</div>
            </button>`; }).join('')}
        </div>`)}
      ${item ? card(`
        <label for="borMonths" class="block text-sm font-medium text-stone-700 mb-3">这套房还住多久：<span class="text-primary-700 font-bold">${months} 个月</span></label>
        <input id="borMonths" type="range" min="1" max="36" value="${months}" oninput="borSet('months', this.value)" class="w-full">
        <div class="flex justify-between text-xs text-stone-500 mt-2 mb-5"><span>1个月</span><span>36个月</span></div>
        <label for="borUse" class="block text-sm font-medium text-stone-700 mb-3">预计一年用多少次：<span class="text-primary-700 font-bold">${st.useCount} 次</span></label>
        <input id="borUse" type="range" min="1" max="100" value="${st.useCount}" oninput="borSet('useCount', this.value)" class="w-full">
        <div class="flex justify-between text-xs text-stone-500 mt-2"><span>1次</span><span>100次</span></div>
        <div class="grid grid-cols-2 gap-2 mt-5">
          <label class="text-xs text-stone-600">你看到的买价
            <input type="number" min="1" inputmode="numeric" value="${prices.buyPrice}" onchange="setOverride('rb:${item.id}', this.value)" class="input mt-1 w-full"></label>
          <label class="text-xs text-stone-600">你看到的单次租金
            <input type="number" min="1" inputmode="numeric" value="${prices.rentPrice}" onchange="setOverride('rr:${item.id}', this.value)" class="input mt-1 w-full"></label>
        </div>
        ${hint('默认是估算价；填上你在电商/租赁平台看到的价格，结论会更准。')}`) +
        `<button type="button" onclick="borCalc()" class="btn-press w-full gradient-card text-white py-4 rounded-2xl font-bold text-lg shadow-lg">帮我算算</button>` : ''}
    </div>`;
}

// ==================== 转卖文案 ====================
const TONES = [
  { id: 'casual', label: '🧘 佛系版', desc: '冷淡不夸张，有缘人来' },
  { id: 'enthusiastic', label: '🔥 热情版', desc: '活泼有感染力，多 emoji' },
  { id: 'professional', label: '📋 专业版', desc: '列参数讲细节，理性描述' },
];

function buildListing(m) {
  const name = m.itemName, price = Number(m.originalPrice) || 0, used = Number(m.useMonths) || 0, c = m.condition;
  const conditionText = c >= 9 ? '几乎全新' : c >= 7 ? '八成新' : c >= 5 ? '有使用痕迹' : '成色一般';
  const conditionDesc = c >= 9 ? '几乎没怎么用，外观无明显痕迹' : c >= 7 ? '正常使用痕迹，功能正常' : c >= 5 ? '有明显使用痕迹，功能正常' : '外观磨损较多，介意勿拍，具体以实物为准';
  const { suggested, fast } = computeResale(price, used, c);
  const dur = used < 12 ? `${used}个月` : `${(used / 12).toFixed(used % 12 ? 1 : 0)}年`;
  let title, body, tags;
  if (m.tone === 'casual') {
    title = `${name}，用了${dur}，${conditionText}`;
    body = `自用的${name}，用了${dur}，${conditionDesc}。\n\n要搬家了带不走，转给需要的人。\n\n原价¥${price}，现在¥${suggested}出。\n\n自取优先，有意私信。`;
    tags = ['自用', '搬家转让', conditionText, '自取'];
  } else if (m.tone === 'enthusiastic') {
    title = c >= 7 ? `搬家出！${name}${conditionText}，¥${suggested}带走～` : `搬家出${name}，¥${suggested}便宜带走！`;
    body = `要搬家啦，带不走的${name}找个新主人！🚚\n\n用了${dur}，${conditionDesc}${c >= 7 ? ' ✨' : '。'}\n\n原价¥${price}，现在只要¥${suggested}！💰\n\n${c >= 9 ? '真的很新，诚心转～' : c >= 7 ? '成色不错，诚心转～' : '实用不讲究的朋友来！'}私信秒回 💬`;
    tags = ['搬家急出', conditionText, c >= 7 ? '性价比高' : '实用就好', '秒回'];
  } else {
    title = `[转让] ${name} ${conditionText} ¥${suggested}`;
    body = `物品名称：${name}\n使用时长：${dur}\n物品成色：${conditionText}（${c}/10）\n成色说明：${conditionDesc}\n原价：¥${price}\n转让价：¥${suggested}\n\n转让原因：搬家不便携带。\n交易方式：支持自提，邮寄运费自理。\n可拍实物视频，私信详询。`;
    tags = [conditionText, '搬家转让', '可看实物', '支持自提'];
  }
  return { title, body, tags, suggested, fast, price, dur, c };
}

function renderMoving() {
  const m = S.moving;
  if (m.showResult) {
    const o = buildListing(m);
    LAST_LISTING = o;
    return `
      <div class="page">
        ${pageHeader('转卖文案', '没用的东西变成钱，文案不用自己想')}
        <div class="gradient-card rounded-2xl p-5 text-white text-center mb-4 shadow-lg" role="status">
          <div class="text-sm text-primary-100 font-medium">建议售价</div>
          <div class="text-5xl font-bold my-1">${yuan(o.suggested)}</div>
          <div class="text-sm text-primary-100">原价${yuan(o.price)} · 用了${o.dur} · 成色${o.c}/10</div>
          <div class="text-xs text-primary-100 mt-2">赶时间搬家？挂 ${yuan(o.fast)} 更容易快速出手</div>
        </div>
        ${card(`<div class="flex items-center justify-between mb-3"><h2 class="text-sm font-semibold text-stone-700">标题</h2>
          <button type="button" onclick="copyListing('title')" class="btn-press px-3 py-1.5 rounded-lg text-sm bg-stone-100 text-stone-800">复制</button></div>
          <p class="text-stone-900 font-medium bg-stone-50 p-3 rounded-xl break-words">${escapeHtml(o.title)}</p>`)}
        ${card(`<div class="flex items-center justify-between mb-3"><h2 class="text-sm font-semibold text-stone-700">正文</h2>
          <button type="button" onclick="copyListing('body')" class="btn-press px-3 py-1.5 rounded-lg text-sm bg-stone-100 text-stone-800">复制</button></div>
          <pre class="text-stone-900 text-sm whitespace-pre-wrap font-sans leading-relaxed bg-stone-50 p-3 rounded-xl">${escapeHtml(o.body)}</pre>
          <div class="flex flex-wrap gap-2 mt-3">${o.tags.map(t => `<span class="chip chip-primary">#${escapeHtml(t)}</span>`).join('')}</div>`)}
        <div class="flex gap-3">
          <button type="button" onclick="copyListing('all')" class="btn-press flex-1 gradient-card text-white py-3.5 rounded-2xl font-semibold">复制全部</button>
          <button type="button" onclick="movingReset()" class="btn-press flex-1 bg-white text-primary-700 py-3.5 rounded-2xl font-semibold border-2 border-primary-200">重新填写</button>
        </div>
        ${hint('定价口径：原价 × 成色/10 × 时间折旧（每年约 −15%，最低 30%）× 二手流通折价 0.7。卖出后可在“我的物品”里记下实际成交价。')}
      </div>`;
  }
  return `
    <div class="page">
      ${pageHeader('转卖文案', '没用的东西变成钱，文案不用自己想')}
      ${S.inventory.some(i => i.status !== 'sold') ? card(`
        <label for="pickInv" class="block text-sm font-medium text-stone-700 mb-2">从我的物品里选</label>
        <select id="pickInv" onchange="pickFromInventory(this.value)" class="input w-full bg-white">
          <option value="">— 选择后自动填写 —</option>
          ${S.inventory.filter(i => i.status !== 'sold').map(i => `<option value="${i.id}">${escapeHtml(i.name)}（${yuan(i.price)}）</option>`).join('')}
        </select>`) : ''}
      ${card(`
        <label for="mvName" class="block text-sm font-medium text-stone-700 mb-2">物品名称</label>
        <input id="mvName" type="text" maxlength="30" value="${escapeHtml(m.itemName)}" oninput="mvSet('itemName', this.value)" placeholder="比如：宜家书桌、小米空气净化器" class="input w-full">
        ${fieldError('mvName')}
        <div class="grid grid-cols-2 gap-3 mt-4">
          <div><label for="mvPrice" class="block text-sm font-medium text-stone-700 mb-2">原价（元）</label>
            <input id="mvPrice" type="number" min="1" inputmode="numeric" value="${escapeHtml(m.originalPrice)}" oninput="mvSet('originalPrice', this.value)" placeholder="购买价" class="input w-full">${fieldError('mvPrice')}</div>
          <div><label for="mvMonths" class="block text-sm font-medium text-stone-700 mb-2">用了几个月</label>
            <input id="mvMonths" type="number" min="0" inputmode="numeric" value="${escapeHtml(m.useMonths)}" oninput="mvSet('useMonths', this.value)" placeholder="如 6" class="input w-full">${fieldError('mvMonths')}</div>
        </div>`)}
      ${card(`
        <label for="mvCond" class="block text-sm font-medium text-stone-700 mb-3">成色：<span class="text-primary-700 font-bold">${m.condition}/10</span></label>
        <input id="mvCond" type="range" min="1" max="10" value="${m.condition}" oninput="mvSet('condition', this.value, true)" class="w-full">
        <div class="flex justify-between text-xs text-stone-500 mt-2"><span>战损版</span><span>全新</span></div>`)}
      ${card(`
        <div class="text-sm font-medium text-stone-700 mb-3" id="tone-label">文案风格</div>
        <div class="space-y-2" role="radiogroup" aria-labelledby="tone-label">
          ${TONES.map(t => `<button type="button" role="radio" aria-checked="${m.tone === t.id}" onclick="mvSet('tone', '${t.id}', true)" class="w-full p-3.5 rounded-xl text-left btn-press border-2 ${m.tone === t.id ? 'border-primary-500 bg-primary-50' : 'border-transparent bg-stone-50'}">
            <div class="font-semibold text-stone-900">${t.label}</div><div class="text-xs text-stone-600 mt-0.5">${t.desc}</div></button>`).join('')}
        </div>`)}
      <button type="button" onclick="generateMoving()" class="btn-press w-full py-4 rounded-2xl font-bold text-lg shadow-lg gradient-card text-white flex items-center justify-center gap-2">${icon('sparkle', 20)}生成闲鱼文案</button>
    </div>`;
}
let LAST_LISTING = null;
