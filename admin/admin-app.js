
import { firebaseConfig } from '../firebase-config.js';
import {
  isConfigured, auth, db,
  onAuthStateChanged, signOut,
  getStaffDoc,
  doc, setDoc, getDocs, collection, query, where, serverTimestamp,
  createUserWithEmailAndPassword,
} from '../assets/firebase-init.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';

const gate = document.getElementById('gate');
const appEl = document.getElementById('app');
const gateMsg = document.getElementById('gate-msg');
const modal = document.getElementById('modal-sekolah');

if (!isConfigured) {
  gate.style.display = 'block';
  gateMsg.textContent = 'Firebase belum dikonfigurasi.';
}

const secondaryApp = isConfigured ? initializeApp(firebaseConfig, 'admin-secondary') : null;
const secondaryAuth = secondaryApp ? getAuth(secondaryApp) : null;

let sekolahList = [];
let currentSekolahId = null;
let siswaPayload = null;

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}
function slugEmailLocal(nama) {
  return String(nama || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 48) || 'siswa';
}

const sidebar = document.getElementById('admin-sidebar');
const backdrop = document.getElementById('backdrop-side');
function openSidebar() {
  sidebar.classList.add('open');
  backdrop.classList.add('show');
}
function closeSidebar() {
  sidebar.classList.remove('open');
  backdrop.classList.remove('show');
}
document.getElementById('btn-menu')?.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
backdrop?.addEventListener('click', closeSidebar);

function clearNavActive() {
  document.querySelectorAll('.nav-link').forEach((n) => n.classList.remove('active'));
  document.querySelectorAll('.nav-school').forEach((n) => n.classList.remove('active'));
}
function showView(viewId) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.getElementById('view-' + viewId)?.classList.add('active');
  closeSidebar();
}
function goManage() {
  currentSekolahId = null;
  clearNavActive();
  document.getElementById('nav-manage')?.classList.add('active');
  document.getElementById('topbar-title').innerHTML = 'Kelola sekolah';
  showView('manage');
}
function goLanjutan() {
  currentSekolahId = null;
  clearNavActive();
  document.getElementById('nav-lanjutan')?.classList.add('active');
  document.getElementById('topbar-title').innerHTML = 'Perawatan data';
  showView('lanjutan');
}
async function openSchool(id) {
  const s = sekolahList.find((x) => x.id === id);
  if (!s) return;
  currentSekolahId = id;
  clearNavActive();
  document.querySelector(`.nav-school[data-sid="${CSS.escape(id)}"]`)?.classList.add('active');
  document.getElementById('school-workspace-title').textContent = s.nama || s.id;
  document.getElementById('topbar-title').innerHTML =
    escapeHtml(s.nama || s.id) + '<small>Data khusus sekolah ini</small>';
  showView('school');
  switchTab('identitas');
  fillIdentitasForm(s);
  await Promise.all([loadGuruList(id), loadSiswaList(id)]);
}
document.getElementById('nav-manage')?.addEventListener('click', goManage);
document.getElementById('nav-lanjutan')?.addEventListener('click', goLanjutan);

function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-tab') === name);
  });
  document.querySelectorAll('.tab-panel').forEach((p) => {
    p.classList.toggle('active', p.id === 'tab-' + name);
  });
}
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
});

function renderActiveNav() {
  const wrap = document.getElementById('nav-active-schools');
  const aktif = sekolahList.filter((s) => s.aktif !== false);
  if (!aktif.length) {
    wrap.innerHTML = '<div class="nav-school-empty">Belum ada sekolah aktif.<br>Aktifkan dari Kelola sekolah.</div>';
    return;
  }
  wrap.innerHTML = aktif.map((s) => `
    <button type="button" class="nav-school ${currentSekolahId === s.id ? 'active' : ''}"
      data-sid="${escapeAttr(s.id)}" title="${escapeAttr(s.nama || s.id)}">
      ${escapeHtml(s.nama || s.id)}
    </button>`).join('');
  wrap.querySelectorAll('.nav-school').forEach((btn) => {
    btn.addEventListener('click', () => openSchool(btn.getAttribute('data-sid')));
  });
}

