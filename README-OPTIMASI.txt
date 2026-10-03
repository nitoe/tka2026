Optimasi alur 1–5 + notifikasi (2026-10-03)

Perbaikan utama:
1. normalizeSubjectId / normalizeKompleksitas — stok & generate tidak miss karena BI/mtk/L1 vs L1-Pemahaman
2. staffUid / createdBy memakai staff.id (getStaffDoc) agar filter "soal saya" & paket latihan konsisten
3. Notifikasi: link logikal + resolveNotifLink (aman di subfolder hosting)
4. Publish: kaliDipakaiTryout di soalPublik; questionPool update best-effort (tidak buat dokumen kosong)
5. Admin: tombol "Tandai diproses" pada pengajuan
6. Ajukan: subject/komposisi dinormalisasi saat simpan

Deploy: upload path sama, firebase deploy --only firestore:rules
Jangan timpa firebase-config.js / scoring.js
