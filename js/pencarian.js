// ============================================
// MODUL PENCARIAN CERDAS LOKASI
// File: pencarian.js
// Deskripsi: Mengelola pencarian lokasi otomatis menggunakan Nominatim API
// ============================================

// ============================================
// VARIABEL GLOBAL PENCARIAN
// ============================================

let sedangMencari = false;
let timeoutPencarian = null;

// Base URL untuk Nominatim API (OpenStreetMap)
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";

// Bounding box untuk area Jepara (diperluas untuk hasil lebih baik)
const JEPARA_BBOX = {
  south: -6.9,
  west: 110.3,
  north: -6.2,
  east: 111.1,
};

// ============================================
// INISIALISASI PENCARIAN CERDAS
// ============================================

/**
 * Fungsi untuk setup event listeners pencarian cerdas
 * Dipanggil dari setupEventListeners() di ui.js
 */
function setupPencarianCerdas() {
  const inputPencarian = document.getElementById("inputPencarian");
  const btnCariLokasi = document.getElementById("btnCariLokasi");
  const quickSearchButtons = document.querySelectorAll(".quick-search-btn");

  // Event listener untuk input pencarian dengan debounce
  if (inputPencarian) {
    inputPencarian.addEventListener(
      "input",
      debounce((e) => {
        const query = e.target.value.trim();
        if (query.length >= 3) {
          cariLokasi(query);
        } else {
          sembunyikanHasilPencarian();
        }
      }, 500)
    );

    // Event listener untuk Enter key
    inputPencarian.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = e.target.value.trim();
        if (query.length >= 3) {
          cariLokasi(query);
        }
      }
    });
  }

  // Event listener untuk tombol cari
  if (btnCariLokasi) {
    btnCariLokasi.addEventListener("click", () => {
      const query = inputPencarian.value.trim();
      if (query.length >= 3) {
        cariLokasi(query);
      } else {
        tampilkanNotifikasi(
          "warning",
          "Masukkan minimal 3 karakter untuk pencarian"
        );
      }
    });
  }

  // Event listener untuk quick search buttons
  quickSearchButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const query = btn.getAttribute("data-query");
      inputPencarian.value = query;
      cariLokasi(query);
    });
  });

  // Event listener untuk tombol GPS di form
  const btnLokasiSayaForm = document.getElementById("btnLokasiSayaForm");
  if (btnLokasiSayaForm) {
    btnLokasiSayaForm.addEventListener("click", dapatkanLokasiSayaForm);
  }

  logConsole("Pencarian cerdas berhasil diinisialisasi", "success");
}

// ============================================
// FUNGSI PENCARIAN UTAMA
// ============================================

/**
 * Fungsi utama untuk mencari lokasi menggunakan Nominatim API
 * @param {string} query - Query pencarian
 */
async function cariLokasi(query) {
  if (sedangMencari) {
    return;
  }

  sedangMencari = true;
  tampilkanLoadingPencarian();

  try {
    logConsole(`Mencari lokasi: ${query}`, "info");

    // Coba beberapa variasi pencarian
    let queries = [
      query + " jepara", // Query asli + jepara
      query + " kabupaten jepara", // + kabupaten jepara
      query + " jawa tengah", // + jawa tengah
      query, // Query asli saja
    ];

    // Tambahan query khusus untuk sekolah
    if (
      query.toLowerCase().includes("sekolah") ||
      query.toLowerCase().includes("sd")
    ) {
      queries = [
        query + " jepara",
        "sekolah dasar jepara",
        "sd negeri jepara",
        "sd swasta jepara",
        "elementary school jepara",
        query + " kabupaten jepara",
        query,
      ];
    }

    // Tambahan query khusus untuk rumah sakit
    if (
      query.toLowerCase().includes("rumah sakit") ||
      query.toLowerCase().includes("rs")
    ) {
      queries = [
        query + " jepara",
        "rumah sakit jepara",
        "rs jepara",
        "hospital jepara",
        "klinik jepara",
        query + " kabupaten jepara",
        query,
      ];
    }

    let allResults = [];

    // Coba setiap variasi query
    for (const searchQuery of queries) {
      const params = new URLSearchParams({
        q: searchQuery,
        format: "json",
        limit: 15,
        countrycodes: "id",
        viewbox: `${JEPARA_BBOX.west},${JEPARA_BBOX.south},${JEPARA_BBOX.east},${JEPARA_BBOX.north}`,
        bounded: 0, // Tidak batasi ketat, biar lebih fleksibel
        addressdetails: 1,
        extratags: 1,
        namedetails: 1,
      });

      const url = `${NOMINATIM_BASE_URL}?${params.toString()}`;

      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "WebGIS-Jepara/1.0 (Educational Purpose)",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            allResults = allResults.concat(data);
            logConsole(
              `Ditemukan ${data.length} hasil untuk "${searchQuery}"`,
              "info"
            );
          }
        }
      } catch (err) {
        console.warn(`Gagal mencari dengan query: ${searchQuery}`, err);
      }

      // Jika sudah dapat hasil yang cukup, stop
      if (allResults.length >= 10) {
        break;
      }
    }

    // Hapus duplikat berdasarkan koordinat
    const uniqueResults = removeDuplicateResults(allResults);

    // Proses dan tampilkan hasil
    prosesHasilPencarian(uniqueResults, query);
  } catch (error) {
    console.error("Error pencarian lokasi:", error);
    tampilkanErrorPencarian("Gagal mencari lokasi. Periksa koneksi internet.");
  } finally {
    sedangMencari = false;
  }
}

