# 🛡️ Panduan Anti-Regresi

Dokumen ini adalah **checklist wajib** sebelum dan sesudah membuat perubahan di repo ini.

Untuk riwayat lengkap pelajaran dari v0.4–v0.10, lihat commit history. Ringkasan aktif di bawah.

---

## Area sensitif (wajib uji ulang)

- Firestore rules, scoring hash (`assets/scoring.js`), skema `packages` / `attempts` / `soalPublik`
- UI kuis LMS (navigasi nomor, timer, gate token/waktu)
- Import bank soal & susun paket

---

## 12. Catatan Mekanisme Try Out (v0.10.0 + v0.11.0)

- Field `packages`: `jenis`, `durasiMenit`, `maksPercobaan`, `tampilkanHasil`, `token`, `bukaPada`, `tutupPada`.
- Layout LMS: satu soal per layar; jawaban di objek memori; restore saat pindah soal.
- Token dicek di client (string trim) — bukan proteksi kriptografis.
- Jendela waktu memakai jam browser; simpan ISO string.
- Timer client-side; auto-submit `waktu_habis`; hasil ditahan hanya di UI siswa.
- Hindari ubah `questionIds` setelah try out dimulai.
- Query batas percobaan dua equality tanpa orderBy — tidak butuh composite index.

---

## Definition of Done

- [ ] Berfungsi di skenario normal & edge case relevan
- [ ] Tidak merusak fitur existing
- [ ] CHANGELOG diupdate
- [ ] Catatan antiregresi ditambah jika pola baru
