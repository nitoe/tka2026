# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

---

## [0.13.0] — 2026-09-25

### Added
- **Laporan PDF hasil try out / latihan** (`assets/laporan-pdf.js` + tombol **PDF** di `guru/rekap-tryout.html`).
  - Identitas siswa, skor %, ketuntasan (KKM 70%).
  - Tabel + diagram batang: per kompleksitas (L1/L2/L3) dan per tipe materi / capaian.
  - Kesimpulan tuntas / remedial.
- Breakdown attempt diperkaya: `poinBenar`, `poinMaks`, `noSoal` per kategori (attempt baru setelah v0.13).

### Catatan
- Attempt sebelum v0.13 tetap bisa di-PDF (benar/total & %; poin/no. soal bisa "—").
- Format lebih rapi dibanding laporan tahun lalu (header sekolah, diagram, layout A4).

### Tidak Berubah
- Logika penilaian hash & gate try out.

---

## [0.12.0] — 2026-09-25

### Added
- Rekap try out/latihan + reset attempt berkonfirmasi.
- Staff boleh delete `attempts` di firestore.rules.

---

## [0.11.0] — 2026-09-25

### Added
- Layout LMS, token & jendela waktu try out.

---

Lihat commit history untuk entri lebih lama.
