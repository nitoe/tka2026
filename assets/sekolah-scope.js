/**
 * Filter & resolve sekolahId untuk query/write multi-tenant.
 * Kompatibel data lama: dokumen tanpa sekolahId dianggap milik SEKOLAH_DEFAULT_ID.
 *
 * Admin di panel guru: filter dari getAdminSekolahFilter()
 *   - '__all__' / null → tidak filter (baca semua)
 *   - id sekolah → filter + write ke sekolah itu
 */
import { SEKOLAH_DEFAULT_ID, getSekolahId } from './sekolah-context.js';

export { SEKOLAH_DEFAULT_ID };

const ADMIN_FILTER_KEY = 'tka2026_admin_sekolah_filter';

function readAdminFilter() {
  try {
    return sessionStorage.getItem(ADMIN_FILTER_KEY)
      || localStorage.getItem(ADMIN_FILTER_KEY)
      || null;
  } catch {
    return null;
  }
}

/**
 * Apakah dokumen milik sekolah target.
 * @param {object} docData
 * @param {string|null} sekolahId null = tidak filter (lolos semua)
 */
export function belongsToSekolah(docData, sekolahId) {
  if (!sekolahId || sekolahId === '__all__') return true;
  const sid = docData && docData.sekolahId;
  if (sid == null || sid === '') {
    return sekolahId === SEKOLAH_DEFAULT_ID;
  }
  return String(sid) === String(sekolahId);
}

/**
 * Filter array dokumen (hasil getDocs) per sekolah.
 * sekolahId null/'__all__' → tanpa filter.
 */
export function filterBySekolah(docs, sekolahId) {
  if (!sekolahId || sekolahId === '__all__') return docs;
  return (docs || []).filter((d) => belongsToSekolah(d, sekolahId));
}

/**
 * Resolve sekolahId untuk write.
 * Admin wajib punya filter sekolah spesifik; jika "semua" → default Kukusan
 * (lebih aman daripada menulis tanpa sekolahId).
 */
export function resolveSekolahIdForWrite(staffOrStudent) {
  if (staffOrStudent && staffOrStudent.peran === 'admin') {
    const af = readAdminFilter();
    if (af && af !== '__all__') return String(af);
    const fromCtx = getSekolahId();
    if (fromCtx) return fromCtx;
    return SEKOLAH_DEFAULT_ID;
  }
  if (staffOrStudent && staffOrStudent.sekolahId) {
    return String(staffOrStudent.sekolahId);
  }
  const fromCtx = getSekolahId();
  if (fromCtx) return fromCtx;
  return SEKOLAH_DEFAULT_ID;
}

/**
 * Resolve sekolahId untuk filter baca.
 * Admin: hormati pemilih "Sekolah kerja" di sidebar (boleh null = semua).
 * Guru/siswa: sekolahId dokumen user → konteks → default.
 * @returns {string|null} null = tidak memfilter (admin: semua sekolah)
 */
export function resolveSekolahIdForRead(userDoc) {
  if (userDoc && userDoc.peran === 'admin') {
    const af = readAdminFilter();
    if (!af || af === '__all__') return null;
    return String(af);
  }
  if (userDoc && userDoc.sekolahId) return String(userDoc.sekolahId);
  const fromCtx = getSekolahId();
  if (fromCtx) return fromCtx;
  return SEKOLAH_DEFAULT_ID;
}

/**
 * sekolahId saat menulis ke bank soal.
 * - Admin → null (pool admin global, dipakai semua sekolah)
 * - Guru → sekolah guru
 */
export function resolveSekolahIdForBankWrite(staff) {
  if (staff && staff.peran === 'admin') return null;
  return resolveSekolahIdForWrite(staff);
}

/** sumber soal: 'admin' | 'guru' */
export function resolveSumberSoal(staff) {
  if (staff && staff.peran === 'admin') return 'admin';
  return 'guru';
}

/**
 * Filter bank soal menurut peran (fase 1 multi-pool).
 *
 * Guru: soal tim sekolah (sumber guru + legacy se-sekolah); TANPA pool admin.
 * Admin: pool admin global SELALU + soal guru (filter sekolah kerja jika dipilih).
 *
 * Legacy (tanpa sumber):
 * - tanpa sekolahId → dianggap pool admin (hanya admin)
 * - ada sekolahId / legacy Kukusan → tim sekolah (guru se-sekolah + admin)
 */
export function filterBankSoal(docs, userDoc) {
  const isAdmin = !!(userDoc && userDoc.peran === 'admin');
  const sid = resolveSekolahIdForRead(userDoc);
  return (docs || []).filter((d) => {
    const sumber = d && d.sumber;
    if (sumber === 'admin') {
      return isAdmin;
    }
    if (sumber === 'guru') {
      if (isAdmin) return !sid || belongsToSekolah(d, sid);
      return belongsToSekolah(d, sid);
    }
    // Legacy tanpa sumber
    const hasSid = d && d.sekolahId != null && d.sekolahId !== '';
    if (!hasSid) {
      // pool lama tanpa sekolahId: admin saja (kecuali filter Kukusan lewat belongsTo)
      if (isAdmin) return true;
      return belongsToSekolah(d, sid);
    }
    if (isAdmin) return !sid || belongsToSekolah(d, sid);
    return belongsToSekolah(d, sid);
  });
}
