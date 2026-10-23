// ==================== 计算引擎（纯函数，便于测试） ====================
function resaleValue(price, rate, months) {
  const decay = Math.max(0.4, 1 - Math.max(0, months - 12) / 36);
  return Math.round(price * rate * decay);
}

function computeRecommendation(st) {
  const months = st.rentMonths;
  const habitLabel = Object.fromEntries(HABIT_OPTIONS.map(h => [h.id, h.label]));
  const scored = goodsDatabase.map(item => {
    const price = goodsPrice(item);
    let score = item.base;
    const why = [];
    const habitHits = item.habits.filter(h => st.habits.includes(h));
    if (habitHits.length) { score += 35; why.push('匹配习惯：' + habitHits.map(h => habitLabel[h]).join('、')); }
    const roomHits = item.rooms.filter(r => st.roomTags.includes(r));
    if (roomHits.length) { score += 25; why.push('适合你的房子：' + roomHits.join('、')); }
    const bulkyPenalty = item.weight === '重' ? (months <= 6 ? 60 : months <= 12 ? 40 : months <= 24 ? 20 : 5)
                       : item.weight === '中' ? (months <= 3 ? 20 : months <= 6 ? 10 : 0) : 0;
    score -= bulkyPenalty;
    const back = resaleValue(price, item.resale, months);
    const moveCost = MOVE_COST[item.weight];
    const net = price - back + moveCost;
    const perMonth = Math.round(net / Math.max(months, 1));
    if (back > 0) why.push(`退租转卖约回 ¥${back}`);
    why.push(moveCost > 0 ? `搬一次约 ¥${moveCost}` : '搬家轻便');
    return { ...item, price, score, why, back, moveCost, net, perMonth, bulkyPenalty, habitHits };
  });

  const mustBuy = [], optional = [], avoid = [];
  let spent = 0;
  scored.filter(i => i.score >= 40).sort((a, b) => b.score - a.score || a.price - b.price).forEach(i => {
    if (spent + i.price <= st.budget) { mustBuy.push(i); spent += i.price; }
    else optional.push({ ...i, note: '超出预算，可以以后再买' });
  });
  scored.filter(i => i.score >= 15 && i.score < 40).forEach(i => {
    if (i.bulkyPenalty >= 20) avoid.push({ ...i, note: `住 ${months} 个月，搬家成本和占地不划算` });
    else if (i.habitHits.length || i.base >= 15) optional.push({ ...i, note: '有需要再买' });
  });
  scored.filter(i => i.score < 15 && (i.habitHits.length || i.base === 0)).forEach(i => {
    if (i.habitHits.length || i.bulkyPenalty > 0 || i.price >= 1000)
      avoid.push({ ...i, note: i.bulkyPenalty > 0 ? `住 ${months} 个月，搬家成本和占地不划算` : '性价比低' });
  });
  st.customItems.forEach(c => {
    const ci = { ...c, why: ['你自己加的'], back: 0, moveCost: 0, net: c.price, perMonth: Math.round(c.price / Math.max(months, 1)) };
    if (c.mustBuy) { mustBuy.push(ci); spent += c.price; } else optional.push(ci);
  });
  optional.sort((a, b) => (b.score || 0) - (a.score || 0));

  const sum = (arr, k) => arr.reduce((s, i) => s + (i[k] || 0), 0);
  const total = sum(mustBuy, 'price'), back = sum(mustBuy, 'back'), moveCost = sum(mustBuy, 'moveCost');
  const net = total - back + moveCost;
  return {
    mustBuy, optional: optional.slice(0, 6), avoid: avoid.slice(0, 5),
    summary: { total, back, moveCost, net, perMonth: Math.round(net / Math.max(months, 1)), months, budget: st.budget, over: total > st.budget }
  };
}

