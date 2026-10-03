/**
 * Shared guru layout shell — sidebar + topbar.
 * Usage (after auth success):
 *   import { mountGuruShell } from '../assets/guru-shell.js';
 *   mountGuruShell({ active: 'dashboard' | 'rekap' | 'bank' | 'susun', staff });
 *
 * Admin-only:
 *   - Link kembali ke Admin Pusat (guru tidak melihat ini)
 *   - Pemilih sekolah kerja (filter data panel guru)
 */
import { signOut, auth, listSekolahAktif } from './firebase-init.js';
import {
  getSekolah,
  setSekolah,
  clearSekolah,
  SEKOLAH_SEED,
  SEKOLAH_DEFAULT_ID,
} from './sekolah-context.js';

const NAV = [
  { id: 'dashboard', href: './index.html',        icon: '🏠', label: 'Dashboard' },
  { id: 'rekap',     href: './rekap-tryout.html',  icon: '📊', label: 'Rekap Try Out' },
  { id: 'rekap-kelas', href: './rekap-kelas.html', icon: '🏫', label: 'Rekap per Kelas' },
  { id: 'monitor', href: './monitor-tryout.html', icon: '📡', label: 'Monitor Langsung' },
  { id: 'bank',      href: './bank-soal.html',     icon: '🗂️', label: 'Bank Soal' },
  { id: 'susun',     href: './susun-paket.html',   icon: '🧩', label: 'Susun Paket' },
];

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
  if (v === '__all__') {
    // Jangan hapus konteks siswa; admin filter terpisah
  } else {
    // Sinkronkan konteks sekolah agar resolveSekolahIdForWrite ikut
    const cur = getSekolah();
    if (!cur || cur.id !== v) {
      setSekolah({
        id: v,
        kode: v,
        nama: v,
        aktif: true,
      });
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
  const items = NAV.map(n => {
    const cls = n.id === active ? 'sidebar-link active' : 'sidebar-link';
    return `<a class="${cls}" href="${n.href}" data-nav="${n.id}">
      <span class="sidebar-icon">${n.icon}</span>
      <span>${n.label}</span>
    </a>`;
  }).join('');

  // Blok khusus admin: kembali ke Admin Pusat + pemilih sekolah
  const adminBlock = isAdmin ? `
  <div class="sidebar-section">Admin</div>
  <a class="sidebar-link sidebar-link-admin" href="../admin/" data-nav="admin" id="link-admin-pusat">
    <span class="sidebar-icon">⚙️</span>
    <span>Admin Pusat</span>
  </a>
  <div class="sidebar-sekolah-picker" id="admin-sekolah-picker">
    <label for="admin-sekolah-select">Sekolah kerja</label>
    <select id="admin-sekolah-select" aria-label="Pilih sekolah untuk panel guru">
      <option value="__all__">Semua sekolah</option>
    </select>
    <p class="sidebar-sekolah-hint">Filter data bank, paket, dan rekap. Guru tidak melihat opsi ini.</p>
  </div>
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
  const adminChip = isAdmin
    ? `<a class="topbar-admin-back" href="../admin/" title="Kembali ke Admin Pusat">⚙️ Admin Pusat</a>`
    : '';
  return `
<header class="guru-topbar">
  <button type="button" class="btn-menu" id="btn-menu" aria-label="Buka menu">☰</button>
  <div class="topbar-title">${title}</div>
  <div class="topbar-actions">${adminChip}</div>
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
    .sidebar-sekolah-picker {
      margin: 0 12px 14px;
      padding: 10px 12px;
      background: #f1f5f9;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    .sidebar-sekolah-picker label {
      display: block;
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
      margin-bottom: 6px;
    }
    .sidebar-sekolah-picker select {
      width: 100%;
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 700;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1.5px solid #cbd5e1;
      background: #fff;
      color: #1e293b;
    }
    .sidebar-sekolah-hint {
      margin: 6px 0 0;
      font-size: 0.68rem;
      font-weight: 600;
      color: #64748b;
      line-height: 1.35;
    }
    .guru-topbar {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .topbar-title { flex: 1; }
    .topbar-actions { display: flex; align-items: center; gap: 8px; }
    .topbar-admin-back {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.78rem;
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

  // ── Admin: isi dropdown sekolah + simpan filter ──
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

  // Opsi: semua + tiap sekolah
  const current = getAdminSekolahFilter() || '__all__';
  sel.innerHTML = '<option value="__all__">Semua sekolah</option>' +
    schools.map(s =>
      `<option value="${escapeHtml(s.id)}">${escapeHtml(s.nama || s.id)}</option>`
    ).join('');

  // Pastikan value valid
  const ids = new Set(['__all__', ...schools.map(s => s.id)]);
  sel.value = ids.has(current) ? current : '__all__';
  setAdminSekolahFilter(sel.value === '__all__' ? '__all__' : sel.value);

  // Lengkapi nama di konteks jika pilih sekolah spesifik
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
    // Muat ulang halaman agar query/filter ikut konteks baru
    location.reload();
  });
}
