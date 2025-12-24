// ============================================
// MODUL PETA LEAFLET
// File: peta.js
// Deskripsi: Mengelola inisialisasi peta, marker, clustering, dan GeoJSON
// ============================================

// ============================================
// VARIABEL GLOBAL PETA
// ============================================

let peta = null; // Instance peta Leaflet
let grupMarker = null; // Marker Cluster Group
let layerGeoJSON = null; // Layer GeoJSON dari QGIS
let markerTerpilih = null; // Marker yang sedang dipilih/highlight
let koordinatKlikPeta = null; // Koordinat dari klik peta
let modeInteraksi = "tambah"; // Mode: 'tambah' atau 'edit'
let fasilitasYangDiedit = null; // ID fasilitas yang sedang diedit

// Koordinat default (Jepara, Jawa Tengah)
const KOORDINAT_DEFAULT = {
  lat: -6.5877,
  lng: 110.6684,
  zoom: 11,
};

// Batas wilayah Kabupaten Jepara (polygon coordinates)
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

// ============================================
// INISIALISASI PETA
// ============================================

/**
 * Fungsi utama untuk menginisialisasi peta Leaflet
 * Dipanggil saat aplikasi pertama kali dimuat
 */
function inisialisasiPeta() {
  try {
    logConsole("Menginisialisasi peta...", "info");

    // Buat instance peta dengan center Jepara
    peta = L.map("peta", {
      center: [KOORDINAT_DEFAULT.lat, KOORDINAT_DEFAULT.lng],
      zoom: KOORDINAT_DEFAULT.zoom,
      zoomControl: true,
      minZoom: 9,
      maxZoom: 19,
    });

    // Tambahkan tile layer dari OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(peta);

    // Tambahkan batas wilayah Jepara
    tambahBatasWilayahJepara();

    // Inisialisasi marker cluster group
    grupMarker = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50,
      iconCreateFunction: buatIconCluster,
    });

    // Tambahkan marker cluster group ke peta
    peta.addLayer(grupMarker);

    // Setup event listener untuk klik pada peta
    peta.on("click", tanganiKlikPeta);

    // Setup event listener untuk mouse move (koordinat real-time)
    peta.on("mousemove", tampilkanKoordinatRealTime);

    // Load GeoJSON jika ada
    muatGeoJSON();

    logConsole("Peta berhasil diinisialisasi!", "success");
  } catch (error) {
    console.error("Gagal menginisialisasi peta:", error);
    tampilkanNotifikasi("error", "Gagal memuat peta. Mohon refresh halaman.");
  }
}

// ============================================
// CUSTOM CLUSTER ICON
// ============================================

/**
 * Fungsi untuk membuat custom icon untuk cluster marker
 * @param {object} cluster - Cluster object dari Leaflet
 * @returns {object} - L.divIcon
 */
function buatIconCluster(cluster) {
  const jumlahMarker = cluster.getChildCount();

  // Tentukan class berdasarkan jumlah marker
  let ukuranClass = "marker-cluster-small";
  if (jumlahMarker >= 10) {
    ukuranClass = "marker-cluster-medium";
  }
  if (jumlahMarker >= 20) {
    ukuranClass = "marker-cluster-large";
  }

  return L.divIcon({
    html: `<div><span>${jumlahMarker}</span></div>`,
    className: `marker-cluster ${ukuranClass}`,
    iconSize: L.point(40, 40),
  });
}

// ============================================
// TANGANI KLIK PADA PETA
// ============================================

/**
 * Fungsi yang dipanggil saat user klik pada peta
 * Koordinat otomatis masuk ke form input
 * @param {object} e - Event object dari Leaflet
 */
