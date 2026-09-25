# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

---

## [0.15.0] — 2026-09-25

### Added
- **Edit paket** (latihan & try out) di `guru/susun-paket.html`: tombol Edit memuat nama, jenis, token, waktu, acak soal/opsi, dan daftar soal; simpan memakai `updateDoc`.
- Filter bank soal saat susun paket dipulihkan: **tipe materi** (`tipeMateri`) dan **kompleksitas** selain mapel & tipe soal.

### Fixed
- Filter materi/kompleksitas sempat hilang saat restore file susun-paket (regresi v0.14) — dikembalikan.

---

## [0.14.1] — 2026-09-25

### Added
- Kontrol **ukuran tulisan** di halaman kuis/try out (`A−` / `A+`): 90%–150%, tersimpan di `localStorage`.

---

## [0.14.0] — 2026-09-25

### Added
- Acak urutan soal & pilihan try out; flag `acakSoal` / `acakOpsi` di paket.

---

## [0.13.2] — 2026-09-25

### Fixed
- CDN jsPDF 404 → jsDelivr; `escapeAttr` di rekap.

---

## [0.13.1] — 2026-09-25

### Fixed
- Label pilihan ganda A–D (bukan 0–3); value = teks opsi.

---

## [0.13.0] — 2026-09-25

### Added
- Laporan PDF + breakdown poin per kategori.

---

## [0.12.0] — 2026-09-25

### Added
- Rekap try out/latihan + reset attempt.

---

Lihat commit history untuk entri lebih lama.
