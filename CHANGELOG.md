# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

---

## [0.18.12] — 2026-10-01

### Fixed
- **Akses try out siswa**: parser waktu (`bukaPada`/`tutupPada`) diseragamkan (Timestamp, epoch, string lokal tanpa zona) di `kuis.html` & `pilih-paket.html`.
- Toleransi jam perangkat ±3 menit agar HP yang melenceng tetap bisa masuk saat jendela ujian.
- Cek `maksPercobaan` tidak lagi menggagalkan seluruh kuis jika query attempt error (index/rules).
- **Pilih paket**: fallback filter `aktif` di klien jika index komposit Firestore belum siap.

### Tidak Berubah
- Syarat `aktif === true`, token try out, batas percobaan saat query berhasil.

---

## [0.18.11] — 2026-09-30

### Added
- **Analisis statistik per kelas; regresi linear BI~MTK (r, R², scatter)**: mean, median, min/max, simpangan baku, ketuntasan KKM 70%, sebaran 4 band, grafik Chart.js, insight otomatis; ringkasan statistik di PDF.
- **Rekap nilai per kelas** (`guru/rekap-kelas.html`): roster siswa kelas 6A/6B, nilai MTK & BI (persen terbaik), keterangan "tidak mengikuti", peringkat terbaik / MTK / BI.
- Ekspor **PDF** landscape + blok pengesahan (Guru Kelas 6A/6B, Kepala Sekolah).
- Menu sidebar **Rekap per Kelas**.

### Tidak Berubah
- Rekap try out per attempt, scoring, bank soal.

---

## [0.18.10] — 2026-09-30

### Added
- **Susun paket — kelola soal paket**: daftar soal terpilih menampilkan cuplikan pertanyaan, meta, tombol **Edit soal** (buka `bank-soal.html?edit=…`) dan **Keluarkan**.
- Filter **Tampilkan hanya soal dalam paket** + pintasan **Kelola di Bank Soal**.
- **Bank soal**: parameter URL `?edit=<idSoal>` membuka form edit otomatis setelah data termuat.

### Tidak Berubah
- Skema `packages.questionIds`, gate try out, scoring.

---

## [0.18.9] — 2026-09-30

### Fixed
- **KaTeX di kuis & bank soal**: fungsi `renderWithKatex` yang hilang dipulihkan; rumus kini di-render andal.
- Rendering LaTeX memakai `katex.renderToString` (manual) + auto-render, dengan **retry** (0 / 400 / 1200 ms).
- **CDN cadangan** KaTeX (jsDelivr → unpkg) jika script awal gagal termuat.
- Normalisasi delimiter LaTeX saat paste (`\(`, `\frac`, dll.).

### Added
- **MathJax 3 sebagai alternatif**: mode `auto` (KaTeX dulu → MathJax), `?math=katex`, `?math=mathjax`.
- MathJax **lazy-load**, antrian typeset batch, konfigurasi ringan (`enableMenu/enrichment/explorer: false`).
- **Pratinjau live KaTeX** di form edit bank soal (stimulus & pertanyaan).

### Changed
- Stimulus & pertanyaan mendukung **HTML aman** (paragraf, tebal, daftar, tabel) + delimiter `$...$`, `$$...$$`, `\(...\)`, `\[...\]`.
- Optimasi performa: skip elemen tanpa delimiter, target DOM sempit, `requestAnimationFrame`, flag `data-katex-done` / `data-mathjax-done`.

### Tidak Berubah
- Hash kunci jawaban, skema attempt, opsi tetap teks polos untuk stabilitas hash.

---

## [0.18.8] — 2026-09-30

### Added
- **Bank soal — Preview soal**: tampilan mirip kuis (stimulus, gambar, opsi, kunci guru).
- **Lightbox stimulus** (bank + kuis): tampilan penuh teks/gambar; zoom **+ / − / 100%**; **tidak** menutup saat klik di luar panel (hanya Tutup / Esc).
- **Edit opsi & kunci jawaban** di modal edit (pg / pgk / pgk-cat) + hitung ulang `kunciHash` ke `soalPublik`.
- Aksesibilitas lightbox: focus trap, `aria-*`, kembalikan fokus, `prefers-reduced-motion`.

### Changed
- **Gambar di kuis**: dibatasi frame (`object-fit: contain`, maks ~260px / 40vh) agar ilustrasi penuh tidak merusak layout.
- Thumbnail bank soal: `loading="lazy"`, `decoding="async"`.
- Paragraf stimulus di kuis diselaraskan dengan preview (kemudian diganti pipeline rich HTML di 0.18.9).

### Tidak Berubah
- Gate try out, susun paket, rekap, scoring attempt.

---

## [0.18.7] — 2026-09-30

### Added
- **Bank soal — pencarian**: kotak cari (pertanyaan, stimulus, tipe, ID) + filter **Tanpa media**.
- **Bank soal — Edit soal**: perbaiki pertanyaan, stimulus teks, tipe materi, kompleksitas, skor.
- **Unggah gambar stimulus**: kompres otomatis (JPEG, lebar maks ~900px), simpan ke `questionPool` + `soalPublik` (`stimulusImage`).
- Badge **tanpa media** untuk soal tanpa stimulus/gambar.
- **Kuis**: tampilkan `stimulusImage` dengan ukuran terbatas (max ~420×260px), tetap terbaca.

### Changed
- Firestore rules: staff (guru & admin) boleh menulis `questionPool` / `soalPublik` (perlu deploy rules).

