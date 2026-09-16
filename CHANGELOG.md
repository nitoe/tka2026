# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

Setiap entri baru **wajib** menyebutkan: tanggal, apa yang berubah, kenapa berubah, dan apa yang **tidak** disentuh (khususnya untuk area sensitif — lihat [ANTIREGRESI.md](./ANTIREGRESI.md)).

---

## [Unreleased]

Rencana kerja aktif — lihat papan proyek / roadmap internal untuk detail fase.

### Direncanakan
- Dashboard rekap nilai real-time untuk guru (sekarang sudah ada data `attempts` sungguhan untuk direkap, lihat v0.9.0).
- Klasifikasi kompleksitas untuk 300 soal Matematika migrasi, dan tipeMateri untuk 270 soal B.Indo migrasi (masih "Belum Dikategorikan").
- Timer pengerjaan, penyesuaian ukuran font, dan navigasi drawer soal di `app/kuis.html` (fitur dari portal lama yang belum diport — kuis saat ini masih single-page-scroll sederhana).
- Fitur edit soal individual & edit paket tersimpan (sekarang baru bisa buat baru/hapus).
- Migrasi ke Cloud Function server-side scoring kalau suatu saat dibutuhkan keamanan lebih tinggi (lihat ANTIREGRESI.md §11).

---

## [0.9.0] — 2026-09-15

### Fixed
- **Bug filter di `guru/bank-soal.html`**: dropdown "Semua Mapel" dan "Semua Kompleksitas" tidak pernah diisi otomatis (`populateFilters()` cuma mengisi dropdown Tipe Materi, dua lainnya lupa disertakan) — soal-soal tersimpan lengkap dengan datanya, tapi tidak bisa difilter lewat dua dropdown itu karena opsinya kosong. Sekarang ketiga dropdown (Mapel, Tipe Materi, Kompleksitas) diisi otomatis dari data yang benar-benar ada, termasuk nilai sentinel "Belum Dikategorikan".
- `guru/susun-paket.html`: tambah opsi "Belum Dikategorikan" di dropdown filter Kompleksitas.
- **Bug double-toggle checkbox di `app/kuis.html`** (ditemukan lewat pengujian otomatis sebelum dirilis, bukan setelah dipakai siswa): klik pada opsi soal tipe `pgk` sempat batal tercentang sendiri karena toggle manual bentrok dengan toggle native browser. Lihat ANTIREGRESI.md §11 untuk detail & pelajarannya.
- Alert error di `app/kuis.html` yang sempat menampilkan `\nCoba kumpulkan ulang.` secara literal (backslash dobel tidak sengaja) alih-alih baris baru — kosmetik, sudah dirapikan.

### Added
- **`assets/scoring.js`** — modul hashing jawaban bersama (SHA-256 via Web Crypto API), satu-satunya sumber logika normalisasi/penilaian, dipakai baik saat import soal maupun saat siswa mengerjakan kuis.
- **Koleksi Firestore baru: `soalPublik`** — salinan soal yang aman dibaca siswa (kunci jawaban asli diganti `kunciHash`). Dibuat otomatis di ketiga jalur import `guru/bank-soal.html` (Excel, JSON soal-lengkap, JSON migrasi-lama).
- **Tombol "Perbarui Soal Publik Sekarang"** di `guru/bank-soal.html` — backfill `soalPublik` untuk soal yang sudah ada sebelum fitur ini dibuat (570 soal migrasi + 30 soal ilustrasi B.Indo).
- **`app/pilih-paket.html`** — daftar paket aktif per mata pelajaran (query `packages` where `subjectId` & `aktif`).
- **`app/kuis.html`** — halaman mengerjakan soal sungguhan: render 3 tipe soal (pg/pgk/pgk-cat) termasuk stimulus HTML/gambar, tracking progres, submit dengan penilaian hash di client, halaman hasil dengan rincian skor per tipe materi & per kompleksitas, simpan ke koleksi `attempts`.
- `app/index.html`: kartu Matematika & Bahasa Indonesia sekarang jadi tautan aktif ke `pilih-paket.html` (bukan lagi "Segera Hadir").
- `firestore.rules`: aturan untuk `soalPublik` (baca: siapa pun yang login; tulis: admin saja).

