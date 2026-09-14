# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

Setiap entri baru **wajib** menyebutkan: tanggal, apa yang berubah, kenapa berubah, dan apa yang **tidak** disentuh (khususnya untuk area sensitif — lihat [ANTIREGRESI.md](./ANTIREGRESI.md)).

---

## [Unreleased]

Rencana kerja aktif — lihat papan proyek / roadmap internal untuk detail fase.

### Direncanakan
- Integrasi Firebase Authentication sungguhan ke `index.html` (saat ini form login baru UI + validasi client-side, belum memanggil `signInWithEmailAndPassword`).
- Halaman `app/` (menu utama siswa setelah login) dan `guru/` (dashboard guru & admin setelah login).
- Setup Firebase project (Auth, Firestore, Hosting, Functions).
- Alat impor otomatis 52 akun siswa + 3 akun guru/admin ke Firebase Authentication & Firestore.
- Desain & penerapan skema Firestore (`subjects`, `questionPool`, `packages`, `attempts`, `students`).
- Panel admin: manajemen bank soal + import dari Google Spreadsheet.
- Aplikasi kuis siswa versi baru (mengambil soal dari Firestore, penilaian server-side).
- Dashboard rekap nilai real-time untuk guru.
- Integrasi Google Apps Script: import soal massal & backup hasil ujian + email laporan ke orang tua.
- Firestore Security Rules & pengujian keamanan (kunci jawaban tidak boleh terkirim ke client).

---

## [0.6.0] — 2026-09-14

### Added
- **`guru/bank-soal.html`**: jalur import baru "Dari JSON Pool" (tab terpisah dari Excel), mendukung format pool soal hasil olahan (base64 ilustrasi) dengan deteksi otomatis dua bentuk file:
  - *Soal lengkap* → import ke `questionPool` (+ `bacaanPool` untuk soal berbasis bacaan bersama).
  - *Ilustrasi saja* (belum ada teks soal) → import ke koleksi baru `ilustrasiSoal` sebagai staging, menunggu teks soal menyusul.
- Kartu "Pustaka Ilustrasi Menunggu Teks Soal" di `guru/bank-soal.html` — muncul otomatis kalau ada entri di `ilustrasiSoal`.
- Skema `pgk-cat` digeneralisasi: kolom (`cols`) sekarang bisa berisi label kustom apa pun (bukan cuma Benar/Salah) — mengakomodasi variasi nyata di data (ditemukan 6 variasi label berbeda di 7 soal `pgk-cat` pada `pool_bahasa_indonesia.json`).
- `firestore.rules`: tambah aturan untuk koleksi `bacaanPool` dan `ilustrasiSoal` (staff baca, admin tulis — pola sama seperti `questionPool`).
- Import lewat jalur JSON memakai **ID dari data sumber sebagai document ID Firestore** (bukan auto-id), membuat proses import idempotent — aman diimpor ulang tanpa duplikasi.

### Fixed
- Penomoran heading di `ANTIREGRESI.md` dirapikan (sempat ada lompatan nomor akibat beberapa kali sisip bagian baru tanpa renumbering).

### Verifikasi
- Fungsi `detectJsonShape()` dan `mapSoalLengkap()` diuji lewat Node langsung terhadap file asli yang diunggah pemilik proyek (bukan data contoh): 30/30 soal Bahasa Indonesia berhasil divalidasi & dipetakan benar, distribusi kompleksitas hasil mapping sesuai ekspektasi (10/10/10 untuk L1/L2/L3), deteksi bentuk file benar untuk kedua file (`soal-lengkap` vs `ilustrasi-saja`).
- Ukuran base64 terbesar dicek (±225KB) — aman di bawah batas 1MiB/dokumen Firestore.
- Layout tab Excel/JSON Pool & kartu Pustaka Ilustrasi diperiksa lewat screenshot browser.
- **Belum diuji end-to-end** (upload sungguhan sampai tersimpan ke Firestore asli) — perlu dicoba langsung oleh pemilik proyek.

### Tidak Berubah
- Jalur import Excel tidak diubah — `pgk-cat` di jalur itu tetap dibatasi Benar/Salah (lebih sederhana untuk pengisian manual guru).
- Belum ada mekanisme otomatis menggabungkan `ilustrasiSoal` dengan teks soal yang datang belakangan — masih manual (lihat ANTIREGRESI.md §8 untuk catatan desainnya).