function tanganiKlikPeta(e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  // Validasi apakah koordinat dalam wilayah Jepara
  if (!validasiKoordinatJepara(lat, lng)) {
    tampilkanNotifikasi(
      "warning",
      "Koordinat di luar wilayah Kabupaten Jepara. Silakan klik dalam area yang ditandai."
    );
    return;
  }

  // Simpan koordinat ke variabel global
  koordinatKlikPeta = { lat, lng };

  // Cek apakah modal edit sedang terbuka
  const modalEdit = document.getElementById("modalEdit");
  const isModalEditOpen = modalEdit && modalEdit.classList.contains("active");

  if (isModalEditOpen) {
    // Jika modal edit terbuka, update koordinat di form edit
    const editLat = document.getElementById("editLat");
    const editLng = document.getElementById("editLng");

    if (editLat && editLng) {
      editLat.value = lat.toFixed(6);
      editLng.value = lng.toFixed(6);
    }

    // Tambahkan marker sementara
    tambahMarkerSementara(lat, lng);

    tampilkanNotifikasi(
      "success",
      "Koordinat diperbarui! Klik Update untuk menyimpan"
    );
  } else {
    // Mode normal - isi form tambah
    const inputLat = document.getElementById("inputLat");
    const inputLng = document.getElementById("inputLng");

    if (inputLat && inputLng) {
      inputLat.value = lat.toFixed(6);
      inputLng.value = lng.toFixed(6);
    }

    // Tambahkan marker sementara
    tambahMarkerSementara(lat, lng);

    tampilkanNotifikasi("info", "Koordinat dipilih untuk fasilitas baru");

    // Auto switch ke tab form jika belum aktif
    switchTab("form");
  }

  logConsole(`Koordinat dipilih: ${formatKoordinat(lat, lng)}`, "info");
}

// ============================================
// MARKER SEMENTARA (PREVIEW)
// ============================================

let markerSementara = null;

/**
 * Fungsi untuk menambah marker sementara sebagai preview
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
function tambahMarkerSementara(lat, lng) {
  // Hapus marker sementara sebelumnya jika ada
  if (markerSementara) {
    peta.removeLayer(markerSementara);
  }

  // Buat marker baru dengan icon khusus
  markerSementara = L.marker([lat, lng], {
    icon: L.divIcon({
      className: "marker-preview",
      html: '<i data-lucide="map-pin" style="color: #f59e0b; width: 32px; height: 32px;"></i>',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    }),
    draggable: false,
  });

  markerSementara
    .addTo(peta)
    .bindPopup(
      `
      <div class="popup-preview">
        <strong>Lokasi Dipilih</strong><br>
        <small>${formatKoordinat(lat, lng)}</small>
      </div>
    `
    )
    .openPopup();

  // Update icons Lucide
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/**
 * Fungsi untuk menghapus marker sementara
 */
function hapusMarkerSementara() {
  if (markerSementara) {
    peta.removeLayer(markerSementara);
    markerSementara = null;
  }
}

// ============================================
// TAMBAH MARKER FASILITAS KE PETA
// ============================================

/**
 * Fungsi untuk menambahkan fasilitas sebagai marker di peta
 * @param {object} fasilitas - Data fasilitas
 * @returns {object} - Marker Leaflet yang dibuat
 */
function tambahMarkerFasilitas(fasilitas) {
  try {
    const lat = parseFloat(fasilitas.koordinat.lat);
    const lng = parseFloat(fasilitas.koordinat.lng);

    // Validasi koordinat
    if (!validasiKoordinat(lat, lng)) {
      console.error("Koordinat tidak valid:", fasilitas);
      return null;
    }

    // Dapatkan icon dan warna berdasarkan kategori
    const namaIcon = getIconKategori(fasilitas.kategori);
    const warna = getWarnaKategori(fasilitas.kategori);

    // Buat custom marker dengan icon Lucide
    const iconHTML = `
      <div style="
        background: ${warna};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        <i data-lucide="${namaIcon}" style="
          color: white;
          width: 20px;
          height: 20px;
          transform: rotate(45deg);
        "></i>
      </div>
    `;

    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: "custom-marker",
        html: iconHTML,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      }),
    });

    // Buat konten popup
    const kontenPopup = buatKontenPopup(fasilitas);
    marker.bindPopup(kontenPopup, {
      maxWidth: 300,
      className: "custom-popup",
    });

    // Event listener saat marker diklik
    marker.on("click", (e) => {
      // Stop propagation agar tidak trigger klik peta
      L.DomEvent.stopPropagation(e);

      markerTerpilih = marker;

      // Langsung buka modal edit untuk kemudahan
      bukaModalEditDariMarker(fasilitas.id);

      // Animate marker (bounce)
      marker.setZIndexOffset(1000);
      setTimeout(() => marker.setZIndexOffset(0), 1000);
    });

    // Tambahkan marker ke cluster group
    grupMarker.addLayer(marker);

    // Simpan referensi ID fasilitas ke marker
    marker.fasilitasId = fasilitas.id;

    // Update icons Lucide
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

    return marker;
  } catch (error) {
    console.error("Gagal menambah marker:", error);
    return null;
  }
}

