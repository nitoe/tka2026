/**
 * Filter & resolve sekolahId untuk query/write multi-tenant.
 * Kompatibel data lama: dokumen tanpa sekolahId dianggap milik SEKOLAH_DEFAULT_ID.
 */
import { SEKOLAH_DEFAULT_ID, getSekolahId } from './sekolah-context.js';

export { SEKOLAH_DEFAULT_ID };

/**
 * Apakah dokumen milik sekolah target.
 * @param {object} docData
 * @param {string} sekolahId
 */
export function belongsToSekolah(docData, sekolahId) {
  if (!sekolahId) return true;
  const sid = docData && docData.sekolahId;
  if (sid == null || sid === '') {
    // Data legacy → hanya tampil untuk sekolah default
    return sekolahId === SEKOLAH_DEFAULT_ID;
  }
  return String(sid) === String(sekolahId);
}

/**
 * Filter array dokumen (hasil getDocs) per sekolah.
 */
export function filterBySekolah(docs, sekolahId) {
  if (!sekolahId) return docs;
  return (docs || []).filter((d) => belongsToSekolah(d, sekolahId));
}

/**
 * Resolve sekolahId untuk write: staff.sekolahId → konteks gerbang → default.
 * @param {{ sekolahId?: string, peran?: string } | null} staffOrStudent
 */
export function resolveSekolahIdForWrite(staffOrStudent) {
  if (staffOrStudent && staffOrStudent.sekolahId) {
    return String(staffOrStudent.sekolahId);
  }
  const fromCtx = getSekolahId();
  if (fromCtx) return fromCtx;
  return SEKOLAH_DEFAULT_ID;
}

/**
 * Resolve sekolahId untuk filter baca (siswa/guru).
 */
export function resolveSekolahIdForRead(userDoc) {
  if (userDoc && userDoc.sekolahId) return String(userDoc.sekolahId);
  const fromCtx = getSekolahId();
  if (fromCtx) return fromCtx;
  return SEKOLAH_DEFAULT_ID;
}
