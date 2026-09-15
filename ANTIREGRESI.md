# 🛡️ Panduan Anti-Regresi

Dokumen ini adalah **checklist wajib** sebelum dan sesudah membuat perubahan di repo ini — baik oleh manusia maupun AI (Claude/Copilot/dll). Tujuannya satu: **jangan sampai fitur yang sudah jalan malah rusak** karena perubahan yang tidak terkait.

Proyek pendahulu (portal TKA versi lama) beberapa kali mengalami regresi dengan pola yang sama: perubahan kecil di satu file lupa diterapkan konsisten ke file lain, atau perbaikan bug tidak diuji ulang di semua skenario. Dokumen ini dibuat supaya pola itu tidak terulang di proyek baru.

---

## 1. Prinsip Umum

1. **Baca dulu sebelum menulis.** Sebelum mengubah kode yang sudah berjalan, pahami dulu alurnya secara utuh (jangan tempel-patch berdasarkan tebakan).
2. **Satu perubahan, satu tujuan.** Jangan gabungkan perbaikan bug dengan refactor besar-besaran dalam satu commit — menyulitkan pelacakan kalau terjadi regresi.
3. **Jangan ubah "yang tidak diminta".** Kalau tugasnya "perbaiki tampilan tombol", jangan sekalian mengubah logika penilaian di file yang sama.
4. **Setiap perbaikan bug → dicatat di [CHANGELOG.md](./CHANGELOG.md)**, termasuk *akar masalah*, bukan cuma gejalanya.
5. **Kalau ragu, jangan asumsikan "sudah pasti benar".** Bug lama di portal sebelumnya sering muncul karena kode diasumsikan lengkap padahal ada properti/variabel yang lupa didefinisikan di file tertentu (lihat §4).

---

## 2. Area Sensitif — Wajib Diuji Ulang Setiap Ada Perubahan

| Area | Kenapa sensitif | Cara verifikasi minimum |
|---|---|---|
| **Firestore Security Rules** | Salah aturan → kunci jawaban bocor ke siswa, atau siswa tidak bisa submit sama sekali | Jalankan emulator + test rules (`firebase emulators:exec`) sebelum deploy |
| **Cloud Function penilaian (`submitAttempt`)** | Kalau scoring balik ke client-side atau ada celah, siswa bisa manipulasi skor | Cek di DevTools Network: pastikan field `kunciJawaban`/`ans` tidak pernah muncul di response ke client sebelum attempt selesai |
| **Skema Firestore (`subjects`, `questionPool`, `packages`, `attempts`)** | Perubahan field/struktur bisa membuat data lama tidak terbaca aplikasi baru | Jalankan migrasi/backfill kalau ada perubahan skema; jangan hapus field lama sebelum semua kode yang membacanya diperbarui |
| **Integrasi Google Apps Script (import soal & backup+email)** | GAS punya kuirk: redirect ke `script.googleusercontent.com` pernah diblokir Safe Exam Browser (SEB) di versi lama | Uji di browser biasa **dan** SEB (jika masih dipakai untuk ujian resmi); jangan asumsikan respons selalu JSON valid |
| **Spreadsheet "Bank Soal Master" (`1JzjZZLQZfrc-6INdJT_ko-En7F3UVz4Fs9lgps0zESs`)** | Perubahan struktur kolom di spreadsheet tanpa update Apps Script → import soal gagal diam-diam | Kalau ubah struktur kolom, update juga parser di Apps Script & validasi di panel admin secara bersamaan |
| **Firebase Auth (role admin vs siswa)** | Salah custom claim → siswa bisa akses panel admin, atau guru terkunci dari akun sendiri | Uji login dengan minimal 1 akun tiap role setelah perubahan apa pun di alur auth |
| **UI kuis (timer, drawer navigasi soal, font size)** | Perubahan CSS/JS di satu tempat gampang merembet ke breakpoint mobile | Uji di lebar layar mobile (≤375px) dan desktop setelah perubahan tampilan |
| **Penanganan jaringan gagal saat submit** | Jika tidak ditangani, siswa bisa kehilangan jawaban saat koneksi putus di tengah submit | Simulasikan offline/lambat (DevTools → Network throttling) saat menguji alur submit |

