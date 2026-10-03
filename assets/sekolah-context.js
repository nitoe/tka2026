/**
 * Konteks multi-sekolah — Portal Latihan TKA 2026
 *
 * Menyimpan pilihan sekolah di sessionStorage + localStorage agar
 * refresh halaman tidak menghilangkan konteks. Semua halaman siswa/guru
 * membaca sekolahId dari sini untuk filter data.
 *
 * Dokumen Firestore: sekolah/{sekolahId}
 *   { kode, nama, alamat, namaKepalaSekolah, nbmKepala, aktif, ... }
 */
const STORAGE_KEY = 'tka2026_sekolah';

/** ID default sekolah existing (backfill). */
export const SEKOLAH_DEFAULT_ID = 'SDM01KUKUSAN';

/** Seed lokal jika koleksi sekolah belum diisi di Firestore. */
export const SEKOLAH_SEED = [
  {
    id: 'SDM01KUKUSAN',
    kode: 'SDM01KUKUSAN',
    nama: 'SD Muhammadiyah 01 Kukusan',
    alamat: 'Kukusan, Beji, Kota Depok',
    namaKepalaSekolah: 'Mudzakkir Walad, S.Pd.',
    nbmKepala: '1167327',
    aktif: true,
  },
];

/**
 * @typedef {{ id: string, kode: string, nama: string, alamat?: string, namaKepalaSekolah?: string, nbmKepala?: string, aktif?: boolean }} SekolahContext
 */

/** @returns {SekolahContext | null} */
export function getSekolah() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data.id) return null;
    return data;
  } catch {
    return null;
  }
}

/** @param {SekolahContext} sekolah */
export function setSekolah(sekolah) {
  if (!sekolah || !sekolah.id) {
    throw new Error('setSekolah: objek sekolah wajib punya id');
  }
  const payload = JSON.stringify({
    id: String(sekolah.id),
    kode: String(sekolah.kode || sekolah.id),
    nama: String(sekolah.nama || sekolah.id),
    alamat: sekolah.alamat || '',
    namaKepalaSekolah: sekolah.namaKepalaSekolah || '',
    nbmKepala: sekolah.nbmKepala || '',
    aktif: sekolah.aktif !== false,
  });
  sessionStorage.setItem(STORAGE_KEY, payload);
  localStorage.setItem(STORAGE_KEY, payload);
}

export function clearSekolah() {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
}

/** @returns {string | null} */
export function getSekolahId() {
  const s = getSekolah();
  return s ? s.id : null;
}

/**
 * Redirect ke gerbang jika belum pilih sekolah.
 * @param {string} [gerbangUrl='/']
 */
export function requireSekolahOrRedirect(gerbangUrl = '/') {
  if (!getSekolahId()) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(gerbangUrl + (gerbangUrl.includes('?') ? '&' : '?') + 'next=' + next);
    return false;
  }
  return true;
}

/**
 * Mode admin: login tanpa pilih sekolah (super-admin pusat).
 */
export function setAdminMode(on) {
  if (on) sessionStorage.setItem('tka2026_admin_mode', '1');
  else sessionStorage.removeItem('tka2026_admin_mode');
}

export function isAdminMode() {
  return sessionStorage.getItem('tka2026_admin_mode') === '1';
}
