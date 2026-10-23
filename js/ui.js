// ==================== 工具 ====================
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const yuan = n => '¥' + Math.round(Number(n) || 0).toLocaleString('zh-CN');

const emojiRules = [
  ['枕', '🛏️'], ['床', '🛏️'], ['窗帘', '🪟'], ['电饭煲', '🍚'], ['锅', '🍳'], ['收纳', '📦'], ['水壶', '🫖'],
  ['镜', '🪞'], ['吹风', '💨'], ['插', '🔌'], ['灯', '💡'], ['椅', '💺'], ['桌', '🪑'], ['投影', '📽️'],
  ['净化', '🌬️'], ['烫', '👔'], ['炸', '🍗'], ['微波', '📟'], ['瑜伽', '🧘'], ['音箱', '🔊'], ['除螨', '🛡️'],
  ['电视', '📺'], ['沙发', '🛋️'], ['书', '📚'], ['跑步', '🏃'], ['烤箱', '🔥'], ['植', '🌿'], ['花', '🌸'],
  ['按摩', '💆'], ['相机', '📷'], ['无人机', '🚁'], ['帐篷', '⛺'], ['露营', '🏕️'], ['游戏', '🎮'], ['Switch', '🎮'],
  ['吉他', '🎸'], ['琴', '🎹'], ['西装', '👔'], ['衣', '👕'], ['行李', '🧳'], ['冰箱', '🧊'], ['暖', '🔥'],
  ['吸尘', '🧹'], ['电脑', '💻'], ['显示器', '🖥️'], ['自行车', '🚲'], ['风扇', '🌀'],
];
function getEmoji(name) {
  const hit = emojiRules.find(([k]) => String(name).includes(k));
  return hit ? hit[1] : '📦';
}

// ==================== 统一线性图标（U11） ====================
const ICON_PATHS = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2"/>',
  scale: '<path d="M12 3v18M5 21h14"/><path d="m5 7 7-4 7 4"/><path d="M2 14l3-7 3 7a3 3 0 0 1-6 0zM16 14l3-7 3 7a3 3 0 0 1-6 0z"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38A1 1 0 0 0 17.52 9H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  check: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M9 8l3 4 3-4M12 12v6M9 13h6M9 16h6"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  sparkle: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
};
function icon(name, size = 20, cls = '') {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;
}

// ==================== 通用组件 ====================
function pageHeader(title, sub, backTo = '/') {
  return `
    <header class="flex items-center mb-5">
      <a href="#${backTo}" class="btn-press mr-3 w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white shadow-card text-stone-700" aria-label="返回">${icon('back', 20)}</a>
      <div class="min-w-0"><h1 class="text-[22px] leading-tight font-bold text-stone-900">${title}</h1>${sub ? `<p class="text-[13px] text-stone-500 truncate mt-0.5">${sub}</p>` : ''}</div>
    </header>`;
}
const card = (inner, cls = '') => `<section class="bg-white rounded-3xl p-5 mb-4 shadow-card ${cls}">${inner}</section>`;
const hint = text => `<p class="text-xs text-stone-500 leading-relaxed mt-2">${text}</p>`;
function fieldError(id) { return `<p id="err-${id}" class="field-error text-xs text-rose-600 mt-1.5 font-medium" role="alert" hidden></p>`; }
function showFieldError(id, msg) {
  const el = document.getElementById('err-' + id);
  const input = document.getElementById(id);
  if (el) { el.textContent = msg; el.hidden = !msg; }
  if (input) { input.setAttribute('aria-invalid', msg ? 'true' : 'false'); input.classList.toggle('input-error', !!msg); if (msg) input.focus(); }
  return !msg;
}

// ==================== Toast（U16） ====================
let toastTimer = null;
function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}
async function copyText(text, label = '已复制') {
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    toast('✓ ' + label);
  } catch (e) { toast('复制失败，请长按文字手动复制'); }
}
