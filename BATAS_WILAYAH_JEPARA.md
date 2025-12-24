# Fitur Batas Wilayah Kabupaten Jepara

## 📍 Deskripsi

Aplikasi WebGIS sekarang dilengkapi dengan batas wilayah administratif Kabupaten Jepara untuk memfokuskan pemetaan fasilitas umum hanya dalam area yang relevan.

## 🗺️ Fitur yang Ditambahkan

### 1. **Polygon Batas Wilayah**

- Menampilkan outline batas Kabupaten Jepara
- Warna biru dengan efek transparan
- Garis putus-putus untuk membedakan dari elemen lain
- Popup informasi wilayah saat diklik

### 2. **Kontrol Peta Baru**

- **🗺️ Zoom ke Wilayah Jepara**: Memfokuskan peta ke batas wilayah
- **⬜ Toggle Batas Wilayah**: Menampilkan/menyembunyikan polygon batas
- **📍 Pusatkan Peta**: Reset ke koordinat pusat Jepara
- **🧭 Lokasi Saya**: GPS untuk mendeteksi lokasi pengguna

### 3. **Validasi Koordinat**

- Hanya menerima koordinat dalam wilayah Jepara
- Peringatan otomatis jika klik di luar area
- Validasi saat menyimpan data fasilitas

### 4. **Bounding Box Pencarian**

- Pencarian lokasi difokuskan ke area Jepara
- Hasil pencarian diprioritaskan untuk wilayah lokal
- Koordinat pencarian:
  - Utara: -6.42°
  - Selatan: -6.78°
  - Barat: 110.46°
  - Timur: 110.82°

## 🎯 Koordinat Referensi Jepara

### Pusat Kabupaten

- **Latitude**: -6.5877°
- **Longitude**: 110.6684°
- **Zoom Default**: 11

### Batas Wilayah

```javascript
const BATAS_JEPARA = [
  [-6.45, 110.55], // Utara-Barat
  [-6.42, 110.75], // Utara-Timur
  [-6.5, 110.82], // Timur-Utara
  [-6.65, 110.8], // Timur-Selatan
  [-6.75, 110.72], // Selatan-Timur
  [-6.78, 110.6], // Selatan-Tengah
  [-6.72, 110.52], // Selatan-Barat
  [-6.6, 110.48], // Barat-Selatan
  [-6.52, 110.46], // Barat-Tengah
  [-6.45, 110.55], // Kembali ke titik awal
];
```

## 🚀 Cara Menggunakan

### Menampilkan Batas Wilayah

1. Batas wilayah otomatis muncul saat peta dimuat
2. Klik tombol **Toggle Batas Wilayah** untuk menyembunyikan/menampilkan
3. Klik pada polygon untuk melihat informasi wilayah

### Zoom ke Wilayah Jepara

1. Klik tombol **Zoom ke Wilayah Jepara** (ikon peta)
2. Peta akan otomatis fokus ke seluruh area Kabupaten Jepara
3. Zoom level disesuaikan untuk menampilkan seluruh wilayah

### Validasi Lokasi

1. Saat klik pada peta, sistem akan validasi koordinat
2. Jika di luar wilayah Jepara, akan muncul peringatan
3. Hanya koordinat dalam wilayah yang dapat disimpan

## 📊 Informasi Wilayah

### Data Administratif

- **Nama**: Kabupaten Jepara
- **Provinsi**: Jawa Tengah
- **Luas**: ± 1.004 km²
- **Ibu Kota**: Jepara
- **Kode Pos**: 59xxx

### Kecamatan di Jepara

1. Jepara
2. Kedung
3. Pecangaan
4. Welahan
5. Mayong
6. Batealit
7. Tahunan
8. Mlonggo
9. Bangsri
10. Keling
11. Karimunjawa
12. Nalumsari
13. Kalinyamatan
14. Kembang
15. Pakis Aji
16. Donorojo

## 🎨 Styling dan Tampilan

### Warna Batas Wilayah

- **Garis**: Biru (#3b82f6)
- **Fill**: Biru transparan (opacity 0.1)
- **Ketebalan**: 3px
- **Style**: Garis putus-putus (10px, 5px)

### Animasi

- Efek pulse pada fill polygon
- Hover effect pada tombol kontrol
- Smooth transition saat zoom

## 🔧 Konfigurasi Teknis

### File yang Dimodifikasi

1. **js/peta.js** - Fungsi batas wilayah dan validasi
2. **js/utilitas.js** - Validasi koordinat Jepara
3. **js/crud.js** - Validasi data fasilitas
4. **js/ui.js** - Event listeners tombol kontrol
5. **index.html** - Tombol kontrol baru
6. **css/style.css** - Styling batas wilayah

### Fungsi Utama

- `tambahBatasWilayahJepara()` - Menambah polygon batas
- `validasiKoordinatJepara()` - Validasi koordinat dalam wilayah
- `toggleBatasWilayah()` - Toggle tampilan batas
- `zoomKeBatasJepara()` - Zoom ke wilayah Jepara

## 📱 Responsivitas

- Batas wilayah responsif di semua ukuran layar
- Tombol kontrol dapat diakses di mobile
- Popup informasi menyesuaikan ukuran layar

## 🔍 Tips Penggunaan

1. **Pencarian Efektif**: Gunakan kata kunci + "jepara" untuk hasil terbaik
2. **Navigasi Cepat**: Gunakan tombol zoom untuk kembali ke area Jepara
3. **Validasi Data**: Pastikan semua fasilitas berada dalam batas wilayah
4. **Visual Guide**: Gunakan batas wilayah sebagai panduan area kerja
