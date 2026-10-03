/**
 * Shared guru layout shell — sidebar + topbar.
 * Usage (after auth success):
 *   import { mountGuruShell } from '../assets/guru-shell.js';
 *   mountGuruShell({ active: 'dashboard' | 'rekap' | 'bank' | 'susun', staff });
 *
 * Admin-only:
 *   - Link kembali ke Admin Pusat (guru tidak melihat ini)
 *   - Pemilih sekolah kerja di topbar (compact, tanpa scroll sidebar)
 */
import { signOut, auth, listSekolahAktif } from './firebase-init.js';
import {
  getSekolah,
  setSekolah,
  SEKOLAH_SEED,
} from './sekolah-context.js';

const NAV = [
  { id: 'dashboard', href: './index.html',        icon: '🏠', label: 'Dashboard' },
  { id: 'rekap',     href: './rekap-tryout.html',  icon: '📊', label: 'Rekap Try Out' },
  { id: 'rekap-kelas', href: './rekap-kelas.html', icon: '🏫', label: 'Rekap per Kelas' },
  { id: 'monitor', href: './monitor-tryout.html', icon: '📡', label: 'Monitor Langsung' },
  { id: 'bank',      href: './bank-soal.html',     icon: '🗂️', label: 'Bank Soal' },
  { id: 'susun',     href: './susun-paket.html',   icon: '🧩', label: 'Susun Paket' },
];

/** Label menu susun: guru = Latihan TKA; admin = Susun Paket penuh */
function navForStaff(staff) {
  const isAdmin = staff && staff.peran === 'admin';
  return NAV.map((n) => {
    if (n.id === 'susun') {
      return {
        ...n,
        label: isAdmin ? 'Susun Paket' : 'Susun Latihan TKA',
      };
    }
    return n;
  });
}

/** Key: filter sekolah admin di panel guru. '__all__' = semua sekolah. */
const ADMIN_FILTER_KEY = 'tka2026_admin_sekolah_filter';

export function getAdminSekolahFilter() {
  try {
    return sessionStorage.getItem(ADMIN_FILTER_KEY)
      || localStorage.getItem(ADMIN_FILTER_KEY)
      || null;
  } catch {
    return null;
  }
}

