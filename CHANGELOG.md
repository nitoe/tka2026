# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

---

## [0.12.0] — 2026-09-25

### Added
- **`guru/rekap-tryout.html`** — rekap hasil try out & latihan: filter jenis/mapel/kelas/paket/nama, ringkasan jumlah attempt & rata-rata skor, tabel detail.
- **Reset ikut try out** (modal konfirmasi): menghapus dokumen `attempts` agar siswa bisa mengerjakan ulang (kasus kirim terlalu cepat / error).

### Changed
- `firestore.rules`: staff boleh **delete** `attempts`; **update** tetap ditolak.
- Dashboard guru: kartu rekap mengarah ke halaman baru.

### Tidak Berubah
- Siswa tetap tidak bisa menghapus/mengubah attempt sendiri.

### Penting
Setelah pull, **deploy firestore.rules** ke Firebase (`firebase deploy --only firestore:rules`) agar tombol Reset berfungsi.

---

## [0.11.0] — 2026-09-25

### Added
- Layout LMS penuh, token & jendela waktu try out, form token/jadwal di Susun Paket.

---

## [0.10.0] — 2026-09-25

### Added
- Mekanisme Try Out: jenis, durasi, maks percobaan, hasil ditahan, timer.

---

Lihat commit history untuk entri lebih lama.
