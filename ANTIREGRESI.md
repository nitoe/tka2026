# 🛡️ Panduan Anti-Regresi

Checklist wajib sebelum/sesudah perubahan di repo ini.

---

## Area sensitif

- Firestore rules, scoring hash, skema `packages` / `attempts` / `soalPublik`
- UI kuis LMS (navigasi, timer, gate token/waktu)
- Rekap & reset attempt (`guru/rekap-tryout.html`)

---

## 12. Try Out (v0.10–v0.11)

- Field: `jenis`, `durasiMenit`, `maksPercobaan`, `tampilkanHasil`, `token`, `bukaPada`, `tutupPada`.
- Layout LMS satu soal per layar; token dicek client-side.
- Timer client-side; hasil ditahan hanya di UI siswa.

---

## 14. Reset Attempt Try Out (v0.12.0)

- Hanya **staff** boleh `delete` dokumen `attempts`. Siswa: update/delete ditolak.
- Reset **menghapus** attempt (bukan ubah status) supaya batas `maksPercobaan` longgar otomatis.
- UI wajib modal konfirmasi — jangan one-click.
- Setelah ubah rules: **deploy** ke Firebase atau Reset gagal permission.
- Jangan izinkan `update` attempt dari client (cegah manipulasi skor).

---

## Definition of Done

- [ ] Skenario normal & edge case
- [ ] Tidak merusak fitur existing
- [ ] CHANGELOG diupdate
- [ ] Catatan antiregresi jika pola baru
