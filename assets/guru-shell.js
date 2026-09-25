/**
 * Shared guru layout shell — sidebar + topbar.
 * Usage (after auth success):
 *   import { mountGuruShell } from '../assets/guru-shell.js';
 *   mountGuruShell({ active: 'dashboard' | 'rekap' | 'bank' | 'susun', staff });
 */
import { signOut, auth } from './firebase-init.js';

const NAV = [
  { id: 'dashboard', href: './index.html',        icon: '🏠', label: 'Dashboard' },
  { id: 'rekap',     href: './rekap-tryout.html',  icon: '📊', label: 'Rekap Try Out' },
  { id: 'bank',      href: './bank-soal.html',     icon: '🗂️', label: 'Bank Soal' },
  { id: 'susun',     href: './susun-paket.html',   icon: '🧩', label: 'Susun Paket' },
];

function buildSidebarHTML(active, staff) {
  const nama = (staff && staff.nama) || 'Staf';
  const peran = (staff && staff.peran) || 'guru';
  const items = NAV.map(n => {
    const cls = n.id === active ? 'sidebar-link active' : 'sidebar-link';
    return `<a class="${cls}" href="${n.href}" data-nav="${n.id}">
      <span class="sidebar-icon">${n.icon}</span>
      <span>${n.label}</span>
    </a>`;
  }).join('');

  return `
<aside class="guru-sidebar" id="guru-sidebar" aria-label="Menu utama">
  <div class="sidebar-brand">
    <div class="brand-mark">TKA</div>
    <div class="brand-text">
      <div class="brand-name">Portal Latihan TKA</div>
      <div class="brand-sub">Area guru & admin</div>
    </div>
  </div>
  <nav class="sidebar-nav">
    <div class="sidebar-section">Menu</div>
    ${items}
  </nav>
  <div class="sidebar-footer">
    <div class="sidebar-user">
      <div class="user-name">${escapeHtml(nama)}</div>
      <div class="user-role">${escapeHtml(peran)}</div>
    </div>
    <button type="button" class="btn-logout" id="btn-logout-shell">Keluar</button>
  </div>
</aside>
<div class="sidebar-backdrop" id="sidebar-backdrop"></div>
`;
}

function buildTopbarHTML(active) {
  const current = NAV.find(n => n.id === active);
  const title = current ? current.label : 'Dashboard';
  return `
<header class="guru-topbar">
  <button type="button" class="btn-menu" id="btn-menu" aria-label="Buka menu">☰</button>
  <div class="topbar-title">${title}</div>
</header>
`;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

/**
 * Mount the shell around existing page content.
 * Expects #page to already exist (will be moved into .guru-content).
 */
export function mountGuruShell({ active = 'dashboard', staff = null } = {}) {
  if (document.getElementById('guru-sidebar')) return;

  const page = document.getElementById('page');
  if (!page) {
    console.warn('mountGuruShell: #page not found');
    return;
  }

  const layout = document.createElement('div');
  layout.className = 'guru-layout';
  layout.id = 'guru-layout';

  const sidebarWrap = document.createElement('div');
  sidebarWrap.innerHTML = buildSidebarHTML(active, staff);
  while (sidebarWrap.firstChild) layout.appendChild(sidebarWrap.firstChild);

  const main = document.createElement('div');
  main.className = 'guru-main';

  const topbarWrap = document.createElement('div');
  topbarWrap.innerHTML = buildTopbarHTML(active);
  while (topbarWrap.firstChild) main.appendChild(topbarWrap.firstChild);

  const content = document.createElement('div');
  content.className = 'guru-content';

  const oldHeader = page.querySelector('header.header, header.app-header');
  if (oldHeader) oldHeader.remove();

  while (page.firstChild) {
    content.appendChild(page.firstChild);
  }
  page.appendChild(content);
  page.style.display = '';
  page.classList.add('guru-page-ready');

  main.appendChild(page);
  layout.appendChild(main);

  document.body.insertBefore(layout, document.body.firstChild);

  const sidebar = document.getElementById('guru-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const btnMenu = document.getElementById('btn-menu');

  function openSidebar() {
    sidebar.classList.add('open');
    backdrop.classList.add('show');
    document.body.classList.add('sidebar-open');
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('show');
    document.body.classList.remove('sidebar-open');
  }

  btnMenu?.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) closeSidebar();
    else openSidebar();
  });
  backdrop?.addEventListener('click', closeSidebar);

  sidebar.querySelectorAll('.sidebar-link').forEach(a => {
    a.addEventListener('click', () => closeSidebar());
  });

  document.getElementById('btn-logout-shell')?.addEventListener('click', async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    location.href = '../index.html';
  });

  document.getElementById('btn-logout')?.remove();
}
