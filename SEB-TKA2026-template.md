# Template Konfigurasi Safe Exam Browser — Portal TKA 2026

Gunakan **SEB Configuration Tool** (Windows) atau Preferences di SEB macOS untuk membuat file `.seb` terenkripsi.  
File XML di bawah hanya **referensi**; untuk ujian nyata simpan sebagai **Starting an exam** + password enkripsi.

---

## 1. Ganti placeholder

| Placeholder | Contoh / isi Anda |
|-------------|-------------------|
| `https://DOMAIN-ANDA/tka2026/` | URL root hosting portal (GitHub Pages / Firebase Hosting / domain sekolah) |
| `QUIT_PASSWORD` | Password keluar SEB (hanya pengawas) — mis. `tka2026keluar` |
| `ADMIN_PASSWORD` | Password buka/edit config — mis. `admin-tka-sekolah` |
| `SETTINGS_PASSWORD` | Password buka file `.seb` (opsional, disarankan) |

**Start URL yang disarankan**

- Umum (siswa pilih mapel):  
  `https://DOMAIN-ANDA/tka2026/app/index.html`  
  atau `https://DOMAIN-ANDA/tka2026/app/pilih-paket.html?mapel=matematika`
- Langsung try out tertentu (jika `paketId` sudah diketahui):  
  `https://DOMAIN-ANDA/tka2026/app/kuis.html?paketId=ID_PAKET`

---

## 2. Pengaturan di SEB Config Tool (checklist)

### General
| Setting | Nilai |
|---------|--------|
| **Start URL** | URL portal (lihat di atas) |
| **Administrator password** | `ADMIN_PASSWORD` |
| **Quit password** | `QUIT_PASSWORD` (wajib diisi) |
| Allow user to quit SEB | ✅ Ya (dengan password) |
| Ask user to confirm quitting | ✅ Ya |

### Config File
| Setting | Nilai |
|---------|--------|
| Use SEB settings file for | **Starting an exam** |
| Settings password (enkripsi file) | `SETTINGS_PASSWORD` (disarankan) |

### User Interface
| Setting | Nilai |
|---------|--------|
| Browser view mode | Full screen / kiosk |
| Show reload button | ✅ (jika Wi‑Fi sering putus) |
| Show time | ✅ |
| Show task bar | Opsional (biasanya nonaktif di ujian ketat) |
| Enable spell check | ❌ |
| Allow dictionary lookup | ❌ |

### Browser
| Setting | Nilai |
|---------|--------|
| Allow browsing back/forward | ❌ (atau ✅ jika perlu navigasi portal) |
| Block pop-up windows | ✅ |
| Allow reload | ✅ |
| Clear cookies / session on start | Opsional (jika ✅, siswa harus login tiap buka SEB) |

### Down/Uploads
| Setting | Nilai |
|---------|--------|
| Allow downloads | ❌ |
| Allow uploads | ❌ |
| Allow PDF plug-in | ❌ (kecuali butuh baca PDF soal) |

### Exam
| Setting | Nilai |
|---------|--------|
| Use Browser & Config Keys | Opsional (portal belum verifikasi key) |
| Quit URL | Kosong, atau URL halaman “selesai” jika nanti ditambah |
| Restart exam password protected | ✅ |

### Applications
| Setting | Nilai |
|---------|--------|
| Allow switching to applications | ❌ |
| Permitted processes | Kosong (kecuali kalkulator OS jika diizinkan guru) |
| Prohibited processes | Biarkan default SEB |

### Network → URL Filter
| Setting | Nilai |
|---------|--------|
| **Activate URL filtering** | ✅ |
| Filter also embedded content | ✅ (bisa diperlonggar jika halaman lambat) |
| Action default | **Block** (whitelist saja yang diizinkan) |

**Aturan allow (expression, bukan regex dulu):**

```
DOMAIN-ANDA
*.googleapis.com
*.gstatic.com
*.firebaseapp.com
*.web.app
identitytoolkit.googleapis.com
securetoken.googleapis.com
firestore.googleapis.com
fonts.googleapis.com
fonts.gstatic.com
www.gstatic.com
```

Catatan:
- Ganti `DOMAIN-ANDA` dengan host portal (tanpa `https://`), mis. `nitoe.github.io` atau `tka.sekolah.sch.id`.
- Firebase Auth & Firestore **wajib** di-allow; kalau terlalu ketat, login/query akan gagal.
- SEB otomatis mengizinkan Start URL; tetap tambahkan host + path asset (`/tka2026/*` jika path berbasis folder).

### Security / Hooked Keys (Windows)
| Setting | Nilai |
|---------|--------|
| Enable kiosk mode / Create new desktop | ✅ (Windows) |
| Allow virtual machine | ❌ |
| Allow screen sharing / AirPlay | ❌ |
| Ctrl+C / Ctrl+V / Ctrl+X | Blokir jika diinginkan |
| Alt+Tab / Print Screen | Blokir |
| Right-click | Blokir (jika opsi tersedia) |

---

## 3. Referensi XML (unencrypted plist)