---

## 3. Checklist Sebelum Deploy / Merge

- [ ] Sudah dites di **browser biasa** (Chrome/Safari mobile & desktop)?
- [ ] Kalau menyentuh alur ujian resmi: sudah dites di **Safe Exam Browser** (jika dipakai)?
- [ ] Firestore Security Rules dites ulang (bukan cuma "kelihatannya jalan" di UI)?
- [ ] Tidak ada `kunciJawaban`/jawaban benar yang terekspos ke response client sebelum submit?
- [ ] Perubahan skema data disertai rencana migrasi data lama (kalau ada data produksi)?
- [ ] `CHANGELOG.md` sudah diupdate dengan format yang benar (lihat template di `CHANGELOG.md`)?
- [ ] Kalau memperbaiki bug: akar masalah dicatat, bukan cuma "sudah diperbaiki"?
- [ ] Kalau bug ditemukan di satu file/komponen serupa: sudah dicek apakah **file/komponen lain** punya bug yang sama? (Ini adalah penyebab regresi paling sering di proyek sebelumnya — satu perbaikan tidak diterapkan konsisten ke semua tempat yang seharusnya identik.)

---

## 4. Lessons Learned dari Portal Lama (dibawa maju sebagai pengingat)

Ini bukan bug proyek baru, tapi **pola bug** yang penting diingat karena arsitektur baru masih mewarisi komponen yang sama (Google Apps Script + Brevo untuk email):

1. **Jangan diam-diam anggap sukses kalau respons gagal di-parse.**
   Pola lama: `.then(r => r.json().catch(() => ({status:'success'})))` — ini menyembunyikan kegagalan asli (timeout, quota exceeded, permission error) dan membuat UI menampilkan "berhasil" padahal tidak. Selalu baca `r.status` dan teks mentah dulu, baru coba parse JSON dengan `try/catch` eksplisit.

2. **Redirect Google Apps Script bisa diblokir oleh lingkungan terkunci (SEB).**
   `script.google.com` melakukan redirect 302 ke `script.googleusercontent.com`. Di lingkungan browser terkunci, redirect ini bisa diblokir meski request awal sudah diterima dan diproses di server. Kalau fitur ini dipakai lagi untuk ujian resmi berpengaman, siapkan jalur alternatif (mis. `no-cors` + `keepalive`, dengan estimasi delay) — tapi kalau itu dilakukan, ukur risikonya: `no-cors` berarti tidak bisa memverifikasi respons asli sukses/gagal.

3. **Variabel yang dipakai tapi tidak pernah didefinisikan — cek konsistensi lintas modul.**
   Bug klasik di proyek lama: satu file punya `const desc = ...` yang dipakai di payload, tapi saat kode itu disalin ke file lain, baris definisinya kelupaan ikut disalin. Kalau proyek baru pakai pola "satu komponen dipakai berulang dengan sedikit variasi per mapel", pastikan ada **satu sumber kebenaran** (fungsi/komponen bersama) — bukan copy-paste manual per mapel seperti dulu. Ini salah satu alasan kuat migrasi ke Firestore + komponen aplikasi tunggal, bukan 1 file HTML per paket soal.

4. **Properti/state yang tidak diinisialisasi di semua varian.**
   Di proyek lama, properti seperti `_fontSteps`/`_lastPayload` ada di sebagian besar file tapi lupa ditambahkan di file yang strukturnya sedikit beda. Di arsitektur baru: hindari duplikasi struktur file per mapel; gunakan satu aplikasi dengan data dinamis dari Firestore, supaya kelas bug ini tidak mungkin terjadi lagi secara struktural.

---

## 5. Jika Terjadi Regresi

