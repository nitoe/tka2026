// ══════════════════════════════════════════════════════════════
// Inisialisasi Firebase — SATU-SATUNYA tempat initializeApp() dipanggil.
//
// Semua halaman (index.html, login.html, app/, guru/, admin/, tools/)
// mengimpor dari sini, bukan menginisialisasi Firebase sendiri-sendiri.
// ══════════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { firebaseConfig } from "../firebase-config.js";

// True kalau firebase-config.js sudah diisi nilai asli (bukan placeholder).
export const isConfigured = !String(firebaseConfig.apiKey || "").includes("GANTI_");

export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const auth = isConfigured ? getAuth(app) : null;
export const db = isConfigured ? getFirestore(app) : null;

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
};

/** Ambil dokumen staff/{uid}. Null kalau uid tsb bukan staff. */
export async function getStaffDoc(uid) {
  const snap = await getDoc(doc(db, "staff", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Ambil dokumen students/{uid}. Null kalau uid tsb bukan siswa terdaftar. */
export async function getStudentDoc(uid) {
  const snap = await getDoc(doc(db, "students", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Tentukan halaman tujuan setelah login berdasarkan peran uid.
 * Admin (super) → admin/
 * Guru → guru/
 * Siswa → app/
 */
export async function resolveHomeByRole(uid) {
  const staff = await getStaffDoc(uid);
  if (staff) {
    if (staff.peran === "admin") return "admin/";
    return "guru/";
  }
  const student = await getStudentDoc(uid);
  if (student) return "app/";
  return null;
}

/**
 * Muat daftar sekolah aktif dari Firestore.
 * Fallback ke seed lokal jika koleksi kosong / belum ada / error rules.
 */
export async function listSekolahAktif(seedFallback = []) {
  if (!isConfigured || !db) return seedFallback;
  try {
    const q = query(collection(db, "sekolah"), where("aktif", "==", true));
    const snap = await getDocs(q);
    if (snap.empty) return seedFallback;
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        kode: data.kode || d.id,
        nama: data.nama || d.id,
        alamat: data.alamat || "",
        namaKepalaSekolah: data.namaKepalaSekolah || "",
        nbmKepala: data.nbmKepala || "",
        aktif: data.aktif !== false,
      };
    });
  } catch (err) {
    console.warn("listSekolahAktif gagal, pakai seed:", err);
    return seedFallback;
  }
}

/**
 * Muat roster login (nama + email) untuk dropdown, tanpa NISN.
 * Koleksi: loginRoster — field: sekolahId, nama, kelas, emailLogin, jenis ('siswa'|'guru')
 */
export async function listLoginRoster(sekolahId, jenis) {
  if (!isConfigured || !db || !sekolahId) return [];
  try {
    const q = query(
      collection(db, "loginRoster"),
      where("sekolahId", "==", sekolahId),
      where("jenis", "==", jenis)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        nama: data.nama || "",
        kelas: data.kelas || "",
        email: data.emailLogin || data.email || "",
        peran: data.peran || (jenis === "guru" ? "guru" : "siswa"),
      };
    });
  } catch (err) {
    console.warn("listLoginRoster gagal:", err);
    return [];
  }
}
