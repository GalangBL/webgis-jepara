# 🗺️ Sistem Informasi Geografis Pemetaan Fasilitas Umum

![WebGIS](https://img.shields.io/badge/WebGIS-Project-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-green)
![License](https://img.shields.io/badge/License-MIT-red)

**Sistem Informasi Geografis (SIG) berbasis web untuk pemetaan fasilitas umum menggunakan HTML, CSS, dan JavaScript murni tanpa framework backend.**

---

## 📖 Tentang Project

Project ini adalah aplikasi WebGIS (Web-based Geographic Information System) yang memungkinkan pengguna untuk:

- ✅ **Menambah, edit, dan hapus** data fasilitas umum (CRUD lengkap)
- ✅ **Visualisasi peta interaktif** menggunakan Leaflet.js
- ✅ **Integrasi dengan QGIS** melalui format GeoJSON
- ✅ **Statistik dan grafik** distribusi fasilitas
- ✅ **Filter dan pencarian** data real-time
- ✅ **Export/Import** data dalam format JSON dan GeoJSON
- ✅ **Dark theme** yang modern dan nyaman di mata
- ✅ **Responsive design** untuk desktop, tablet, dan mobile

---

## 🚀 Fitur Utama

### 1. **CRUD Fasilitas Umum**

- Tambah fasilitas baru dengan klik langsung di peta
- Edit data fasilitas yang sudah ada
- Hapus data dengan konfirmasi (SweetAlert2)
- Data disimpan di localStorage (tanpa database)

### 2. **Peta Interaktif**

- Basemap dari OpenStreetMap
- Marker clustering otomatis
- Custom marker dengan icon Lucide Icons
- Popup informasi detail
- Klik peta untuk mendapatkan koordinat
- Zoom dan pan ke lokasi fasilitas

### 3. **Integrasi QGIS**

- Load GeoJSON dari QGIS
- Tampilkan polygon, line, dan point
- Popup untuk GeoJSON features
- Export data ke format GeoJSON

### 4. **Statistik & Analisis**

- Dashboard dengan total fasilitas per kategori
- Pie chart distribusi kategori
- Filter multi-select berdasarkan kategori
- Pencarian real-time

### 5. **Pencarian Cerdas Lokasi (FITUR BARU!)**

- **Auto-complete search** menggunakan Nominatim API (OpenStreetMap)
- **Deteksi kategori otomatis** berdasarkan nama lokasi
- **Quick search buttons** untuk pencarian cepat (SD, RS, Masjid, Bank, Kantor)
- **Hasil pencarian terfilter** khusus area Jepara
- **Geolocation** untuk deteksi lokasi pengguna
- **Reverse geocoding** untuk mendapatkan alamat dari koordinat

### 6. **Export & Import**

- Download data sebagai JSON
- Download data sebagai GeoJSON (kompatibel dengan QGIS)
- Import data dari file JSON
- Backup dan restore data

---

## 🛠️ Teknologi yang Digunakan

| Teknologi                 | Versi   | Kegunaan                         |
| ------------------------- | ------- | -------------------------------- |
| **HTML5**                 | -       | Struktur halaman web             |
| **CSS3**                  | -       | Styling dengan dark theme modern |
| **JavaScript (ES6+)**     | -       | Logika aplikasi & interaksi      |
| **Leaflet.js**            | 1.9.4   | Library peta interaktif          |
| **Leaflet MarkerCluster** | 1.5.3   | Clustering marker otomatis       |
| **Leaflet Draw**          | 1.0.4   | Drawing tools di peta            |
| **Chart.js**              | 4.4.0   | Visualisasi grafik statistik     |
| **SweetAlert2**           | 11.x    | Modal & alert yang cantik        |
| **Lucide Icons**          | Latest  | Icon set modern SVG-based        |
| **localStorage**          | Web API | Penyimpanan data di browser      |

---

## 📁 Struktur Project

```
project-sig-fasilitas/
│
├── index.html              # Halaman utama aplikasi
├── README.md               # Dokumentasi ini
├── KONSEP_PROJECT.md       # Dokumentasi konsep lengkap
│
├── css/
│   ├── style.css           # Main stylesheet (dark theme)
│   └── responsive.css      # Media queries untuk mobile
│
├── js/
│   ├── app.js              # Entry point aplikasi
│   ├── peta.js             # Inisialisasi & kontrol peta Leaflet
│   ├── crud.js             # Operasi CRUD & localStorage
│   ├── pencarian.js        # Pencarian cerdas & geolocation (BARU!)
│   ├── ui.js               # Interaksi UI & animasi
│   └── utilitas.js         # Helper functions
│
├── data/
│   ├── sample.geojson      # Sample GeoJSON dari QGIS
│   └── kategori.json       # Daftar kategori fasilitas
│
├── assets/
│   └── images/             # Folder untuk gambar (kosong, bisa ditambahkan)
│
└── docs/                   # Folder dokumentasi (kosong, bisa ditambahkan)
```

---

## 🎯 Cara Menjalankan

### **Metode 1: Langsung Buka di Browser**

1. Download atau clone project ini
2. Buka file `index.html` di browser modern (Chrome, Firefox, Edge)
3. Aplikasi langsung siap digunakan!

**Catatan:** Tidak perlu install server atau dependency apapun. Semua library dimuat via CDN.

### **Metode 2: Menggunakan Local Server (Opsional)**

Jika ingin menjalankan dengan local server:

```bash
# Menggunakan Python
python -m http.server 8000

# Atau menggunakan Node.js
npx http-server
```

Lalu buka: `http://localhost:8000`

---

## 📘 Panduan Penggunaan

### **1. Menambah Fasilitas Baru**

**Metode 1: Pencarian Cerdas (BARU!)**

1. Ketik nama tempat di "Pencarian Cerdas Lokasi" (misal: "SD Negeri 1 Jepara")
2. Atau klik tombol quick search (SD, RS, Masjid, Bank, Kantor)
3. Pilih dari hasil pencarian yang muncul
4. Data nama, alamat, dan koordinat otomatis terisi
5. Kategori terdeteksi otomatis berdasarkan nama
6. Klik **"Simpan Fasilitas"**

**Metode 2: Geolocation**

1. Klik tombol **"Lokasi Saya"** (icon navigation) di peta
2. Izinkan akses lokasi di browser
3. Koordinat dan alamat otomatis terisi
4. Isi data lainnya dan simpan

**Metode 3: Manual (Klasik)**

1. Klik pada peta untuk memilih lokasi
2. Koordinat akan otomatis terisi di form
3. Isi nama fasilitas, kategori, alamat, dan deskripsi
4. Klik tombol **"Simpan Fasilitas"**
5. Marker akan muncul di peta dan data masuk ke tabel

### **2. Melihat Detail Fasilitas**

- **Dari Peta:** Klik marker → Popup muncul dengan info detail
- **Dari Tabel:** Klik row → Peta otomatis zoom ke lokasi

### **3. Mengedit Fasilitas**

1. Klik tombol **Edit** (icon pensil) di tabel
2. Modal edit muncul dengan data pre-filled
3. Ubah data yang diperlukan
4. Klik **"Update Data"**

### **4. Menghapus Fasilitas**

1. Klik tombol **Hapus** (icon tempat sampah) di tabel
2. Konfirmasi penghapusan
3. Data dan marker akan terhapus

### **5. Filter & Pencarian**

- **Pencarian:** Ketik di kotak search untuk cari berdasarkan nama/kategori
- **Filter Kategori:** Centang/uncentang kategori yang ingin ditampilkan
- **Reset:** Klik tombol "Reset Semua Filter"

### **6. Statistik**

- Lihat tab **"Statistik"**
- Grafik pie chart menampilkan distribusi kategori
- Rincian per kategori ditampilkan di bawah chart

### **7. Export & Import Data**

**Export:**

- **Download JSON:** Untuk backup atau transfer data
- **Download GeoJSON:** Untuk dibuka di QGIS atau software GIS lain

**Import:**

- Klik tombol **"Import JSON"**
- Pilih file JSON yang valid
- Konfirmasi import (akan mengganti semua data)

---

## 🗺️ Integrasi dengan QGIS

### **Cara Membuat GeoJSON di QGIS:**

1. **Buka QGIS Desktop**
2. **Buat Layer Baru:**
   - Menu: Layer → Create Layer → New Shapefile Layer
   - Pilih tipe: Point, Line, atau Polygon
3. **Digitasi Data:**
   - Toggle Editing (icon pensil)
   - Add Feature untuk menambah titik/polygon
   - Isi atribut data
4. **Export ke GeoJSON:**
   - Right-click layer → Export → Save Features As...
   - Format: GeoJSON
   - CRS: EPSG:4326 (WGS 84)
   - Save ke folder `data/sample.geojson`
5. **Refresh aplikasi web** untuk load GeoJSON baru

---

## 🌈 Tema & Warna

Project ini menggunakan **dark theme** dengan color palette modern:

```css
--bg-primary: #0f172a      /* Dark Navy - Background utama */
--bg-secondary: #1e293b    /* Slate Dark - Cards */
--bg-tertiary: #334155     /* Slate - Hover */
--accent-blue: #3b82f6     /* Primary actions */
--accent-green: #10b981    /* Success */
--accent-red: #ef4444      /* Danger */
--text-primary: #f1f5f9    /* Main text */
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut   | Aksi                  |
| ---------- | --------------------- |
| `Ctrl + N` | Tambah Fasilitas Baru |
| `Ctrl + F` | Cari/Filter Data      |
| `Ctrl + S` | Lihat Statistik       |
| `ESC`      | Tutup Modal           |

---

## 📱 Responsive Design

Aplikasi sudah responsive untuk berbagai ukuran layar:

- **Desktop (>1024px):** Layout side-by-side penuh
- **Tablet (768-1024px):** Sidebar lebih ramping
- **Mobile (<768px):** Stack vertical, table simplified

---

## 🧩 Fitur Lanjutan (Ide Pengembangan)

### **Backend Integration:**

- Connect ke database MySQL/PostgreSQL dengan PostGIS
- REST API menggunakan Node.js/Express
- Authentication & authorization

### **Advanced GIS Features:**

- Buffer analysis
- Routing & directions
- Heatmap density
- Nearest facility search

### **Real-time Features:**

- Live GPS tracking
- WebSocket untuk real-time updates
- Crowdsourced data submission

---

## 🐛 Troubleshooting

### **Peta tidak muncul?**

- Pastikan koneksi internet aktif (tile dari OpenStreetMap)
- Buka Console (F12) untuk cek error

### **Data hilang setelah refresh?**

- Data disimpan di localStorage browser
- Jangan clear browsing data/cache
- Gunakan export untuk backup

### **GeoJSON tidak load?**

- Pastikan file ada di `data/sample.geojson`
- Cek format GeoJSON valid (gunakan geojsonlint.com)
- Lihat console untuk error

---

## 📄 Lisensi

Project ini menggunakan lisensi **MIT**. Bebas digunakan untuk keperluan pendidikan dan komersial.

---

## 👨‍💻 Author

**WebGIS Development Team**

- Project untuk tugas kuliah GIS
- Built with ❤️ using modern web technologies

---

## 🙏 Acknowledgments

- **Leaflet.js** - Amazing open-source mapping library
- **OpenStreetMap** - Free map data
- **Chart.js** - Beautiful charts
- **SweetAlert2** - Sweet modals & alerts
- **Lucide Icons** - Clean and modern icons
- **QGIS** - Professional GIS software

---

## 📞 Support

Jika ada pertanyaan atau issue:

1. Buka file `KONSEP_PROJECT.md` untuk dokumentasi lengkap
2. Cek Console Browser (F12) untuk debug
3. Pastikan semua library ter-load dengan baik

---

**Happy Mapping! 🗺️✨**
