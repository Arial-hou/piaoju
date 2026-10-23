// D3：用京东联盟开放接口刷新 data/prices.json 里的「新品价」
// - 只更新新品价（goods.price / rent.buyPrice）；租金、二手价不在此处更新
// - 没有密钥、接口失败、结果异常（偏离原值 3 倍以上）时，一律保留原值
// - 纯 Node 标准库，无需 npm install
// 用法：JD_APP_KEY=xxx JD_APP_SECRET=yyy node scripts/update-prices.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const PRICES = path.join(ROOT, 'data', 'prices.json');
const { JD_APP_KEY: KEY, JD_APP_SECRET: SECRET } = process.env;

if (!KEY || !SECRET) {
  console.log('未配置 JD_APP_KEY / JD_APP_SECRET，跳过更新，保持人工估算值。');
  process.exit(0);
}

// 从 js/data.js 读取物品名称作为搜索关键词
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'data.js'), 'utf8') +
  ';globalThis.__d={goodsDatabase,buyOrRentItems};', ctx);
const { goodsDatabase, buyOrRentItems } = ctx.__d;

function sign(params) {
  const s = Object.keys(params).sort().map(k => k + params[k]).join('');
  return crypto.createHash('md5').update(SECRET + s + SECRET).digest('hex').toUpperCase();
}

async function searchPrice(keyword) {
  const ts = new Date(Date.now() + 8 * 3600e3).toISOString().replace('T', ' ').slice(0, 19);
  const p = {
    method: 'jd.union.open.goods.query', app_key: KEY, timestamp: ts,
    format: 'json', v: '1.0', sign_method: 'md5',
    '360buy_param_json': JSON.stringify({ goodsReqDTO: { keyword, pageSize: 20, sortName: 'inOrderCount30Days', sort: 'desc' } }),
  };
  p.sign = sign(p);
  const res = await fetch('https://api.jd.com/routerjson?' + new URLSearchParams(p), { signal: AbortSignal.timeout(15000) });
  const json = await res.json();
  const raw = json?.jd_union_open_goods_query_responce?.queryResult;
  const data = JSON.parse(raw || '{}').data || [];
  const prices = data.map(g => Number(g?.priceInfo?.lowestPrice || g?.priceInfo?.price)).filter(n => n > 0).sort((a, b) => a - b);
  if (prices.length < 3) return null;
  // 取销量前 20 的下四分位数：贴近"入门款"定位
  return Math.round(prices[Math.floor(prices.length / 4)]);
}

const sane = (oldV, newV) => newV && (!oldV || (newV < oldV * 3 && newV > oldV / 3));

(async () => {
  const json = JSON.parse(fs.readFileSync(PRICES, 'utf8'));
  json.goods ||= {}; json.rent ||= {};
  let changed = 0, kept = 0;
  const jobs = [
    ...goodsDatabase.map(g => ({ name: g.name, get: () => json.goods[g.id]?.price, set: v => { (json.goods[g.id] ||= {}).price = v; } })),
    ...buyOrRentItems.map(g => ({ name: g.name, get: () => json.rent[g.id]?.buyPrice, set: v => { (json.rent[g.id] ||= {}).buyPrice = v; } })),
  ];
  for (const j of jobs) {
    try {
      const v = await searchPrice(j.name);
      if (sane(j.get(), v)) { if (v !== j.get()) { j.set(v); changed++; } }
      else kept++;
    } catch (e) { kept++; console.warn(`${j.name}: ${e.message}`); }
    await new Promise(r => setTimeout(r, 300));
  }
  if (changed) {
    json.updated = new Date().toISOString().slice(0, 7);
    json.source = '新品价：京东联盟销量前 20 商品的入门价位（自动更新）；租金与二手价：人工估算';
    fs.writeFileSync(PRICES, JSON.stringify(json, null, 2) + '\n');
  }
  console.log(`更新 ${changed} 项，保留原值 ${kept} 项。`);
})().catch(e => { console.error('价格更新异常，保留原数据：', e.message); process.exit(0); });
