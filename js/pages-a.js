// ==================== 首页 ====================
function renderHome() {
  const r = computeRecommendation(S.recommend), s = r.summary;
  const lease = computeLease(S.lease);
  const inv = S.inventory.filter(i => i.status !== 'sold');
  const quote = dailyQuotes[new Date().getDate() % dailyQuotes.length];

  const leaseCard = lease ? `
    <a href="#/lease" class="block bg-white rounded-3xl p-4 mb-5 shadow-card btn-press">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-stone-700 flex items-center gap-1.5">${icon('calendar', 16, 'text-primary-600')}退租倒计时</span>
        <span class="text-xs text-primary-700 font-medium">详情 ›</span>
      </div>
      <div class="mt-2 flex items-baseline gap-2">
        <span class="text-3xl font-bold ${lease.left <= 14 ? 'text-rose-600' : 'text-stone-900'}">${lease.left >= 0 ? lease.left : 0}</span>
        <span class="text-sm text-stone-600">${lease.left >= 0 ? '天后退租' : '已过退租日'}</span>
      </div>
      ${lease.todo.length ? `<p class="text-xs text-stone-600 mt-1">👉 ${escapeHtml(lease.todo[lease.todo.length - 1].text)}</p>` : lease.upcoming ? `<p class="text-xs text-stone-500 mt-1">下一步（剩 ${lease.upcoming.days} 天时）：${escapeHtml(lease.upcoming.text)}</p>` : ''}
    </a>` : `
    <a href="#/lease" class="flex items-center justify-between bg-white/70 rounded-3xl p-4 mb-5 border border-dashed border-primary-300 btn-press">
      <span class="text-sm text-stone-700 flex items-center gap-2">${icon('calendar', 18, 'text-primary-600')}填一下退租日期，到点提醒你卖东西、约搬家</span>
      <span class="text-primary-700 text-sm font-medium flex-shrink-0 ml-2">去填 ›</span>
    </a>`;

  const tool = (href, ic, color, title, desc) => `
    <a href="#${href}" class="btn-press bg-white rounded-3xl p-4 shadow-card card-hover flex flex-col">
      <span class="w-11 h-11 rounded-2xl ${color} flex items-center justify-center mb-3">${icon(ic, 22)}</span>
      <span class="font-bold text-stone-900 text-[15px]">${title}</span>
      <span class="text-xs text-stone-500 mt-1 leading-snug">${desc}</span>
    </a>`;
  const hour = new Date().getHours();
  const hello = hour < 6 ? '夜深了' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';

  return `
    <div class="page">
      <header class="flex items-center justify-between mb-4 pt-1">
        <div>
          <p class="text-[13px] text-stone-500">${hello}，漂泊的你</p>
          <h1 class="text-[26px] leading-tight font-extrabold text-stone-900 tracking-tight">漂居<span class="text-accent-500">.</span></h1>
        </div>
        <a href="#/settings" class="w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center text-stone-600 btn-press" aria-label="价格与数据设置">${icon('edit', 18)}</a>
      </header>

      <section class="hero rounded-4xl p-5 mb-4 text-white shadow-lift relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-white/85">我的租房设定</span>
          <a href="#/recommend" class="text-xs font-medium bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full">修改</a>
        </div>
        <div class="flex flex-wrap gap-1.5 mt-3">
          <span class="text-xs px-2.5 py-1 rounded-full bg-white/20 font-medium">住 ${s.months} 个月</span>
          <span class="text-xs px-2.5 py-1 rounded-full bg-white/10">预算 ${yuan(s.budget)}</span>
          ${S.recommend.roomTags.map(t => `<span class="text-xs px-2.5 py-1 rounded-full bg-white/10">${escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="mt-5">
          <div class="text-xs text-white/75">每月实际花</div>
          <div class="text-[40px] leading-none font-extrabold mt-1 tracking-tight">${yuan(s.perMonth)}</div>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-4">
          <div class="rounded-2xl px-3 py-2.5" style="background:rgba(255,255,255,.12)"><div class="text-[11px] text-white/75">建议添置</div><div class="font-bold text-lg">${yuan(s.total)}</div></div>
          <div class="rounded-2xl px-3 py-2.5" style="background:rgba(255,255,255,.12)"><div class="text-[11px] text-white/75">退租可卖回</div><div class="font-bold text-lg text-accent-200">${yuan(s.back)}</div></div>
        </div>
        <a href="#/recommend" class="mt-4 flex items-center justify-center gap-1.5 bg-white text-primary-800 py-3 rounded-2xl font-bold btn-press">${icon('list', 18)}查看入住清单</a>
      </section>

      ${leaseCard}

      <div class="flex items-center justify-between mb-2.5 mt-1 px-1"><h2 class="text-base font-bold text-stone-900">租房工具箱</h2><span class="text-xs text-stone-400">6 个</span></div>
      <div class="grid grid-cols-2 gap-3 mb-5">
        ${tool('/buy-or-rent', 'scale', 'bg-accent-50 text-accent-600', '买还是租', '支持自定义物品，算完再决定')}
        ${tool('/moving', 'tag', 'bg-rose-50 text-rose-600', '转卖文案', '估价 + 一键生成闲鱼文案')}
        ${tool('/inventory', 'box', 'bg-sky-50 text-sky-700', '我的物品', inv.length ? `在用 ${inv.length} 件` : '记下买了啥，退租好清算')}
        ${tool('/settle', 'coin', 'bg-primary-50 text-primary-700', '退租清算', '卖什么、带什么、回多少钱')}
        ${tool('/move-cost', 'truck', 'bg-violet-50 text-violet-700', '搬家估算', '打车、面包车还是搬家公司')}
        ${tool('/inspect', 'check', 'bg-amber-50 text-amber-700', '验房清单', '入住退租逐项拍照，保押金')}
      </div>

      <div class="rounded-3xl bg-white/60 border border-stone-200/70 px-5 py-4 text-center mb-3">
        <p class="text-stone-600 text-sm leading-relaxed">“${quote}”</p>
      </div>
      <p class="text-center text-xs text-stone-400 pb-2">数据只存在你的浏览器里 · <a href="#/settings" class="underline">价格与数据设置</a></p>
    </div>`;
}

// ==================== 入住清单：分步表单（U7）+ 结果页（U5/U6） ====================
function tagBtn(onclick, label, selected, extra = '') {
  return `<button type="button" onclick="${onclick}" aria-pressed="${selected}" class="tag px-4 py-2.5 rounded-full text-sm border font-medium ${selected ? 'selected' : 'bg-white text-stone-700 border-stone-200 hover:border-primary-300'}">${extra}${label}</button>`;
}

function renderRecommend() {
  const st = S.recommend;
  if (st.showResults) return renderRecommendResult();
  const step = st.step || 1;
  const steps = ['住多久', '什么房', '怎么住'];
  const bar = `
    <ol class="flex gap-2 mb-4" aria-label="步骤">
      ${steps.map((t, i) => `<li class="flex-1"><button type="button" onclick="recStep(${i + 1})" class="w-full text-left" ${i + 1 === step ? 'aria-current="step"' : ''}>
        <div class="h-2 rounded-full transition-colors ${i + 1 <= step ? 'bg-primary-500' : 'bg-stone-200'}"></div>
        <div class="text-xs mt-1 ${i + 1 === step ? 'text-primary-700 font-semibold' : 'text-stone-500'}">${i + 1}. ${t}</div></button></li>`).join('')}
    </ol>`;

  let body = '';
  if (step === 1) {
    body = card(`
      <label for="rentMonths" class="block text-sm font-medium text-stone-700 mb-3">这套房打算住多久：<span class="text-primary-700 font-bold">${st.rentMonths} 个月</span></label>
      <input id="rentMonths" type="range" min="1" max="36" value="${st.rentMonths}" oninput="recSet('rentMonths', this.value, true)" class="w-full">
      <div class="flex justify-between text-xs text-stone-500 mt-2"><span>1个月</span><span>36个月</span></div>
      ${hint('住得越短，大件越不划算——它们会在下次搬家时变成负担。')}`) +
    card(`
      <label for="budget" class="block text-sm font-medium text-stone-700 mb-3">一次性购物预算：<span class="text-primary-700 font-bold">${yuan(st.budget)}</span></label>
      <input id="budget" type="range" min="0" max="10000" step="100" value="${st.budget}" oninput="recSet('budget', this.value, true)" class="w-full">
      <div class="flex justify-between text-xs text-stone-500 mt-2"><span>¥0</span><span>¥10,000</span></div>
      ${st.budget === 0 ? '<p class="text-xs text-amber-700 mt-2 font-medium">预算为 0 时不放入必买清单，只给建议</p>' : ''}`);
  } else if (step === 2) {
    const n = st.roomTags.includes('朝北') || st.roomTags.includes('朝西');
    body = card(`
      <div class="text-sm font-medium text-stone-700 mb-3">房型配置（多选）</div>
      <div class="space-y-3">
        ${ROOM_GROUPS.map(g => `<div><div class="text-xs text-stone-500 mb-2 font-medium">${g.title}</div>
          <div class="flex flex-wrap gap-2">${g.tags.map(t => tagBtn(`toggleRoomTag('${t}')`, t, st.roomTags.includes(t))).join('')}</div></div>`).join('')}
      </div>
      ${n ? `<div class="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">💡 采光一般：清单里会优先放<strong>落地灯/台灯</strong>，窗帘选浅色。</div>` : ''}
      ${st.roomTags.includes('朝南') ? `<div class="mt-3 p-3 rounded-xl bg-primary-50 border border-primary-200 text-xs text-primary-800 leading-relaxed">☀️ 朝南采光好：清单里会优先放<strong>遮光窗帘</strong>保证睡眠。</div>` : ''}`);
  } else {
    body = card(`
      <div class="text-sm font-medium text-stone-700 mb-3">生活习惯（多选）</div>
      <div class="flex flex-wrap gap-2 mb-3">${HABIT_OPTIONS.map(h => tagBtn(`toggleHabit('${h.id}')`, h.label, st.habits.includes(h.id), `<span class="mr-1" aria-hidden="true">${h.icon}</span>`)).join('')}</div>
      <div class="flex gap-2">
        <label for="customHabitInput" class="sr-only">自定义习惯</label>
        <input type="text" id="customHabitInput" maxlength="12" placeholder="其他习惯，如：摄影" class="input flex-1 min-w-0">
        <button type="button" onclick="addCustomHabit()" class="btn-press px-4 py-2.5 bg-stone-100 text-stone-800 rounded-xl text-sm font-semibold">添加</button>
      </div>
      ${fieldError('customHabitInput')}
      ${st.customHabits.length ? `<div class="flex flex-wrap gap-2 mt-3">${st.customHabits.map((h, i) => `<span class="inline-flex items-center px-3 py-1.5 rounded-xl bg-primary-50 text-primary-800 text-sm border border-primary-200">${escapeHtml(h)}<button type="button" onclick="removeCustomHabit(${i})" class="ml-1.5 text-primary-700" aria-label="删除 ${escapeHtml(h)}">✕</button></span>`).join('')}</div>${hint('自定义习惯会被记录，但暂时不影响推荐排序。')}` : ''}`) +
    card(`
      <div class="text-sm font-medium text-stone-700 mb-3">自己想买的东西</div>
      <div class="flex gap-2">
        <label for="customItemName" class="sr-only">物品名称</label>
        <input type="text" id="customItemName" maxlength="20" placeholder="物品名称，如：电暖器" class="input flex-1 min-w-0">
        <label for="customItemPrice" class="sr-only">价格</label>
        <input type="number" id="customItemPrice" min="1" inputmode="numeric" placeholder="价格" class="input w-24 flex-shrink-0">
      </div>
      ${fieldError('customItemName')}${fieldError('customItemPrice')}
      <div class="flex gap-2 mt-2">
        <label for="customItemType" class="sr-only">放入哪个清单</label>
        <select id="customItemType" class="input flex-1 min-w-0 bg-white"><option value="must">放进必买</option><option value="optional">放进可缓</option></select>
        <button type="button" onclick="addCustomItem()" class="btn-press flex-shrink-0 px-5 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold">添加</button>
      </div>
      ${st.customItems.length ? `<ul class="space-y-2 mt-4">${st.customItems.map((it, i) => `
        <li class="flex items-center justify-between p-3 rounded-xl ${it.mustBuy ? 'bg-primary-50 border border-primary-200' : 'bg-amber-50 border border-amber-200'}">
          <span class="flex items-center min-w-0"><span class="text-xl mr-2" aria-hidden="true">${it.emoji}</span><span class="text-sm font-medium truncate">${escapeHtml(it.name)}</span><span class="text-xs text-stone-600 ml-2 flex-shrink-0">${yuan(it.price)}</span></span>
          <button type="button" onclick="removeCustomItem(${i})" class="text-stone-600 text-sm flex-shrink-0 ml-2" aria-label="删除 ${escapeHtml(it.name)}">删除</button>
        </li>`).join('')}</ul>` : ''}`);
  }

  const nav = `
    <div class="flex gap-3 sticky-actions">
      ${step > 1 ? `<button type="button" onclick="recStep(${step - 1})" class="btn-press flex-1 bg-white text-stone-800 py-3.5 rounded-2xl font-semibold border border-stone-300">上一步</button>` : ''}
      ${step < 3 ? `<button type="button" onclick="recStep(${step + 1})" class="btn-press flex-[2] gradient-card text-white py-3.5 rounded-2xl font-bold">下一步</button>`
                 : `<button type="button" onclick="generateRecommend()" class="btn-press flex-[2] gradient-card text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2">${icon('sparkle', 20)}算出我的入住清单</button>`}
    </div>
    ${step < 3 ? `<button type="button" onclick="generateRecommend()" class="w-full text-center text-sm text-primary-700 mt-3 py-2">跳过，直接看结果 ›</button>` : ''}`;

  return `<div class="page">${pageHeader('入住清单', '告诉我住多久、怎么住，帮你算清楚')}${bar}${body}${nav}</div>`;
}

function itemCard(item, tone, i) {
  const toneCls = { primary: 'bg-primary-50/70 border-primary-200', amber: 'bg-amber-50/70 border-amber-200', rose: 'bg-rose-50/70 border-rose-200' }[tone];
  const priceCls = { primary: 'text-primary-700', amber: 'text-amber-700', rose: 'text-rose-700' }[tone];
  return `
    <li class="stagger-item p-4 rounded-2xl border ${toneCls}" style="animation-delay:${i * 0.04}s">
      <div class="flex items-start">
        <span class="emoji-lg mr-3" aria-hidden="true">${item.emoji || '📦'}</span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <span class="font-semibold text-stone-900 truncate">${escapeHtml(item.name)}</span>
            <span class="${priceCls} font-bold flex-shrink-0">${yuan(item.price)}</span>
          </div>
          <p class="text-xs text-stone-600 mt-1 leading-relaxed">${escapeHtml(item.note || item.reason)}</p>
          <details class="mt-1.5">
            <summary class="text-xs text-stone-500 cursor-pointer select-none">为什么这么建议</summary>
            <div class="flex flex-wrap gap-1 mt-2">
              ${(item.why || []).map(w => `<span class="text-xs px-2 py-0.5 rounded-full bg-white text-stone-700 border border-stone-200">${escapeHtml(w)}</span>`).join('')}
              ${tone !== 'rose' && item.perMonth !== undefined ? `<span class="text-xs px-2 py-0.5 rounded-full bg-white text-stone-700 border border-stone-200">折合 ${yuan(item.perMonth)}/月</span>` : ''}
              ${item.reason && item.note ? `<span class="text-xs text-stone-600 w-full mt-1">${escapeHtml(item.reason)}</span>` : ''}
            </div>
          </details>
        </div>
      </div>
      ${tone === 'primary' && item.id ? `<button type="button" onclick="addToInventoryFromRec(${item.id})" class="mt-2 text-xs text-primary-700 font-medium flex items-center gap-1">${icon('plus', 14)}买了，记进我的物品</button>` : ''}
    </li>`;
}

function renderRecommendResult() {
  const { mustBuy, optional, avoid, summary: s } = computeRecommendation(S.recommend);
  const section = (title, list, tone, empty, open = true) => `
    <details class="bg-white rounded-3xl p-5 shadow-card mb-4 group" ${open ? 'open' : ''}>
      <summary class="flex items-center cursor-pointer select-none list-none">
        <h2 class="font-bold text-stone-900 text-lg">${title}</h2>
        <span class="ml-2 text-xs chip">${list.length} 件</span>
        <span class="ml-auto text-stone-500 transition-transform group-open:rotate-90">${icon('chevron', 18)}</span>
      </summary>
      <ul class="space-y-2 mt-4">${list.length ? list.map((it, i) => itemCard(it, tone, i)).join('') : `<li class="text-sm text-stone-500">${empty}</li>`}</ul>
    </details>`;

  return `
    <div class="page">
      ${pageHeader('入住清单', `住 ${s.months} 个月 · 预算 ${yuan(s.budget)} · ${escapeHtml(S.recommend.roomTags.join('/') || '未选房型')}`)}
      <div class="sticky-summary hero rounded-3xl px-5 py-3.5 text-white shadow-lift mb-4" role="status">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="text-xs text-primary-100">实际花费 ${yuan(s.net)} · 预算剩 ${yuan(s.budget - s.total)}</div>
            <div class="text-xs text-primary-100 mt-0.5">买 ${yuan(s.total)} − 卖回 ${yuan(s.back)} + 搬家 ${yuan(s.moveCost)}</div>
          </div>
          <div class="font-bold text-2xl whitespace-nowrap flex-shrink-0">≈ ${yuan(s.perMonth)}<span class="text-sm font-medium">/月</span></div>
        </div>
      </div>

      ${section('必买清单', mustBuy, 'primary', s.budget === 0 ? '预算为 0，先不买，下面的建议供参考' : '在当前预算内没有特别必要的物品')}
      ${section('可以缓一缓', optional, 'amber', '暂无', false)}
      ${section('这次别买', avoid, 'rose', '没有需要特别避开的', false)}

      <p class="text-xs text-stone-500 leading-relaxed px-1 mb-4">排序依据：基础必要度 + 习惯匹配 + 房型匹配 − 租期内搬家负担；必买按优先级装入预算。价格为估算（${escapeHtml(PRICE_META.updated)}），可在 <a href="#/settings" class="underline">设置</a> 里改成你看到的价格。</p>

      <div class="flex gap-3">
        <button type="button" onclick="recommendReset()" class="btn-press flex-1 bg-white text-primary-700 py-3.5 rounded-2xl font-semibold border-2 border-primary-200">调整条件</button>
        <button type="button" onclick="shareRecommend()" class="btn-press flex-1 bg-white text-stone-800 py-3.5 rounded-2xl font-semibold border-2 border-stone-200 flex items-center justify-center gap-1.5">${icon('share', 18)}存为图片</button>
      </div>
    </div>`;
}
