/* PostReady AI — shared frontend helpers */

const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

async function api(url, options = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json().catch(() => ({ success: false, message: 'Invalid server response. Please try again.' }));
  if (!res.ok) {
    // Translate raw errors into friendly user-facing messages.
    let msg = data?.message || 'Request failed. Please try again.';
    if (res.status === 401) msg = 'Please login to continue.';
    else if (res.status === 402) msg = 'You are out of credits. Upgrade your plan to continue.';
    else if (res.status === 403) msg = 'Your current plan does not allow this action.';
    else if (res.status === 429) msg = 'Too many requests. Please wait a moment and try again.';
    else if (res.status >= 500) msg = 'Our servers are having trouble. Please try again in a moment.';
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Renders a friendly empty-state block.
 */
function emptyState(message, hint = '') {
  return `<div class="empty"><p>${escapeHtml(message)}</p>${hint ? `<p class="muted small">${escapeHtml(hint)}</p>` : ''}</div>`;
}

/**
 * Renders a friendly error block.
 */
function errorState(message, hint = '') {
  return `<div class="card error-card"><strong>Something went wrong</strong><p>${escapeHtml(message)}</p>${hint ? `<p class="muted small">${escapeHtml(hint)}</p>` : ''}</div>`;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function copyText(text) {
  navigator.clipboard.writeText(String(text || ''));
  toast('Copied to clipboard');
}

function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  // restart the entrance animation on repeated toasts
  t.classList.remove('hidden');
  t.style.animation = 'none';
  t.offsetHeight; // reflow
  t.style.animation = '';
  t.textContent = msg;
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(() => t.classList.add('hidden'), 2200);
}

function navToggle() {
  const n = $('.navlinks');
  if (n) n.classList.toggle('open');
}

async function logout() {
  await api('/api/logout', { method: 'POST' });
  location.href = '/login.html';
}

async function requireAuth() {
  try { const d = await api('/api/me'); return d.user; }
  catch (e) { location.href = '/login.html'; return null; }
}

async function optionalUser() {
  try { return (await api('/api/me')).user; } catch { return null; }
}

function appTopbar(active = '') {
  return `<div class="topbar"><div class="topbar-inner">
    <a class="brand" href="/"><span class="brand-mark">P</span>PostReady <span>AI</span></a>
    <button class="btn ghost mobile-toggle" onclick="navToggle()">Menu</button>
    <div class="navlinks">
      <a class="${active === 'home' ? 'primary' : ''}" href="/">Home</a>
      <a class="${active === 'pricing' ? 'primary' : ''}" href="/pricing.html">Pricing</a>
      <a href="/login.html">Login</a>
      <a class="primary" href="/signup.html">Start free</a>
    </div>
  </div></div>`;
}

function appShell(active = 'dashboard') {
  const items = [
    ['dashboard', 'Dashboard', '/dashboard.html', '&#9635;'],
    ['generate', 'Generate', '/generate.html', '&#10022;'],
    ['profile', 'Brand Voice', '/profile.html', '&#9673;'],
    ['schedule', 'Planner', '/schedule.html', '&#9783;'],
    ['analytics', 'Analytics', '/analytics.html', '&#9637;']
  ];
  return `<div class="topbar"><div class="topbar-inner">
      <a class="brand" href="/dashboard.html"><span class="brand-mark">P</span>PostReady <span>AI</span></a>
      <button class="btn ghost mobile-toggle" onclick="navToggle()">Menu</button>
      <div class="navlinks">
        <a href="/pricing.html">Pricing</a>
        <button class="btn ghost" onclick="logout()">Logout</button>
      </div>
    </div></div>
    <div class="layout">
      <aside class="sidebar">${items.map(i => `<a class="side-link ${active === i[0] ? 'active' : ''}" href="${i[2]}"><span>${i[3]}</span>${i[1]}</a>`).join('')}</aside>
      <main class="content" id="appContent"></main>
    </div>`;
}

function stat(label, value) {
  return `<div class="stat"><span class="muted small">${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`;
}

function resultSection(title, items) {
  const text = Array.isArray(items) ? items.join('\n') : String(items || '');
  const safeJs = text.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
  return `<div class="result"><button class="btn ghost copy-mini" onclick="copyText(\`${safeJs}\`)">Copy</button><strong>${escapeHtml(title)}</strong><pre>${escapeHtml(text)}</pre></div>`;
}

/**
 * Animated "AI is thinking" state, used instead of a plain "Loading..." string
 * while a generation request is in flight.
 */
function thinkingHTML(label = 'Generating your post package') {
  return `<div class="thinking"><span class="dots"><span></span><span></span><span></span></span><span class="label">${escapeHtml(label)}&hellip;</span></div>`;
}

/* ---------- Global micro-interactions ---------- */

// Button ripple effect on click, applied to any element with the .btn class.
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${(e.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2}px`;
  ripple.style.top = `${(e.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2}px`;
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});

// Subtle 3D tilt on hoverable cards (skipped on touch devices and reduced-motion).
(function enableCardTilt() {
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia && window.matchMedia('(hover: none)').matches;
  if (prefersReducedMotion || isTouch) return;

  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest && e.target.closest('.card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${(-py * 2.2).toFixed(2)}deg) rotateY(${(px * 2.2).toFixed(2)}deg) translateY(-3px)`;
  });
  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest && e.target.closest('.card');
    if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
  });
})();