// ============================================
// BUAT KONTEN POPUP
// ============================================

/**
 * Fungsi untuk membuat HTML konten popup marker
 * @param {object} fasilitas - Data fasilitas
 * @returns {string} - HTML string
 */
function buatKontenPopup(fasilitas) {
  const namaIcon = getIconKategori(fasilitas.kategori);
  const warna = getWarnaKategori(fasilitas.kategori);

  return `
    <div class="popup-fasilitas">
      <div class="popup-header" style="background: ${warna}">
        <i data-lucide="${namaIcon}"></i>
        <div>
          <h4>${escapeHTML(fasilitas.nama)}</h4>
          <span>${escapeHTML(fasilitas.kategori)}</span>
        </div>
      </div>
      <div class="popup-body">
        ${
          fasilitas.alamat
            ? `
          <div class="popup-item">
            <i data-lucide="map-pin"></i>
            <span>${escapeHTML(fasilitas.alamat)}</span>
          </div>
        `
            : ""
        }
        <div class="popup-item">
          <i data-lucide="navigation"></i>
          <span>${formatKoordinat(
            fasilitas.koordinat.lat,
            fasilitas.koordinat.lng,
            4
          )}</span>
        </div>
        ${
          fasilitas.deskripsi
            ? `
          <div class="popup-item">
            <i data-lucide="align-left"></i>
            <span>${escapeHTML(potongText(fasilitas.deskripsi, 100))}</span>
          </div>
        `
            : ""
        }
      </div>
      <div class="popup-footer">
        <button class="popup-btn" onclick="lihatDetailFasilitas('${
          fasilitas.id
        }')">
          <i data-lucide="eye"></i>
          Lihat Detail
        </button>
        <button class="popup-btn" onclick="panKeMarker('${fasilitas.id}')">
          <i data-lucide="crosshair"></i>
          Fokus
        </button>
        <button class="popup-btn" onclick="copyKoordinatFasilitas('${
          fasilitas.koordinat.lat
        }', '${fasilitas.koordinat.lng}')">
          <i data-lucide="copy"></i>
          Copy Koordinat
        </button>
      </div>
    </div>
  `;
}

// ============================================
// RENDER SEMUA MARKER
// ============================================

/**
 * Fungsi untuk render semua marker dari array data fasilitas
 * @param {Array} dataFasilitas - Array data fasilitas
 */
function renderSemuaMarker(dataFasilitas) {
  // Hapus semua marker existing
  grupMarker.clearLayers();

  // Tambahkan marker untuk setiap fasilitas
  dataFasilitas.forEach((fasilitas) => {
    tambahMarkerFasilitas(fasilitas);
  });

  logConsole(
    `${dataFasilitas.length} marker berhasil ditambahkan ke peta`,
    "success"
  );
}

// ============================================
// UPDATE MARKER (EDIT)
// ============================================

/**
 * Fungsi untuk update posisi marker saat data di-edit
 * @param {string} fasilitasId - ID fasilitas
 * @param {object} dataFasilitasBaru - Data fasilitas yang baru
 */
