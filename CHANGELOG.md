# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

---

## [0.18.5] — 2026-09-28

### Added
- **Bank soal**: unduh template Excel (`.xlsx`, sheet `Template Soal` + `Petunjuk`) dan template JSON.
- Contoh 3 tipe soal (pg, pgk, pgk-cat) di template; validasi import selaras skema scoring.

### Fixed
- **Bank soal**: handler import Excel/JSON dipulihkan (preview + commit ke `questionPool` + `soalPublik` ber-hash).

### Tidak Berubah
- Skema attempt, kuis, rekap, susun paket.

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

Lihat commit history untuk entri lebih lama.