### Tidak Berubah
- Skema attempt, scoring hash, susun paket, gate try out.

---

## [0.18.6] — 2026-09-30

### Fixed
- **Susun paket — jadwal buka/tutup**: parsing tanggal lebih tahan (Timestamp Firestore, ISO, seconds); tampilan `datetime-local` diperjelas + pratinjau jadwal berbahasa Indonesia.

### Tidak Berubah
- Skema field `bukaPada`/`tutupPada` (ISO string), filter aktif, gate di kuis.

---

## [0.18.5] — 2026-09-28

### Added
- **Bank soal**: unduh template Excel (`.xlsx`, sheet `Template Soal` + `Petunjuk`) dan template JSON.
- Contoh 3 tipe soal (pg, pgk, pgk-cat) di template; validasi import selaras skema scoring.

### Fixed
- **Bank soal**: handler import Excel/JSON dipulihkan (preview + commit ke `questionPool` + `soalPublik` ber-hash).

### Tidak Berubah
- Skema attempt, kuis, rekap, susun paket.

---

## [0.18.4] — 2026-09-28

### Fixed
- **Penilaian kuis**: `skor` dipaksa `Number(...)` agar tidak concat string dari import.
- **No. soal di laporan**: memakai urutan stabil di `package.questionIds` (bukan urutan setelah acak soal).
- **Rekap**: `escapeAttr` / `escapeHtml` dipastikan memakai entitas HTML yang benar.

### Tidak Berubah
- Rumus skor total, KKM 70%, struktur `skorPerKompleksitas` / `skorPerTipeMateri`.

---

## [0.18.3] — 2026-09-28

### Fixed / Improved
- **Kuis (esensial)**: autosave jawaban ke `sessionStorage` (pulih jika tab tertutup/refresh dalam sesi yang sama).
- Peringatan `beforeunload` saat ujian berlangsung (cegah tutup tab tidak sengaja).
- Deteksi soal hilang di `soalPublik` (log console; skor maks mengikuti soal yang berhasil dimuat).
- Penilaian lebih tahan error jika `kunciHash` kosong/tipe tidak dikenal.

### Tidak Berubah
- Skema attempt, gate token/waktu, rekap, PDF, susun paket.

---

## [0.18.2] — 2026-09-26

### Fixed
- **Susun paket**: simpan field `aktif` (centang "Aktifkan paket") + `skorMaksimal` agar paket muncul di daftar siswa (`where aktif == true`).
- Badge AKTIF / NONAKTIF di daftar paket tersimpan; normalisasi `subjectId`.

### Tidak Berubah
- Filter siswa, gate token/waktu, rekap, bank soal.

---

## [0.18.1] — 2026-09-25

### Changed
- **Query Firestore rekap** lebih selektif: kombinasi `jenisPaket` + `subjectId` (bukan hanya satu filter), soft limit 1000 dokumen, fallback otomatis jika index komposit belum siap.
- Sort waktu tetap di klien (tanpa `orderBy` di server).

### Added
- `firestore.indexes.json` — index komposit `attempts`: `jenisPaket`+`subjectId`, dan `packageId`+`studentId` (untuk cek attempt siswa di kuis).

### Fixed
- `escapeAttr` / `escapeHtml` di rekap (entitas HTML sempat rusak saat push v0.18.0).

### Tidak Berubah
- Grafik Chart.js, tab bandingkan, PDF, reset attempt, shell guru.

---

## [0.18.0] — 2026-09-25

### Added
- **Grafik hasil** di `guru/rekap-tryout.html` (Chart.js): sebaran skor (0–50 / 51–70 / 71–85 / 86–100) dan rata-rata per paket.
- **Tab Bandingkan Paket**: pilih dua paket → metrik side-by-side (rata-rata, jumlah attempt, % tuntas ≥70%) + delta, grafik batang, dan tabel perubahan per siswa (hanya yang ikut keduanya).
- Stat box **Tuntas (≥70%)**.

### Changed
- **Optimasi query Firestore**: filter server-side prioritas `packageId` → `jenisPaket` → `subjectId`; fallback scan penuh hanya jika tidak ada filter. Sort waktu di klien (hindari composite index). Hint query ditampilkan di UI.

### Tidak Berubah
- PDF laporan, reset attempt (modal 2 langkah), filter kelas/nama (klien), shell guru, aturan skor.

---

## [0.17.0] — 2026-09-25

### Added
- **Sidebar layout** untuk seluruh area guru (`assets/guru-shell.js` + CSS di `theme.css`).
- Navigasi tetap: Dashboard, Rekap Try Out, Bank Soal, Susun Paket; user + logout di footer sidebar.
- Mobile: hamburger + backdrop; sidebar collapsible.

### Changed
- `guru/index.html`, `bank-soal.html`, `rekap-tryout.html`, `susun-paket.html` memakai shell bersama.
- Header per-halaman diganti topbar ringan + sidebar.

### Tidak Berubah
- Logika Firebase, filter, PDF, reset attempt, import, edit paket.

---

## [0.16.0] — 2026-09-25

### Changed
- **Redesign UI guru**: `guru/bank-soal.html`, `guru/susun-paket.html`, `guru/rekap-tryout.html` memakai `assets/theme.css` + header gelap profesional (`--brand-ink`).
- Konsisten dengan dashboard & halaman kuis yang sudah lebih rapi.

### Tidak Berubah
- Logika filter cascading, import, backfill BI, edit paket, PDF, reset attempt.

---

Lihat commit history untuk entri lebih lama.
