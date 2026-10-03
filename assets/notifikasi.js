/**
 * Notifikasi in-app (koleksi Firestore: notifikasi)
 *
 * Jenis:
 *  - pengajuan_baru  → targetRole: 'admin'
 *  - tryout_dipublish / tryout_ditolak → targetUid: uid guru
 */
import { db, auth } from './firebase-init.js';
import {
  collection, addDoc, getDocs, doc, updateDoc, serverTimestamp, query, where, limit
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {{
 *   targetUid?: string|null,
 *   targetRole?: 'admin'|'guru'|null,
 *   jenis: string,
 *   judul: string,
 *   isi?: string,
 *   link?: string,
 *   refId?: string|null,
 * }} payload
 */
export async function buatNotifikasi(payload) {
  const data = {
    targetUid: payload.targetUid || null,
    targetRole: payload.targetRole || null,
    jenis: payload.jenis || 'info',
    judul: payload.judul || 'Notifikasi',
    isi: payload.isi || '',
    link: payload.link || null,
    refId: payload.refId || null,
    dibaca: false,
    createdAt: serverTimestamp(),
    createdBy: (auth.currentUser && auth.currentUser.uid) || null,
  };
  await addDoc(collection(db, 'notifikasi'), data);
}

/** Notifikasi ke semua admin (targetRole admin) */
export async function notifAdminPengajuanBaru({ nama, subjectId, diajukanOlehNama, pengajuanId, sekolahId }) {
  await buatNotifikasi({
    targetRole: 'admin',
    jenis: 'pengajuan_baru',
    judul: 'Pengajuan try out baru',
    isi: `${diajukanOlehNama || 'Guru'} mengajukan “${nama || 'Try Out'}” (${subjectId || '-'})` +
      (sekolahId ? ` · ${sekolahId}` : ''),
    // Logical path (diselesaikan di UI agar cocok subpath hosting)
    link: 'admin/pengajuan-tryout.html',
    refId: pengajuanId || null,
  });
}

/** Notifikasi ke guru pengaju */
export async function notifGuruStatusPengajuan({ targetUid, status, nama, packageId, pengajuanId }) {
  if (!targetUid) return;
  const dipublish = status === 'dipublish';
  await buatNotifikasi({
    targetUid,
    targetRole: 'guru',
    jenis: dipublish ? 'tryout_dipublish' : 'tryout_ditolak',
    judul: dipublish ? 'Try out siap dipakai' : 'Pengajuan try out ditolak',
    isi: dipublish
      ? `Usulan “${nama || 'Try Out'}” telah dipublish` + (packageId ? ` (paket ${packageId.slice(0, 8)}…)` : '')
      : `Usulan “${nama || 'Try Out'}” ditolak oleh admin.`,
    link: 'guru/ajukan-tryout.html',
    refId: pengajuanId || null,
  });
}

/** Prefix root situs dari URL saat ini (mendukung hosting di subfolder). */
export function siteRootPrefix() {
  const p = location.pathname || '/';
  const m = p.match(/^(.*?)\/(?:guru|admin|app)(?:\/|$)/);
  if (m) return m[1] || '';
  // file di root
  if (p.endsWith('/')) return p.slice(0, -1);
  return p.replace(/\/[^/]*$/, '');
}

/** Ubah link logikal (admin/…) menjadi href absolut-path di hosting ini */
export function resolveNotifLink(link) {
  if (!link || link === '#') return '#';
  if (/^https?:\/\//i.test(link) || link.startsWith('/')) return link;
  const root = siteRootPrefix();
  return `${root}/${String(link).replace(/^\//, '')}`;
}

/**
 * Ambil notifikasi untuk user saat ini (maks 40, gabung role admin jika admin).
 * @param {{ uid: string, peran?: string }} staff
 */
export async function ambilNotifikasi(staff) {
  const uid = staff?.uid || auth.currentUser?.uid;
  if (!uid) return [];
  const col = collection(db, 'notifikasi');
  const items = [];
  try {
    const snapUid = await getDocs(query(col, where('targetUid', '==', uid), limit(40)));
    snapUid.docs.forEach((d) => items.push({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('notif targetUid', e);
  }
  if (staff?.peran === 'admin') {
    try {
      const snapRole = await getDocs(query(col, where('targetRole', '==', 'admin'), limit(40)));
      snapRole.docs.forEach((d) => {
        if (!items.some((x) => x.id === d.id)) items.push({ id: d.id, ...d.data() });
      });
    } catch (e) {
      console.warn('notif targetRole', e);
    }
  }
  items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  return items.slice(0, 40);
}

export async function tandaiDibaca(id) {
  await updateDoc(doc(db, 'notifikasi', id), {
    dibaca: true,
    dibacaAt: serverTimestamp(),
  });
}

export async function tandaiSemuaDibaca(items) {
  const unread = (items || []).filter((n) => !n.dibaca);
  await Promise.all(unread.map((n) => tandaiDibaca(n.id).catch(() => {})));
}

function injectNotifStyles() {
  if (document.getElementById('tka-notif-css')) return;
  const style = document.createElement('style');
  style.id = 'tka-notif-css';
  style.textContent = `
    .tka-notif-wrap { position: relative; flex-shrink: 0; margin-left: 6px; }
    .tka-notif-btn {
      appearance: none; border: 1.5px solid #cbd5e1; background: #fff;
      border-radius: 10px; width: 38px; height: 36px; cursor: pointer;
      font-size: 1.05rem; line-height: 1; position: relative;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .tka-notif-btn:hover { background: #f1f5f9; }
    .tka-notif-badge {
      position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px;
      padding: 0 5px; border-radius: 999px; background: #dc2626; color: #fff;
      font-size: 0.65rem; font-weight: 800; display: none; align-items: center; justify-content: center;
    }
    .tka-notif-badge.show { display: inline-flex; }
    .tka-notif-panel {
      display: none; position: absolute; right: 0; top: calc(100% + 6px);
      width: min(340px, 92vw); max-height: 380px; overflow: auto;
      background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
      box-shadow: 0 12px 40px rgba(15,23,42,0.15); z-index: 200;
    }
    .tka-notif-panel.open { display: block; }
    .tka-notif-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 12px; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; background: #fff;
    }
    .tka-notif-head strong { font-size: 0.82rem; font-weight: 800; }
    .tka-notif-head button {
      border: none; background: none; font-size: 0.72rem; font-weight: 700;
      color: #1a56db; cursor: pointer;
    }
    .tka-notif-item {
      display: block; padding: 10px 12px; border-bottom: 1px solid #f1f5f9;
      text-decoration: none; color: inherit; cursor: pointer;
    }
    .tka-notif-item:hover { background: #f8fafc; }
    .tka-notif-item.unread { background: #eff6ff; }
    .tka-notif-item .j { font-size: 0.8rem; font-weight: 800; color: #0f172a; }
    .tka-notif-item .i { font-size: 0.72rem; font-weight: 600; color: #64748b; margin-top: 3px; line-height: 1.4; }
    .tka-notif-empty { padding: 20px; text-align: center; font-size: 0.8rem; font-weight: 600; color: #94a3b8; }
  `;
  document.head.appendChild(style);
}

/**
 * Pasang lonceng notifikasi di elemen container (mis. topbar).
 * @param {HTMLElement} container
 * @param {{ uid?: string, peran?: string }} staff
 */
export async function mountNotifikasiBell(container, staff) {
  if (!container) return;
  injectNotifStyles();

  const wrap = document.createElement('div');
  wrap.className = 'tka-notif-wrap';
  wrap.innerHTML = `
    <button type="button" class="tka-notif-btn" id="tka-notif-btn" title="Notifikasi" aria-label="Notifikasi">
      🔔<span class="tka-notif-badge" id="tka-notif-badge">0</span>
    </button>
    <div class="tka-notif-panel" id="tka-notif-panel" role="menu">
      <div class="tka-notif-head">
        <strong>Notifikasi</strong>
        <button type="button" id="tka-notif-readall">Tandai dibaca</button>
      </div>
      <div id="tka-notif-list"><div class="tka-notif-empty">Memuat…</div></div>
    </div>
  `;
  container.appendChild(wrap);

  const btn = wrap.querySelector('#tka-notif-btn');
  const panel = wrap.querySelector('#tka-notif-panel');
  const badge = wrap.querySelector('#tka-notif-badge');
  const list = wrap.querySelector('#tka-notif-list');
  let items = [];

  async function refresh() {
    try {
      items = await ambilNotifikasi(staff);
    } catch (e) {
      list.innerHTML = `<div class="tka-notif-empty">Gagal memuat</div>`;
      return;
    }
    const unread = items.filter((n) => !n.dibaca).length;
    badge.textContent = unread > 9 ? '9+' : String(unread);
    badge.classList.toggle('show', unread > 0);
    if (!items.length) {
      list.innerHTML = `<div class="tka-notif-empty">Belum ada notifikasi</div>`;
      return;
    }
    list.innerHTML = items.map((n) => {
      const href = resolveNotifLink(n.link || '#');
      return `
      <a class="tka-notif-item ${n.dibaca ? '' : 'unread'}" href="${escapeHtml(href)}" data-id="${escapeHtml(n.id)}">
        <div class="j">${escapeHtml(n.judul)}</div>
        <div class="i">${escapeHtml(n.isi || '')}</div>
      </a>`;
    }).join('');
    list.querySelectorAll('.tka-notif-item').forEach((a) => {
      a.addEventListener('click', async (ev) => {
        const id = a.getAttribute('data-id');
        const n = items.find((x) => x.id === id);
        if (n && !n.dibaca) {
          try { await tandaiDibaca(id); n.dibaca = true; } catch (_) {}
        }
        if (!n?.link || n.link === '#') ev.preventDefault();
      });
    });
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });
  document.addEventListener('click', () => panel.classList.remove('open'));
  panel.addEventListener('click', (e) => e.stopPropagation());
  wrap.querySelector('#tka-notif-readall').addEventListener('click', async () => {
    await tandaiSemuaDibaca(items);
    await refresh();
  });

  await refresh();
  // polling ringan tiap 60 detik
  setInterval(refresh, 60000);
}
