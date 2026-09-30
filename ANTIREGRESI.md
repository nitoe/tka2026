# 🛡️ Panduan Anti-Regresi

Dokumen ini adalah **checklist wajib** sebelum dan sesudah membuat perubahan di repo ini.

Untuk riwayat lengkap pelajaran dari v0.4–v0.10, lihat commit history. Ringkasan aktif di bawah.

---

## Area sensitif (wajib uji ulang)

- Firestore rules, scoring hash (`assets/scoring.js`), skema `packages` / `attempts` / `soalPublik`
- UI kuis LMS (navigasi nomor, timer, gate token/waktu)
- Import bank soal & susun paket
- **Edit soal + `stimulusImage` + sinkron `soalPublik`**
- **Rendering rumus (KaTeX / MathJax)** di stimulus & pertanyaan
- **Lightbox / preview** tidak boleh mengganggu navigasi soal atau timer

---

## 12. Catatan Mekanisme Try Out (v0.10.0 + v0.11.0)

- Field `packages`: `jenis`, `durasiMenit`, `maksPercobaan`, `tampilkanHasil`, `token`, `bukaPada`, `tutupPada`, **`aktif`**, **`skorMaksimal`**.
- Layout LMS: satu soal per layar; jawaban di objek memori; restore saat pindah soal.
- Token dicek di client (string trim) — bukan proteksi kriptografis.
- Jendela waktu memakai jam browser; simpan ISO string (`bukaPada` / `tutupPada`).
- Timer client-side; auto-submit `waktu_habis`; hasil ditahan hanya di UI siswa.
- Hindari ubah `questionIds` setelah try out dimulai.
- Query batas percobaan dua equality tanpa orderBy — tidak butuh composite index.
- Paket hanya tampil di siswa jika **`aktif == true`** (dan subject cocok).

---

## 14. Reset Attempt Try Out (v0.12.0)

- Hanya **staff** yang boleh `delete` dokumen `attempts` (lihat `firestore.rules`). Siswa tetap `update/delete: false`.
- Reset **menghapus** attempt, bukan menandai status khusus — supaya query batas `maksPercobaan` di `kuis.html` otomatis longgar.
- UI wajib konfirmasi (modal) sebelum delete; jangan one-click tanpa dialog.
- Setelah mengubah rules, **deploy rules ke Firebase** (`firebase deploy --only firestore:rules`) — tanpa deploy, tombol reset akan gagal permission.
- Jangan izinkan `update` attempt dari client: mencegah manipulasi skor.

---

## 15. Bank Soal — Edit, Media, Preview (v0.18.7–v0.18.8)

- Edit menulis ke **`questionPool`** (boleh ada `kunciJawaban`) dan **`soalPublik`** (hanya `kunciHash`, tanpa kunci plaintext).
- Gambar stimulus: kompres JPEG di klien (lebar maks ~900px) → field `stimulusImage` (data URL atau URL).
- Kuis menampilkan gambar dalam **frame terbatas** (`max ~260px` / `40vh`, `object-fit: contain`); perbesar lewat lightbox.
- Lightbox **jangan** menutup saat backdrop click (hindari tutup tidak sengaja saat ujian).
- Preview bank harus mencerminkan layout kuis (stimulus teks, gambar, opsi).
- Saat mengubah opsi/kunci: **wajib** `computeKunciHash` ulang dan `setDoc` merge ke `soalPublik`.
- Kunci pg/pgk = **teks opsi yang sama persis**, bukan huruf A/B/C/D.
- Filter **Tanpa media** + search memudahkan audit soal rusak import.

### Checklist uji
- [ ] Edit soal → muncul di kuis (teks + gambar)
- [ ] Ubah kunci → jawaban siswa dinilai benar/salah sesuai kunci baru
- [ ] Preview ≈ tampilan kuis
- [ ] Lightbox buka/tutup (Tutup & Esc); klik luar tidak menutup
- [ ] Staff tanpa rules baru → permission-denied (ingat deploy rules)

---

## 16. Rendering Rumus — KaTeX & MathJax (v0.18.9)

- Delimiter didukung: `$...$`, `$$...$$`, `\(...\)`, `\[...\]`.
- Pipeline: `normalizeLatexDelimiters` → `formatRichHtml` (HTML aman / paragraf) → `renderRichMath`.
- **KaTeX primer**: `ensureKatexLoaded` (CDN jsDelivr + unpkg), `renderMathInElement` dan/atau `katex.renderToString`.
- **MathJax 3 cadangan**: lazy load `tex-chtml.js`; mode URL `?math=auto|katex|mathjax`.
- Jangan double-render tanpa perlu (`data-katex-done` / `data-mathjax-done`); clear flag saat konten diganti (preview edit).
- **Opsi jawaban** boleh menampilkan KaTeX di label, tetapi **nilai hash** tetap teks mentah opsi.
- Jangan masukkan `<script>` ke stimulus; `sanitizeHtml` membuang tag/atribut berbahaya.
- Dependensi CDN: pastikan jaringan siswa tidak memblokir jsDelivr/unpkg saat mode KaTeX.

### Checklist uji
- [ ] Stimulus `Nilai $\frac{22}{7}$` tampil sebagai pecahan di **kuis** dan **preview bank**
- [ ] `\(...\)` dan `$$...$$` juga tampil
- [ ] Soal tanpa rumus tidak error di console
- [ ] `?math=mathjax` tetap merender jika KaTeX diblokir
- [ ] Ganti soal (prev/next) tidak menumpuk layer `.katex` rusak

---

## 17. Penilaian & Laporan (v0.18.3–v0.18.4)

- `skor` selalu di-`Number(...)` sebelum akumulasi.
- `noSoal` di laporan mengikuti urutan `package.questionIds`, bukan urutan acak di sesi siswa.
- Autosave `sessionStorage` + `beforeunload` di kuis; submit tetap sumber kebenaran di Firestore.

---

## Definition of Done

- [ ] Berfungsi di skenario normal & edge case relevan
- [ ] Tidak merusak fitur existing
- [ ] CHANGELOG diupdate
- [ ] Catatan antiregresi ditambah jika pola baru
- [ ] File kritis (`kuis.html`, `bank-soal.html`, rules) sudah di-deploy / hard-refresh diverifikasi
