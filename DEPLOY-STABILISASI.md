# Stabilisasi deploy + backfill multi-sekolah

Ikuti **berurutan**. Jangan loncat ke filter bank/rekap sebelum langkah ini hijau.

---

## A. Upload file

### Dari arsip fase 1 (`tka-multisekolah.zip`)
| Path |
|------|
| `index.html` (gerbang) |
| `login.html` |
| `admin/index.html` |
| `assets/sekolah-context.js` |
| `assets/firebase-init.js` |
| `firestore.rules` |

### Dari arsip fase 2 (`tka-multisekolah-fase2.zip`)
| Path |
|------|
| `assets/sekolah-scope.js` |
| `assets/guru-shell.js` |
| `admin/backfill-sekolah.html` |
| `admin/index.html` *(versi terbaru + seed + link backfill)* |
| `app/pilih-paket.html` |
| `app/kuis.html` |
| `guru/susun-paket.html` |

Jangan timpa kosong: `firebase-config.js`, `scoring.js`.

---

## B. Deploy rules

```bash
firebase deploy --only firestore:rules
```

Pastikan rules memuat match `sekolah` dan `loginRoster`.

---

## C. Seed sekolah (wajib sebelum gerbang “hidup” dari Firestore)

1. Buka `/login.html?mode=admin` → masuk admin.
2. Buka `/admin/`.
3. Klik **Seed sekolah SDM01KUKUSAN**  
   **atau** isi form Kelola Sekolah manual dengan ID `SDM01KUKUSAN`.

Cek Firestore Console → koleksi `sekolah` → dokumen `SDM01KUKUSAN` → `aktif: true`.

---

## D. Backfill `sekolahId` (data lama)

1. Dari panel admin → **Backfill** (`/admin/backfill-sekolah.html`).
2. Target: `SDM01KUKUSAN`.
3. Centang koleksi yang relevan (default packages, attempts, questionPool, soalPublik, students, staff guru).
4. **Dry-run ON** → Jalankan → baca log (berapa yang “perlu”).
5. **Dry-run OFF** → Jalankan lagi → tunggu sampai selesai.
6. Spot-check 2–3 dokumen di Console: field `sekolahId` terisi.

**Catatan staff:** hanya `peran: guru` yang di-backfill. Admin super boleh tanpa `sekolahId`.

---

## E. Uji smoke (harus lulus semua)

| # | Uji | Hasil diharapkan |
|---|-----|------------------|
| 1 | Buka `/` | Daftar sekolah (minimal Kukusan) |
| 2 | Pilih Kukusan → login | Dropdown siswa/guru terisi |
| 3 | Login siswa → pilih paket | Hanya paket sekolah ini (setelah backfill) |
| 4 | Login guru → Susun paket | Daftar paket terfilter; simpan paket baru punya `sekolahId` |
| 5 | Login admin → Admin Pusat | CRUD sekolah + backfill + seed OK |
| 6 | Hard refresh (Ctrl+Shift+R) | Tidak error console terkait modul ES |

Jika gerbang kosong padahal seed sudah ada: cek rules `sekolah` (baca `aktif == true`) dan hard refresh.

---

## F. Rollback darurat

- Kembalikan `index.html` login lama hanya jika gerbang memblokir total; sementara arahkan user ke `/login.html` setelah set sekolah manual di Console tidak praktis.
- Rules: simpan salinan rules lama sebelum deploy.
- Backfill **merge** saja — tidak menghapus field lain; aman diulang.

---

## G. Setelah stabil

Baru lanjut fase berikutnya: filter bank soal + rekap per `sekolahId`, lalu (opsional) perketat rules.