/** @param {string|null} id null/__all__ = semua */
export function setAdminSekolahFilter(id) {
  const v = !id || id === '__all__' ? '__all__' : String(id);
  try {
    sessionStorage.setItem(ADMIN_FILTER_KEY, v);
    localStorage.setItem(ADMIN_FILTER_KEY, v);
  } catch (_) {}
  if (v !== '__all__') {
    const cur = getSekolah();
    if (!cur || cur.id !== v) {
      setSekolah({ id: v, kode: v, nama: v, aktif: true });
    }
  }
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildSidebarHTML(active, staff) {
  const nama = (staff && staff.nama) || 'Staf';
  const peran = (staff && staff.peran) || 'guru';
  const isAdmin = peran === 'admin';
  const items = navForStaff(staff).map(n => {
    const cls = n.id === active ? 'sidebar-link active' : 'sidebar-link';
    return `<a class="${cls}" href="${n.href}" data-nav="${n.id}">
      <span class="sidebar-icon">${n.icon}</span>
      <span>${n.label}</span>
    </a>`;
  }).join('');

  // Hanya link Admin Pusat di sidebar (ringkas); pemilih sekolah di topbar
  const adminBlock = isAdmin ? `
  <div class="sidebar-section">Admin</div>
  <a class="sidebar-link sidebar-link-admin" href="../admin/" data-nav="admin" id="link-admin-pusat">
    <span class="sidebar-icon">⚙️</span>
    <span>Admin Pusat</span>
  </a>
  ` : '';

  const brandSub = isAdmin
    ? 'Mode admin · panel guru'
    : ((staff && staff.sekolahId) ? staff.sekolahId : 'Area guru');

  return `
<aside class="guru-sidebar" id="guru-sidebar" aria-label="Menu utama">
  <div class="sidebar-brand">
    <div class="brand-mark">TKA</div>
    <div class="brand-text">
      <div class="brand-name">Portal Latihan TKA</div>
      <div class="brand-sub">${escapeHtml(brandSub)}</div>
    </div>
  </div>
  <nav class="sidebar-nav">
    ${adminBlock}
    <div class="sidebar-section">Menu</div>
    ${items}
  </nav>
  <div class="sidebar-footer">
    <div class="sidebar-user">
      <div class="user-name">${escapeHtml(nama)}</div>
      <div class="user-role">${escapeHtml(peran)}${isAdmin ? ' · super' : ''}</div>
    </div>
    <button type="button" class="btn-logout" id="btn-logout-shell">Keluar</button>
  </div>
</aside>
<div class="sidebar-backdrop" id="sidebar-backdrop"></div>
`;
}

function buildTopbarHTML(active, staff) {
  const current = NAV.find(n => n.id === active);
  const title = current ? current.label : 'Dashboard';
  const isAdmin = staff && staff.peran === 'admin';

  // Pemilih sekolah + link admin di topbar (satu baris, tidak memicu scroll sidebar)
  const adminTools = isAdmin ? `
  <div class="topbar-admin-tools">
    <label class="topbar-sekolah-label" for="admin-sekolah-select">🏫</label>
    <select id="admin-sekolah-select" class="topbar-sekolah-select" title="Sekolah kerja — filter data panel guru" aria-label="Pilih sekolah kerja">
      <option value="__all__">Semua sekolah</option>
    </select>
    <a class="topbar-admin-back" href="../admin/" title="Kembali ke Admin Pusat">⚙️ Admin Pusat</a>
  </div>` : '';

  return `
<header class="guru-topbar">
  <button type="button" class="btn-menu" id="btn-menu" aria-label="Buka menu">☰</button>
  <div class="topbar-title">${title}</div>
  ${adminTools}
</header>
`;
}

function injectAdminStyles() {
  if (document.getElementById('guru-shell-admin-css')) return;
  const style = document.createElement('style');
  style.id = 'guru-shell-admin-css';
  style.textContent = `
    .sidebar-link-admin {
      background: rgba(37, 99, 235, 0.12) !important;
      border: 1px solid rgba(37, 99, 235, 0.25);
      border-radius: 10px;
      margin: 0 10px 8px;
      font-weight: 800 !important;
    }
    .sidebar-link-admin:hover {
      background: rgba(37, 99, 235, 0.2) !important;
    }
    .guru-topbar {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: nowrap;
    }
    .topbar-title {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .topbar-admin-tools {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      margin-left: auto;
    }
    .topbar-sekolah-label {
      font-size: 0.95rem;
      line-height: 1;
      cursor: default;
      opacity: 0.85;
    }
    .topbar-sekolah-select {
      max-width: min(220px, 42vw);
      font-family: inherit;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 6px 28px 6px 10px;
      border-radius: 999px;
      border: 1.5px solid #cbd5e1;
      background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2364748b' stroke-width='1.5' fill='none'/%3E%3C/svg%3E") no-repeat right 10px center;
      color: #1e293b;
      appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
      outline: none;
    }
    .topbar-sekolah-select:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    .topbar-admin-back {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.76rem;
      font-weight: 800;
      color: #1e40af;
      background: #dbeafe;
      border: 1px solid #93c5fd;
      border-radius: 999px;
      padding: 6px 12px;
      text-decoration: none;
      white-space: nowrap;
    }
    .topbar-admin-back:hover { background: #bfdbfe; }
    @media (max-width: 640px) {
      .topbar-sekolah-select { max-width: min(150px, 36vw); font-size: 0.72rem; padding: 5px 24px 5px 8px; }
      .topbar-admin-back { padding: 5px 8px; font-size: 0.7rem; }
      .topbar-admin-back { font-size: 0; padding: 6px 10px; } /* icon only on very small */
      .topbar-admin-back::first-line { font-size: 0.76rem; }
    }
  `;
  document.head.appendChild(style);
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

  injectAdminStyles();

  const layout = document.createElement('div');
  layout.className = 'guru-layout';
  layout.id = 'guru-layout';

  const sidebarWrap = document.createElement('div');
  sidebarWrap.innerHTML = buildSidebarHTML(active, staff);
  while (sidebarWrap.firstChild) layout.appendChild(sidebarWrap.firstChild);

  const main = document.createElement('div');
  main.className = 'guru-main';

  const topbarWrap = document.createElement('div');
  topbarWrap.innerHTML = buildTopbarHTML(active, staff);
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
    sidebar?.classList.add('open');
    backdrop?.classList.add('show');
    document.body.classList.add('sidebar-open');
  }
  function closeSidebar() {
    sidebar?.classList.remove('open');
    backdrop?.classList.remove('show');
    document.body.classList.remove('sidebar-open');
  }

  btnMenu?.addEventListener('click', () => {
    if (sidebar?.classList.contains('open')) closeSidebar();
    else openSidebar();
  });
  backdrop?.addEventListener('click', closeSidebar);

  sidebar?.querySelectorAll('.sidebar-link').forEach(a => {
    a.addEventListener('click', () => closeSidebar());
  });

  document.getElementById('btn-logout-shell')?.addEventListener('click', async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    location.href = '../index.html';
  });

  document.getElementById('btn-logout')?.remove();

  if (staff && staff.peran === 'admin') {
    initAdminSekolahPicker();
  }
}

async function initAdminSekolahPicker() {
  const sel = document.getElementById('admin-sekolah-select');
  if (!sel) return;

  let schools = [];
  try {
    schools = await listSekolahAktif(SEKOLAH_SEED);
  } catch (_) {
    schools = SEKOLAH_SEED.slice();
  }
  if (!schools.length) schools = SEKOLAH_SEED.slice();

  const current = getAdminSekolahFilter() || '__all__';
  sel.innerHTML = '<option value="__all__">Semua sekolah</option>' +
    schools.map(s =>
      `<option value="${escapeHtml(s.id)}">${escapeHtml(s.nama || s.id)}</option>`
    ).join('');

  const ids = new Set(['__all__', ...schools.map(s => s.id)]);
  sel.value = ids.has(current) ? current : '__all__';
  setAdminSekolahFilter(sel.value === '__all__' ? '__all__' : sel.value);

  if (sel.value !== '__all__') {
    const s = schools.find(x => x.id === sel.value);
    if (s) setSekolah(s);
  }

  sel.addEventListener('change', () => {
    const v = sel.value;
    setAdminSekolahFilter(v);
    if (v !== '__all__') {
      const s = schools.find(x => x.id === v);
      if (s) setSekolah(s);
    }
    location.reload();
  });
}