### Konteks Penting (bukan bug, tapi perlu diketahui)
- `pool_matematika.json` yang diunggah **tidak berisi teks soal sama sekali** — hanya 116 ilustrasi. `pool_bahasa_indonesia.json` berisi 30 dari 300 soal yang diklaim (hanya yang butuh ilustrasi). Ini dikonfirmasi memang seluruh data yang ada saat ini, bukan kesalahan upload.

### Pekerjaan Berikutnya
- Pemilik proyek: coba import `pool_bahasa_indonesia.json` & `pool_matematika.json` lewat `guru/bank-soal.html` di project Firebase asli, kabari kalau ada hasil tak terduga.
- Lanjutkan proses pembuatan 270 soal Bahasa Indonesia & 300 soal Matematika (teks) yang tersisa.
- Bangun mekanisme penggabungan otomatis `ilustrasiSoal` ↔ teks soal yang datang belakangan.

---

## [0.5.0] — 2026-09-13

### Added
- **`guru/bank-soal.html`** — halaman kelola bank soal:
  - Admin: upload Excel → preview tervalidasi per baris (baris salah ditandai merah + alasan spesifik, tidak ikut terimpor) → import ke Firestore `questionPool` (batch write, aman untuk ratusan soal sekaligus).
  - Semua staff (admin & guru): lihat & filter bank soal (per mapel / tipe materi / kompleksitas) untuk keperluan menyusun paket di fase berikutnya.
- **`contoh/template-bank-soal.xlsx`** — template Excel 3 sheet: "Petunjuk Pengisian" (penjelasan tiap kolom), "Template Soal" (siap isi, sudah ada dropdown validasi bawaan Excel untuk kolom mataPelajaran/kompleksitas/tipeSoal/kunci Benar-Salah), "Contoh Terisi" (4 contoh soal mencakup ketiga tipeSoal).
- Taksonomi bank soal baru: `tipeMateri` (domain konten, meneruskan struktur `cat` dari portal lama), **`kompleksitas`** (level kognitif L1-Pemahaman/L2-Aplikasi/L3-Penalaran — field baru, tidak ada di portal lama, mengikuti kerangka AKM Kemendikbud).
- Dashboard guru (`guru/index.html`): tambah kartu tautan ke Bank Soal.

### Changed
- **`firestore.rules`**: koleksi `packages` sekarang bisa ditulis oleh **guru maupun admin** (`isStaff()`, sebelumnya `isAdmin()` saja) — karena guru yang akan menyusun paket latihan/try out dari bank soal, bukan hanya admin. Koleksi `questionPool` (bank soal mentah) tetap admin-only.

### Verifikasi
- Fungsi `validateRow()` diuji terpisah lewat Node dengan 8 skenario (pg/pgk/pgk-cat valid, dan berbagai kasus salah format) — semua lulus.
- Template Excel diverifikasi bisa dibaca ulang dengan benar lewat openpyxl (header & isi cocok seperti yang dirancang).
- Layout `guru/bank-soal.html` dan kartu baru di `guru/index.html` diperiksa lewat screenshot browser (mode bypass-auth khusus untuk cek visual, karena login sungguhan butuh project Firebase asli).
- Belum diuji end-to-end oleh pemilik proyek (upload Excel asli → benar-benar tersimpan ke Firestore) — perlu dicoba langsung karena lingkungan kerja di sini tidak punya akses ke project Firebase asli.

### Tidak Berubah
- Belum ada fitur "susun paket dari bank soal" — itu langkah berikutnya setelah bank soal ini terisi.
- Belum ada fitur tambah/edit soal manual satu-satu (hanya lewat impor Excel) — lihat ANTIREGRESI.md §9 kalau nanti mau ditambahkan.

### Pekerjaan Berikutnya
- Pemilik proyek: isi `contoh/template-bank-soal.xlsx` dengan soal sungguhan, coba import lewat `guru/bank-soal.html`, kabari kalau ada baris yang tertolak tapi seharusnya valid (atau sebaliknya).
- Fitur susun paket (guru pilih mapel+kompleksitas+tipeMateri → pilih soal dari hasil filter → simpan sebagai `packages`).
- Aplikasi kuis siswa yang mengambil soal dari `packages`/`questionPool`.

