# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

---

## [0.14.0] — 2026-09-25

### Added
- **Acak urutan soal & pilihan** saat try out (`app/kuis.html`):
  - Urutan soal diacak sekali per sesi siswa (beda siswa → beda urutan).
  - Urutan pilihan A–D diacak per soal; stabil saat navigasi bolak-balik.
  - Penilaian tetap aman: nilai yang di-hash adalah **teks opsi**, bukan posisi.
- Opsi di **Susun Paket** (try out): checkbox *Acak urutan soal* dan *Acak urutan pilihan* (default: aktif). Disimpan sebagai `acakSoal` / `acakOpsi` di dokumen paket.
- Paket lama tanpa field ini: try out tetap diacak; latihan tidak.

---

## [0.13.2] — 2026-09-25

### Fixed
- CDN jsPDF di `guru/rekap-tryout.html`: URL cdnjs 2.5.2 **404** → jsDelivr.
- `escapeAttr` di rekap.

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