function computeBuyOrRent(item, months, useCount) {
  const { buyPrice, rentPrice } = rentItemPrices(item);
  const uses = Math.max(1, Math.round(useCount * months / 12));
  const moveCost = MOVE_COST[item.storageDiff === '高' ? '重' : item.storageDiff === '中' ? '中' : '轻'];
  const resale = resaleValue(buyPrice, item.resaleValue / 100, months);
  const maintain = Math.round(item.maintainCost * months / 12);
  const buyNet = buyPrice - resale + maintain + moveCost;
  const rentTotal = rentPrice * uses;
  const diff = rentTotal - buyNet;
  const breakEven = Math.ceil(buyNet / rentPrice);
  const closeCall = Math.abs(diff) <= Math.max(50, buyNet * 0.1);
  const verdict = closeCall ? 'close' : diff > 0 ? 'buy' : 'rent';
  return { buyPrice, rentPrice, uses, moveCost, resale, maintain, buyNet, rentTotal, diff, breakEven, closeCall, verdict, perUseBuy: buyNet / uses, months };
}

function computeResale(price, usedMonths, c) {
  const ageFactor = Math.max(0.3, 1 - usedMonths / 12 * 0.15);
  const suggested = Math.max(1, Math.round(price * (c / 10) * ageFactor * 0.7));
  return { suggested, fast: Math.max(1, Math.round(suggested * 0.8)) };
}

// F6 搬家成本
function computeMoveCost(mc) {
  const mode = MOVE_PARAMS.modes.find(m => m.id === mc.mode) || MOVE_PARAMS.modes[0];
  const km = Math.max(0, Number(mc.km) || 0), boxes = Math.max(0, Number(mc.boxes) || 0);
  const bulky = Math.max(0, Number(mc.bulky) || 0), floors = Math.max(0, Number(mc.floors) || 0);
  const transport = Math.round(mode.base + mode.perKm * km + mode.perBox * boxes);
  const materials = boxes * MOVE_PARAMS.boxPrice;
  const bulkyFee = bulky * MOVE_PARAMS.bulkyFee;
  const floorFee = mode.id === 'self' ? 0 : floors * MOVE_PARAMS.floorFee * Math.max(1, Math.ceil(boxes / 10));
  const dayOff = Math.max(0, Number(mc.dayOff) || 0);
  const total = transport + materials + bulkyFee + floorFee + dayOff;
  return { mode, transport, materials, bulkyFee, floorFee, dayOff, total };
}

// F4 退租倒计时
function daysBetween(a, b) {
  const d1 = new Date(a + 'T00:00:00'), d2 = new Date(b + 'T00:00:00');
  return Math.round((d2 - d1) / 86400000);
}
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function computeLease(lease, today = todayStr()) {
  if (!lease.moveOut) return null;
  const left = daysBetween(today, lease.moveOut);
  const total = lease.moveIn ? Math.max(1, daysBetween(lease.moveIn, lease.moveOut)) : null;
  const progress = total ? Math.min(100, Math.max(0, Math.round((1 - left / total) * 100))) : null;
  const next = LEASE_MILESTONES.filter(m => left <= m.days && left >= 0);
  const upcoming = LEASE_MILESTONES.filter(m => left > m.days).slice(-1)[0] || null;
  return { left, total, progress, todo: next, upcoming };
}

// F3 退租清算：物品库里在用的物品 → 卖 / 带走 / 扔 汇总
function computeSettlement(inv, months) {
  const rows = inv.filter(i => i.status !== 'sold').map(i => {
    const usedMonths = i.boughtAt ? Math.max(0, Math.round(daysBetween(i.boughtAt, todayStr()) / 30)) : months;
    const { suggested } = computeResale(i.price, usedMonths, 7);
    const move = MOVE_COST[i.weight || '轻'];
    const action = move >= 150 || suggested > move * 2 ? 'sell' : 'take';
    return { ...i, usedMonths, suggested, move, action };
  });
  const sell = rows.filter(r => r.action === 'sell'), take = rows.filter(r => r.action === 'take');
  const sold = inv.filter(i => i.status === 'sold');
  return {
    rows, sell, take, sold,
    expectIncome: sell.reduce((s, r) => s + r.suggested, 0),
    takeCost: take.reduce((s, r) => s + r.move, 0),
    actualIncome: sold.reduce((s, r) => s + (Number(r.soldPrice) || 0), 0),
    spent: inv.reduce((s, r) => s + (Number(r.price) || 0), 0),
  };
}