// ============================================
// PROSES HASIL PENCARIAN
// ============================================

/**
 * Fungsi untuk memproses dan menampilkan hasil pencarian
 * @param {Array} data - Data hasil dari Nominatim API
 * @param {string} query - Query pencarian original
 */
function prosesHasilPencarian(data, query) {
  const hasilContainer = document.getElementById("hasilPencarian");

  if (!hasilContainer) return;

  // Jika tidak ada hasil dari API, coba gunakan fallback data
  if (!data || data.length === 0) {
    const fallbackData = getFallbackData(query);
    if (fallbackData.length > 0) {
      logConsole(
        `Menggunakan ${fallbackData.length} data fallback untuk "${query}"`,
        "info"
      );
      data = fallbackData;
    } else {
      tampilkanTidakAdaHasil(query);
      return;
    }
  }

  // Filter dan sort hasil berdasarkan relevansi
  const hasilTerfilter = filterDanSortHasil(data, query);

  // Build HTML untuk hasil
  let htmlHasil = "";

  hasilTerfilter.forEach((item, index) => {
    const icon = getIconUntukTipe(item.type, item.class);
    const nama = item.display_name.split(",")[0]; // Ambil nama utama
    const alamat = item.display_name;
    const jarak = hitungJarakDariPusat(
      parseFloat(item.lat),
      parseFloat(item.lon)
    );

    htmlHasil += `
      <div class="search-result-item" onclick="pilihHasilPencarian(${index}, '${
      item.lat
    }', '${item.lon}', '${escapeHTML(nama)}', '${escapeHTML(alamat)}')">
        <i data-lucide="${icon}" class="search-result-icon"></i>
        <div class="search-result-content">
          <div class="search-result-name">${escapeHTML(nama)}</div>
          <div class="search-result-address">${escapeHTML(alamat)}</div>
          <div class="search-result-distance">${formatJarak(jarak)}</div>
        </div>
      </div>
    `;
  });

  hasilContainer.innerHTML = htmlHasil;
  hasilContainer.classList.add("active");

  // Update Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  logConsole(
    `Ditemukan ${hasilTerfilter.length} hasil untuk "${query}"`,
    "success"
  );
}

// ============================================
// FILTER DAN SORT HASIL
// ============================================

/**
 * Fungsi untuk filter dan sort hasil pencarian berdasarkan relevansi
 * @param {Array} data - Data mentah dari API
 * @param {string} query - Query pencarian
 * @returns {Array} - Data yang sudah difilter dan disort
 */
