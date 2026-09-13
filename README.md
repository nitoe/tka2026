# 📚 TKA 2026 — SD Muhammadiyah 01 Kukusan

Aplikasi latihan soal **Tes Kompetensi Akademik (TKA) 2026** untuk siswa kelas 6 SD Muhammadiyah 01 Kukusan.

Proyek ini adalah **penerus** dari portal latihan TKA sebelumnya (HTML statis tanpa database terpusat), dibangun ulang di atas **Firebase** agar guru punya bank soal yang bisa dikelola tanpa coding, dashboard rekap nilai real-time, dan penilaian yang aman di sisi server.

> 🚧 **Status: Dalam Pengembangan.** Lihat [CHANGELOG.md](./CHANGELOG.md) untuk progres, dan [ANTIREGRESI.md](./ANTIREGRESI.md) sebelum melakukan perubahan.

---

## 🎯 Tentang Proyek

Portal ini dibuat sebagai sarana belajar mandiri bagi siswa kelas 6 dalam mempersiapkan diri menghadapi TKA 2026, dengan latihan soal beserta koreksi otomatis dan rekap nilai per kompetensi.

Inisiatif **Arif Azwar Anas**, Guru Kelas 6 sekaligus Wakil Kepala Sekolah Bidang Kurikulum SD Muhammadiyah 01 Kukusan.

---

## 📝 Mata Pelajaran

| Mata Pelajaran | Status |
|---|---|
| Matematika | 🔧 Dalam migrasi dari versi lama |
| Bahasa Indonesia | 🔧 Dalam migrasi dari versi lama |
| IPA | 📋 Direncanakan (menunggu kisi-kisi resmi) |
| Bahasa Inggris | 📋 Direncanakan (menunggu kisi-kisi resmi) |

Skema data dibuat generik per mata pelajaran, jadi penambahan mapel baru tidak memerlukan perubahan kode aplikasi — cukup penambahan data.

---

## 🏗️ Arsitektur

```
Firebase Hosting  →  aplikasi siswa & panel admin (statis + Firebase SDK)
Firebase Auth     →  akun guru/admin & akun siswa
Cloud Firestore   →  bank soal, paket soal, hasil ujian, master data siswa/kelas
Cloud Functions   →  penilaian server-side (kunci jawaban tidak pernah dikirim ke client),
                     jembatan ke Google Apps Script
Google Apps Script
  + Spreadsheet   →  (1) template import soal massal bagi guru
                     (2) backup arsip hasil ujian + kirim email laporan ke orang tua (Brevo)
```

Detail lengkap ada di dokumen roadmap internal tim (tidak disertakan di repo publik).

---

## ⚙️ Konfigurasi

### Google Spreadsheet (Bank Soal & Backup)
Spreadsheet yang digunakan sebagai sumber import bank soal dan arsip backup hasil ujian:

```
Spreadsheet ID: 1JzjZZLQZfrc-6INdJT_ko-En7F3UVz4Fs9lgps0zESs
```

ID ini dipakai oleh Google Apps Script Web App (deploy terpisah, kode tersimpan di project Apps Script, bukan di repo ini) untuk:
1. Membaca template soal yang diisi guru → diimpor ke Firestore lewat panel admin.
2. Mencatat backup baris hasil ujian setiap kali ada `attempt` baru + memicu email laporan ke orang tua.

> ⚠️ Spreadsheet ID bukan rahasia (bukan kredensial), tapi **jangan pernah commit** URL deployment Apps Script (`script.google.com/macros/s/.../exec`), API key Brevo, atau kredensial Firebase Admin SDK ke repo ini. Simpan di Apps Script Script Properties / Firebase Functions config / secret manager.

### Firebase
Konfigurasi Firebase project (`firebaseConfig`) akan ditambahkan di `firebase-config.js` setelah project Firebase dibuat. File ini aman untuk publik (bukan kredensial rahasia), tapi keamanan sesungguhnya dijaga lewat **Firestore Security Rules**.

---

## 📂 Struktur Repo (rencana)

```
/
├── index.html              # Landing page / portal utama
├── README.md
├── CHANGELOG.md
├── ANTIREGRESI.md
├── firebase.json            # (akan ditambahkan) konfigurasi Firebase Hosting
├── firestore.rules          # (akan ditambahkan) Security Rules
├── functions/                # (akan ditambahkan) Cloud Functions (Node.js)
├── public/                   # (akan ditambahkan) aset aplikasi siswa & admin
│   ├── app/                  # aplikasi kuis siswa
│   └── admin/                 # panel guru/admin
└── apps-script/               # (akan ditambahkan) salinan kode .gs untuk referensi/versi kontrol
```

---

## 🚀 Menjalankan Secara Lokal (setelah setup Firebase tersedia)

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # pilih/isi project Firebase
firebase emulators:start  # jalankan Auth + Firestore + Hosting emulator lokal
```

Detail lengkap akan diperbarui begitu `firebase.json` dan struktur `functions/` sudah ditambahkan.

---

## 🛠️ Teknologi

- **Frontend:** HTML, CSS, JavaScript (Firebase Modular SDK) — tanpa framework tambahan agar ringan dan mudah dipelihara, konsisten dengan versi sebelumnya.
- **Backend:** Firebase (Auth, Firestore, Cloud Functions, Hosting) + Google Apps Script.
- **Database soal & hasil:** Cloud Firestore (real-time).
- **Bank soal & backup:** Google Sheets via Apps Script Web App.

---

## 🤝 Kontribusi & Alur Kerja

Sebelum membuat perubahan, baca **[ANTIREGRESI.md](./ANTIREGRESI.md)** — dokumen ini berisi checklist wajib agar perubahan baru tidak merusak fitur yang sudah berjalan (pelajaran dari versi lama yang beberapa kali mengalami regresi).

Setiap perubahan yang berdampak ke pengguna wajib dicatat di **[CHANGELOG.md](./CHANGELOG.md)**.

---

*Semangat belajar, raih prestasi terbaik! 🌟*
*SD Muhammadiyah 01 Kukusan*
