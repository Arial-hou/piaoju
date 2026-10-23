// ==================== 全局状态 + hash 路由（U3） ====================
let S = loadState();

const ROUTES = {
  '/': renderHome,
  '/recommend': renderRecommend,
  '/buy-or-rent': renderBuyOrRent,
  '/moving': renderMoving,
  '/inventory': renderInventory,
  '/settle': renderSettle,
  '/lease': renderLease,
  '/inspect': renderInspect,
  '/move-cost': renderMoveCost,
  '/settings': renderSettings,
};
const TITLES = {
  '/': '漂居 · 短租青年的租房生活消费助手', '/recommend': '入住清单', '/buy-or-rent': '买还是租', '/moving': '转卖文案',
  '/inventory': '我的物品', '/settle': '退租清算', '/lease': '退租倒计时', '/inspect': '验房清单', '/move-cost': '搬家估算', '/settings': '价格与数据',
};
// 底部导航：子页面归到最近的一级入口
const NAV_OWNER = { '/settle': '/inventory', '/lease': '/', '/inspect': '/', '/move-cost': '/', '/settings': '/' };

function currentRoute() {
  const p = (location.hash || '#/').slice(1).split('?')[0] || '/';
  return ROUTES[p] ? p : '/';
}

function render() {
  const route = currentRoute();
  const main = document.getElementById('main-content');
  if (!main) return;
  try {
    main.innerHTML = ROUTES[route]();
  } catch (e) {
    console.error(e);
    main.innerHTML = `<div class="page"><div class="bg-white rounded-2xl p-6 text-center border border-stone-200">
      <p class="text-stone-800 font-semibold">页面出了点问题</p>
      <p class="text-sm text-stone-600 mt-1">可以先回首页，或在“价格与数据”里清空数据后重试。</p>
      <a href="#/" class="inline-block mt-4 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold">回首页</a></div></div>`;
  }
  document.title = TITLES[route] || TITLES['/'];
  const owner = NAV_OWNER[route] || route;
  document.querySelectorAll('[data-nav]').forEach(a => {
    const on = a.getAttribute('data-nav') === owner;
    a.classList.toggle('nav-active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

let lastRoute = null;
function onRouteChange() {
  const route = currentRoute();
  render();
  if (route !== lastRoute) {
    window.scrollTo(0, 0);
    // 切页后把焦点放到主区域，方便读屏
    const main = document.getElementById('main-content');
    if (main && lastRoute !== null) main.focus({ preventScroll: true });
  }
  lastRoute = route;
}

// ==================== F7 入住清单存为图片 ====================
function shareRecommend() {
  const { mustBuy, summary: s } = computeRecommendation(S.recommend);
  const W = 750, pad = 48, lineH = 64;
  const H = 520 + Math.max(1, mustBuy.length) * lineH + 140;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  const font = (w, px) => `${w} ${px}px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`;

  c.fillStyle = '#fafaf9'; c.fillRect(0, 0, W, H);
  const g = c.createLinearGradient(0, 0, W, 300);
  g.addColorStop(0, '#059669'); g.addColorStop(1, '#0d9488');
  c.fillStyle = g; c.fillRect(0, 0, W, 330);

  c.fillStyle = '#fff';
  c.font = font(700, 44); c.fillText('我的入住清单', pad, 96);
  c.font = font(400, 26); c.fillText(`住 ${s.months} 个月 · 预算 ${yuan(s.budget)} · ${S.recommend.roomTags.join('/') || '未选房型'}`, pad, 144);
  c.font = font(700, 72); c.fillText(`≈ ${yuan(s.perMonth)}/月`, pad, 246);
  c.font = font(400, 24); c.fillText(`买 ${yuan(s.total)} − 退租卖回 ${yuan(s.back)} + 搬家 ${yuan(s.moveCost)}`, pad, 296);

  let y = 400;
  c.fillStyle = '#1c1917'; c.font = font(700, 32); c.fillText(`必买 ${mustBuy.length} 件`, pad, y);
  y += 30;
  if (!mustBuy.length) { c.fillStyle = '#57534e'; c.font = font(400, 26); c.fillText('当前预算下先不买，按需再添', pad, y + 40); y += lineH; }
  mustBuy.forEach(it => {
    y += lineH;
    c.fillStyle = '#e7e5e4'; c.fillRect(pad, y - 44, W - pad * 2, 1);
    c.fillStyle = '#1c1917'; c.font = font(400, 30);
    const name = `${it.emoji || '📦'} ${it.name}`;
    c.fillText(name.length > 16 ? name.slice(0, 16) + '…' : name, pad, y);
    c.fillStyle = '#047857'; c.font = font(700, 30);
    const p = yuan(it.price); c.fillText(p, W - pad - c.measureText(p).width, y);
  });
  c.fillStyle = '#78716c'; c.font = font(400, 22);
  c.fillText('价格为估算 · 漂居：短租青年的租房生活消费助手', pad, H - 60);
  c.fillText(location.origin + location.pathname, pad, H - 28);

  cv.toBlob(async blob => {
    if (!blob) return toast('生成图片失败');
    const file = new File([blob], '漂居-入住清单.png', { type: 'image/png' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: '我的入住清单' });
        return;
      }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = file.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('✓ 图片已保存');
  }, 'image/png');
}

// ==================== 初始化 ====================
window.addEventListener('hashchange', onRouteChange);
document.addEventListener('DOMContentLoaded', () => {
  onRouteChange();
  // 远程价格到了再刷新一次（失败则保持内置估算）
  loadRemotePrices().then(() => { if (remotePrices) render(); });
});
