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

## 📂 Struktur Repo

```
/
├── index.html              # Halaman masuk (login siswa & guru/admin)
├── firebase-config.js       # Konfigurasi Firebase (isi setelah project dibuat)
├── firestore.rules          # Security Rules Firestore
├── assets/
│   └── firebase-init.js     # Satu-satunya tempat initializeApp() dipanggil
├── app/
│   └── index.html            # Halaman utama siswa (setelah login)
├── guru/
│   └── index.html            # Dashboard guru & admin (setelah login)
├── tools/
│   └── import-siswa.html     # Alat impor akun siswa massal (khusus admin, sekali pakai)
├── README.md
├── CHANGELOG.md
└── ANTIREGRESI.md
```

Belum ada di repo (menyusul di fase berikutnya): `functions/` (Cloud Functions untuk penilaian server-side), halaman aplikasi kuis sungguhan di `app/matematika/` & `app/bahasa-indonesia/`, dan `firebase.json` untuk konfigurasi Hosting.

---

## 🔐 Skema Akun & Login

Halaman masuk (`index.html`) punya dua tab, keduanya berbasis **dropdown nama** (bukan ketik email):

- **Tab Siswa** — pilih nama dari dropdown (dikelompokkan per kelas), lalu masukkan kata sandi.
  Email login internal: `nama.siswa@sdm01tka2026.id` (bukan email sungguhan). Kata sandi: **NISN** siswa.
- **Tab Guru & Admin** — pilih nama dari dropdown, lalu masukkan kata sandi.
  Akun ditetapkan tetap (tidak ada pendaftaran mandiri): Arif Azwar Anas (admin), Ratih Yuniati (guru), Asuroh Susanti (guru).

Peran (admin/guru/siswa) ditentukan lewat dokumen di Firestore (koleksi `staff` dan `students`), **bukan** custom claims — supaya tidak perlu Cloud Functions hanya untuk mengatur peran. Lihat `firestore.rules` untuk detail aturan aksesnya.

> ⚠️ Data akun siswa (nama, kelas, NISN) dan daftar kredensialnya **tidak disimpan di repo ini** karena repo bersifat publik — lihat catatan privasi di `CHANGELOG.md` versi 0.3.0.

---

## 🧑‍💻 Setup Firebase (sekali di awal)

1. Buat project di [Firebase Console](https://console.firebase.google.com), aktifkan **Firestore** (mode production, lokasi `asia-southeast2`) dan **Authentication** (provider Email/Password).
2. Daftarkan Web App, salin `firebaseConfig` yang muncul ke file `firebase-config.js` di root repo (menggantikan nilai placeholder `GANTI_DENGAN_...`).
3. Deploy `firestore.rules` lewat tab **Firestore > Rules** di Console (salin-tempel isinya), atau lewat Firebase CLI (`firebase deploy --only firestore:rules`) kalau sudah pakai CLI.
4. Buat 3 akun guru/admin manual di **Authentication > Users** (lihat kredensial di file kerja lokal, bukan di repo), lalu buat dokumen `staff/{uid}` yang sesuai secara manual di **Firestore > Data** (field: `nama`, `peran`).
5. Jalankan `tools/import-siswa.html` (login sebagai admin, pilih file data siswa lokal) untuk membuat 52 akun siswa + dokumen `students/{uid}` sekaligus.

---

## 🚀 Menjalankan Secara Lokal

Karena halaman ini pakai **ES Modules** (`import`/`export`), **tidak bisa dibuka langsung dengan dobel klik** (`file://`) — browser akan memblokirnya karena kebijakan CORS. Jalankan server lokal sederhana dulu:

```bash
# dari folder root repo
python3 -m http.server 8000
# lalu buka http://localhost:8000 di browser
```

Atau pakai ekstensi "Live Server" kalau memakai VS Code. Setelah nanti sudah pakai Firebase Hosting, kendala ini otomatis hilang karena diakses lewat `https://`, bukan `file://`.

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