1. **Jangan panik-fix langsung di production.** Cek dulu commit/rilis terakhir yang masih berfungsi normal.
2. **Rollback dulu** (Firebase Hosting punya versioning bawaan — bisa rollback ke rilis sebelumnya lewat Console/CLI) sambil menyelidiki akar masalah dengan tenang.
3. **Tulis laporan regresi** di `CHANGELOG.md` dengan format yang sama seperti bug lama di proyek pendahulu: gejala → akar masalah → perbaikan → apa yang sengaja tidak diubah.
4. **Tambahkan kasus ini ke §2 atau §4 di atas** kalau ternyata ini kelas bug baru yang berpotensi terulang.

---

## 6. Catatan Arsitektur Login & Database (mulai v0.4.0)

- **`assets/firebase-init.js` adalah satu-satunya tempat `initializeApp()` dipanggil.** Semua halaman (`index.html`, `app/`, `guru/`, `tools/`) mengimpor dari sana. Kalau butuh fungsi Firebase baru (mis. Storage), tambahkan exportnya di sana — **jangan** panggil `initializeApp()` lagi di file lain, supaya tidak terulang pola "copy-paste drift" (lihat §4).
- **Peran (admin/guru/siswa) ditentukan lewat dokumen Firestore** (`staff/{uid}` dan `students/{uid}`), bukan custom claims Firebase Auth. Konsekuensinya: kalau menambah peran baru atau mengubah logika akses, ubah di **dua tempat sekaligus** — `firestore.rules` (server-side, wajib) dan halaman guard (`app/index.html`, `guru/index.html`) yang membaca dokumen tsb (client-side, untuk UX). Kalau hanya ubah salah satu, bisa terjadi celah keamanan (rules longgar tapi UI ketat) atau UX rusak (UI ketat tapi rules sudah benar).
- **Bootstrap 3 akun staff pertama kali dilakukan manual** lewat Firebase Console (Authentication > Add user, lalu Firestore > buat dokumen `staff/{uid}` manual) — bukan lewat `tools/import-siswa.html`, karena rules `staff/{uid}` butuh `isAdmin()` yang belum ada sebelum dokumen staff pertama dibuat. Kalau perlu menambah staff baru di kemudian hari, tetap lewat Console manual (jumlahnya sedikit, tidak butuh alat khusus).
- **`tools/import-siswa.html` sengaja membaca file dari komputer admin saat itu juga** (lewat `<input type="file">`), bukan mengambil file dari repo — karena file data siswa memuat NISN yang juga menjadi kata sandi. Kalau ke depan alat ini dikembangkan lagi, pertahankan pola ini; jangan ubah jadi fetch file dari path repo.
- **ES Modules butuh server HTTP, tidak bisa dibuka lewat `file://`.** Kalau menguji perubahan secara lokal, jalankan `python3 -m http.server` dulu (lihat README). Kalau lupa dan membuka lewat dobel klik, halaman `app/`/`guru/`/`tools/` akan macet di layar "Memeriksa sesi masuk..." karena modul gagal dimuat — ini bukan bug baru, cek dulu caranya dibuka sebelum menyelidiki lebih jauh.

---

## 7. Catatan Bank Soal (mulai v0.5.0)

- **Kolom template Excel (`contoh/template-bank-soal.xlsx`, sheet "Template Soal") dan fungsi `validateRow()` di `guru/bank-soal.html` harus SELALU berubah bersamaan.** Kalau menambah/mengganti nama kolom di template, wajib update juga logika validasi & mapping-nya di kode — ini persis kelas bug "copy-paste drift" yang sudah diwanti-wanti di §4. Salah satu cara mendeteksi kalau lupa: import beberapa baris dari template versi lama setelah kode diubah, harusnya tetap tervalidasi benar (atau gagal dengan pesan yang jelas, bukan diam-diam salah simpan).
- **Nilai enum (`mataPelajaran`, `kompleksitas`, `tipeSoal`) dicocokkan persis (case-sensitive).** Kalau menambah pilihan baru (mis. mapel IPA), update di TIGA tempat: dropdown validasi Excel (`DataValidation` di script pembuat template), array `*_VALID` di `guru/bank-soal.html`, dan dokumentasi kolom di sheet "Petunjuk Pengisian".
- **`questionPool` sengaja hanya bisa ditulis oleh admin** (lihat `firestore.rules`) — kalau nanti guru juga perlu menambah soal individual (bukan cuma lewat impor Excel), perubahan rules HARUS dibarengi perubahan UI (tombol tambah soal manual) supaya tidak ada guru yang mencoba fitur yang diam-diam ditolak rules.