function updateMarker(fasilitasId, dataFasilitasBaru) {
  // Cari marker dengan ID yang sesuai
  const marker = cariMarkerById(fasilitasId);

  if (marker) {
    // Hapus marker lama
    grupMarker.removeLayer(marker);
  }

  // Tambah marker baru dengan data updated
  tambahMarkerFasilitas(dataFasilitasBaru);
}

// ============================================
// HAPUS MARKER
// ============================================

/**
 * Fungsi untuk menghapus marker dari peta
 * @param {string} fasilitasId - ID fasilitas
 */
function hapusMarker(fasilitasId) {
  const marker = cariMarkerById(fasilitasId);

  if (marker) {
    // Animasi fade out sebelum dihapus
    marker.setOpacity(0);

    setTimeout(() => {
      grupMarker.removeLayer(marker);
      logConsole(`Marker ${fasilitasId} berhasil dihapus`, "info");
    }, 300);
  }
}

// ============================================
// CARI MARKER BY ID
// ============================================

/**
 * Fungsi helper untuk mencari marker berdasarkan ID fasilitas
 * @param {string} fasilitasId - ID fasilitas
 * @returns {object|null} - Marker Leaflet atau null
 */
function cariMarkerById(fasilitasId) {
  let markerDitemukan = null;

  grupMarker.eachLayer((marker) => {
    if (marker.fasilitasId === fasilitasId) {
      markerDitemukan = marker;
    }
  });

  return markerDitemukan;
}

// ============================================
// PAN DAN ZOOM KE MARKER
// ============================================

/**
 * Fungsi untuk pan dan zoom peta ke marker tertentu
 * @param {string} fasilitasId - ID fasilitas
 */
function panKeMarker(fasilitasId) {
  const marker = cariMarkerById(fasilitasId);

  if (marker) {
    // Pan dan zoom ke marker dengan animasi
    peta.flyTo(marker.getLatLng(), 16, {
      duration: 1,
      easeLinearity: 0.5,
    });

    // Buka popup
    setTimeout(() => {
      marker.openPopup();

      // Bounce animation
      animasiMarkerBounce(marker);
    }, 1000);
  }
}

/**
 * Fungsi untuk animasi bounce pada marker
 * @param {object} marker - Marker Leaflet
 */
function animasiMarkerBounce(marker) {
  let count = 0;
  const interval = setInterval(() => {
    marker.setZIndexOffset(count % 2 === 0 ? 1000 : 0);
    count++;

    if (count >= 6) {
      clearInterval(interval);
      marker.setZIndexOffset(0);
    }
  }, 200);
}

// ============================================
// PUSATKAN PETA KE LOKASI DEFAULT
// ============================================

/**
 * Fungsi untuk reset peta ke koordinat default
 */
function pusatkanPeta() {
  peta.flyTo(
    [KOORDINAT_DEFAULT.lat, KOORDINAT_DEFAULT.lng],
    KOORDINAT_DEFAULT.zoom,
    {
      duration: 1,
      easeLinearity: 0.5,
    }
  );
}

// ============================================
// LOAD GEOJSON DARI FILE
// ============================================

/**
 * Fungsi untuk memuat GeoJSON dari file eksternal
 * GeoJSON ini adalah layer dari QGIS
 */
async function muatGeoJSON() {
  try {
    // Fetch file GeoJSON
    const response = await fetch("data/sample.geojson");

    if (!response.ok) {
      logConsole("File GeoJSON tidak ditemukan, skip loading", "warning");
      return;
    }

    const dataGeoJSON = await response.json();

    // Tambahkan layer GeoJSON ke peta
    layerGeoJSON = L.geoJSON(dataGeoJSON, {
      style: styleGeoJSON,
      onEachFeature: onEachFeatureGeoJSON,
    }).addTo(peta);

    // Zoom ke bounds GeoJSON
    if (layerGeoJSON.getBounds().isValid()) {
      peta.fitBounds(layerGeoJSON.getBounds(), { padding: [50, 50] });
    }

    logConsole("GeoJSON berhasil dimuat!", "success");
  } catch (error) {
    logConsole("Skip loading GeoJSON: " + error.message, "warning");
  }
}

