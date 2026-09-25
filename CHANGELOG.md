# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

---

## [0.18.0] — 2026-09-25

### Added
- **Grafik hasil** di `guru/rekap-tryout.html` (Chart.js): sebaran skor (0–50 / 51–70 / 71–85 / 86–100) dan rata-rata per paket.
- **Tab Bandingkan Paket**: pilih dua paket → metrik side-by-side (rata-rata, jumlah attempt, % tuntas ≥70%) + delta, grafik batang, dan tabel perubahan per siswa (hanya yang ikut keduanya).
- Stat box **Tuntas (≥70%)**.

### Changed
- **Optimasi query Firestore**: filter server-side prioritas `packageId` → `jenisPaket` → `subjectId`; fallback scan penuh hanya jika tidak ada filter. Sort waktu di klien (hindari composite index). Hint query ditampilkan di UI.

### Tidak Berubah
- PDF laporan, reset attempt (modal 2 langkah), filter kelas/nama (klien), shell guru, aturan skor.

---

## [0.17.0] — 2026-09-25

### Added
- **Sidebar layout** untuk seluruh area guru (`assets/guru-shell.js` + CSS di `theme.css`).
- Navigasi tetap: Dashboard, Rekap Try Out, Bank Soal, Susun Paket; user + logout di footer sidebar.
- Mobile: hamburger + backdrop; sidebar collapsible.

### Changed
- `guru/index.html`, `bank-soal.html`, `rekap-tryout.html`, `susun-paket.html` memakai shell bersama.
- Header per-halaman diganti topbar ringan + sidebar.

### Tidak Berubah
- Logika Firebase, filter, PDF, reset attempt, import, edit paket.

---

## [0.16.0] — 2026-09-25

### Changed
- **Redesign UI guru**: `guru/bank-soal.html`, `guru/susun-paket.html`, `guru/rekap-tryout.html` memakai `assets/theme.css` + header gelap profesional (`--brand-ink`).
- Konsisten dengan dashboard & halaman kuis yang sudah lebih rapi.

### Tidak Berubah
- Logika filter cascading, import, backfill BI, edit paket, PDF, reset attempt.

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