function filterDanSortHasil(data, query) {
  const queryLower = query.toLowerCase();

  return data
    .map((item) => {
      // Hitung skor relevansi
      const nama = item.display_name.toLowerCase();
      let skor = 0;

      // Skor berdasarkan kecocokan nama
      if (nama.includes(queryLower)) {
        skor += 10;
      }

      // Skor berdasarkan kata kunci query
      const queryWords = queryLower.split(" ");
      queryWords.forEach((word) => {
        if (nama.includes(word)) {
          skor += 3;
        }
      });

      // Skor berdasarkan tipe lokasi
      if (item.type === "school" || item.class === "amenity") {
        skor += 5;
      }

      // Skor berdasarkan jarak dari pusat Jepara
      const jarak = hitungJarakDariPusat(
        parseFloat(item.lat),
        parseFloat(item.lon)
      );

      // Prioritas tinggi untuk area Jepara (dalam 50km)
      if (jarak <= 50) {
        skor += 15;
      } else if (jarak <= 100) {
        skor += 5;
      }

      // Skor berdasarkan kedekatan
      skor += Math.max(0, 20 - jarak); // Semakin dekat semakin tinggi skor

      // Bonus jika mengandung kata "jepara"
      if (nama.includes("jepara")) {
        skor += 20;
      }

      // Bonus untuk kategori yang sering dicari
      const kategoriBonus = [
        "school",
        "hospital",
        "clinic",
        "bank",
        "mosque",
        "university",
      ];
      if (
        kategoriBonus.includes(item.type) ||
        kategoriBonus.includes(item.class)
      ) {
        skor += 8;
      }

      // Bonus khusus untuk sekolah jika query mengandung kata sekolah/sd
      if (
        (queryLower.includes("sekolah") || queryLower.includes("sd")) &&
        (item.type === "school" ||
          nama.includes("sekolah") ||
          nama.includes("sd"))
      ) {
        skor += 25;
      }

      // Bonus khusus untuk rumah sakit jika query mengandung kata rs/rumah sakit
      if (
        (queryLower.includes("rumah sakit") || queryLower.includes("rs")) &&
        (item.type === "hospital" ||
          nama.includes("rumah sakit") ||
          nama.includes("rs"))
      ) {
        skor += 25;
      }

      return { ...item, skor, jarak };
    })
    .filter((item) => item.skor > 0) // Hanya ambil yang ada skor
    .sort((a, b) => b.skor - a.skor) // Sort berdasarkan skor tertinggi
    .slice(0, 12); // Ambil maksimal 12 hasil teratas
}

// ============================================
// PILIH HASIL PENCARIAN
// ============================================

/**
 * Fungsi yang dipanggil saat user memilih salah satu hasil pencarian
 * @param {number} index - Index hasil yang dipilih
 * @param {string} lat - Latitude
 * @param {string} lon - Longitude
 * @param {string} nama - Nama lokasi
 * @param {string} alamat - Alamat lengkap
 */
function pilihHasilPencarian(index, lat, lon, nama, alamat) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  // Deteksi kategori otomatis berdasarkan nama
  const kategori = deteksiKategoriOtomatisReturn(nama, alamat);

  // Isi hidden inputs
  const inputNama = document.getElementById("inputNama");
  const inputKategori = document.getElementById("inputKategori");
  const inputAlamat = document.getElementById("inputAlamat");
  const inputLat = document.getElementById("inputLat");
  const inputLng = document.getElementById("inputLng");

  if (inputNama) inputNama.value = nama;
  if (inputKategori) inputKategori.value = kategori || "";
  if (inputAlamat) inputAlamat.value = alamat;
  if (inputLat) inputLat.value = latitude.toFixed(6);
  if (inputLng) inputLng.value = longitude.toFixed(6);

  // Tampilkan preview data
  tampilkanPreviewData(
    nama,
    kategori || "Tidak terdeteksi",
    alamat,
    latitude,
    longitude
  );

  // Tambahkan marker sementara di peta
  tambahMarkerSementara(latitude, longitude);

  // Pan peta ke lokasi
  if (peta) {
    peta.flyTo([latitude, longitude], 16, {
      duration: 1.5,
      easeLinearity: 0.5,
    });
  }

  // Sembunyikan hasil pencarian
  sembunyikanHasilPencarian();

  // Clear input pencarian
  const inputPencarian = document.getElementById("inputPencarian");
  if (inputPencarian) {
    inputPencarian.value = "";
  }

  // Aktifkan tombol simpan
  const btnSimpan = document.getElementById("btnSimpan");
  if (btnSimpan) {
    btnSimpan.disabled = false;
  }

  tampilkanNotifikasi("success", `Lokasi "${nama}" berhasil dipilih!`);

  logConsole(
    `Lokasi dipilih: ${nama} (${formatKoordinat(latitude, longitude)})`,
    "success"
  );
}