/**
 * Fungsi untuk styling GeoJSON layer
 * @param {object} feature - Feature GeoJSON
 * @returns {object} - Style object
 */
function styleGeoJSON(feature) {
  return {
    color: "#3b82f6",
    weight: 2,
    opacity: 0.7,
    fillOpacity: 0.2,
  };
}

/**
 * Fungsi yang dipanggil untuk setiap feature di GeoJSON
 * @param {object} feature - Feature GeoJSON
 * @param {object} layer - Layer Leaflet
 */
function onEachFeatureGeoJSON(feature, layer) {
  // Jika ada properties, tampilkan di popup
  if (feature.properties) {
    let popupContent =
      '<div class="popup-geojson"><strong>Data GeoJSON</strong><br>';

    for (let prop in feature.properties) {
      popupContent += `<b>${prop}:</b> ${feature.properties[prop]}<br>`;
    }

    popupContent += "</div>";
    layer.bindPopup(popupContent);
  }
}

// ============================================
// TOGGLE LAYER GEOJSON
// ============================================

/**
 * Fungsi untuk toggle tampilan layer GeoJSON
 * @param {boolean} tampilkan - True untuk show, false untuk hide
 */
function toggleLayerGeoJSON(tampilkan) {
  if (!layerGeoJSON) return;

  if (tampilkan) {
    peta.addLayer(layerGeoJSON);
  } else {
    peta.removeLayer(layerGeoJSON);
  }
}

// ============================================
// MODE INTERAKSI PETA
// ============================================

/**
 * Fungsi untuk mengatur mode interaksi peta
 * @param {string} mode - 'tambah' atau 'edit'
 */
function setModeInteraksi(mode) {
  modeInteraksi = mode;

  // Update cursor peta
  const petaContainer = document.getElementById("peta");
  if (petaContainer) {
    petaContainer.classList.remove("mode-tambah", "mode-edit");
    petaContainer.classList.add(`mode-${mode}`);
  }

  // Update info di UI
  updateInfoModeInteraksi();

  logConsole(`Mode interaksi diubah ke: ${mode}`, "info");
}

/**
 * Fungsi untuk update info mode di UI
 */
function updateInfoModeInteraksi() {
  const infoMode = document.getElementById("infoModeInteraksi");
  if (infoMode) {
    if (modeInteraksi === "tambah") {
      infoMode.innerHTML =
        '<i data-lucide="plus-circle"></i> Mode: Tambah Data (Klik peta untuk koordinat)';
      infoMode.className = "mode-info mode-tambah";
    } else if (modeInteraksi === "edit") {
      infoMode.innerHTML =
        '<i data-lucide="edit"></i> Mode: Edit Data (Klik marker atau peta untuk update koordinat)';
      infoMode.className = "mode-info mode-edit";
    }

    // Update icons
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }
}

/**
 * Fungsi untuk buka modal edit dari klik marker
 * @param {string} fasilitasId - ID fasilitas
 */
function bukaModalEditDariMarker(fasilitasId) {
  fasilitasYangDiedit = fasilitasId;
  bukaModalEdit(fasilitasId);

  // Set mode ke edit jika belum
  if (modeInteraksi !== "edit") {
    setModeInteraksi("edit");
  }

  tampilkanNotifikasi("info", "Klik peta untuk mengubah lokasi fasilitas");
}
// ============================================
// KOORDINAT REAL-TIME
// ============================================

let koordinatDisplay = null;

/**
 * Fungsi untuk menampilkan koordinat real-time saat mouse bergerak di peta
 * @param {object} e - Event object dari Leaflet
 */