async function loadSekolah() {
  const snap = await getDocs(collection(db, 'sekolah'));
  sekolahList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  sekolahList.sort((a, b) => String(a.nama || '').localeCompare(String(b.nama || ''), 'id'));
  renderSchoolGrid();
  renderActiveNav();
}

function renderSchoolGrid() {
  const grid = document.getElementById('school-grid');
  if (!sekolahList.length) {
    grid.innerHTML = `<div class="empty-box">Belum ada sekolah.<br>
      <button type="button" class="btn btn-primary" style="margin-top:14px" id="btn-empty-tambah">+ Tambah sekolah</button></div>`;
    document.getElementById('btn-empty-tambah')?.addEventListener('click', openModal);
    return;
  }
  grid.innerHTML = sekolahList.map((s) => {
    const isOn = s.aktif !== false;
    return `<article class="school-card">
      <div class="school-icon">🏫</div>
      <div class="school-body">
        <div class="school-name">${escapeHtml(s.nama || s.id)}</div>
        <div class="school-meta">${escapeHtml(s.alamat || 'Alamat belum diisi')}${s.namaKepalaSekolah ? ' · ' + escapeHtml(s.namaKepalaSekolah) : ''}</div>
        <span class="school-code">${escapeHtml(s.kode || s.id)}</span>
        <span class="badge ${isOn ? 'on' : 'off'}" style="margin-left:6px">${isOn ? 'Aktif' : 'Dimatikan'}</span>
      </div>
      <div class="school-actions">
        ${isOn ? `<button type="button" class="btn btn-primary btn-sm" data-open="${escapeAttr(s.id)}">Kelola data</button>` : ''}
        <button type="button" class="btn btn-sm ${isOn ? 'btn-danger' : 'btn-primary'}" data-toggle="${escapeAttr(s.id)}">
          ${isOn ? 'Matikan' : 'Aktifkan'}
        </button>
      </div>
    </article>`;
  }).join('');
  grid.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => openSchool(btn.getAttribute('data-open')));
  });
  grid.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => toggleAktif(btn.getAttribute('data-toggle')));
  });
}

async function toggleAktif(id) {
  const s = sekolahList.find((x) => x.id === id);
  if (!s) return;
  const next = s.aktif === false;
  const msg = next
    ? `Aktifkan "${s.nama || id}"?\nSekolah akan muncul di menu kiri dan di halaman login.`
    : `Matikan "${s.nama || id}"?\nSekolah hilang dari menu kiri dan halaman login.`;
  if (!confirm(msg)) return;
  await setDoc(doc(db, 'sekolah', id), { aktif: next, updatedAt: serverTimestamp() }, { merge: true });
  await loadSekolah();
  if (currentSekolahId === id && !next) goManage();
  alert(next
    ? 'Sekolah diaktifkan. Menu kiri sudah diperbarui.'
    : 'Sekolah dimatikan. Menu kiri sudah diperbarui.');
}

function openModal() {
  document.getElementById('form-sekolah').reset();
  document.getElementById('status-sekolah').textContent = '';
  modal.classList.add('show');
}
function closeModal() { modal.classList.remove('show'); }
document.getElementById('btn-open-tambah').addEventListener('click', openModal);
document.getElementById('btn-close-modal').addEventListener('click', closeModal);
document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

document.getElementById('form-sekolah').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('status-sekolah');
  status.className = 'status';
  const kode = document.getElementById('f-kode').value.trim().toUpperCase().replace(/\s+/g, '');
  const nama = document.getElementById('f-nama').value.trim();
  if (!kode || !nama) {
    status.textContent = 'Kode dan nama wajib diisi.';
    status.className = 'status err';
    return;
  }
  try {
    await setDoc(doc(db, 'sekolah', kode), {
      kode, nama,
      alamat: document.getElementById('f-alamat').value.trim(),
      namaKepalaSekolah: document.getElementById('f-kepala').value.trim(),
      nbmKepala: document.getElementById('f-nbm').value.trim(),
      aktif: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    status.textContent = '✅ Sekolah disimpan dan diaktifkan.';
    status.className = 'status ok';
    await loadSekolah();
    setTimeout(() => { closeModal(); openSchool(kode); }, 400);
  } catch (err) {
    status.textContent = 'Gagal: ' + (err.message || err.code);
    status.className = 'status err';
  }
});

