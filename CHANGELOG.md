# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

Setiap entri baru **wajib** menyebutkan: tanggal, apa yang berubah, kenapa berubah, dan apa yang **tidak** disentuh (khususnya untuk area sensitif — lihat [ANTIREGRESI.md](./ANTIREGRESI.md)).

---

## [Unreleased]

Rencana kerja aktif — lihat papan proyek / roadmap internal untuk detail fase.

### Direncanakan
- Integrasi Firebase Authentication sungguhan ke `index.html` (saat ini form Masuk/Daftar baru UI + validasi client-side, belum memanggil `signInWithEmailAndPassword`/`createUserWithEmailAndPassword`).
- Halaman `admin/` (Panel Guru) — saat ini baru berupa tautan placeholder di `index.html`.
- Setup Firebase project (Auth, Firestore, Hosting, Functions).
- Desain & penerapan skema Firestore (`subjects`, `questionPool`, `packages`, `attempts`, `students`).
- Panel admin: manajemen bank soal + import dari Google Spreadsheet.
- Aplikasi kuis siswa versi baru (mengambil soal dari Firestore, penilaian server-side).
- Dashboard rekap nilai real-time untuk guru.
- Integrasi Google Apps Script: import soal massal & backup hasil ujian + email laporan ke orang tua.
- Firestore Security Rules & pengujian keamanan (kunci jawaban tidak boleh terkirim ke client).

---

## [0.2.0] — 2026-09-13

### Changed
- **`index.html` didesain ulang total** dari landing page kartu paket menjadi **halaman gerbang masuk (login/daftar)**, mengikuti referensi desain split-screen (kiri: branding + fitur, kanan: kartu autentikasi dengan tab Masuk/Daftar) yang diberikan pemilik proyek.
- Identitas visual (warna biru, font Nunito/Baloo 2) dari versi sebelumnya dipertahankan untuk kontinuitas brand — palet referensi (teal) tidak ditiru langsung, hanya struktur & fungsinya.

### Added
- Form **Masuk**: email + kata sandi, dengan validasi client-side (format email, kata sandi tidak boleh kosong) dan pesan error inline per field.
- Form **Daftar**: nama lengkap, kelas (6A/6B/6C), email, kata sandi + konfirmasi, dengan validasi client-side (kata sandi minimal 6 karakter, konfirmasi harus sama).
- Tab switching antara panel Masuk/Daftar (vanilla JS, objek `AuthUI`).
- Tautan "Masuk ke Panel Guru ↗" mengarah ke `./admin/` (halaman belum dibuat — akan 404 sampai Fase panel admin dikerjakan).
- Badge "Pratinjau UI — belum tersambung Firebase" dan pesan status setelah submit, agar jelas bagi siapa pun yang membuka bahwa autentikasi asli belum aktif.
- Komentar `// TODO(Fase 1 — Firebase Auth)` di titik-titik yang perlu diganti dengan pemanggilan Firebase Authentication sungguhan.

### Tidak Berubah
- Belum ada koneksi backend apa pun (Firebase/Apps Script) — submit form hanya menampilkan pesan status, tidak mengirim data ke mana pun.
- `README.md` dan `ANTIREGRESI.md` tidak diubah pada entri ini.

### Pekerjaan Berikutnya
- Sambungkan form ke Firebase Authentication (lihat penanda `TODO` di kode) begitu Fase 0 (setup project Firebase) selesai.
- Buat halaman `admin/index.html` agar tautan Panel Guru tidak lagi mengarah ke halaman kosong.

---

## [0.1.0] — 2026-09-13

### Added
- Scaffold awal repository: `index.html`, `README.md`, `CHANGELOG.md`, `ANTIREGRESI.md`.
- `index.html`: landing page portal dengan status "segera hadir" untuk Matematika & Bahasa Indonesia, dan bagian "Direncanakan" untuk IPA & Bahasa Inggris. Belum terhubung ke Firebase — murni statis.
- Dokumentasi arsitektur target (Firebase + Google Apps Script + Spreadsheet) di README.
- Referensi Spreadsheet ID untuk bank soal & backup hasil ujian: `1JzjZZLQZfrc-6INdJT_ko-En7F3UVz4Fs9lgps0zESs` (dicatat di README, bukan kredensial rahasia).

### Context
- Proyek ini adalah penerus dari portal TKA lama (HTML statis per paket soal, tanpa database terpusat, penilaian di client-side, hasil hanya dikirim via email lewat Google Apps Script + Brevo).
- Keputusan desain awal: fokus 2 mapel dulu (Matematika, Bahasa Indonesia), dashboard guru/admin real-time jadi prioritas utama, bank soal dikelola sebagai pool di Firestore dengan mekanisme import dari admin.

### Tidak Berubah
- Belum ada logika penilaian, autentikasi, atau koneksi database apa pun di tahap ini — repo masih tahap scaffold dokumentasi + landing page statis.

---

## Template Entri Baru

Salin blok ini setiap membuat rilis/perubahan baru:

```
## [x.y.z] — YYYY-MM-DD

### Added
-

### Changed
-

### Fixed
-

### Tidak Berubah
- (area sensitif yang sengaja tidak disentuh, untuk mencegah regresi)

### Pekerjaan Berikutnya
-
```
