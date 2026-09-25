# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

---

## [0.13.1] — 2026-09-25

### Fixed
- Label pilihan ganda di `app/kuis.html`: tidak lagi menampilkan **0, 1, 2, 3** (indeks array). Sekarang **A, B, C, D**.
- Nilai yang dikirim saat menjawab memakai **teks opsi** (bukan indeks), selaras dengan `kunciJawaban` di bank soal — supaya penilaian hash tetap benar.

---

## [0.13.0] — 2026-09-25

### Added
- Laporan PDF hasil try out / latihan (`assets/laporan-pdf.js` + tombol PDF di rekap).
- Breakdown attempt: `poinBenar`, `poinMaks`, `noSoal` per kategori.

---

## [0.12.0] — 2026-09-25

### Added
- Rekap try out/latihan + reset attempt berkonfirmasi.

---

Lihat commit history untuk entri lebih lama.