---

## [0.4.0] — 2026-09-13

### Added
- **`firestore.rules`** — aturan keamanan Firestore lengkap: siswa hanya baca data sendiri, staff (admin/guru) ditentukan lewat dokumen `staff/{uid}` (bukan custom claims), kunci jawaban bank soal (`questionPool`) tidak bisa dibaca client biasa, hasil ujian (`attempts`) tidak bisa diubah/dihapus setelah dibuat.
- **`firebase-config.js`** — placeholder konfigurasi Firebase (nilai `GANTI_DENGAN_...`, aman untuk publik, tinggal diisi setelah project Firebase dibuat).
- **`assets/firebase-init.js`** — modul terpusat: satu-satunya tempat `initializeApp()` dipanggil, dipakai semua halaman lain (lihat ANTIREGRESI.md §7).
- **`app/index.html`** — halaman utama siswa setelah login: sapaan nama + kelas, kartu mata pelajaran (masih "Segera Hadir"), tombol Keluar. Redirect otomatis ke halaman masuk kalau belum login atau bukan akun siswa.
- **`guru/index.html`** — dashboard guru/admin setelah login: sapaan nama + badge peran, placeholder "Dashboard Rekap Nilai — Dalam Pengembangan", tombol Keluar.
- **`tools/import-siswa.html`** — alat sekali pakai untuk admin: login admin → pilih file JSON data siswa dari komputer lokal → buat otomatis akun Firebase Authentication + dokumen Firestore untuk setiap siswa (idempotent — aman dijalankan ulang, entri yang sudah ada otomatis dilewati).
- `index.html`: tombol Masuk pada kedua tab sekarang benar-benar memanggil Firebase Authentication (`signInWithEmailAndPassword`), dengan redirect otomatis sesuai peran setelah berhasil, dan pesan error yang manusiawi (nama/sandi salah, koneksi bermasalah, dll).

### Changed
- README.md: struktur repo diperbarui sesuai kondisi sebenarnya (bukan lagi "rencana"), ditambah bagian Setup Firebase langkah-demi-langkah dan skema akun/login.
- README.md: catatan penting — ES Modules butuh dibuka lewat server HTTP lokal (`python3 -m http.server`), tidak bisa dobel klik langsung (`file://`).

### Verifikasi
- Semua file `.js`/`<script type="module">` divalidasi sintaksnya lewat `node --check` — tidak ada error.
- Semua halaman diuji lewat server HTTP lokal dengan Playwright: path impor modul relatif (`../assets/firebase-init.js`, `../firebase-config.js`) sudah benar dari kedalaman folder mana pun.
- Alur "Firebase belum dikonfigurasi" (placeholder `firebase-config.js`) menampilkan fallback yang wajar di `index.html` (tidak ada elemen rusak/hilang).
- ✅ **[Update 2026-09-13] Diverifikasi end-to-end oleh pemilik proyek setelah `firebase-config.js` diisi nilai asli project `tka2026-sdm01`:** 3 akun staff + akun siswa berhasil dibuat lewat kombinasi Firebase Console (staff) dan `tools/import-siswa.html` (siswa), dan login sungguhan berhasil di kedua tab (Siswa, Guru & Admin) dengan redirect ke `app/` dan `guru/` sesuai peran.

### Tidak Berubah
- Belum ada Cloud Functions / penilaian server-side — itu untuk fase aplikasi kuis (belum dikerjakan).
- `ANTIREGRESI.md` ditambah §7 (catatan arsitektur login & database) — bagian lain tidak diubah.

### Pekerjaan Berikutnya
- Pemilik proyek: selesaikan setup Firebase Console (lihat README §Setup Firebase), isi `firebase-config.js`, deploy `firestore.rules`, buat 3 akun staff + dokumen `staff/{uid}` manual, jalankan `tools/import-siswa.html`.
- Setelah itu: uji ulang alur login end-to-end (siswa & guru) dengan project Firebase asli.
- Bangun halaman kuis sungguhan (Matematika & Bahasa Indonesia) + Cloud Functions penilaian server-side.

---

## [0.3.0] — 2026-09-13