---

## 8. Catatan Import JSON Pool Soal (mulai v0.6.0)

- **File `pool_matematika.json` dan `pool_bahasa_indonesia.json` yang pertama kali diberikan TIDAK LENGKAP** dibanding field `total_soal` di dalamnya sendiri (matematika: 0 dari 300 soal, cuma 116 ilustrasi tanpa teks; bahasa-indonesia: 30 dari 300 soal). Ini dikonfirmasi memang demikian (belum ada file lanjutan). **Kalau ada file pool baru datang di kemudian hari, JANGAN asumsikan `total_soal` di dalam file = jumlah data yang benar-benar ada** — selalu hitung ulang panjang array sebenarnya sebelum dipercaya, seperti yang dilakukan `detectJsonShape()`/preview import.
- **Pemetaan `lingkup_materi → kompleksitas` ada di DUA tempat yang harus sinkron**: fungsi `LINGKUP_KE_KOMPLEKSITAS` di `guru/bank-soal.html`, dan tabel di README.md. Kalau sumber data mulai memakai label `lingkup_materi` baru di luar 3 yang sudah dipetakan, baris tsb akan otomatis ditandai bermasalah di pratinjau (bukan silently salah kompleksitas) — pertahankan perilaku "gagal kelihatan" ini, jangan diam-diam kasih fallback default kompleksitas kalau label tidak dikenali.
- **Koleksi `ilustrasiSoal` adalah staging area, bukan tujuan akhir.** Saat file teks soal Matematika yang sesungguhnya datang (dengan `id` yang match, mis. "MTK-006"), belum ada mekanisme OTOMATIS untuk menggabungkannya dengan ilustrasi yang sudah tersimpan — ini masih manual/belum dibangun. Kalau membangun fitur itu nanti, pertimbangkan: cek `ilustrasiSoal/{id}` saat import soal baru, kalau ada gabungkan gambarnya ke dokumen `questionPool` yang baru dibuat, lalu opsional hapus dari `ilustrasiSoal`.
- **Base64 gambar disimpan langsung di field Firestore** (bukan Firebase Storage). Ukuran terbesar yang pernah ditemukan ±225KB per gambar, aman di bawah batas 1MiB per dokumen Firestore. **Kalau ke depan jumlah soal berilustrasi jauh lebih banyak (ribuan) atau gambar jauh lebih besar, migrasi ke Firebase Storage** (simpan file di Storage, simpan URL-nya saja di Firestore) — jangan terus menambah base64 langsung tanpa mengecek dulu total ukuran koleksi.
- **Import JSON memakai ID dari data sumber sebagai document ID Firestore** (bukan auto-id seperti jalur Excel) — ini sengaja, supaya re-import file yang sama bersifat idempotent (menimpa, bukan menduplikasi). Kalau mengubah jalur ini, pertahankan sifat idempotent-nya, atau jelaskan konsekuensinya kalau sengaja diubah.

---

## 10. Catatan Susun Paket (mulai v0.7.0)

- **`packages` menyimpan referensi ID soal, bukan salinan isinya.** Kalau nanti ada fitur edit/hapus soal di bank soal, pertimbangkan dampaknya ke paket yang sudah dibuat — idealnya cek dulu apakah soal itu dipakai di paket manapun sebelum mengizinkan hapus, atau minimal beri peringatan. Belum ada validasi ini sama sekali saat ini.
- **Tidak ada pengecekan nama paket duplikat** — guru bisa menyimpan beberapa paket dengan nama sama persis. Kalau ini jadi masalah nyata di pemakaian, tambahkan validasi nama unik per mapel.
- **Query `questionPool` per mapel di `susun-paket.html` mengambil SEMUA soal mapel tsb sekaligus** (tidak dipaginasi). Aman untuk ratusan soal, tapi kalau bank soal tumbuh jadi ribuan per mapel, perlu ditambah paginasi atau server-side filtering (Cloud Function) supaya tidak berat di browser guru.

