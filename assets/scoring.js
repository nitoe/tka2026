// ══════════════════════════════════════════════════════════════
// Modul penilaian bersama — SATU-SATUNYA tempat logika hashing
// jawaban didefinisikan. Dipakai di DUA titik yang WAJIB konsisten:
//   1) guru/bank-soal.html   — saat import soal, menghitung kunciHash
//      dari kunciJawaban asli lalu menyimpannya ke `soalPublik`
//      (TANPA kunciJawaban plaintext).
//   2) app/kuis.html          — saat siswa submit jawaban, menghitung
//      hash dari jawaban siswa dengan cara yang SAMA PERSIS, lalu
//      dibandingkan dengan kunciHash.
//
// Kalau mengubah cara normalisasi/hashing di sini, soal yang SUDAH
// diimpor dengan versi lama tidak akan otomatis ikut berubah — perlu
// jalankan ulang "Backfill Soal Publik" di guru/bank-soal.html supaya
// kunciHash-nya disegarkan. Lihat ANTIREGRESI.md §12.
//
// CATATAN KEAMANAN (baca ini sebelum mengubah apa pun di sini):
// Pendekatan hash ini BUKAN pengganti Cloud Function server-side
// scoring — ini kompromi sengaja supaya proyek tidak perlu Firebase
// Blaze plan + Cloud Functions dulu. Hash mencegah siswa membaca
// kunci jawaban lewat DevTools/Firestore console (casual peeking),
// TAPI tidak mencegah siswa yang menulis skrip sendiri untuk mencoba
// menebak & mencocokkan hash secara brute-force. Untuk aplikasi
// latihan sekolah dasar ini dianggap risiko yang bisa diterima; kalau
// suatu saat butuh keamanan lebih tinggi (ujian resmi berbobot nilai),
// migrasi ke Cloud Function callable untuk scoring sungguhan.
// ══════════════════════════════════════════════════════════════

/** Normalisasi satu nilai jawaban: trim + lowercase, spasi berlebih dirapikan. */
function normalizeOne(val) {
  return String(val ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Menghasilkan "kunci mentah" (string) yang akan di-hash, tergantung tipe soal:
 * - pg      : jawaban tunggal -> dinormalisasi apa adanya.
 * - pgk     : jawaban jamak, URUTAN TIDAK PENTING -> dinormalisasi lalu diurutkan.
 * - pgk-cat : jawaban per pernyataan, URUTAN HARUS SAMA DENGAN `rows` -> dinormalisasi
 *             tanpa diurutkan (posisi harus match index rows).
 */
export function buildRawKey(tipe, jawaban) {
  if (tipe === 'pg') {
    return normalizeOne(jawaban);
  }
  if (tipe === 'pgk') {
    const arr = Array.isArray(jawaban) ? jawaban : [jawaban];
    return arr.map(normalizeOne).sort().join('|');
  }
  if (tipe === 'pgk-cat') {
    const arr = Array.isArray(jawaban) ? jawaban : [jawaban];
    return arr.map(normalizeOne).join('|');
  }
  throw new Error(`Tipe soal tidak dikenal untuk scoring: ${tipe}`);
}

/** SHA-256 hex string dari sebuah teks, memakai Web Crypto API bawaan browser. */
export async function sha256Hex(text) {
  const enc = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Hitung kunciHash dari kunciJawaban asli — dipakai saat IMPORT soal. */
export async function computeKunciHash(tipe, kunciJawaban) {
  return sha256Hex(buildRawKey(tipe, kunciJawaban));
}

/** Hitung hash dari jawaban SISWA — dipakai saat SUBMIT kuis, lalu dibandingkan ke kunciHash. */
export async function hashJawabanSiswa(tipe, jawabanSiswa) {
  return sha256Hex(buildRawKey(tipe, jawabanSiswa));
}

/**
 * Ubah dokumen questionPool (punya kunciJawaban plaintext) menjadi versi
 * aman untuk siswa (punya kunciHash, TANPA kunciJawaban). Dipakai saat
 * import & saat backfill.
 */
export async function toSoalPublik(soal) {
  const { kunciJawaban, ...rest } = soal;
  const kunciHash = await computeKunciHash(soal.tipe, kunciJawaban);
  return { ...rest, kunciHash };
}