Simpan sebagai acuan atau impor jika tool mendukung. **Jangan** bagikan ke siswa dalam bentuk plain text tanpa enkripsi.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>startURL</key>
  <string>https://DOMAIN-ANDA/tka2026/app/index.html</string>

  <key>sebConfigPurpose</key>
  <integer>1</integer>

  <key>allowQuit</key>
  <true/>
  <key>quitURL</key>
  <string></string>

  <key>allowPreferencesWindow</key>
  <false/>
  <key>allowSpellCheck</key>
  <false/>
  <key>allowDownUploads</key>
  <false/>
  <key>allowBrowsingBackForward</key>
  <false/>
  <key>blockPopUpWindows</key>
  <true/>
  <key>browserWindowAllowReload</key>
  <true/>
  <key>showReloadButton</key>
  <true/>
  <key>showTime</key>
  <true/>
  <key>showTaskBar</key>
  <false/>
  <key>allowSwitchToApplications</key>
  <false/>
  <key>allowVirtualMachine</key>
  <false/>
  <key>allowScreenSharing</key>
  <false/>
  <key>allowWlan</key>
  <false/>
  <key>allowAudioCapture</key>
  <false/>
  <key>allowVideoCapture</key>
  <false/>

  <key>URLFilterEnable</key>
  <true/>
  <key>URLFilterEnableContentFilter</key>
  <true/>
  <key>urlFilterRegex</key>
  <false/>
  <key>URLFilterRules</key>
  <array>
    <dict>
      <key>action</key>
      <integer>1</integer>
      <key>active</key>
      <true/>
      <key>expression</key>
      <string>DOMAIN-ANDA</string>
      <key>regex</key>
      <false/>
    </dict>
    <dict>
      <key>action</key>
      <integer>1</integer>
      <key>active</key>
      <true/>
      <key>expression</key>
      <string>*.googleapis.com</string>
      <key>regex</key>
      <false/>
    </dict>
    <dict>
      <key>action</key>
      <integer>1</integer>
      <key>active</key>
      <true/>
      <key>expression</key>
      <string>*.gstatic.com</string>
      <key>regex</key>
      <false/>
    </dict>
    <dict>
      <key>action</key>
      <integer>1</integer>
      <key>active</key>
      <true/>
      <key>expression</key>
      <string>*.firebaseapp.com</string>
      <key>regex</key>
      <false/>
    </dict>
    <dict>
      <key>action</key>
      <integer>1</integer>
      <key>active</key>
      <true/>
      <key>expression</key>
      <string>*.web.app</string>
      <key>regex</key>
      <false/>
    </dict>
    <dict>
      <key>action</key>
      <integer>1</integer>
      <key>active</key>
      <true/>
      <key>expression</key>
      <string>fonts.googleapis.com</string>
      <key>regex</key>
      <false/>
    </dict>
    <dict>
      <key>action</key>
      <integer>1</integer>
      <key>active</key>
      <true/>
      <key>expression</key>
      <string>fonts.gstatic.com</string>
      <key>regex</key>
      <false/>
    </dict>
  </array>

  <key>sendBrowserExamKey</key>
  <false/>
  <key>removeBrowserProfile</key>
  <true/>
</dict>
</plist>
```

Password quit/admin **tidak** ditulis plain di XML di atas; isi lewat Config Tool agar di-hash dengan benar.

---

## 4. Cara membuat file `.seb` (Windows)

1. Install [Safe Exam Browser](https://safeexambrowser.org/download_en.html) + buka **SEB Config Tool**.
2. Isi checklist di bagian 2.
3. Menu **File → Save settings as…** (atau tab Config File).
4. Pilih **Starting an exam**.
5. Set **Settings password** (enkripsi).
6. Simpan mis. `TKA2026-tryout-MTK.seb` / `TKA2026-tryout-BI.seb`.
7. Uji di satu PC lab: double-click `.seb` → login → kerjakan 1 soal dummy → quit dengan `QUIT_PASSWORD`.

---

## 5. Distribusi ke lab

| Cara | Keterangan |
|------|------------|
| USB / folder bersama | Salin `.seb` ke setiap PC; siswa double-click |
| Link unduh terkontrol | Hanya dibuka mendekati jam ujian |
| `sebs://DOMAIN-ANDA/path/config.seb` | Jika file di-host HTTPS; SEB membuka otomatis |

Jangan taruh quit/admin password di kertas siswa. Cukup pengawas yang tahu.

---

## 6. Uji kompatibilitas dengan portal TKA

Setelah `.seb` jalan, cek:

1. Halaman login muncul dan Firebase Auth berhasil.
2. Daftar paket (`aktif` + jadwal) terbaca.
3. Token try out bisa diketik.
4. Soal + opsi + navigasi + kumpulkan berjalan.
5. Tidak ada request diblokir (jika gagal load, longgarkan URL filter / matikan content filter sementara).

Jika login gagal hanya di SEB → hampir pasti URL filter terlalu ketat (tambah `*.googleapis.com` dan host Firebase).

---

## 7. Batasan penting

- Portal **belum** memverifikasi Browser Exam Key / Config Key; SEB mengunci OS, bukan server yang menolak browser biasa.
- Siswa masih bisa mengerjakan di Chrome biasa jika tahu URL — mitigasi: token + jendela waktu + pengawas + jangan sebar URL kuis publik.
- iPad/iOS SEB punya UI config sedikit berbeda; gunakan Start URL + Quit password yang sama.

---

*Template ini untuk SD Muhammadiyah 01 Kukusan — Portal Latihan TKA 2026. Sesuaikan DOMAIN dan password sebelum dipakai produksi.*
