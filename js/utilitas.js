// ============================================
// UTILITAS HELPER FUNCTIONS
// File: utilitas.js
// Deskripsi: Fungsi-fungsi helper umum untuk aplikasi WebGIS
// ============================================

// ============================================
// GENERATE ID UNIK
// ============================================

/**
 * Fungsi untuk membuat ID unik menggunakan timestamp dan random string
 * @returns {string} - ID unik dalam format timestamp-random
 */
function buatIdUnik() {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomStr}`;
}

// ============================================
// FORMAT TANGGAL
// ============================================

/**
 * Fungsi untuk memformat tanggal ke format Indonesia
 * @param {string|Date} tanggal - Tanggal yang akan diformat
 * @returns {string} - Tanggal dalam format "DD/MM/YYYY HH:mm"
 */
function formatTanggal(tanggal) {
  const date = new Date(tanggal);

  const hari = String(date.getDate()).padStart(2, "0");
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  const tahun = date.getFullYear();
  const jam = String(date.getHours()).padStart(2, "0");
  const menit = String(date.getMinutes()).padStart(2, "0");

  return `${hari}/${bulan}/${tahun} ${jam}:${menit}`;
}

/**
 * Fungsi untuk memformat tanggal ke format singkat (tanpa waktu)
 * @param {string|Date} tanggal - Tanggal yang akan diformat
 * @returns {string} - Tanggal dalam format "DD/MM/YYYY"
 */
function formatTanggalSingkat(tanggal) {
  const date = new Date(tanggal);

  const hari = String(date.getDate()).padStart(2, "0");
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  const tahun = date.getFullYear();

  return `${hari}/${bulan}/${tahun}`;
}

// ============================================
// FORMAT KOORDINAT
// ============================================

/**
 * Fungsi untuk memformat koordinat ke string yang rapi
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} desimal - Jumlah digit desimal (default 6)
 * @returns {string} - Koordinat dalam format "lat, lng"
 */
function formatKoordinat(lat, lng, desimal = 6) {
  const latFormat = parseFloat(lat).toFixed(desimal);
  const lngFormat = parseFloat(lng).toFixed(desimal);
  return `${latFormat}, ${lngFormat}`;
}

/**
 * Fungsi untuk validasi koordinat
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} - True jika valid, false jika tidak
 */
function validasiKoordinat(lat, lng) {
  // Validasi latitude: -90 sampai 90
  if (lat < -90 || lat > 90) {
    return false;
  }

  // Validasi longitude: -180 sampai 180
  if (lng < -180 || lng > 180) {
    return false;
  }

  return true;
}

// ============================================
// DEBOUNCE FUNCTION
// ============================================

/**
 * Fungsi debounce untuk menunda eksekusi fungsi
 * Berguna untuk search/filter real-time
 * @param {Function} fungsi - Fungsi yang akan di-debounce
 * @param {number} delay - Delay dalam milliseconds
 * @returns {Function} - Fungsi yang sudah di-debounce
 */
function debounce(fungsi, delay = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fungsi.apply(this, args), delay);
  };
}

// ============================================
// ESCAPE HTML (PREVENT XSS)
// ============================================

/**
 * Fungsi untuk escape HTML characters (mencegah XSS)
 * @param {string} text - Text yang akan di-escape
 * @returns {string} - Text yang sudah aman
 */
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// VALIDASI INPUT
// ============================================

/**
 * Fungsi untuk validasi input tidak kosong
 * @param {string} nilai - Nilai yang akan divalidasi
 * @returns {boolean} - True jika tidak kosong
 */
function tidakKosong(nilai) {
  return nilai !== null && nilai !== undefined && nilai.trim() !== "";
}

/**
 * Fungsi untuk validasi apakah string hanya berisi angka
 * @param {string} nilai - Nilai yang akan divalidasi
 * @returns {boolean} - True jika hanya angka
 */
function adalahAngka(nilai) {
  return !isNaN(nilai) && !isNaN(parseFloat(nilai));
}

// ============================================
// LOCAL STORAGE HELPER
// ============================================

/**
 * Fungsi untuk menyimpan data ke localStorage dengan error handling
 * @param {string} kunci - Key untuk localStorage
 * @param {any} nilai - Nilai yang akan disimpan (akan di-JSON.stringify)
 * @returns {boolean} - True jika berhasil, false jika gagal
 */
function simpanKeLokalStorage(kunci, nilai) {
  try {
    const dataString = JSON.stringify(nilai);
    localStorage.setItem(kunci, dataString);
    return true;
  } catch (error) {
    console.error("Gagal menyimpan ke localStorage:", error);
    return false;
  }
}

/**
 * Fungsi untuk mengambil data dari localStorage dengan error handling
 * @param {string} kunci - Key untuk localStorage
 * @param {any} nilaiDefault - Nilai default jika tidak ada data
 * @returns {any} - Data yang sudah di-parse atau nilai default
 */
function ambilDariLokalStorage(kunci, nilaiDefault = null) {
  try {
    const dataString = localStorage.getItem(kunci);
    if (dataString === null) {
      return nilaiDefault;
    }
    return JSON.parse(dataString);
  } catch (error) {
    console.error("Gagal mengambil dari localStorage:", error);
    return nilaiDefault;
  }
}

/**
 * Fungsi untuk menghapus data dari localStorage
 * @param {string} kunci - Key yang akan dihapus
 */
function hapusDariLokalStorage(kunci) {
  try {
    localStorage.removeItem(kunci);
  } catch (error) {
    console.error("Gagal menghapus dari localStorage:", error);
  }
}

// ============================================
// DOWNLOAD FILE
// ============================================

/**
 * Fungsi untuk download data sebagai file JSON
 * @param {any} data - Data yang akan di-download
 * @param {string} namaFile - Nama file (tanpa ekstensi)
 */
function downloadJSON(data, namaFile) {
  try {
    // Convert data ke JSON string dengan pretty print
    const dataString = JSON.stringify(data, null, 2);

    // Buat blob dari string
    const blob = new Blob([dataString], { type: "application/json" });

    // Buat URL untuk blob
    const url = URL.createObjectURL(blob);

    // Buat element link temporary
    const link = document.createElement("a");
    link.href = url;
    link.download = `${namaFile}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Gagal download file:", error);
    return false;
  }
}