function fillIdentitasForm(s) {
  document.getElementById('id-edit-id').value = s.id;
  document.getElementById('id-kode').value = s.kode || s.id;
  document.getElementById('id-nama').value = s.nama || '';
  document.getElementById('id-alamat').value = s.alamat || '';
  document.getElementById('id-kepala').value = s.namaKepalaSekolah || '';
  document.getElementById('id-nbm').value = s.nbmKepala || '';
  document.getElementById('status-identitas').textContent = '';
}

document.getElementById('form-identitas').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('status-identitas');
  const id = document.getElementById('id-edit-id').value;
  const nama = document.getElementById('id-nama').value.trim();
  if (!id || !nama) {
    status.textContent = 'Nama wajib diisi.';
    status.className = 'status err';
    return;
  }
  try {
    await setDoc(doc(db, 'sekolah', id), {
      nama,
      alamat: document.getElementById('id-alamat').value.trim(),
      namaKepalaSekolah: document.getElementById('id-kepala').value.trim(),
      nbmKepala: document.getElementById('id-nbm').value.trim(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    status.textContent = '✅ Identitas disimpan.';
    status.className = 'status ok';
    await loadSekolah();
    document.getElementById('school-workspace-title').textContent = nama;
    document.getElementById('topbar-title').innerHTML =
      escapeHtml(nama) + '<small>Data khusus sekolah ini</small>';
  } catch (err) {
    status.textContent = 'Gagal: ' + (err.message || err.code);
    status.className = 'status err';
  }
});

function belongsToSchool(data, sekolahId) {
  const sid = data && data.sekolahId;
  if (sid != null && sid !== '') return String(sid) === String(sekolahId);
  // Data lama tanpa sekolahId → milik sekolah default Kukusan
  return String(sekolahId) === 'SDM01KUKUSAN';
}

async function loadGuruList(sekolahId) {
  const wrap = document.getElementById('guru-list-wrap');
  wrap.innerHTML = '<div class="empty-box" style="box-shadow:none;padding:20px">Memuat…</div>';
  try {
    // Ambil semua staff lalu filter di klien agar data lama (tanpa sekolahId) ikut tampil
    const snap = await getDocs(collection(db, 'staff'));
    let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .filter((r) => {
        if (r.peran === 'admin') return false;
        // peran guru, atau tanpa peran (data lama) tapi bukan admin
        const isGuru = !r.peran || r.peran === 'guru';
        return isGuru && belongsToSchool(r, sekolahId);
      });

    // Lengkapi dari loginRoster jika staff kosong / kurang
    try {
      const rosterSnap = await getDocs(collection(db, 'loginRoster'));
      const rosterGuru = rosterSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        .filter((r) => (r.jenis === 'guru' || r.peran === 'guru') && belongsToSchool(r, sekolahId));
      const emails = new Set(rows.map((r) => (r.emailLogin || '').toLowerCase()).filter(Boolean));
      for (const r of rosterGuru) {
        const em = (r.emailLogin || '').toLowerCase();
        if (em && emails.has(em)) continue;
        rows.push({
          id: r.id,
          nama: r.nama,
          emailLogin: r.emailLogin,
          aktif: true,
          _fromRoster: true,
          sekolahId: r.sekolahId,
        });
        if (em) emails.add(em);
      }
    } catch (_) { /* loginRoster opsional */ }

    rows.sort((a, b) => String(a.nama || '').localeCompare(String(b.nama || ''), 'id'));
    if (!rows.length) {
      wrap.innerHTML = `<div class="empty-box" style="box-shadow:none;padding:20px">
        Belum ada guru untuk sekolah ini.<br>
        <span style="font-size:0.8rem;font-weight:600">Jika data sudah pernah dibuat sebelum multi-sekolah, gunakan tombol “Hubungkan data lama” di bawah.</span>
      </div>
      <div style="margin-top:12px">${hubungkanBtnHtml()}</div>`;
      bindHubungkanBtn();
      return;
    }
    const legacyCount = rows.filter((r) => r.sekolahId == null || r.sekolahId === '').length;
    wrap.innerHTML = `
      ${legacyCount ? `<p class="hint">${legacyCount} data belum bertanda sekolah (data lama). Disarankan hubungkan ke sekolah ini.</p>
        <div style="margin-bottom:12px">${hubungkanBtnHtml()}</div>` : ''}
      <table class="data-table"><thead><tr><th>Nama</th><th>Email masuk</th><th>Status</th></tr></thead>
      <tbody>${rows.map((r) => `<tr>
        <td><strong>${escapeHtml(r.nama || '—')}</strong>${r.sekolahId ? '' : ' <span class="badge off">data lama</span>'}</td>
        <td>${escapeHtml(r.emailLogin || '—')}</td>
        <td><span class="badge ${r.aktif !== false ? 'on' : 'off'}">${r.aktif !== false ? 'Aktif' : 'Dimatikan'}</span></td>
      </tr>`).join('')}</tbody></table>
      <p class="hint" style="margin-top:10px;margin-bottom:0">${rows.length} guru</p>`;
    bindHubungkanBtn();
  } catch (err) {
    wrap.innerHTML = `<div class="status err">Gagal memuat: ${escapeHtml(err.message)}</div>`;
  }
}

function hubungkanBtnHtml() {
  return `<button type="button" class="btn btn-ghost btn-sm" id="btn-hubungkan-lama">Hubungkan data lama ke sekolah ini</button>
    <div class="status" id="status-hubungkan"></div>`;
}

function bindHubungkanBtn() {
  document.getElementById('btn-hubungkan-lama')?.addEventListener('click', hubungkanDataLama);
}

async function hubungkanDataLama() {
  if (!currentSekolahId) return;
  const status = document.getElementById('status-hubungkan');
  if (status) {
    status.className = 'status';
    status.textContent = 'Menghubungkan data lama…';
  }
  const target = currentSekolahId;
  let n = 0;
  try {
    for (const col of ['staff', 'students', 'loginRoster']) {
      const snap = await getDocs(collection(db, col));
      for (const d of snap.docs) {
        const data = d.data();
        if (data.sekolahId != null && data.sekolahId !== '') continue;
        // Jangan sentuh super-admin
        if (col === 'staff' && data.peran === 'admin') continue;
        await setDoc(doc(db, col, d.id), { sekolahId: target }, { merge: true });
        n++;
      }
    }
    if (status) {
      status.textContent = n
        ? `✅ ${n} data ditandai milik ${target}.`
        : 'Tidak ada data lama yang perlu ditandai.';
      status.className = 'status ok';
    }
    await Promise.all([loadGuruList(target), loadSiswaList(target)]);
  } catch (err) {
    if (status) {
      status.textContent = 'Gagal: ' + (err.message || err.code);
      status.className = 'status err';
    }
  }
}

document.getElementById('btn-add-guru').addEventListener('click', async () => {
  const status = document.getElementById('status-guru');
  status.className = 'status';
  if (!currentSekolahId) {
    status.textContent = 'Pilih sekolah dulu dari menu kiri.';
    status.className = 'status err';
    return;
  }
  const nama = document.getElementById('g-nama').value.trim();
  const email = document.getElementById('g-email').value.trim().toLowerCase();
  const pass = document.getElementById('g-pass').value;
  if (!nama || !email || pass.length < 6) {
    status.textContent = 'Lengkapi nama, email, dan kata sandi (min. 6).';
    status.className = 'status err';
    return;
  }
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    await setDoc(doc(db, 'staff', cred.user.uid), {
      nama, peran: 'guru', sekolahId: currentSekolahId,
      emailLogin: email, aktif: true, createdAt: serverTimestamp(),
    });
    await setDoc(doc(db, 'loginRoster', cred.user.uid), {
      sekolahId: currentSekolahId, nama, emailLogin: email, jenis: 'guru', peran: 'guru', kelas: '',
    });
    status.textContent = '✅ Akun guru dibuat: ' + nama;
    status.className = 'status ok';
    document.getElementById('g-nama').value = '';
    document.getElementById('g-email').value = '';
    document.getElementById('g-pass').value = '';
    await loadGuruList(currentSekolahId);
  } catch (err) {
    status.textContent = 'Gagal: ' + (err.code || err.message);
    status.className = 'status err';
  }
});