### Changed
- **`index.html` dirombak ulang** dari model Masuk/Daftar (email+password ketik manual) menjadi **dua tab berbasis dropdown nama**: tab **Siswa** dan tab **Guru & Admin**. Tab **Daftar dihapus** — akun tidak lagi didaftarkan mandiri oleh pengguna, melainkan diprovisi lebih dulu oleh admin (lihat data siswa & guru di bawah).
- Tautan "Panel Guru" ke halaman terpisah (`./admin/`) **dihapus** — login guru/admin sekarang menyatu di halaman yang sama, dibedakan lewat tab, bukan halaman terpisah.
- Nama siswa dari data mentah (beberapa ditulis SEMUA HURUF KAPITAL atau huruf kecil semua) dinormalisasi ke Proper Case (mis. `ABI IBADURROHMAN` → `Abi Ibadurrohman`) agar konsisten dan rapi di seluruh dropdown maupun dokumen turunannya.

### Added
- Dropdown **Nama Siswa** (52 nama, dikelompokkan per kelas via `<optgroup>`: Kelas 6A & 6B, urut abjad) + field Kata Sandi.
- Dropdown **Nama Guru & Admin** (Arif Azwar Anas, Ratih Yuniati, Asuroh Susanti) + field Kata Sandi.
- Data akun (nama → ID login internal) disisipkan langsung di `index.html` sebagai array JS (`SISWA`, `GURU`) untuk mengisi dropdown — **bukan** kredensial asli, hanya pemetaan nama ke email internal; kata sandi tetap divalidasi lewat Firebase Authentication di fase berikutnya.
- File data siswa (Nama, Kelas, NISN, Email Login) dan file Excel **`Daftar-Login-Siswa-TKA2026.xlsx`** (2 sheet: Login Siswa & Login Guru+Admin) disiapkan sebagai bahan kerja untuk alat impor akun ke Firebase. **Keduanya sengaja TIDAK disertakan di repo ini** (lihat peringatan privasi di bawah) — disimpan lokal di komputer admin saja.

### Skema Akun (ditetapkan pemilik proyek)
- **Siswa**: email login `nama.siswa@sdm01tka2026.id` (domain internal, bukan email sungguhan), kata sandi = **NISN** siswa.
- **Guru/Admin**: `arif@admintka2026.id` (admin), `ratih@gurutka2026.id` (guru), `santi@gurutka2026.id` (guru — akun atas nama Asuroh Susanti), kata sandi ditetapkan manual oleh pemilik proyek.

### ⚠️ Catatan Privasi (PENTING — baca sebelum upload ke GitHub)
- Repo `nitoe/tka2026` bersifat **publik**. Dari data lengkap ala Dapodik yang diberikan (~30 kolom termasuk alamat rumah, data orang tua, nomor HP), **hanya Nama, Kelas, dan NISN** yang dipakai untuk aplikasi ini — kolom lain tidak diproses maupun disimpan di mana pun.
- Nama lengkap 52 siswa tampil di *client-side* `index.html` (bisa dilihat lewat "View Source" oleh siapa pun yang membuka halaman login, karena repo publik). Ini trade-off yang disengaja demi UX dropdown nama — **tidak ada kata sandi yang ikut ter-expose lewat `index.html`**, jadi risikonya setara daftar nama kelas yang memang lazim terlihat publik (mis. di mading/rapor).
- **JANGAN UPLOAD** file `siswa-kelas6-2026-2027.json` atau `Daftar-Login-Siswa-TKA2026.xlsx` ke GitHub — dua file itu memuat NISN yang sekaligus menjadi **kata sandi** setiap siswa. Simpan hanya di komputer lokal admin (atau Google Drive privat sekolah), tidak pernah di repo publik. Alat impor akun ke Firebase (fase berikutnya) akan dirancang membaca file ini lewat pemilih file lokal di browser, bukan mengambil dari repo.

### Tidak Berubah
- Belum ada koneksi backend apa pun — submit form masih menampilkan pesan status placeholder, sama seperti versi sebelumnya, sampai Firebase Authentication benar-benar diintegrasikan.
- `README.md` dan `ANTIREGRESI.md` belum diperbarui pada entri ini.