// ============================================
// DETEKSI KATEGORI OTOMATIS
// ============================================

/**
 * Fungsi untuk mendeteksi kategori fasilitas berdasarkan nama
 * @param {string} nama - Nama lokasi
 * @param {string} alamat - Alamat lokasi
 */
function deteksiKategoriOtomatis(nama, alamat) {
  const inputKategori = document.getElementById("inputKategori");

  if (!inputKategori || inputKategori.value) {
    return; // Jika sudah ada kategori yang dipilih, skip
  }

  const namaLower = nama.toLowerCase();
  const alamatLower = alamat.toLowerCase();
  const gabungan = `${namaLower} ${alamatLower}`;

  // Pola deteksi kategori
  const pola = {
    Sekolah: [
      "sekolah",
      "sd",
      "smp",
      "sma",
      "smk",
      "mi",
      "mts",
      "ma",
      "pondok pesantren",
      "tk",
      "paud",
      "madrasah",
      "school",
      "elementary",
      "junior",
      "senior",
    ],
    "Rumah Sakit": [
      "rumah sakit",
      "rs",
      "hospital",
      "klinik",
      "puskesmas",
      "pustu",
      "posyandu",
      "praktek dokter",
      "medical",
      "kesehatan",
      "clinic",
    ],
    Masjid: [
      "masjid",
      "musholla",
      "surau",
      "langgar",
      "mosque",
      "islamic",
      "al-",
    ],
    Bank: [
      "bank",
      "atm",
      "bri",
      "bni",
      "bca",
      "mandiri",
      "btn",
      "bsi",
      "muamalat",
      "koperasi",
      "credit union",
    ],
    "Kantor Pemerintahan": [
      "kantor",
      "dinas",
      "kelurahan",
      "kecamatan",
      "balai desa",
      "pemkab",
      "pemkot",
      "polsek",
      "koramil",
      "government",
      "office",
      "bupati",
      "walikota",
    ],
    Pasar: [
      "pasar",
      "market",
      "toko",
      "warung",
      "minimarket",
      "supermarket",
      "mall",
      "plaza",
      "shopping",
      "perdagangan",
    ],
    Taman: [
      "taman",
      "park",
      "kebun",
      "hutan",
      "wisata",
      "pantai",
      "alun-alun",
      "lapangan",
      "stadion",
      "gelanggang",
    ],
    Universitas: [
      "universitas",
      "institut",
      "sekolah tinggi",
      "akademi",
      "politeknik",
      "university",
      "college",
      "kampus",
    ],
  };

  // Cari kategori yang cocok
  for (const [kategori, keywords] of Object.entries(pola)) {
    for (const keyword of keywords) {
      if (gabungan.includes(keyword)) {
        inputKategori.value = kategori;
        tampilkanNotifikasi(
          "info",
          `Kategori "${kategori}" terdeteksi otomatis`
        );
        return;
      }
    }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Fungsi untuk mendapatkan icon berdasarkan tipe lokasi dari Nominatim
 * @param {string} type - Tipe dari Nominatim
 * @param {string} class_ - Class dari Nominatim
 * @returns {string} - Nama icon Lucide
 */
function getIconUntukTipe(type, class_) {
  const mapping = {
    school: "school",
    hospital: "hospital",
    clinic: "hospital",
    pharmacy: "plus-square",
    bank: "landmark",
    atm: "credit-card",
    place_of_worship: "landmark",
    mosque: "landmark",
    government: "building-2",
    office: "building-2",
    marketplace: "shopping-bag",
    shop: "shopping-bag",
    park: "trees",
    university: "graduation-cap",
    college: "graduation-cap",
  };

  return mapping[type] || mapping[class_] || "map-pin";
}

/**
 * Fungsi untuk menghitung jarak dari pusat Jepara
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {number} - Jarak dalam kilometer
 */
function hitungJarakDariPusat(lat, lon) {
  const pusatJepara = {
    lat: -6.5877,
    lng: 110.6684,
  };

  return hitungJarak(pusatJepara.lat, pusatJepara.lng, lat, lon);
}

/**
 * Fungsi untuk menampilkan loading saat pencarian
 */
function tampilkanLoadingPencarian() {
  const hasilContainer = document.getElementById("hasilPencarian");

  if (hasilContainer) {
    hasilContainer.innerHTML = `
      <div class="search-loading">
        <div class="spinner"></div>
        <span>Mencari lokasi...</span>
      </div>
    `;
    hasilContainer.classList.add("active");
  }

  // Disable tombol cari
  const btnCari = document.getElementById("btnCariLokasi");
  if (btnCari) {
    btnCari.disabled = true;
  }
}

/**
 * Fungsi untuk menampilkan pesan tidak ada hasil
 * @param {string} query - Query pencarian
 */
function tampilkanTidakAdaHasil(query) {
  const hasilContainer = document.getElementById("hasilPencarian");

  if (hasilContainer) {
    hasilContainer.innerHTML = `
      <div class="search-no-results">
        <i data-lucide="search-x"></i>
        <p>Tidak ditemukan hasil untuk "${escapeHTML(query)}"</p>
        <small>Coba gunakan kata kunci yang berbeda</small>
      </div>
    `;
    hasilContainer.classList.add("active");

    // Update icons
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  // Enable kembali tombol cari
  const btnCari = document.getElementById("btnCariLokasi");
  if (btnCari) {
    btnCari.disabled = false;
  }
}

/**
 * Fungsi untuk menampilkan error pencarian
 * @param {string} pesan - Pesan error
 */
function tampilkanErrorPencarian(pesan) {
  const hasilContainer = document.getElementById("hasilPencarian");

  if (hasilContainer) {
    hasilContainer.innerHTML = `
      <div class="search-no-results">
        <i data-lucide="wifi-off"></i>
        <p>${escapeHTML(pesan)}</p>
        <small>Silakan coba lagi</small>
      </div>
    `;
    hasilContainer.classList.add("active");

    // Update icons
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  // Enable kembali tombol cari
  const btnCari = document.getElementById("btnCariLokasi");
  if (btnCari) {
    btnCari.disabled = false;
  }
}

/**
 * Fungsi untuk menyembunyikan hasil pencarian
 */
function sembunyikanHasilPencarian() {
  const hasilContainer = document.getElementById("hasilPencarian");

  if (hasilContainer) {
    hasilContainer.classList.remove("active");
  }

  // Enable kembali tombol cari
  const btnCari = document.getElementById("btnCariLokasi");
  if (btnCari) {
    btnCari.disabled = false;
  }
}

// ============================================
// EVENT LISTENER GLOBAL
// ============================================

// Sembunyikan hasil pencarian saat klik di luar
document.addEventListener("click", (e) => {
  const hasilContainer = document.getElementById("hasilPencarian");
  const inputPencarian = document.getElementById("inputPencarian");
  const btnCari = document.getElementById("btnCariLokasi");

  if (
    hasilContainer &&
    !hasilContainer.contains(e.target) &&
    e.target !== inputPencarian &&
    e.target !== btnCari
  ) {
    sembunyikanHasilPencarian();
  }
});

// ============================================
// GEOLOCATION - LOKASI PENGGUNA
// ============================================

/**
 * Fungsi untuk mendapatkan lokasi pengguna saat ini
 */
function dapatkanLokasiSaya() {
  if (!navigator.geolocation) {
    tampilkanNotifikasi("error", "Geolocation tidak didukung oleh browser ini");
    return;
  }

  tampilkanNotifikasi("info", "Mencari lokasi Anda...");

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000, // Cache selama 1 menit
  };

  navigator.geolocation.getCurrentPosition(
    berhasilDapatkanLokasi,
    gagalDapatkanLokasi,
    options
  );
}

/**
 * Callback saat berhasil mendapatkan lokasi
 * @param {Position} position - Posisi dari geolocation API
 */
function berhasilDapatkanLokasi(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const akurasi = position.coords.accuracy;

  logConsole(
    `Lokasi ditemukan: ${formatKoordinat(lat, lng)} (akurasi: ${Math.round(
      akurasi
    )}m)`,
    "success"
  );

  // Isi form dengan koordinat
  const inputLat = document.getElementById("inputLat");
  const inputLng = document.getElementById("inputLng");

  if (inputLat && inputLng) {
    inputLat.value = lat.toFixed(6);
    inputLng.value = lng.toFixed(6);
  }

  // Tambahkan marker sementara
  tambahMarkerSementara(lat, lng);

  // Pan peta ke lokasi
  if (peta) {
    peta.flyTo([lat, lng], 16, {
      duration: 1.5,
      easeLinearity: 0.5,
    });
  }

  // Cari alamat berdasarkan koordinat (reverse geocoding)
  cariAlamatDariKoordinat(lat, lng);

  tampilkanNotifikasi(
    "success",
    `Lokasi Anda ditemukan! (akurasi: ${Math.round(akurasi)}m)`
  );
}

/**
 * Callback saat gagal mendapatkan lokasi
 * @param {PositionError} error - Error dari geolocation API
 */
function gagalDapatkanLokasi(error) {
  let pesan = "Gagal mendapatkan lokasi";

  switch (error.code) {
    case error.PERMISSION_DENIED:
      pesan = "Akses lokasi ditolak. Mohon izinkan akses lokasi di browser.";
      break;
    case error.POSITION_UNAVAILABLE:
      pesan = "Informasi lokasi tidak tersedia.";
      break;
    case error.TIMEOUT:
      pesan = "Timeout saat mencari lokasi. Silakan coba lagi.";
      break;
  }

  console.error("Geolocation error:", error);
  tampilkanNotifikasi("error", pesan);
}

/**
 * Fungsi untuk reverse geocoding (koordinat ke alamat)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
async function cariAlamatDariKoordinat(lat, lng) {
  try {
    const params = new URLSearchParams({
      lat: lat,
      lon: lng,
      format: "json",
      addressdetails: 1,
      zoom: 18,
    });

    const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "WebGIS-Jepara/1.0 (Educational Purpose)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.display_name) {
      // Isi field alamat
      const inputAlamat = document.getElementById("inputAlamat");
      if (inputAlamat && !inputAlamat.value.trim()) {
        inputAlamat.value = data.display_name;
      }

      logConsole(`Alamat ditemukan: ${data.display_name}`, "success");
    }
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    // Tidak perlu notifikasi error untuk reverse geocoding
  }
}
// ============================================
// FUNGSI UNTUK FORM YANG DISEDERHANAKAN
// ============================================

/**
 * Fungsi untuk menampilkan preview data yang dipilih
 * @param {string} nama - Nama fasilitas
 * @param {string} kategori - Kategori fasilitas
 * @param {string} alamat - Alamat fasilitas
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
function tampilkanPreviewData(nama, kategori, alamat, lat, lng) {
  const dataPreview = document.getElementById("dataPreview");
  const previewNama = document.getElementById("previewNama");
  const previewKategori = document.getElementById("previewKategori");
  const previewAlamat = document.getElementById("previewAlamat");
  const previewKoordinat = document.getElementById("previewKoordinat");

  if (dataPreview) {
    dataPreview.style.display = "block";
  }

  if (previewNama) {
    previewNama.textContent = nama;
  }

  if (previewKategori) {
    previewKategori.textContent = kategori;
    previewKategori.style.color =
      kategori === "Tidak terdeteksi" ? "#f59e0b" : "#10b981";
  }

  if (previewAlamat) {
    previewAlamat.textContent = alamat;
  }

  if (previewKoordinat) {
    previewKoordinat.textContent = formatKoordinat(lat, lng, 6);
  }

  // Scroll ke preview
  setTimeout(() => {
    dataPreview.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 300);
}

/**
 * Fungsi untuk deteksi kategori yang mengembalikan nilai
 * @param {string} nama - Nama lokasi
 * @param {string} alamat - Alamat lokasi
 * @returns {string|null} - Kategori yang terdeteksi atau null
 */
function deteksiKategoriOtomatisReturn(nama, alamat) {
  const namaLower = nama.toLowerCase();
  const alamatLower = alamat.toLowerCase();
  const gabungan = `${namaLower} ${alamatLower}`;

  // Pola deteksi kategori
  const pola = {
    Sekolah: [
      "sekolah",
      "sd",
      "smp",
      "sma",
      "smk",
      "mi",
      "mts",
      "ma",
      "pondok pesantren",
      "tk",
      "paud",
      "madrasah",
      "school",
      "elementary",
      "junior",
      "senior",
    ],
    "Rumah Sakit": [
      "rumah sakit",
      "rs",
      "hospital",
      "klinik",
      "puskesmas",
      "pustu",
      "posyandu",
      "praktek dokter",
      "medical",
      "kesehatan",
      "clinic",
    ],
    Masjid: [
      "masjid",
      "musholla",
      "surau",
      "langgar",
      "mosque",
      "islamic",
      "al-",
    ],
    Bank: [
      "bank",
      "atm",
      "bri",
      "bni",
      "bca",
      "mandiri",
      "btn",
      "bsi",
      "muamalat",
      "koperasi",
      "credit union",
    ],
    "Kantor Pemerintahan": [
      "kantor",
      "dinas",
      "kelurahan",
      "kecamatan",
      "balai desa",
      "pemkab",
      "pemkot",
      "polsek",
      "koramil",
      "government",
      "office",
      "bupati",
      "walikota",
    ],
    Pasar: [
      "pasar",
      "market",
      "toko",
      "warung",
      "minimarket",
      "supermarket",
      "mall",
      "plaza",
      "shopping",
      "perdagangan",
    ],
    Taman: [
      "taman",
      "park",
      "kebun",
      "hutan",
      "wisata",
      "pantai",
      "alun-alun",
      "lapangan",
      "stadion",
      "gelanggang",
    ],
    Universitas: [
      "universitas",
      "institut",
      "sekolah tinggi",
      "akademi",
      "politeknik",
      "university",
      "college",
      "kampus",
    ],
  };

  // Cari kategori yang cocok
  for (const [kategori, keywords] of Object.entries(pola)) {
    for (const keyword of keywords) {
      if (gabungan.includes(keyword)) {
        return kategori;
      }
    }
  }

  return null; // Tidak terdeteksi
}
/**
 * Fungsi GPS khusus untuk form yang disederhanakan
 */
function dapatkanLokasiSayaForm() {
  if (!navigator.geolocation) {
    tampilkanNotifikasi("error", "Geolocation tidak didukung oleh browser ini");
    return;
  }

  tampilkanNotifikasi("info", "Mencari lokasi Anda...");

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
  };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const akurasi = position.coords.accuracy;

      // Isi hidden inputs
      const inputNama = document.getElementById("inputNama");
      const inputKategori = document.getElementById("inputKategori");
      const inputAlamat = document.getElementById("inputAlamat");
      const inputLat = document.getElementById("inputLat");
      const inputLng = document.getElementById("inputLng");

      if (inputNama) inputNama.value = "Lokasi Saya";
      if (inputKategori) inputKategori.value = "";
      if (inputAlamat) inputAlamat.value = "Lokasi GPS";
      if (inputLat) inputLat.value = lat.toFixed(6);
      if (inputLng) inputLng.value = lng.toFixed(6);

      // Tampilkan preview
      tampilkanPreviewData(
        "Lokasi Saya",
        "Tidak terdeteksi",
        "Lokasi GPS",
        lat,
        lng
      );

      // Tambahkan marker sementara
      tambahMarkerSementara(lat, lng);

      // Pan peta ke lokasi
      if (peta) {
        peta.flyTo([lat, lng], 16, {
          duration: 1.5,
          easeLinearity: 0.5,
        });
      }

      // Aktifkan tombol simpan
      const btnSimpan = document.getElementById("btnSimpan");
      if (btnSimpan) {
        btnSimpan.disabled = false;
      }

      // Cari alamat berdasarkan koordinat
      cariAlamatDariKoordinat(lat, lng);

      tampilkanNotifikasi(
        "success",
        `Lokasi GPS ditemukan! (akurasi: ${Math.round(akurasi)}m)`
      );
    },
    (error) => {
      let pesan = "Gagal mendapatkan lokasi";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          pesan =
            "Akses lokasi ditolak. Mohon izinkan akses lokasi di browser.";
          break;
        case error.POSITION_UNAVAILABLE:
          pesan = "Informasi lokasi tidak tersedia.";
          break;
        case error.TIMEOUT:
          pesan = "Timeout saat mencari lokasi. Silakan coba lagi.";
          break;
      }
      tampilkanNotifikasi("error", pesan);
    },
    options
  );
}