---

## 11. Catatan Migrasi Data Portal Lama (mulai v0.7.0 lanjutan)

- **Sumber data**: 300 soal Matematika + 300 soal Bahasa Indonesia asli dari portal TKA lama (`sdm01-main.zip`, folder `matematika/paket-1..10` dan `bahasa-indonesia/paket-1..10`) diekstrak langsung dari kode JS-nya (bukan diketik ulang manual), supaya tidak ada risiko salah salin.
- **Dedup otomatis terhadap 30 soal Bahasa Indonesia yang sudah masuk** (dari `pool_bahasa_indonesia.json`, lihat CHANGELOG v0.6.0): soal lama yang teksnya persis sama dengan salah satu dari 30 itu **dilewati**, karena versi yang sudah ada punya ilustrasi & metadata genre yang lebih baik. Hasil akhir: 300 Matematika baru + 270 Bahasa Indonesia baru (bukan 300, karena 30 sudah ada).
- **`kompleksitas` untuk 300 soal Matematika migrasi diberi nilai sentinel `"Belum Dikategorikan"`** — portal lama tidak pernah melacak level kognitif, jadi tidak ada data asli untuk dipetakan. Field `kompleksitas` kita perluas dari 3 nilai (L1/L2/L3) menjadi 4 (+ sentinel ini). **Kalau menambah filter/dropdown kompleksitas di halaman lain (mis. `susun-paket.html`), pastikan sentinel ini ikut ditangani** — jangan biarkan soal "Belum Dikategorikan" jadi tidak muncul di filter manapun.
- **`tipeMateri` untuk 270 soal Bahasa Indonesia migrasi juga diberi sentinel `"Belum Dikategorikan"`** (portal lama tidak melacak genre teks) — sementara `kompleksitas`-nya justru terisi penuh (dipetakan dari `cat` lama: Pemahaman Tekstual/Inferensial/Evaluasi dan Apresiasi → L1/L2/L3). Jadi soal Matematika migrasi "kaya" di `tipeMateri` tapi "kosong" di `kompleksitas`, sedangkan soal B.Indo migrasi kebalikannya — ini bukan bug, tapi konsekuensi dari data asli yang memang berbeda struktur.
- **`sourceImportId` dipakai sebagai document ID** (pola sama seperti jalur JSON pool lainnya, lihat §8) — format `MTK-OLD-P{nomor paket}-{id asli}` dan `BI-OLD-P{nomor paket}-{id asli}`, supaya re-import aman (idempotent) dan tertelusuri asalnya dari paket mana.
- **File hasil migrasi (`matematika-migrasi-lama.json`, `bahasa-indonesia-migrasi-lama.json`) sengaja TIDAK disertakan di repo** — dibagikan langsung sebagai file kerja, karena ukurannya cukup besar (soal Matematika membawa gambar stimulus base64 hingga ~2MB total) dan sifatnya "sekali pakai untuk migrasi", bukan sesuatu yang perlu dilacak versinya di git.

---

## 12. Definition of Done (untuk fitur baru, bukan cuma bugfix)

Sebuah fitur baru dianggap selesai kalau:

- [ ] Berfungsi sesuai spesifikasi di skenario normal.
- [ ] Sudah diuji skenario gagal/edge case yang relevan (jaringan putus, input kosong, dsb).
- [ ] Tidak menurunkan performa/aksesibilitas fitur lain yang sudah ada.
- [ ] Firestore Rules & Cloud Functions terkait (kalau ada) sudah diuji, bukan cuma diasumsikan aman.
- [ ] Dicatat di `CHANGELOG.md`.
- [ ] Kalau menyentuh area di §2, checklist §3 sudah dijalankan penuh.