### Pekerjaan Berikutnya
- Setup Firebase project (dipandu langkah demi langkah).
- Firestore Security Rules untuk koleksi `students`, `guru`, dll.
- Alat impor otomatis akun ke Firebase Authentication + Firestore dari `data/siswa-kelas6-2026-2027.json`.
- Sambungkan `submitLogin()` ke `signInWithEmailAndPassword` sungguhan + redirect sesuai peran (siswa → `app/`, guru/admin → `guru/`).

---

## [0.2.0] — 2026-09-13

### Changed
- **`index.html` didesain ulang total** dari landing page kartu paket menjadi **halaman gerbang masuk (login/daftar)**, mengikuti referensi desain split-screen (kiri: branding + fitur, kanan: kartu autentikasi dengan tab Masuk/Daftar) yang diberikan pemilik proyek.
- Identitas visual (warna biru, font Nunito/Baloo 2) dari versi sebelumnya dipertahankan untuk kontinuitas brand — palet referensi (teal) tidak ditiru langsung, hanya struktur & fungsinya.

### Added
- Form **Masuk**: email + kata sandi, dengan validasi client-side (format email, kata sandi tidak boleh kosong) dan pesan error inline per field.
- Form **Daftar**: nama lengkap, kelas (6A/6B/6C), email, kata sandi + konfirmasi, dengan validasi client-side (kata sandi minimal 6 karakter, konfirmasi harus sama).
- Tab switching antara panel Masuk/Daftar (vanilla JS, objek `AuthUI`).
- Tautan "Masuk ke Panel Guru ↗" mengarah ke `./admin/` (halaman belum dibuat — akan 404 sampai Fase panel admin dikerjakan).
- Badge "Pratinjau UI — belum tersambung Firebase" dan pesan status setelah submit, agar jelas bagi siapa pun yang membuka bahwa autentikasi asli belum aktif.
- Komentar `// TODO(Fase 1 — Firebase Auth)` di titik-titik yang perlu diganti dengan pemanggilan Firebase Authentication sungguhan.

### Tidak Berubah
- Belum ada koneksi backend apa pun (Firebase/Apps Script) — submit form hanya menampilkan pesan status, tidak mengirim data ke mana pun.
- `README.md` dan `ANTIREGRESI.md` tidak diubah pada entri ini.

### Pekerjaan Berikutnya
- Sambungkan form ke Firebase Authentication (lihat penanda `TODO` di kode) begitu Fase 0 (setup project Firebase) selesai.
- Buat halaman `admin/index.html` agar tautan Panel Guru tidak lagi mengarah ke halaman kosong.

---

## [0.1.0] — 2026-09-13

### Added
- Scaffold awal repository: `index.html`, `README.md`, `CHANGELOG.md`, `ANTIREGRESI.md`.
- `index.html`: landing page portal dengan status "segera hadir" untuk Matematika & Bahasa Indonesia, dan bagian "Direncanakan" untuk IPA & Bahasa Inggris. Belum terhubung ke Firebase — murni statis.
- Dokumentasi arsitektur target (Firebase + Google Apps Script + Spreadsheet) di README.
- Referensi Spreadsheet ID untuk bank soal & backup hasil ujian: `1JzjZZLQZfrc-6INdJT_ko-En7F3UVz4Fs9lgps0zESs` (dicatat di README, bukan kredensial rahasia).

### Context
- Proyek ini adalah penerus dari portal TKA lama (HTML statis per paket soal, tanpa database terpusat, penilaian di client-side, hasil hanya dikirim via email lewat Google Apps Script + Brevo).
- Keputusan desain awal: fokus 2 mapel dulu (Matematika, Bahasa Indonesia), dashboard guru/admin real-time jadi prioritas utama, bank soal dikelola sebagai pool di Firestore dengan mekanisme import dari admin.

### Tidak Berubah
- Belum ada logika penilaian, autentikasi, atau koneksi database apa pun di tahap ini — repo masih tahap scaffold dokumentasi + landing page statis.

---

## Template Entri Baru

Salin blok ini setiap membuat rilis/perubahan baru:

```
## [x.y.z] — YYYY-MM-DD

### Added
-

### Changed
-

### Fixed
-

### Tidak Berubah
- (area sensitif yang sengaja tidak disentuh, untuk mencegah regresi)

### Pekerjaan Berikutnya
-
```
