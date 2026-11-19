# Restore + Export Bank Soal

## Status
Commit terakhir sempat berisi PLACEHOLDER pada `guru/bank-soal.html` (kesalahan push).
File yang benar sudah disiapkan di folder artifacts.

## Cara cepat (di mesin Windows Anda)

```powershell
cd C:\Users\USER\Documents\GitHub\tka2026

# Opsi A — kembalikan versi terakhir yang bagus dari Git, lalu ganti dengan file export
git checkout b2846d6be5f6f5c7bb45daa74ab2fca61be1a87f -- guru/bank-soal.html

# Opsi B — salin file yang sudah ada fitur export (dari chat/artifacts)
# Copy bank-soal-dengan-export.html → guru\bank-soal.html

git add guru/bank-soal.html
git commit -m "feat(bank-soal): export JSON/Excel (filter atau semua) untuk migrasi website baru"
git push
```

## Fitur export yang ditambahkan
Di kartu **Daftar Soal Tersimpan**:
- Export JSON (filter) — soal sesuai filter UI, lengkap kunci + gambar base64
- Export JSON (semua) — seluruh bank yang Anda bisa lihat
- Export Excel (filter) — spreadsheet ringkas

JSON shape: `{ _meta: {...}, soal: [ {...}, ... ] }` — field `soal` kompatibel import JSON Bank Soal.
