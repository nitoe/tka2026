# 🛡️ Panduan Anti-Regresi

Checklist wajib sebelum/sesudah perubahan di repo ini.

---

## Area sensitif

- Firestore rules, scoring hash, skema `packages` / `attempts` / `soalPublik`
- UI kuis LMS (navigasi, timer, gate token/waktu)
- Rekap, reset attempt, laporan PDF

---

## 12. Try Out (v0.10–v0.11)

- Field: `jenis`, `durasiMenit`, `maksPercobaan`, `tampilkanHasil`, `token`, `bukaPada`, `tutupPada`.
- Layout LMS satu soal per layar; token dicek client-side.

---

## 14. Reset Attempt (v0.12.0)

- Hanya **staff** boleh `delete` `attempts`. Siswa: update/delete ditolak.
- Reset menghapus attempt supaya batas `maksPercobaan` longgar.
- UI wajib modal konfirmasi.
- Deploy firestore.rules setelah ubah rules.

---

## 15. Laporan PDF (v0.13.0)

- Generator: `assets/laporan-pdf.js` (jsPDF + autotable CDN hanya di halaman rekap).
- Attempt baru: simpan `poinBenar` / `poinMaks` / `noSoal` per kategori; jangan hapus field lama `{benar,total}`.
- KKM default 70% — ubah lewat `buatLaporanPdf(attempt, { kkm })` jika perlu.
- Jangan muat jsPDF di halaman siswa.

---

## Definition of Done

- [ ] Skenario normal & edge case
- [ ] Tidak merusak fitur existing
- [ ] CHANGELOG diupdate
- [ ] Catatan antiregresi jika pola baru