function tampilkanKoordinatRealTime(e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  // Buat atau update display koordinat
  if (!koordinatDisplay) {
    koordinatDisplay = L.control({ position: "bottomleft" });

    koordinatDisplay.onAdd = function () {
      const div = L.DomUtil.create("div", "koordinat-display");
      div.innerHTML = `
        <div class="koordinat-container">
          <i data-lucide="crosshair"></i>
          <span id="koordinatText">${formatKoordinat(lat, lng, 6)}</span>
          <button id="btnCopyKoordinat" class="btn-copy-mini" title="Copy Koordinat">
            <i data-lucide="copy"></i>
          </button>
        </div>
      `;
      return div;
    };

    koordinatDisplay.addTo(peta);

    // Setup event listener untuk tombol copy
    setTimeout(() => {
      const btnCopy = document.getElementById("btnCopyKoordinat");
      if (btnCopy) {
        btnCopy.addEventListener("click", () => {
          const koordinatText = document.getElementById("koordinatText");
          if (koordinatText) {
            copyKeClipboard(koordinatText.textContent);
            tampilkanNotifikasi(
              "success",
              `Koordinat dicopy: ${koordinatText.textContent}`
            );
          }
        });
      }

      // Update Lucide icons
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    }, 100);
  }

  // Update koordinat text
  const koordinatText = document.getElementById("koordinatText");
  if (koordinatText) {
    koordinatText.textContent = formatKoordinat(lat, lng, 6);
  }
}

/**
 * Fungsi untuk menambahkan batas wilayah Kabupaten Jepara
 */
function tambahBatasWilayahJepara() {
  try {
    // Buat polygon untuk batas wilayah Jepara
    const batasWilayah = L.polygon(BATAS_JEPARA, {
      color: "#3b82f6",
      weight: 3,
      opacity: 0.8,
      fillColor: "#3b82f6",
      fillOpacity: 0.1,
      dashArray: "10, 5",
    }).addTo(peta);

    // Tambahkan popup informasi
    batasWilayah.bindPopup(
      `
      <div class="popup-batas-wilayah">
        <h4>🏛️ Kabupaten Jepara</h4>
        <p><strong>Provinsi:</strong> Jawa Tengah</p>
        <p><strong>Luas:</strong> ± 1.004 km²</p>
        <p><strong>Ibu Kota:</strong> Jepara</p>
        <p><strong>Kode Pos:</strong> 59xxx</p>
        <hr style="margin: 8px 0; border: 1px solid #e2e8f0;">
        <small>Area fokus aplikasi WebGIS Fasilitas Umum</small>
      </div>
    `,
      {
        className: "popup-batas-wilayah-container",
      }
    );

    // Fit peta ke batas wilayah dengan padding
    const bounds = batasWilayah.getBounds();
    peta.fitBounds(bounds, {
      padding: [20, 20],
      maxZoom: 12,
    });

    // Simpan referensi untuk kontrol layer
    window.layerBatasJepara = batasWilayah;

    logConsole("Batas wilayah Jepara berhasil ditambahkan", "success");
  } catch (error) {
    console.error("Gagal menambahkan batas wilayah:", error);
  }
}

/**
 * Fungsi untuk toggle tampilan batas wilayah Jepara
 */
function toggleBatasWilayah() {
  if (window.layerBatasJepara) {
    if (peta.hasLayer(window.layerBatasJepara)) {
      peta.removeLayer(window.layerBatasJepara);
      tampilkanNotifikasi("info", "Batas wilayah Jepara disembunyikan");
    } else {
      peta.addLayer(window.layerBatasJepara);
      tampilkanNotifikasi("info", "Batas wilayah Jepara ditampilkan");
    }
  }
}

/**
 * Fungsi untuk zoom ke batas wilayah Jepara
 */
function zoomKeBatasJepara() {
  if (window.layerBatasJepara) {
    const bounds = window.layerBatasJepara.getBounds();
    peta.fitBounds(bounds, {
      padding: [20, 20],
      maxZoom: 12,
      duration: 1,
    });
    tampilkanNotifikasi("success", "Peta difokuskan ke wilayah Jepara");
  }
}