/**
 * Fungsi untuk download data sebagai GeoJSON
 * @param {Array} dataFasilitas - Array data fasilitas
 * @param {string} namaFile - Nama file (tanpa ekstensi)
 */
function downloadGeoJSON(dataFasilitas, namaFile) {
  try {
    // Konversi data fasilitas ke format GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: dataFasilitas.map((fasilitas) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            parseFloat(fasilitas.koordinat.lng),
            parseFloat(fasilitas.koordinat.lat),
          ],
        },
        properties: {
          id: fasilitas.id,
          nama: fasilitas.nama,
          kategori: fasilitas.kategori,
          alamat: fasilitas.alamat || "",
          deskripsi: fasilitas.deskripsi || "",
          waktuDibuat: fasilitas.waktuDibuat,
          waktuDiubah: fasilitas.waktuDiubah || "",
        },
      })),
    };

    // Download sebagai JSON
    return downloadJSON(geojson, namaFile);
  } catch (error) {
    console.error("Gagal membuat GeoJSON:", error);
    return false;
  }
}

// ============================================
// TRUNCATE TEXT
// ============================================

/**
 * Fungsi untuk memotong text yang terlalu panjang
 * @param {string} text - Text yang akan dipotong
 * @param {number} panjangMaks - Panjang maksimal
 * @returns {string} - Text yang sudah dipotong dengan "..."
 */
function potongText(text, panjangMaks = 50) {
  if (!text) return "";
  if (text.length <= panjangMaks) return text;
  return text.substring(0, panjangMaks) + "...";
}

// ============================================
// SCROLL SMOOTH
// ============================================

/**
 * Fungsi untuk scroll smooth ke element tertentu
 * @param {string} selectorElement - Selector CSS dari element tujuan
 */
function scrollKeElement(selectorElement) {
  const element = document.querySelector(selectorElement);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}

// ============================================
// COPY TO CLIPBOARD
// ============================================

/**
 * Fungsi untuk copy text ke clipboard
 * @param {string} text - Text yang akan di-copy
 * @returns {Promise<boolean>} - Promise yang resolve true jika berhasil
 */
async function copyKeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Gagal copy ke clipboard:", error);
    return false;
  }
}

// ============================================
// GET ICON UNTUK KATEGORI
// ============================================

