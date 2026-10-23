// ==================== 本地存储（F1）：数据只存在本机浏览器 ====================
const STORE_KEY = 'piaoju:v1';

const DEFAULT_STATE = () => ({
  recommend: { rentMonths: 6, roomTags: ['合租', '公共卫生间'], budget: 1500, habits: ['cooking'], customHabits: [], customItems: [], step: 1, showResults: false },
  buyOrRent: { selectedId: null, useCount: 20, months: null, showResult: false },
  moving: { itemName: '', originalPrice: '', useMonths: '', condition: 8, tone: 'casual', showResult: false },
  lease: { moveIn: '', moveOut: '', rent: '', deposit: '' },      // F4 退租倒计时
  inventory: [],                                                 // F2 我的物品库 {id,name,emoji,price,boughtAt,weight,soldPrice,status}
  inspect: {},                                                   // F5 验房勾选 { 'group|item': true }
  moveCalc: { mode: 'van', km: 10, boxes: 10, bulky: 1, floors: 0, dayOff: 0 }, // F6
  priceOverrides: {},                                            // D1 用户改价 { 'g:1': 180, 'r:2': 280 }
});

function deepMerge(base, saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(base)) return saved ?? base;
  const out = { ...base };
  for (const k of Object.keys(saved)) {
    out[k] = base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) ? deepMerge(base[k], saved[k]) : saved[k];
  }
  return out;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? deepMerge(DEFAULT_STATE(), JSON.parse(raw)) : DEFAULT_STATE();
  } catch (e) { return DEFAULT_STATE(); }
}

let saveTimer = null;
function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* 隐私模式等情况下静默失败 */ }
  }, 150);
}

function clearAllData() {
  try { localStorage.removeItem(STORE_KEY); } catch (e) {}
  S = DEFAULT_STATE();
}

// ==================== 价格（D1）：内置估算 < prices.json < 用户改价 ====================
let remotePrices = null;
async function loadRemotePrices() {
  try {
    const res = await fetch('data/prices.json', { cache: 'no-cache' });
    if (!res.ok) return;
    remotePrices = await res.json();
    if (remotePrices.updated) PRICE_META.updated = remotePrices.updated;
    if (remotePrices.source) PRICE_META.source = remotePrices.source;
  } catch (e) { /* 本地 file:// 打开或离线时用内置估算 */ }
}

function goodsPrice(item) {
  const o = S.priceOverrides['g:' + item.id];
  if (o > 0) return o;
  const r = remotePrices?.goods?.[item.id]?.price;
  return r > 0 ? r : item.price;
}
function rentItemPrices(item) {
  const r = remotePrices?.rent?.[item.id] || {};
  const ob = S.priceOverrides['rb:' + item.id], or = S.priceOverrides['rr:' + item.id];
  return {
    buyPrice: ob > 0 ? ob : (r.buyPrice > 0 ? r.buyPrice : item.buyPrice),
    rentPrice: or > 0 ? or : (r.rentPrice > 0 ? r.rentPrice : item.rentPrice),
  };
}
function isOverridden(key) { return S.priceOverrides[key] > 0; }