async function loadSiswaList(sekolahId) {
  const wrap = document.getElementById('siswa-list-wrap');
  wrap.innerHTML = '<div class="empty-box" style="box-shadow:none;padding:20px">Memuat…</div>';
  try {
    const snap = await getDocs(collection(db, 'students'));
    let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .filter((r) => belongsToSchool(r, sekolahId));

    // Lengkapi dari loginRoster (siswa) — dipakai dropdown login
    try {
      const rosterSnap = await getDocs(collection(db, 'loginRoster'));
      const rosterSiswa = rosterSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        .filter((r) => (r.jenis === 'siswa' || (!r.jenis && !r.peran)) && belongsToSchool(r, sekolahId));
      const emails = new Set(rows.map((r) => (r.emailLogin || '').toLowerCase()).filter(Boolean));
      const names = new Set(rows.map((r) => (r.nama || '').toLowerCase()).filter(Boolean));
      for (const r of rosterSiswa) {
        const em = (r.emailLogin || '').toLowerCase();
        const nm = (r.nama || '').toLowerCase();
        if (em && emails.has(em)) continue;
        if (!em && nm && names.has(nm)) continue;
        rows.push({
          id: r.id,
          nama: r.nama,
          kelas: r.kelas || '',
          nisn: r.nisn || '',
          emailLogin: r.emailLogin || '',
          sekolahId: r.sekolahId,
          _fromRoster: true,
        });
        if (em) emails.add(em);
        if (nm) names.add(nm);
      }
    } catch (_) {}

    rows.sort((a, b) => String(a.nama || '').localeCompare(String(b.nama || ''), 'id'));
    if (!rows.length) {
      wrap.innerHTML = `<div class="empty-box" style="box-shadow:none;padding:20px">
        Belum ada siswa untuk sekolah ini.<br>
        <span style="font-size:0.8rem;font-weight:600">Jika data sudah pernah ada, tekan “Hubungkan data lama” di tab Akun guru atau di bawah.</span>
      </div>
      <div style="margin-top:12px">${hubungkanBtnHtml()}</div>`;
      bindHubungkanBtn();
      return;
    }
    const legacyCount = rows.filter((r) => r.sekolahId == null || r.sekolahId === '').length;
    wrap.innerHTML = `
      ${legacyCount ? `<p class="hint">${legacyCount} data belum bertanda sekolah (data lama).</p>
        <div style="margin-bottom:12px">${hubungkanBtnHtml()}</div>` : ''}
      <div style="overflow-x:auto"><table class="data-table">
      <thead><tr><th>Nama</th><th>Kelas</th><th>NISN</th><th>Email masuk</th></tr></thead>
      <tbody>${rows.map((r) => `<tr>
        <td><strong>${escapeHtml(r.nama || '—')}</strong>${r.sekolahId ? '' : ' <span class="badge off">data lama</span>'}</td>
        <td>${escapeHtml(r.kelas || '—')}</td>
        <td>${escapeHtml(r.nisn || '—')}</td>
        <td>${escapeHtml(r.emailLogin || '—')}</td>
      </tr>`).join('')}</tbody></table></div>
      <p class="hint" style="margin-top:10px;margin-bottom:0">${rows.length} siswa</p>`;
    bindHubungkanBtn();
  } catch (err) {
    wrap.innerHTML = `<div class="status err">Gagal memuat: ${escapeHtml(err.message)}</div>`;
  }
}

