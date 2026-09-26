# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

---

## [0.18.2] — 2026-09-26

### Fixed
- **Susun paket**: simpan field `aktif` (centang "Aktifkan paket") + `skorMaksimal` agar paket muncul di daftar siswa (`where aktif == true`).
- Badge **AKTIF** / **NONAKTIF** di daftar paket tersimpan; normalisasi `subjectId`.

### Tidak Berubah
- Filter siswa, gate token/waktu, rekap, bank soal.

---

## [0.18.1] — 2026-09-25

### Changed
- **Query Firestore rekap** lebih selektif: kombinasi `jenisPaket` + `subjectId`, soft limit 1000, fallback index komposit.

### Added
- `firestore.indexes.json` — index komposit `attempts`.

### Fixed
- `escapeAttr` / `escapeHtml` di rekap.

---

## [0.18.0] — 2026-09-25

### Added
- Grafik hasil + tab Bandingkan Paket di rekap try out.

### Changed
- Optimasi query Firestore rekap.

---

Lihat commit history untuk entri lebih lama.