### Verifikasi
- `assets/scoring.js` diuji lewat Node dengan 9 skenario (pg benar/salah, pgk urutan berbeda tapi tetap match, pgk kurang/beda jawaban tidak match, pgk-cat urutan match vs tertukar) — semua lulus.
- Alur kuis lengkap diuji end-to-end lewat Playwright dengan data tiruan (3 soal, satu per tipe): render semua tipe soal benar, progress tracking benar, submit dengan jawaban benar → skor 5/5, submit dengan jawaban sengaja salah semua → skor 0/5, breakdown per tipe materi & kompleksitas akurat.
- Bug double-toggle checkbox ditemukan justru LEWAT pengujian ini (progress sempat nyangkut di "2/3" padahal 3 soal dijawab) — diperbaiki lalu diuji ulang sampai lulus, termasuk uji klik checkbox 2x berturut-turut harus kembali ke status tidak tercentang.
- Query `packages` (dua filter equality tanpa orderBy) dikonfirmasi tidak butuh composite index Firestore.
- **Belum diuji end-to-end dengan Firestore/Auth asli** (baru diuji dengan data tiruan di lingkungan kerja ini) — perlu dicoba langsung oleh pemilik proyek: import soal → backfill soal publik → susun paket → siswa login → kerjakan kuis → cek dokumen `attempts` tersimpan benar.

### Tidak Berubah
- Dashboard rekap nilai guru masih placeholder — sekarang datanya (`attempts`) sudah mulai ada, tinggal dibangun tampilannya.
- Belum ada timer/pengaturan waktu pengerjaan, penyesuaian ukuran font, atau navigasi drawer soal (fitur dari portal lama) — kuis saat ini single-page-scroll sederhana.

### Pekerjaan Berikutnya
- Pemilik proyek: jalankan backfill Soal Publik, susun 1 paket, coba kerjakan sebagai siswa sungguhan, kabari hasilnya.
- Bangun dashboard rekap nilai guru (lihat CHANGELOG v0.5.0 "Pekerjaan Berikutnya" — sekarang datanya sudah tersedia).

---

## [0.8.0] — 2026-09-14

### Added
- **Jalur import JSON ketiga di `guru/bank-soal.html`: "Array datar hasil migrasi"** — `detectJsonShape()` sekarang mengenali file berupa array JSON langsung (bukan object dengan field `mata_pelajaran`), setiap item divalidasi ringan (`validateMigrasiItem()`) lalu ditulis ke `questionPool` dengan document ID dari `sourceImportId` (idempotent).
- Data migrasi lengkap dari portal TKA lama: **300 soal Matematika** dan **270 soal Bahasa Indonesia baru** (270, bukan 300, karena 30 soal yang sudah masuk lewat `pool_bahasa_indonesia.json` dideteksi otomatis sebagai duplikat berdasarkan kecocokan teks pertanyaan, dan dilewati). Diekstrak langsung dari kode JS `matematika/paket-1..10` dan `bahasa-indonesia/paket-1..10` di `sdm01-main.zip` (bukan input manual), termasuk field `stim`/`rows`/`cols`/`ans` asli seperti stimulus HTML (untuk Matematika, termasuk gambar base64 di dalamnya) dan struktur `pgk-cat`.
- Field baru pada skema `kompleksitas`: nilai sentinel **`"Belum Dikategorikan"`** untuk soal yang levelnya belum diklasifikasi (khusus 300 soal Matematika migrasi, karena portal lama tidak melacak level kognitif).

### Verifikasi
- Ekstraksi diuji dengan menjalankan skrip Node terhadap seluruh 20 file paket asli (10 Matematika + 10 Bahasa Indonesia) — total 300+300=600 soal berhasil diekstrak tanpa error.
- Fungsi `validateMigrasiItem()` diuji terhadap seluruh 570 soal hasil migrasi (setelah dedup): **100% valid** (0 bermasalah), dan seluruh `sourceImportId` dipastikan unik (tidak ada tabrakan document ID).
- Ukuran dokumen terbesar dicek (~95KB untuk soal Matematika dengan gambar stimulus) — aman di bawah batas 1MiB/dokumen Firestore; total ukuran per mapel (~1.4MB Matematika, ~0.6MB B.Indo) juga aman di bawah batas ukuran satu batch write Firestore (~10MB).
- **Belum diuji end-to-end** (import sungguhan ke Firestore asli) — perlu dicoba langsung oleh pemilik proyek.

