# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

---

## [0.18.4] — 2026-09-28

### Fixed
- **Penilaian kuis**: `skor` dipaksa `Number(...)` agar tidak concat string dari import.
- **No. soal di laporan**: memakai urutan stabil di `package.questionIds` (bukan urutan setelah acak soal).
- **Rekap**: `escapeAttr` / `escapeHtml` dipastikan memakai entitas HTML yang benar.

### Tidak Berubah
- Rumus skor total, KKM 70%, struktur `skorPerKompleksitas` / `skorPerTipeMateri`.

---

## [0.18.3] — 2026-09-28

### Fixed / Improved
- **Kuis (esensial)**: autosave jawaban ke `sessionStorage` (pulih jika tab tertutup/refresh dalam sesi yang sama).
- Peringatan `beforeunload` saat ujian berlangsung (cegah tutup tab tidak sengaja).
- Deteksi soal hilang di `soalPublik` (log console; skor maks mengikuti soal yang berhasil dimuat).
- Penilaian lebih tahan error jika `kunciHash` kosong/tipe tidak dikenal.

### Tidak Berubah
- Skema attempt, gate token/waktu, rekap, PDF, susun paket.

---

## [0.18.2] — 2026-09-26

### Fixed
- **Susun paket**: simpan field `aktif` (centang "Aktifkan paket") + `skorMaksimal` agar paket muncul di daftar siswa (`where aktif == true`).
- Badge AKTIF / NONAKTIF di daftar paket tersimpan; normalisasi `subjectId`.

### Tidak Berubah
- Filter siswa, gate token/waktu, rekap, bank soal.

---

## [0.18.1] — 2026-09-25

### Changed
- **Query Firestore rekap** lebih selektif: kombinasi `jenisPaket` + `subjectId` (bukan hanya satu filter), soft limit 1000 dokumen, fallback otomatis jika index komposit belum siap.
- Sort waktu tetap di klien (tanpa `orderBy` di server).

### Added
- `firestore.indexes.json` — index komposit `attempts`: `jenisPaket`+`subjectId`, dan `packageId`+`studentId` (untuk cek attempt siswa di kuis).

### Fixed
- `escapeAttr` / `escapeHtml` di rekap (entitas HTML sempat rusak saat push v0.18.0).

### Tidak Berubah
- Grafik Chart.js, tab bandingkan, PDF, reset attempt, shell guru.

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

Lihat commit history untuk entri lebih lama.
