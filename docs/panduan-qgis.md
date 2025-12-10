# 📚 Panduan Membuat GeoJSON dengan QGIS

Tutorial lengkap untuk membuat dan mengexport data GeoJSON dari QGIS yang bisa digunakan di aplikasi WebGIS ini.

---

## 📥 Download & Install QGIS

1. **Download QGIS Installer**
   - Kunjungi: https://qgis.org/en/site/forusers/download.html
   - Pilih versi sesuai sistem operasi (Windows, Mac, Linux)
   - Recommended: **QGIS Long Term Release (LTR)**

2. **Install QGIS**
   - Jalankan installer
   - Ikuti wizard instalasi
   - Tunggu sampai selesai

---

## 🗺️ Tutorial 1: Membuat Point Layer (Fasilitas Umum)

### Langkah 1: Buat Project Baru
1. Buka QGIS Desktop
2. Klik **Project → New** (atau `Ctrl+N`)
3. Save project: **File → Save As** → Beri nama `fasilitas_umum.qgz`

### Langkah 2: Tambahkan Basemap (Opsional)
1. Browser panel (kiri) → **XYZ Tiles** → **OpenStreetMap**
2. Drag ke canvas atau double-click
3. Tunggu basemap dimuat

### Langkah 3: Buat Layer Point Baru
1. Klik **Layer → Create Layer → New Shapefile Layer**
2. Isi parameter:
   - **File name**: `fasilitas_sekolah.shp`
   - **Geometry type**: `Point`
   - **CRS**: `EPSG:4326 - WGS 84` (PENTING!)
3. **New Field** → Tambahkan atribut:
   
   | Name | Type | Length |
   |------|------|--------|
   | `nama` | Text | 100 |
   | `kategori` | Text | 50 |
   | `alamat` | Text | 200 |
   | `deskripsi` | Text | 255 |

4. Klik **OK**

### Langkah 4: Digitasi Point
1. Layer baru muncul di panel Layers
2. **Klik kanan layer** → **Toggle Editing** (icon pensil)
3. Klik icon **Add Point Feature** (icon titik)
4. Klik di peta untuk tambah point
5. Isi form atribut yang muncul
6. Ulangi untuk point lainnya

### Langkah 5: Save Edits
1. Klik **Save Layer Edits** (icon disket)
2. **Toggle Editing** lagi untuk stop editing

### Langkah 6: Export ke GeoJSON
1. **Klik kanan layer** → **Export → Save Features As...**
2. Isi parameter:
   - **Format**: `GeoJSON`
   - **File name**: `data\sample.geojson` (di folder project WebGIS)
   - **CRS**: `EPSG:4326 - WGS 84`
   - **Layer Options**:
     - RFC7946: **Yes** (untuk compatibility)
     - COORDINATE_PRECISION: **6**
3. Klik **OK**

### Langkah 7: Test di Aplikasi
1. Copy file `sample.geojson` ke folder `data/` di project WebGIS
2. Refresh browser
3. Layer akan muncul di peta!

---

## 🔷 Tutorial 2: Membuat Polygon Layer (Area/Boundary)

### Langkah 1: Buat Layer Polygon Baru
1. **Layer → Create Layer → New Shapefile Layer**
2. Parameter:
   - **File name**: `wilayah_jakarta.shp`
   - **Geometry type**: `Polygon`
   - **CRS**: `EPSG:4326 - WGS 84`
3. Tambahkan field atribut:
   - `nama` (Text, 100)
   - `kode` (Text, 20)
   - `luas_km2` (Decimal, 10, 2)

### Langkah 2: Digitasi Polygon
1. **Toggle Editing** (icon pensil)
2. Klik **Add Polygon Feature**
3. Klik di peta untuk buat vertex polygon
4. **Klik kanan** untuk selesai menggambar
5. Isi atribut
6. Save edits

### Langkah 3: Export ke GeoJSON
- Sama seperti Tutorial 1 Langkah 6

---

## 📍 Tutorial 3: Cara Mendapatkan Koordinat Akurat

