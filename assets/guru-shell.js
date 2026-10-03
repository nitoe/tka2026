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
  { id: 'rekap-kelas', href: './rekap-kelas.html', icon: '🏫', label: 'Rekap per Kelas' },
  { id: 'monitor', href: './monitor-tryout.html', icon: '📡', label: 'Monitor Langsung' },
  { id: 'bank',      href: './bank-soal.html',     icon: '🗂️', label: 'Bank Soal' },
  { id: 'susun',     href: './susun-paket.html',   icon: '🧩', label: 'Susun Paket' },
];

function buildSidebarHTML(active, staff) {
  const nama = (staff && staff.nama) || 'Staf';
  const peran = (staff && staff.peran) || 'guru';
  const isAdmin = peran === 'admin';
  const sekolahLabel = (staff && staff.sekolahId) ? staff.sekolahId : (isAdmin ? 'Semua sekolah' : '');
  const items = NAV.map(n => {
    const cls = n.id === active ? 'sidebar-link active' : 'sidebar-link';
    return `<a class="${cls}" href="${n.href}" data-nav="${n.id}">
      <span class="sidebar-icon">${n.icon}</span>
      <span>${n.label}</span>
    </a>`;
  }).join('');
  const adminLink = isAdmin
    ? `<a class="sidebar-link" href="../admin/" data-nav="admin">
      <span class="sidebar-icon">⚙️</span>
      <span>Admin Pusat</span>
    </a>`
    : '';

  return `
<aside class="guru-sidebar" id="guru-sidebar" aria-label="Menu utama">
  <div class="sidebar-brand">
    <div class="brand-mark">TKA</div>
    <div class="brand-text">
      <div class="brand-name">Portal Latihan TKA</div>
      <div class="brand-sub">${escapeHtml(sekolahLabel || 'Area guru')}</div>
    </div>
  </div>
  <nav class="sidebar-nav">
    <div class="sidebar-section">Menu</div>
    ${items}
    ${adminLink}
  </nav>
  <div class="sidebar-footer">
    <div class="sidebar-user">
      <div class="user-name">${escapeHtml(nama)}</div>
      <div class="user-role">${escapeHtml(peran)}${sekolahLabel && !isAdmin ? ' · ' + escapeHtml(sekolahLabel) : ''}</div>
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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Mount the shell around existing page content.
 * Expects #page to already exist (will be moved into .guru-content).
 */
export function mountGuruShell({ active = 'dashboard', staff = null } = {}) {
  // Prevent double-mount
  if (document.getElementById('guru-sidebar')) return;

  const page = document.getElementById('page');
  if (!page) {
    console.warn('mountGuruShell: #page not found');
    return;
  }

  // Create layout wrapper
  const layout = document.createElement('div');
  layout.className = 'guru-layout';
  layout.id = 'guru-layout';

  // Sidebar
  const sidebarWrap = document.createElement('div');
  sidebarWrap.innerHTML = buildSidebarHTML(active, staff);
  while (sidebarWrap.firstChild) layout.appendChild(sidebarWrap.firstChild);

  // Main column
  const main = document.createElement('div');
  main.className = 'guru-main';

  const topbarWrap = document.createElement('div');
  topbarWrap.innerHTML = buildTopbarHTML(active);
  while (topbarWrap.firstChild) main.appendChild(topbarWrap.firstChild);

  const content = document.createElement('div');
  content.className = 'guru-content';

  // Move existing page children into content (skip old header if present)
  const oldHeader = page.querySelector('header.header, header.app-header');
  if (oldHeader) oldHeader.remove();

  // Move remaining children of #page into content
  while (page.firstChild) {
    content.appendChild(page.firstChild);
  }
  // Put content back into #page so existing JS that toggles #page still works
  page.appendChild(content);
  page.style.display = ''; // let layout control visibility
  page.classList.add('guru-page-ready');

  main.appendChild(page);
  layout.appendChild(main);

  // Insert layout at body start (after loading screens)
  document.body.insertBefore(layout, document.body.firstChild);

  // Wire interactions
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

  // Close on nav click (mobile)
  sidebar.querySelectorAll('.sidebar-link').forEach(a => {
    a.addEventListener('click', () => closeSidebar());
  });

  // Logout → gerbang pilih sekolah
  document.getElementById('btn-logout-shell')?.addEventListener('click', async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    location.href = '../index.html';
  });


  // Hide any leftover page-level logout buttons
  document.getElementById('btn-logout')?.remove();
}