/**
 * Fungsi untuk reset form yang disederhanakan
 */
function resetFormCerdas() {
  // Reset hidden inputs
  const inputs = [
    "inputNama",
    "inputKategori",
    "inputAlamat",
    "inputLat",
    "inputLng",
    "inputDeskripsi",
  ];
  inputs.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = "";
    }
  });

  // Reset input pencarian
  const inputPencarian = document.getElementById("inputPencarian");
  if (inputPencarian) {
    inputPencarian.value = "";
  }

  // Sembunyikan preview
  const dataPreview = document.getElementById("dataPreview");
  if (dataPreview) {
    dataPreview.style.display = "none";
  }

  // Disable tombol simpan
  const btnSimpan = document.getElementById("btnSimpan");
  if (btnSimpan) {
    btnSimpan.disabled = true;
  }

  // Hapus marker sementara
  hapusMarkerSementara();

  // Sembunyikan hasil pencarian
  sembunyikanHasilPencarian();

  tampilkanNotifikasi("info", "Form telah direset");
}
/**
 * Fungsi untuk menghapus duplikat hasil berdasarkan koordinat
 * @param {Array} results - Array hasil pencarian
 * @returns {Array} - Array hasil tanpa duplikat
 */
function removeDuplicateResults(results) {
  const seen = new Set();
  return results.filter((item) => {
    const lat = parseFloat(item.lat).toFixed(4);
    const lon = parseFloat(item.lon).toFixed(4);
    const key = `${lat},${lon}`;

    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
// ============================================
// DATA FALLBACK LOKAL JEPARA
// ============================================

/**
 * Data fallback untuk fasilitas umum di Jepara
 * Digunakan jika API tidak memberikan hasil
 */
const FALLBACK_DATA_JEPARA = {
  sekolah: [
    {
      lat: -6.5877,
      lon: 110.6684,
      display_name: "SD Negeri 1 Jepara, Jepara, Jawa Tengah, Indonesia",
      type: "school",
      class: "amenity",
    },
    {
      lat: -6.59,
      lon: 110.67,
      display_name: "SD Negeri 2 Jepara, Jepara, Jawa Tengah, Indonesia",
      type: "school",
      class: "amenity",
    },
    {
      lat: -6.585,
      lon: 110.665,
      display_name: "SMP Negeri 1 Jepara, Jepara, Jawa Tengah, Indonesia",
      type: "school",
      class: "amenity",
    },
    {
      lat: -6.592,
      lon: 110.672,
      display_name: "SMA Negeri 1 Jepara, Jepara, Jawa Tengah, Indonesia",
      type: "school",
      class: "amenity",
    },
  ],
  rumahSakit: [
    {
      lat: -6.5877,
      lon: 110.6684,
      display_name: "RSUD RA Kartini Jepara, Jepara, Jawa Tengah, Indonesia",
      type: "hospital",
      class: "amenity",
    },
    {
      lat: -6.59,
      lon: 110.67,
      display_name: "RS Islam Jepara, Jepara, Jawa Tengah, Indonesia",
      type: "hospital",
      class: "amenity",
    },
  ],
  masjid: [
    {
      lat: -6.5877,
      lon: 110.6684,
      display_name: "Masjid Agung Jepara, Jepara, Jawa Tengah, Indonesia",
      type: "place_of_worship",
      class: "amenity",
    },
  ],
  bank: [
    {
      lat: -6.5877,
      lon: 110.6684,
      display_name: "Bank BRI Jepara, Jepara, Jawa Tengah, Indonesia",
      type: "bank",
      class: "amenity",
    },
  ],
};

/**
 * Fungsi untuk mendapatkan data fallback berdasarkan query
 * @param {string} query - Query pencarian
 * @returns {Array} - Array data fallback
 */
function getFallbackData(query) {
  const queryLower = query.toLowerCase();
  let fallbackResults = [];

  if (
    queryLower.includes("sekolah") ||
    queryLower.includes("sd") ||
    queryLower.includes("smp") ||
    queryLower.includes("sma")
  ) {
    fallbackResults = fallbackResults.concat(FALLBACK_DATA_JEPARA.sekolah);
  }

  if (
    queryLower.includes("rumah sakit") ||
    queryLower.includes("rs") ||
    queryLower.includes("hospital")
  ) {
    fallbackResults = fallbackResults.concat(FALLBACK_DATA_JEPARA.rumahSakit);
  }

  if (queryLower.includes("masjid") || queryLower.includes("mosque")) {
    fallbackResults = fallbackResults.concat(FALLBACK_DATA_JEPARA.masjid);
  }

  if (queryLower.includes("bank")) {
    fallbackResults = fallbackResults.concat(FALLBACK_DATA_JEPARA.bank);
  }

  return fallbackResults;
}
