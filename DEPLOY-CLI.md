# Pertama kali memakai Firebase CLI di repo ini

Repo ini sebelumnya tidak punya `firebase.json` / `.firebaserc`, jadi `firebase use` gagal.

## 1. Pasang dan masuk
```powershell
npm install -g firebase-tools
firebase login
```

## 2. Dari folder repo
```powershell
cd C:\Users\USER\Documents\GitHub\tka2026
firebase use tka2026-sdm01
```
Atau cukup `firebase use` lalu pilih proyek (setelah `.firebaserc` ada, default sudah `tka2026-sdm01`).

## 3. Deploy
Rules saja:
```powershell
firebase deploy --only firestore:rules
```

Hosting (situs statis, root repo):
```powershell
firebase deploy --only hosting
```

Keduanya:
```powershell
firebase deploy --only firestore:rules,hosting
```

## Catatan
- `firebase-config.js` harus ada di folder saat deploy Hosting (file lokal, jangan di-commit).
- Jika Hosting belum pernah dibuat, CLI akan menanyakannya saat deploy pertama, atau buat dulu di Firebase Console → Hosting.
- Project ID dari config yang sudah dipakai: `tka2026-sdm01`.