/**
 * Fungsi untuk mendapatkan nama icon Lucide berdasarkan kategori
 * @param {string} kategori - Nama kategori
 * @returns {string} - Nama icon Lucide
 */
function getIconKategori(kategori) {
  const mapping = {
    Sekolah: "school",
    "Rumah Sakit": "hospital",
    "Kantor Pemerintahan": "building-2",
    Masjid: "landmark",
    Taman: "trees",
    Pasar: "shopping-bag",
    Bank: "landmark",
    Universitas: "graduation-cap",
  };

  return mapping[kategori] || "map-pin";
}

/**
 * Fungsi untuk mendapatkan warna berdasarkan kategori
 * @param {string} kategori - Nama kategori
 * @returns {string} - Kode warna hex
 */
function getWarnaKategori(kategori) {
  const mapping = {
    Sekolah: "#3b82f6", // Blue
    "Rumah Sakit": "#ef4444", // Red
    "Kantor Pemerintahan": "#8b5cf6", // Purple
    Masjid: "#10b981", // Green
    Taman: "#22c55e", // Light Green
    Pasar: "#f59e0b", // Orange
    Bank: "#eab308", // Yellow
    Universitas: "#06b6d4", // Cyan
  };

  return mapping[kategori] || "#64748b";
}

// ============================================
// HITUNG JARAK ANTARA DUA KOORDINAT (Haversine Formula)
// ============================================

/**
 * Fungsi untuk menghitung jarak antara dua titik koordinat
 * Menggunakan Haversine Formula
 * @param {number} lat1 - Latitude titik 1
 * @param {number} lng1 - Longitude titik 1
 * @param {number} lat2 - Latitude titik 2
 * @param {number} lng2 - Longitude titik 2
 * @returns {number} - Jarak dalam kilometer
 */
function hitungJarak(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius bumi dalam kilometer

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const jarak = R * c; // Jarak dalam kilometer

  return Math.round(jarak * 100) / 100; // Round ke 2 desimal
}

/**
 * Fungsi untuk format jarak ke string yang readable
 * @param {number} jarakKm - Jarak dalam kilometer
 * @returns {string} - Jarak yang sudah diformat (misal: "1.5 km" atau "500 m")
 */
function formatJarak(jarakKm) {
  if (jarakKm < 1) {
    return `${Math.round(jarakKm * 1000)} m`;
  }
  return `${jarakKm} km`;
}

// ============================================
// CONSOLE LOG DENGAN STYLE (UNTUK DEBUGGING)
// ============================================

/**
 * Fungsi untuk console log dengan warna (debugging)
 * @param {string} pesan - Pesan yang akan di-log
 * @param {string} tipe - Tipe log: 'info', 'success', 'warning', 'error'
 */
function logConsole(pesan, tipe = "info") {
  const styles = {
    info: "background: #3b82f6; color: white; padding: 2px 6px; border-radius: 3px;",
    success:
      "background: #10b981; color: white; padding: 2px 6px; border-radius: 3px;",
    warning:
      "background: #f59e0b; color: white; padding: 2px 6px; border-radius: 3px;",
    error:
      "background: #ef4444; color: white; padding: 2px 6px; border-radius: 3px;",
  };

  console.log(`%c${pesan}`, styles[tipe] || styles.info);
}
// ============================================
// COPY KOORDINAT FASILITAS
// ============================================

/**
 * Fungsi untuk copy koordinat fasilitas dari popup
 * @param {string} lat - Latitude
 * @param {string} lng - Longitude
 */
async function copyKoordinatFasilitas(lat, lng) {
  const koordinat = `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(
    6
  )}`;

  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(koordinat);
      tampilkanNotifikasi("success", `Koordinat berhasil dicopy: ${koordinat}`);
    } else {
      // Fallback untuk browser lama
      const textArea = document.createElement("textarea");
      textArea.value = koordinat;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const berhasil = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (berhasil) {
        tampilkanNotifikasi(
          "success",
          `Koordinat berhasil dicopy: ${koordinat}`
        );
      } else {
        tampilkanNotifikasi(
          "error",
          "Gagal copy koordinat. Silakan copy manual."
        );
      }
    }
  } catch (error) {
    console.error("Error copy koordinat:", error);
    tampilkanNotifikasi("error", "Gagal copy koordinat. Silakan copy manual.");
  }

  logConsole(`Koordinat dicopy: ${koordinat}`, "info");
}