document.getElementById('s-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const preview = document.getElementById('s-preview');
  const btn = document.getElementById('btn-import-siswa');
  siswaPayload = null;
  btn.disabled = true;
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data)) throw new Error('Bukan array');
    siswaPayload = data;
    preview.textContent = data.length + ' baris terbaca. Siap diimpor ke sekolah ini.';
    btn.disabled = false;
  } catch {
    preview.textContent = 'File JSON tidak valid.';
  }
});

document.getElementById('btn-import-siswa').addEventListener('click', async () => {
  if (!siswaPayload || !currentSekolahId) return;
  const status = document.getElementById('status-siswa');
  const log = document.getElementById('s-log');
  const btn = document.getElementById('btn-import-siswa');
  btn.disabled = true;
  log.innerHTML = '';
  let ok = 0, err = 0;
  for (const row of siswaPayload) {
    const nama = (row.nama || '').trim();
    const nisn = String(row.nisn || row.passwordDefault || '').trim();
    const kelas = (row.kelas || '').trim();
    let email = (row.emailLogin || row.email || '').trim().toLowerCase();
    if (!email && nama) {
      email = slugEmailLocal(nama) + '@' + currentSekolahId.toLowerCase() + '.tka2026.id';
    }
    if (!nama || !nisn || !email) {
      log.innerHTML += `<div>❌ ${escapeHtml(nama || '(tanpa nama)')}: data tidak lengkap</div>`;
      err++;
      continue;
    }
    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, nisn);
      await setDoc(doc(db, 'students', cred.user.uid), {
        nama, nisn, kelas, sekolahId: currentSekolahId,
        emailLogin: email, aktif: true, createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'loginRoster', cred.user.uid), {
        sekolahId: currentSekolahId, nama, kelas, emailLogin: email, jenis: 'siswa',
      });
      log.innerHTML += `<div>✅ ${escapeHtml(nama)}</div>`;
      ok++;
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        log.innerHTML += `<div>⏭ ${escapeHtml(nama)}: email sudah ada</div>`;
      } else {
        log.innerHTML += `<div>❌ ${escapeHtml(nama)}: ${escapeHtml(e.code || e.message)}</div>`;
        err++;
      }
    }
  }
  status.textContent = `Selesai: ${ok} berhasil, ${err} gagal.`;
  status.className = err ? 'status err' : 'status ok';
  btn.disabled = false;
  await loadSiswaList(currentSekolahId);
});

