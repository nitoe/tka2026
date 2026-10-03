# Multi-sekolah — Panduan deploy (fase 1)

## Alur pengguna

1. **`index.html`** — gerbang pilih nama sekolah  
2. **`login.html`** — login siswa/guru (scoped ke sekolah yang dipilih)  
3. **`login.html?mode=admin`** — login super-admin (tanpa pilih sekolah)  
4. **`admin/`** — kelola sekolah, buat guru, import siswa  

## File yang diubah / ditambah

| Path | Keterangan |
|------|------------|
| `index.html` | **Baru sebagai gerbang** (mengganti login root) |
| `login.html` | **Baru** — login lama dipindah ke sini + sadar sekolah |
| `assets/sekolah-context.js` | **Baru** — simpan `sekolahId` di session/localStorage |
| `assets/firebase-init.js` | Ditambah helper list sekolah, roster, `resolveHomeByRole` → admin |
| `firestore.rules` | Koleksi `sekolah`, `loginRoster` |
| `admin/index.html` | **Baru** — panel admin pusat |

> **Penting:** File login lama di root diganti. Setelah upload, URL `/` = pilih sekolah, `/login.html` = masuk.

## Langkah deploy

1. Upload file di atas ke path yang sama di hosting/repo.  
2. Deploy rules:  
   `firebase deploy --only firestore:rules`  
3. Di Firebase Console → Firestore, buat dokumen seed (sekali):

**Koleksi `sekolah`, dokumen ID: `SDM01KUKUSAN`**
```json
{
  "kode": "SDM01KUKUSAN",
  "nama": "SD Muhammadiyah 01 Kukusan",
  "alamat": "Kukusan, Beji, Kota Depok",
  "namaKepalaSekolah": "Mudzakkir Walad, S.Pd.",
  "nbmKepala": "1167327",
  "aktif": true
}
```

Atau lewat **Admin → Kelola Sekolah** setelah login admin.

4. Pastikan dokumen `staff/{uid}` admin punya `"peran": "admin"`.  
5. Hard refresh (Ctrl+Shift+R).

## Catatan fase ini

- Isolasi data bank soal / attempts **belum** memaksa `sekolahId` di rules (masih full staff).  
  Langkah berikutnya: backfill `sekolahId` ke semua dokumen + filter query.  
- Roster login sekolah default (Kukusan) masih pakai daftar fallback di `login.html` jika koleksi `loginRoster` kosong.  
- Sekolah baru wajib diisi lewat admin (guru + import siswa) agar dropdown login terisi.  

## Contoh JSON import siswa

```json
[
  {
    "nama": "Contoh Siswa",
    "nisn": "1234567890",
    "kelas": "6A",
    "sekolahId": "SDM01KUKUSAN"
  }
]
```
