# TKA2026 — snapshot repo terbaru (2026-10-02)

Arsip ini berisi file aplikasi yang dikelola di workspace proyek.
Beberapa file runtime (firebase-init.js, firebase-config.js, scoring.js, index login)
biasanya ada di repo GitHub dan mungkin tidak termasuk jika tidak ada di artifacts.

## Struktur

```
app/           halaman siswa (kuis, pilih paket, riwayat)
guru/          halaman guru (bank soal, susun paket, rekap, monitor)
assets/        CSS/JS bersama (theme, guru-shell, laporan-pdf)
firestore.rules
firestore.indexes.json
CHANGELOG.md
ANTIREGRESI.md
TKA2026-template-soal.json / .xlsx
SEB-TKA2026-template.md
```

## Deploy singkat

1. Ekstrak di root repo (timpa file yang sama path-nya).
2. Pastikan assets/firebase-init.js & scoring.js tetap dari repo.
3. firebase deploy --only firestore:rules
4. (opsional) firebase deploy --only firestore:indexes
5. Hard refresh browser (Ctrl+Shift+R)

## Fitur utama di snapshot ini

- Monitor langsung (liveSessions)
- Rekap per kelas: tab, gabungan kelas, ketuntasan, regresi, capaian materi
- Rekap try out: filter kelas dinormalisasi (6A/6B)
- Kuis: timer wall-clock, batch load soal, pgk-cat, stimulus HTML
- PDF paket soal (susun paket)
- Riwayat nilai siswa