document.getElementById('btn-seed-kukusan')?.addEventListener('click', async () => {
  const status = document.getElementById('status-seed');
  status.className = 'status';
  status.textContent = 'Menyimpan…';
  try {
    await setDoc(doc(db, 'sekolah', 'SDM01KUKUSAN'), {
      kode: 'SDM01KUKUSAN',
      nama: 'SD Muhammadiyah 01 Kukusan',
      alamat: 'Kukusan, Beji, Kota Depok',
      namaKepalaSekolah: 'Mudzakkir Walad, S.Pd.',
      nbmKepala: '1167327',
      aktif: true,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });
    status.textContent = '✅ SD Muhammadiyah 01 Kukusan ditambahkan.';
    status.className = 'status ok';
    await loadSekolah();
  } catch (err) {
    status.textContent = 'Gagal: ' + (err.message || err.code);
    status.className = 'status err';
  }
});


document.getElementById('btn-hubungkan-identitas')?.addEventListener('click', async () => {
  const st = document.getElementById('status-hubungkan-identitas');
  if (st) { st.className = 'status'; st.textContent = 'Menghubungkan data lama…'; }
  await hubungkanDataLama();
  const src = document.getElementById('status-hubungkan');
  if (st) {
    st.textContent = (src && src.textContent) || 'Selesai.';
    st.className = (src && src.className) || 'status ok';
  }
});

document.getElementById('btn-logout').addEventListener('click', async () => {
  try { await signOut(auth); } catch (_) {}
  location.href = '../index.html';
});

onAuthStateChanged(auth, async (user) => {
  if (!isConfigured) return;
  if (!user) {
    gate.style.display = 'block';
    appEl.style.display = 'none';
    gateMsg.innerHTML = 'Belum login. <a href="../login.html?mode=admin">Login admin</a>';
    return;
  }
  const staff = await getStaffDoc(user.uid);
  if (!staff || staff.peran !== 'admin') {
    gate.style.display = 'block';
    appEl.style.display = 'none';
    gateMsg.textContent = 'Akses ditolak. Hanya super-admin.';
    return;
  }
  gate.style.display = 'none';
  appEl.style.display = 'flex';
  document.getElementById('admin-name').textContent = staff.nama || user.email || 'Admin';
  await loadSekolah();
});
