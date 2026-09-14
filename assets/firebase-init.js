// ══════════════════════════════════════════════════════════════
// Inisialisasi Firebase — SATU-SATUNYA tempat initializeApp() dipanggil.
//
// Semua halaman (index.html, app/, guru/, tools/) mengimpor dari sini,
// bukan menginisialisasi Firebase sendiri-sendiri. Ini sengaja dibuat
// begitu untuk mencegah kelas bug "copy-paste drift" yang pernah terjadi
// di portal lama (lihat ANTIREGRESI.md §4).
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
};

/** Ambil dokumen staff/{uid}. Null kalau uid tsb bukan staff. */
export async function getStaffDoc(uid) {
  const snap = await getDoc(doc(db, "staff", uid));
  return snap.exists() ? snap.data() : null;
}

/** Ambil dokumen students/{uid}. Null kalau uid tsb bukan siswa terdaftar. */
export async function getStudentDoc(uid) {
  const snap = await getDoc(doc(db, "students", uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * Tentukan halaman tujuan setelah login berdasarkan peran uid.
 * Return '../guru/', '../app/', atau null (uid tidak terdaftar di mana pun).
 */
export async function resolveHomeByRole(uid) {
  const staff = await getStaffDoc(uid);
  if (staff) return "guru/";
  const student = await getStudentDoc(uid);
  if (student) return "app/";
  return null;
}
