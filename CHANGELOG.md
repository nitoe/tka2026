# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

Setiap entri baru **wajib** menyebutkan: tanggal, apa yang berubah, kenapa berubah, dan apa yang **tidak** disentuh (khususnya untuk area sensitif — lihat [ANTIREGRESI.md](./ANTIREGRESI.md)).

---

## [0.11.0] — 2026-09-25

### Added
- **Layout LMS penuh** di `app/kuis.html` (latihan & try out): satu soal per layar, navigasi nomor, Prev/Next.
- **Token & jendela waktu** try out (`packages.token`, `bukaPada`, `tutupPada`) — gate di kuis; status di pilih-paket.
- Form token/jadwal di `guru/susun-paket.html` saat jenis = Try Out.

### Tidak Berubah
- Edit paket tersimpan (updateDoc) belum; hapus lalu buat ulang, atau set field di Firebase Console.
- Dashboard rekap guru belum.

### Catatan Kamis
1. Susun Try Out + isi token & jadwal.
2. Uji dengan Dummy 1/2 sebelum dibagikan ke siswa.

---

## [0.10.0] — 2026-09-25

### Added
- **Mekanisme Try Out**: field `jenis`, `durasiMenit`, `maksPercobaan`, `tampilkanHasil`; timer; batas 1x; hasil ditahan.

### Tidak Berubah
- Dashboard rekap nilai guru masih placeholder.

---

## [Unreleased]

### Direncanakan
- Dashboard rekap nilai real-time untuk guru.
- Fitur ubah paket tersimpan (updateDoc).
- Klasifikasi kompleksitas / tipeMateri yang masih "Belum Dikategorikan".

---

Lihat riwayat lengkap di commit history GitHub untuk entri v0.9.x ke bawah.
