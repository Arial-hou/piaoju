// 冒烟测试：在 vm 中按顺序加载全部 js，渲染 10 个路由，检查 NaN/undefined/报错
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const FILES = ['data', 'checklists', 'store', 'engine', 'ui', 'pages-a', 'pages-b', 'pages-c', 'handlers', 'app'];

function el() {
  return {
    innerHTML: '', textContent: '', value: '', style: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    focus() {}, appendChild() {}, remove() {}, click() {}, addEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
  };
}
const main = el();
const store = {};
const listeners = {};
const errors = [];
const ctx = {
  console: { log() {}, warn() {}, error: (...a) => errors.push(a.map(String).join(' ')) },
  location: { hash: '#/', origin: 'http://x', pathname: '/piaoju/' },
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
  },
  document: {
    title: '', body: el(),
    getElementById: id => (id === 'main-content' ? main : el()),
    querySelector: () => el(), querySelectorAll: () => [],
    createElement: () => el(), addEventListener: (t, f) => { listeners[t] = f; },
    execCommand() { return true; },
  },
  navigator: {}, fetch: () => Promise.reject(new Error('offline')),
  setTimeout, clearTimeout, Promise, Date, Math, JSON,
  confirm: () => true, prompt: () => null, alert() {},
};
ctx.window = ctx;
ctx.window.addEventListener = (t, f) => { listeners['w:' + t] = f; };
ctx.window.scrollTo = () => {};
vm.createContext(ctx);

const src = FILES.map(f => fs.readFileSync(path.join(root, 'js', f + '.js'), 'utf8')).join('\n;\n');
vm.runInContext(src + '\n;globalThis.__T={get S(){return S},render,ROUTES,escapeHtml,computeBuyOrRent,computeRecommendation,resaleValue,computeSettlement};', ctx, { filename: 'bundle.js' });

let fail = 0;
const ok = (cond, msg) => { if (!cond) { fail++; console.log('✗ ' + msg); } else console.log('✓ ' + msg); };

listeners.DOMContentLoaded();
for (const r of Object.keys(ctx.__T.ROUTES)) {
  ctx.location.hash = '#' + r;
  errors.length = 0;
  ctx.__T.render();
  const text = main.innerHTML.replace(/<[^>]+>/g, ' ');
  ok(!errors.length && !/页面出了点问题/.test(main.innerHTML), `${r} 渲染无异常 ${errors[0] || ''}`);
  ok(!/\bNaN\b|\bundefined\b|\bnull\b/.test(text), `${r} 无 NaN/undefined`);
  ok(main.innerHTML.length > 300, `${r} 有内容 (${main.innerHTML.length}B)`);
}

// 交互流：生成清单 → 加入物品库 → 清算页
const T = ctx.__T;
vm.runInContext("generateRecommend && generateRecommend();", ctx);
const rec = T.computeRecommendation(T.S.recommend);
ok(Array.isArray(rec.mustBuy) && isFinite(rec.summary.perMonth), `入住清单可计算（月均 ${rec.summary.perMonth}）`);
ok(T.escapeHtml('<img src=x onerror=1>') === '&lt;img src=x onerror=1&gt;', 'XSS 转义');
ok(T.resaleValue(1000, 0.5, 6) === 500, '转卖估值：12 个月内不折旧');
ok(T.resaleValue(1000, 0.5, 120) === 200, '转卖估值：长期折旧下限 40%');
vm.runInContext("S.inventory.push({id:'t1',name:'<b>测试</b>',price:300,condition:9,months:2,move:'中'}); saveState && saveState();", ctx);
ctx.location.hash = '#/settle'; T.render();
ok(!/<b>测试<\/b>/.test(main.innerHTML), '物品名称已转义');
ok(!/\bNaN\b/.test(main.innerHTML), '清算页含物品后无 NaN');


// 买还是租：自定义物品 添加 → 选中 → 计算 → 删除
{
  const vals = { borNewName: '扫地机器人<b>', borNewBuy: '1800', borNewRent: '40', borNewSize: '中', borNewResale: '50', borNewMaintain: '60' };
  const getById = ctx.document.getElementById;
  ctx.document.getElementById = id => (id in vals ? Object.assign(el(), { value: vals[id] }) : getById(id));
  vm.runInContext('borAddCustom()', ctx);
  const st = ctx.__T.S.buyOrRent;
  ok(st.customItems.length === 1 && st.selectedId === st.customItems[0].id, '自定义物品已添加并选中');
  vm.runInContext('borAddCustom()', ctx);
  ok(st.customItems.length === 1, '重名物品不会重复添加');
  ctx.location.hash = '#/buy-or-rent'; ctx.__T.render();
  ok(main.innerHTML.includes('扫地机器人&lt;b&gt;') && !main.innerHTML.includes('扫地机器人<b>'), '自定义物品名已转义并显示');
  vm.runInContext('borCalc()', ctx);
  const t = main.innerHTML.replace(/<[^>]+>/g, ' ');
  ok(/建议(购买|租用)|差不多/.test(t) && !/NaN|undefined/.test(t), '自定义物品可出结论');
  const r = ctx.__T.computeBuyOrRent(st.customItems[0], 6, 20);
  ok(r.buyPrice === 1800 && r.rentPrice === 40 && r.uses === 10 && r.moveCost === 40, `自定义物品计算口径正确（买净 ${r.buyNet} / 租 ${r.rentTotal}）`);
  vm.runInContext(`borRemoveCustom(${JSON.stringify(st.customItems[0].id)})`, ctx);
  ok(st.customItems.length === 0 && st.selectedId === null, '自定义物品可删除');
  ctx.document.getElementById = getById;
}

console.log(fail ? `\n失败 ${fail} 项` : '\n全部通过');
process.exit(fail ? 1 : 0);
