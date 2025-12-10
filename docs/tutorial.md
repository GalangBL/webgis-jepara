# 🚀 Quick Start Guide - WebGIS Fasilitas Umum

Panduan cepat untuk memulai menggunakan aplikasi WebGIS Pemetaan Fasilitas Umum.

---

## ⚡ Langkah Cepat (3 Menit)

### 1. **Buka Aplikasi**
```
📂 Buka folder project
📄 Double-click pada file: index.html
🌐 Aplikasi akan terbuka di browser
```

### 2. **Tambah Fasilitas Pertama**
1. **Klik di peta** untuk pilih lokasi
2. **Isi form di sidebar kiri:**
   - Nama: `SD Negeri 01 Jakarta`
   - Kategori: `Sekolah`
   - Alamat: `Jl. Sudirman No. 123`
   - Deskripsi: `Sekolah dasar negeri`
3. **Klik "Simpan Fasilitas"**
4. **Marker muncul di peta!** ✅

### 3. **Lihat Data**
- Scroll ke bawah untuk lihat **tabel data**
- Klik **row** → peta zoom ke lokasi
- Klik **marker** → popup muncul

---

## 🎯 Fitur yang Harus Dicoba

### ✅ Tab 1: Tambah Data
- Klik peta langsung isi koordinat
- Pilih kategori dari dropdown
- Simpan dan marker otomatis muncul

### 🔍 Tab 2: Filter
- **Search:** Ketik nama fasilitas
- **Filter Kategori:** Centang kategori yang mau ditampilkan
- **Reset:** Klik "Reset Semua Filter"

### 📊 Tab 3: Statistik
- Lihat pie chart distribusi kategori
- Rincian jumlah per kategori
- Export data ke JSON/GeoJSON
- Import data dari file JSON

---

## 🖱️ Interaksi Peta

### Klik Peta
- Koordinat otomatis masuk form
- Marker preview (orange) muncul

### Klik Marker
- Popup info detail fasilitas
- Button "Lihat Detail" → scroll ke tabel
- Button "Fokus" → zoom in ke marker

### Klik Row Tabel
- Peta zoom ke koordinat
- Marker bounce (animasi)
- Row highlight

---

## ⌨️ Keyboard Shortcuts

| Key | Fungsi |
|-----|--------|
| `Ctrl + N` | Fokus ke form tambah data |
| `Ctrl + F` | Fokus ke search/filter |
| `Ctrl + S` | Buka tab statistik |
| `ESC` | Tutup modal edit |

---

## 💾 Backup & Restore Data

### Backup Data
1. Tab **Statistik**
2. Klik **"Download JSON"**
3. File `fasilitas_YYYY-MM-DD.json` tersimpan

### Restore Data
1. Tab **Statistik**
2. Klik **"Import JSON"**
3. Pilih file backup
4. Konfirmasi import

---

## 🗺️ Load Data QGIS

### Jika Ada File GeoJSON dari QGIS:
1. Copy file `.geojson` ke folder `data/`
2. Rename jadi `sample.geojson`
3. Refresh browser
4. Layer otomatis muncul di peta!

---

## ❗ Catatan Penting

### Data Tersimpan di Browser
- Data disimpan di **localStorage**
- Tidak hilang saat tutup browser
- **TAPI** hilang jika clear cache/data browser
- **Solusi:** Export data secara berkala

### Browser yang Didukung
- ✅ Google Chrome (Recommended)
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ✅ Safari
- ❌ Internet Explorer (Tidak support)

### Koneksi Internet
- **Dibutuhkan** untuk load tile peta (OSM)
- **Dibutuhkan** untuk load library dari CDN
- Aplikasi tidak akan jalan offline

---

## 🐛 Troubleshooting Cepat

### Peta Tidak Muncul?
```
1. Cek koneksi internet
2. Tekan F12 → Lihat Console untuk error
3. Refresh halaman (Ctrl+R)
```

### Data Hilang?
```
1. Jangan clear browser cache
2. Gunakan Export untuk backup
3. Import kembali file backup
```

### Koordinat Salah?
```
1. Pastikan format: Latitude (-90 s/d 90), Longitude (-180 s/d 180)
2. Klik ulang di peta untuk koordinat baru
3. Edit data jika sudah tersimpan
```

---

## 📱 Akses dari Mobile

### Cara Buka di HP/Tablet:
1. Copy folder project ke HP (via USB/Cloud)
2. Buka file manager
3. Tap file `index.html`
4. Pilih browser untuk buka

**Atau:**
- Upload ke web hosting (gratis: GitHub Pages, Netlify)
- Akses via link dari HP

---

## 🎓 Tips Untuk Tugas Kuliah

### 1. Dokumentasi
- Screenshot aplikasi
- Video demo penggunaan
- Export data untuk laporan

### 2. Presentasi
- Buka langsung di browser saat presentasi
- Tambah data live di depan dosen
- Tunjukkan semua fitur (CRUD, filter, chart)

### 3. Development
- Semua kode bisa diedit (HTML, CSS, JS)
- Variable & comment sudah bahasa Indonesia
- Mudah disesuaikan kebutuhan

---

## 📞 Need Help?

### Cek Dokumentasi:
- `README.md` - Dokumentasi lengkap
- `KONSEP_PROJECT.md` - Konsep & arsitektur
- `docs/panduan-qgis.md` - Tutorial QGIS

### Console Browser (F12):
- Lihat error di tab Console
- Cek network request
- Debug variable dengan `window.debugWebGIS`

---

## 🎉 Selamat!

Kamu sudah siap menggunakan WebGIS Fasilitas Umum!

**Next Steps:**
1. ✅ Tambah minimal 10 data fasilitas
2. ✅ Export data untuk backup
3. ✅ Screenshot untuk dokumentasi
4. ✅ (Opsional) Deploy ke web hosting

---

**Happy Mapping! 🗺️✨**