### Metode 1: Dari Google Maps
1. Buka Google Maps
2. Klik kanan di lokasi → **What's here?**
3. Copy koordinat (format: `-6.2088, 106.8456`)
4. Gunakan di QGIS atau langsung di aplikasi WebGIS

### Metode 2: Dari QGIS
1. Di QGIS, pastikan **CRS Project = EPSG:4326**
2. Lihat koordinat di **status bar** (bawah) saat kursor bergerak
3. Klik untuk marking koordinat

### Metode 3: GPS Smartphone
1. Install aplikasi GPS (misal: GPS Status, Maps.me)
2. Catat koordinat di lokasi
3. Input ke QGIS atau WebGIS

---

## 🎨 Tutorial 4: Styling Layer di QGIS (Opsional)

### Kategorisasi Berdasarkan Field
1. **Klik kanan layer** → **Properties** → Tab **Symbology**
2. Dropdown atas → Pilih **Categorized**
3. **Value**: Pilih field `kategori`
4. Klik **Classify**
5. QGIS otomatis buat kategori dengan warna berbeda
6. Klik **OK**

### Custom Warna
1. Double-click warna di kategori
2. Pilih warna custom
3. **OK**

---

## 🔄 Tutorial 5: Import GeoJSON Kembali ke QGIS

### Cara 1: Drag & Drop
1. Drag file `.geojson` dari Explorer
2. Drop ke QGIS canvas
3. Layer otomatis dimuat

### Cara 2: Add Vector Layer
1. **Layer → Add Layer → Add Vector Layer**
2. **Source**: Browse file `.geojson`
3. **Add**

---

## 💡 Tips & Trik

### 1. Validasi Geometri
Sebelum export, validasi geometri:
1. **Vector → Geometry Tools → Check Validity**
2. Fix jika ada error

### 2. Simplify Geometry (Untuk Polygon Besar)
Jika file GeoJSON terlalu besar:
1. **Vector → Geometry Tools → Simplify**
2. Tolerance: `0.0001` (untuk EPSG:4326)

### 3. Reproject CRS
Jika layer CRS bukan 4326:
1. **Klik kanan layer** → **Export → Save Features As...**
2. **CRS**: Pilih `EPSG:4326`

### 4. Merge Multiple Layers
Gabungkan beberapa layer jadi satu:
1. **Vector → Data Management Tools → Merge Vector Layers**
2. Pilih layer yang mau digabung
3. Run

---

## ❌ Troubleshooting

### GeoJSON Tidak Muncul di WebGIS?

**Cek 1: CRS Correct?**
- Harus `EPSG:4326` (WGS 84)
- Cek di layer properties

**Cek 2: File Valid?**
- Buka file `.geojson` di text editor
- Pastikan format JSON valid
- Atau cek di: http://geojsonlint.com/

**Cek 3: Koordinat Benar?**
- Longitude: -180 sampai 180
- Latitude: -90 sampai 90
- Format: `[lng, lat]` (bukan `[lat, lng]`)

**Cek 4: File Location**
- Pastikan file di folder `data/sample.geojson`
- Path harus benar

---

## 📖 Resources Tambahan

### QGIS Documentation
- Official Docs: https://docs.qgis.org/
- Training Manual: https://docs.qgis.org/training_manual/

### GeoJSON Spec
- Official Spec: https://geojson.org/
- RFC 7946: https://tools.ietf.org/html/rfc7946

### Online Tools
- GeoJSON Validator: http://geojsonlint.com/
- GeoJSON.io Editor: http://geojson.io/ (Edit & View)
- MyGeodata Converter: https://mygeodata.cloud/converter/

---

## 🎓 Practice Project

**Tugas Latihan:**
1. Download data shapefile Indonesia (cari di web)
2. Import ke QGIS
3. Filter hanya provinsi tertentu (misal: DKI Jakarta)
4. Export ke GeoJSON
5. Load di WebGIS
6. Tambahkan 10 point fasilitas di area tersebut
7. Export semua data untuk backup

---

**Selamat Belajar! 🚀**

Jika ada pertanyaan, cek dokumentasi resmi QGIS atau forum GIS Indonesia.