### Tidak Berubah
- Dua jalur import JSON sebelumnya (soal-lengkap, ilustrasi-saja) tidak diubah.
- Belum ada mekanisme untuk mengisi `kompleksitas` (Matematika) atau `tipeMateri` (B.Indo migrasi) yang masih "Belum Dikategorikan" — perlu proses klasifikasi lanjutan (manual atau lewat bantuan lain) di kemudian hari.

### Pekerjaan Berikutnya
- Pemilik proyek: import `matematika-migrasi-lama.json` dan `bahasa-indonesia-migrasi-lama.json` lewat `guru/bank-soal.html` (file dibagikan terpisah, tidak ada di repo — lihat ANTIREGRESI.md §11), kabari kalau ada hasil tak terduga.
- Klasifikasi kompleksitas untuk 300 soal Matematika migrasi, dan tipeMateri untuk 270 soal B.Indo migrasi (masih "Belum Dikategorikan").
- Gabungkan Pustaka Ilustrasi Matematika (116 gambar, sudah masuk sejak v0.6.0) dengan 300 soal Matematika migrasi ini berdasarkan kecocokan `id` (mis. "MTK-006") — belum ada mekanisme otomatis untuk ini.

---

## [0.7.0] — 2026-09-14

### Added
- **`guru/susun-paket.html`** — halaman baru untuk merakit paket latihan/try out (bisa diakses admin & guru, sesuai `firestore.rules` yang sudah mengizinkan `isStaff()` menulis `packages` sejak v0.5.0):
  - Filter soal per mapel → tipe materi → kompleksitas.
  - Pilih soal lewat checkbox, panel kanan menampilkan ringkasan (jumlah soal + total skor) secara real-time.
  - Simpan sebagai dokumen `packages` baru; daftar paket tersimpan ditampilkan & bisa dihapus di halaman yang sama.
- Dashboard guru (`guru/index.html`): tambah kartu tautan ke Susun Paket.

### Verifikasi
- Sintaks JS divalidasi lewat `node --check`.
- Layout & interaksi (render daftar soal, panel ringkasan, status simpan) diperiksa lewat screenshot browser dengan data simulasi (karena login sungguhan butuh project Firebase asli, sama seperti keterbatasan pengujian di versi-versi sebelumnya).
- **Belum diuji end-to-end** (pilih soal sungguhan dari Firestore asli → simpan paket → muncul di daftar) — perlu dicoba langsung oleh pemilik proyek.

### Tidak Berubah
- Belum ada fitur edit paket yang sudah tersimpan (cuma buat baru & hapus) — kalau perlu ubah, hapus lalu buat ulang untuk saat ini.
- Belum ada pengecekan dampak ke paket kalau soal di bank soal diubah/dihapus (lihat ANTIREGRESI.md §10).

### Pekerjaan Berikutnya
- Pemilik proyek: coba susun 1 paket sungguhan dari 30 soal Bahasa Indonesia yang sudah masuk, kabari kalau ada hasil tak terduga.
- Aplikasi kuis siswa yang mengambil soal dari `packages` (lewat Cloud Function, supaya kunci jawaban tidak terkirim ke client — lihat ANTIREGRESI.md §2).
- Dashboard rekap nilai guru (masih placeholder).

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
- ✅ **[Update 2026-09-14] Diverifikasi end-to-end oleh pemilik proyek:** `pool_bahasa_indonesia.json` berhasil masuk 30 soal ke Bank Soal (dari 300 yang diklaim — sesuai ekspektasi, karena memang baru itu yang tersedia), dan `pool_matematika.json` berhasil masuk ke Pustaka Ilustrasi (bukan Bank Soal aktif) sesuai desain.

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
