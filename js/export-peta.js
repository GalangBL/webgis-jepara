// ============================================
// MODUL EXPORT PETA INTERAKTIF
// File: export-peta.js
// Deskripsi: Mengelola export peta sebagai gambar, PDF, dan print interaktif
// ============================================

// ============================================
// VARIABEL GLOBAL EXPORT
// ============================================

let sedangExport = false;

// ============================================
// EXPORT PETA SEBAGAI GAMBAR
// ============================================

/**
 * Fungsi untuk export peta sebagai gambar PNG dengan marker yang bisa diklik
 */
async function eksporPetaSebagaiGambar() {
  if (sedangExport) {
    tampilkanNotifikasi(
      "warning",
      "Export sedang berlangsung, mohon tunggu..."
    );
    return;
  }

  if (daftarFasilitas.length === 0) {
    tampilkanNotifikasi("warning", "Tidak ada data fasilitas untuk diexport");
    return;
  }

  sedangExport = true;
  tampilkanNotifikasi("info", "Mempersiapkan export peta...");

  try {
    // Buat modal untuk preview dan konfigurasi export
    await buatModalExportPeta();
  } catch (error) {
    console.error("Error export peta:", error);
    tampilkanNotifikasi("error", "Gagal export peta. Silakan coba lagi.");
  } finally {
    sedangExport = false;
  }
}

/**
 * Fungsi untuk membuat modal export peta dengan preview
 */
async function buatModalExportPeta() {
  // Buat modal HTML
  const modalHTML = `
    <div class="modal active" id="modalExportPeta">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>
            <i data-lucide="camera"></i>
            Export Peta Interaktif
          </h3>
          <button class="btn-close" id="btnCloseExportModal">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="export-config">
            <div class="config-section">
              <h4>Konfigurasi Export</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="exportTitle">Judul Peta</label>
                  <input type="text" id="exportTitle" value="Peta Fasilitas Umum Jepara" />
                </div>
                <div class="form-group">
                  <label for="exportFormat">Format</label>
                  <select id="exportFormat">
                    <option value="png">PNG (Gambar)</option>
                    <option value="html">HTML Interaktif</option>
                    <option value="pdf">PDF (dengan data)</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="exportSize">Ukuran</label>
                  <select id="exportSize">
                    <option value="1024x768">1024 x 768 (Standard)</option>
                    <option value="1920x1080">1920 x 1080 (HD)</option>
                    <option value="2560x1440">2560 x 1440 (2K)</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>
                    <input type="checkbox" id="includeCoordinates" checked />
                    Tampilkan koordinat saat klik marker
                  </label>
                </div>
              </div>
              <div class="form-group" id="customSizeGroup" style="display: none;">
                <div class="form-row">
                  <div class="form-group">
                    <label for="customWidth">Lebar (px)</label>
                    <input type="number" id="customWidth" value="1024" min="800" max="4000" />
                  </div>
                  <div class="form-group">
                    <label for="customHeight">Tinggi (px)</label>
                    <input type="number" id="customHeight" value="768" min="600" max="3000" />
                  </div>
                </div>
              </div>
            </div>
            
            <div class="legend-section">
              <h4>Legend Fasilitas</h4>
              <div id="exportLegend" class="export-legend">
                <!-- Legend akan diisi oleh JavaScript -->
              </div>
            </div>
          </div>
          
          <div class="export-preview">
            <h4>Preview Peta</h4>
            <div id="previewContainer" class="preview-container">
              <div id="previewMap" class="preview-map"></div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="btnCancelExport">
            <i data-lucide="x"></i>
            Batal
          </button>
          <button class="btn btn-primary" id="btnDownloadExport">
            <i data-lucide="download"></i>
            Download Peta
          </button>
        </div>
      </div>
    </div>
  `;

  // Tambahkan modal ke body
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Setup event listeners
  setupExportModalEvents();

  // Buat preview peta
  await buatPreviewPeta();

  // Buat legend
  buatLegendExport();

  // Update Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/**
 * Fungsi untuk setup event listeners modal export
 */
function setupExportModalEvents() {
  const modal = document.getElementById("modalExportPeta");
  const btnClose = document.getElementById("btnCloseExportModal");
  const btnCancel = document.getElementById("btnCancelExport");
  const btnDownload = document.getElementById("btnDownloadExport");
  const exportSize = document.getElementById("exportSize");
  const customSizeGroup = document.getElementById("customSizeGroup");

  // Close modal
  [btnClose, btnCancel].forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", () => {
        tutupModalExport();
      });
    }
  });

  // Click outside modal
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      tutupModalExport();
    }
  });

  // Download button
  if (btnDownload) {
    btnDownload.addEventListener("click", prosesDownloadPeta);
  }

  // Size selector
  if (exportSize) {
    exportSize.addEventListener("change", (e) => {
      if (e.target.value === "custom") {
        customSizeGroup.style.display = "block";
      } else {
        customSizeGroup.style.display = "none";
      }
    });
  }
}

/**
 * Fungsi untuk membuat preview peta
 */
async function buatPreviewPeta() {
  const previewContainer = document.getElementById("previewMap");

  if (!previewContainer) return;

  // Buat peta preview dengan ukuran kecil
  const previewMap = L.map(previewContainer, {
    center: [KOORDINAT_DEFAULT.lat, KOORDINAT_DEFAULT.lng],
    zoom: 12,
    zoomControl: false,
    attributionControl: false,
  });

  // Tambahkan tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
    previewMap
  );

  // Tambahkan marker untuk setiap fasilitas
  daftarFasilitas.forEach((fasilitas) => {
    const lat = parseFloat(fasilitas.koordinat.lat);
    const lng = parseFloat(fasilitas.koordinat.lng);

    if (validasiKoordinat(lat, lng)) {
      const namaIcon = getIconKategori(fasilitas.kategori);
      const warna = getWarnaKategori(fasilitas.kategori);

      // Buat marker dengan popup koordinat
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "export-marker",
          html: `
            <div style="
              background: ${warna};
              width: 24px;
              height: 24px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              border: 2px solid white;
            ">
              <i data-lucide="${namaIcon}" style="
                color: white;
                width: 12px;
                height: 12px;
                transform: rotate(45deg);
              "></i>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
          popupAnchor: [0, -24],
        }),
      });

      // Popup dengan koordinat dan info
      const popupContent = `
        <div class="export-popup">
          <h4>${escapeHTML(fasilitas.nama)}</h4>
          <p><strong>Kategori:</strong> ${escapeHTML(fasilitas.kategori)}</p>
          <p><strong>Alamat:</strong> ${escapeHTML(fasilitas.alamat || "-")}</p>
          <p><strong>Koordinat:</strong> ${formatKoordinat(lat, lng, 6)}</p>
          <button onclick="copyKoordinat('${lat}', '${lng}')" class="btn-copy-coord">
            <i data-lucide="copy"></i> Copy Koordinat
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: "export-popup-container",
      });

      marker.addTo(previewMap);
    }
  });

  // Fit bounds ke semua marker
  if (daftarFasilitas.length > 0) {
    const group = new L.featureGroup(previewMap._layers);
    if (Object.keys(group._layers).length > 0) {
      previewMap.fitBounds(group.getBounds().pad(0.1));
    }
  }

  // Update icons
  setTimeout(() => {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }, 100);

  // Simpan referensi peta preview
  window.previewMapInstance = previewMap;
}

/**
 * Fungsi untuk membuat legend export
 */
function buatLegendExport() {
  const legendContainer = document.getElementById("exportLegend");

  if (!legendContainer) return;

  // Hitung jumlah per kategori
  const kategoriCount = {};
  daftarFasilitas.forEach((fasilitas) => {
    if (kategoriCount[fasilitas.kategori]) {
      kategoriCount[fasilitas.kategori]++;
    } else {
      kategoriCount[fasilitas.kategori] = 1;
    }
  });

  // Buat HTML legend
  let legendHTML = "";
  for (const [kategori, jumlah] of Object.entries(kategoriCount)) {
    const icon = getIconKategori(kategori);
    const warna = getWarnaKategori(kategori);

    legendHTML += `
      <div class="legend-item">
        <div class="legend-marker" style="background: ${warna}">
          <i data-lucide="${icon}"></i>
        </div>
        <span class="legend-text">${kategori} (${jumlah})</span>
      </div>
    `;
  }

  legendContainer.innerHTML = legendHTML;

  // Update icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/**
 * Fungsi untuk proses download peta
 */
async function prosesDownloadPeta() {
  const format = document.getElementById("exportFormat").value;
  const title =
    document.getElementById("exportTitle").value ||
    "Peta Fasilitas Umum Jepara";
  const includeCoordinates =
    document.getElementById("includeCoordinates").checked;

  tampilkanNotifikasi("info", "Memproses export peta...");

  try {
    switch (format) {
      case "png":
        await exportSebagaiPNG(title);
        break;
      case "html":
        await exportSebagaiHTML(title, includeCoordinates);
        break;
      case "pdf":
        await exportSebagaiPDF(title, includeCoordinates);
        break;
    }

    tampilkanNotifikasi("success", "Peta berhasil diexport!");
    tutupModalExport();
  } catch (error) {
    console.error("Error export:", error);
    tampilkanNotifikasi("error", "Gagal export peta. Silakan coba lagi.");
  }
}

/**
 * Fungsi untuk export sebagai PNG
 */
async function exportSebagaiPNG(title) {
  try {
    // Gunakan html2canvas untuk capture peta
    if (typeof html2canvas === "undefined") {
      // Jika html2canvas tidak tersedia, buat screenshot sederhana
      tampilkanNotifikasi(
        "info",
        "Menggunakan metode screenshot alternatif..."
      );

      // Buat canvas dari peta yang ada
      const mapElement = document.getElementById("peta");
      if (mapElement) {
        // Trigger browser print dialog sebagai alternatif
        window.print();
        return;
      }
    }

    tampilkanNotifikasi("info", "Fitur export PNG akan segera tersedia");
  } catch (error) {
    console.error("Error export PNG:", error);
    tampilkanNotifikasi(
      "error",
      "Gagal export PNG. Gunakan export HTML sebagai alternatif."
    );
  }
}

/**
 * Fungsi untuk export sebagai HTML interaktif
 */
async function exportSebagaiHTML(title, includeCoordinates) {
  const htmlContent = buatHTMLInteraktif(title, includeCoordinates);

  // Download sebagai file HTML
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${
    new Date().toISOString().split("T")[0]
  }.html`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Fungsi untuk membuat HTML interaktif
 */
function buatHTMLInteraktif(title, includeCoordinates) {
  const fasilitasData = JSON.stringify(daftarFasilitas);

  return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHTML(title)}</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
    <style>
        body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .header { background: #1e293b; color: white; padding: 1rem; text-align: center; }
        .map-container { height: calc(100vh - 80px); position: relative; }
        .legend { position: absolute; top: 10px; right: 10px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); z-index: 1000; max-width: 200px; }
        .legend-item { display: flex; align-items: center; margin-bottom: 8px; }
        .legend-marker { width: 20px; height: 20px; border-radius: 50%; margin-right: 8px; display: flex; align-items: center; justify-content: center; }
        .legend-text { font-size: 12px; }
        .coordinate-display { position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.8); color: white; padding: 8px 12px; border-radius: 4px; font-family: monospace; z-index: 1000; }
        .popup-content { max-width: 250px; }
        .copy-btn { background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-top: 5px; }
        .copy-btn:hover { background: #2563eb; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${escapeHTML(title)}</h1>
        <p>Sistem Informasi Geografis Fasilitas Umum - Jepara</p>
    </div>
    
    <div class="map-container">
        <div id="map" style="height: 100%; width: 100%;"></div>
        
        <div class="legend">
            <h4 style="margin: 0 0 10px 0; font-size: 14px;">Legend</h4>
            <div id="legendContent"></div>
        </div>
        
        ${
          includeCoordinates
            ? '<div class="coordinate-display" id="coordDisplay">Klik marker untuk melihat koordinat</div>'
            : ""
        }
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
    <script>
        const fasilitasData = ${fasilitasData};
        
        // Inisialisasi peta
        const map = L.map('map').setView([-6.5877, 110.6684], 12);
        
        // Tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Marker cluster
        const markers = L.markerClusterGroup();
        
        // Fungsi helper
        function getIconKategori(kategori) {
            const mapping = {
                'Sekolah': '🏫',
                'Rumah Sakit': '🏥',
                'Kantor Pemerintahan': '🏢',
                'Masjid': '🕌',
                'Taman': '🏞️',
                'Pasar': '🏪',
                'Bank': '🏦',
                'Universitas': '🎓'
            };
            return mapping[kategori] || '📍';
        }
        
        function getWarnaKategori(kategori) {
            const mapping = {
                'Sekolah': '#3b82f6',
                'Rumah Sakit': '#ef4444',
                'Kantor Pemerintahan': '#8b5cf6',
                'Masjid': '#10b981',
                'Taman': '#22c55e',
                'Pasar': '#f59e0b',
                'Bank': '#eab308',
                'Universitas': '#06b6d4'
            };
            return mapping[kategori] || '#64748b';
        }
        
        // Tambahkan marker
        fasilitasData.forEach(fasilitas => {
            const lat = parseFloat(fasilitas.koordinat.lat);
            const lng = parseFloat(fasilitas.koordinat.lng);
            
            if (lat && lng) {
                const icon = getIconKategori(fasilitas.kategori);
                const warna = getWarnaKategori(fasilitas.kategori);
                
                const marker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'custom-marker',
                        html: '<div style="background: ' + warna + '; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">' + icon + '</div>',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })
                });
                
                const popupContent = \`
                    <div class="popup-content">
                        <h4>\${fasilitas.nama}</h4>
                        <p><strong>Kategori:</strong> \${fasilitas.kategori}</p>
                        <p><strong>Alamat:</strong> \${fasilitas.alamat || '-'}</p>
                        ${
                          includeCoordinates
                            ? `
                        <p><strong>Koordinat:</strong> \${lat.toFixed(6)}, \${lng.toFixed(6)}</p>
                        <button class="copy-btn" onclick="copyToClipboard('\${lat.toFixed(6)}, \${lng.toFixed(6)}')">📋 Copy Koordinat</button>
                        `
                            : ""
                        }
                    </div>
                \`;
                
                marker.bindPopup(popupContent);
                
                ${
                  includeCoordinates
                    ? `
                marker.on('click', function() {
                    document.getElementById('coordDisplay').innerHTML = 
                        'Koordinat: ' + lat.toFixed(6) + ', ' + lng.toFixed(6);
                });
                `
                    : ""
                }
                
                markers.addLayer(marker);
            }
        });
        
        map.addLayer(markers);
        
        // Fit bounds
        if (fasilitasData.length > 0) {
            map.fitBounds(markers.getBounds().pad(0.1));
        }
        
        // Buat legend
        const kategoriCount = {};
        fasilitasData.forEach(f => {
            kategoriCount[f.kategori] = (kategoriCount[f.kategori] || 0) + 1;
        });
        
        let legendHTML = '';
        for (const [kategori, jumlah] of Object.entries(kategoriCount)) {
            const icon = getIconKategori(kategori);
            const warna = getWarnaKategori(kategori);
            legendHTML += \`
                <div class="legend-item">
                    <div class="legend-marker" style="background: \${warna};">\${icon}</div>
                    <span class="legend-text">\${kategori} (\${jumlah})</span>
                </div>
            \`;
        }
        document.getElementById('legendContent').innerHTML = legendHTML;
        
        // Copy function
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Koordinat berhasil dicopy: ' + text);
            });
        }
    </script>
</body>
</html>
  `;
}

/**
 * Fungsi untuk export sebagai PDF
 */
async function exportSebagaiPDF(title, includeCoordinates) {
  try {
    // Buat konten HTML untuk PDF
    const htmlContent = buatKontenPrint();

    // Buka window baru untuk print ke PDF
    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Tunggu sebentar lalu trigger print dialog
    setTimeout(() => {
      printWindow.print();
      tampilkanNotifikasi(
        "success",
        "Gunakan 'Save as PDF' di dialog print untuk menyimpan sebagai PDF"
      );
    }, 1000);
  } catch (error) {
    console.error("Error export PDF:", error);
    tampilkanNotifikasi(
      "error",
      "Gagal export PDF. Gunakan print browser sebagai alternatif."
    );
  }
}

/**
 * Fungsi untuk tutup modal export
 */
function tutupModalExport() {
  const modal = document.getElementById("modalExportPeta");
  if (modal) {
    // Destroy preview map
    if (window.previewMapInstance) {
      window.previewMapInstance.remove();
      window.previewMapInstance = null;
    }

    modal.remove();
  }
}

/**
 * Fungsi untuk copy koordinat (dipanggil dari HTML export)
 */
function copyKoordinat(lat, lng) {
  const koordinat = `${lat}, ${lng}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(koordinat).then(() => {
      tampilkanNotifikasi("success", `Koordinat berhasil dicopy: ${koordinat}`);
    });
  } else {
    // Fallback untuk browser lama
    const textArea = document.createElement("textarea");
    textArea.value = koordinat;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    tampilkanNotifikasi("success", `Koordinat berhasil dicopy: ${koordinat}`);
  }
}

// ============================================
// PRINT PETA INTERAKTIF
// ============================================

/**
 * Fungsi untuk print peta interaktif
 */
function printPetaInteraktif() {
  if (daftarFasilitas.length === 0) {
    tampilkanNotifikasi("warning", "Tidak ada data fasilitas untuk diprint");
    return;
  }

  // Buat window baru untuk print
  const printWindow = window.open("", "_blank");

  const printContent = buatKontenPrint();

  printWindow.document.write(printContent);
  printWindow.document.close();

  // Tunggu sebentar lalu print
  setTimeout(() => {
    printWindow.print();
  }, 1000);

  tampilkanNotifikasi("success", "Halaman print telah dibuka");
}

/**
 * Fungsi untuk membuat konten print
 */
function buatKontenPrint() {
  const fasilitasData = JSON.stringify(daftarFasilitas);

  return `
<!DOCTYPE html>
<html>
<head>
    <title>Print Peta Fasilitas Umum Jepara</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
        }
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .map-container { height: 400px; border: 1px solid #ccc; margin: 20px 0; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .data-table th { background-color: #f2f2f2; }
        .legend { display: flex; flex-wrap: wrap; gap: 15px; margin: 20px 0; }
        .legend-item { display: flex; align-items: center; }
        .legend-marker { width: 16px; height: 16px; border-radius: 50%; margin-right: 5px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Peta Fasilitas Umum Jepara</h1>
        <p>Sistem Informasi Geografis - Tanggal: ${new Date().toLocaleDateString(
          "id-ID"
        )}</p>
    </div>
    
    <div class="map-container" id="map"></div>
    
    <div class="legend" id="legend"></div>
    
    <table class="data-table">
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Fasilitas</th>
                <th>Kategori</th>
                <th>Alamat</th>
                <th>Koordinat</th>
            </tr>
        </thead>
        <tbody id="dataTable">
        </tbody>
    </table>
    
    <div class="footer">
        <p>Total Fasilitas: ${
          daftarFasilitas.length
        } | Dicetak pada: ${new Date().toLocaleString("id-ID")}</p>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const fasilitasData = ${fasilitasData};
        
        // Inisialisasi peta
        const map = L.map('map').setView([-6.5877, 110.6684], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        // Fungsi helper
        function getWarnaKategori(kategori) {
            const mapping = {
                'Sekolah': '#3b82f6', 'Rumah Sakit': '#ef4444', 'Kantor Pemerintahan': '#8b5cf6',
                'Masjid': '#10b981', 'Taman': '#22c55e', 'Pasar': '#f59e0b',
                'Bank': '#eab308', 'Universitas': '#06b6d4'
            };
            return mapping[kategori] || '#64748b';
        }
        
        // Tambahkan marker dan isi tabel
        let tableHTML = '';
        const kategoriCount = {};
        
        fasilitasData.forEach((fasilitas, index) => {
            const lat = parseFloat(fasilitas.koordinat.lat);
            const lng = parseFloat(fasilitas.koordinat.lng);
            
            if (lat && lng) {
                // Marker
                const warna = getWarnaKategori(fasilitas.kategori);
                L.circleMarker([lat, lng], {
                    radius: 8,
                    fillColor: warna,
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map).bindPopup(\`
                    <b>\${fasilitas.nama}</b><br>
                    \${fasilitas.kategori}<br>
                    \${lat.toFixed(6)}, \${lng.toFixed(6)}
                \`);
                
                // Tabel
                tableHTML += \`
                    <tr>
                        <td>\${index + 1}</td>
                        <td>\${fasilitas.nama}</td>
                        <td>\${fasilitas.kategori}</td>
                        <td>\${fasilitas.alamat || '-'}</td>
                        <td>\${lat.toFixed(6)}, \${lng.toFixed(6)}</td>
                    </tr>
                \`;
                
                // Count kategori
                kategoriCount[fasilitas.kategori] = (kategoriCount[fasilitas.kategori] || 0) + 1;
            }
        });
        
        document.getElementById('dataTable').innerHTML = tableHTML;
        
        // Legend
        let legendHTML = '';
        for (const [kategori, jumlah] of Object.entries(kategoriCount)) {
            const warna = getWarnaKategori(kategori);
            legendHTML += \`
                <div class="legend-item">
                    <div class="legend-marker" style="background: \${warna};"></div>
                    <span>\${kategori} (\${jumlah})</span>
                </div>
            \`;
        }
        document.getElementById('legend').innerHTML = legendHTML;
        
        // Fit bounds
        if (fasilitasData.length > 0) {
            const group = new L.featureGroup();
            fasilitasData.forEach(f => {
                const lat = parseFloat(f.koordinat.lat);
                const lng = parseFloat(f.koordinat.lng);
                if (lat && lng) {
                    L.marker([lat, lng]).addTo(group);
                }
            });
            map.fitBounds(group.getBounds().pad(0.1));
        }
    </script>
</body>
</html>
  `;
}

// ============================================
// FITUR TAMBAHAN EXPORT
// ============================================

/**
 * Fungsi untuk membuat QR Code koordinat (opsional)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} - URL QR Code
 */
function buatQRCodeKoordinat(lat, lng) {
  const koordinatText = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  // Menggunakan QR Server API (gratis)
  return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
    googleMapsUrl
  )}`;
}

/**
 * Fungsi untuk export data lengkap dengan statistik
 */
async function exportDataLengkap() {
  if (daftarFasilitas.length === 0) {
    tampilkanNotifikasi("warning", "Tidak ada data untuk diexport");
    return;
  }

  const dataLengkap = {
    metadata: {
      title: "Data Fasilitas Umum Jepara",
      tanggalExport: new Date().toISOString(),
      totalFasilitas: daftarFasilitas.length,
      area: "Kabupaten Jepara, Jawa Tengah",
      koordinatPusat: {
        lat: KOORDINAT_DEFAULT.lat,
        lng: KOORDINAT_DEFAULT.lng,
      },
    },
    statistik: hitungStatistikLengkap(),
    fasilitas: daftarFasilitas.map((f) => ({
      ...f,
      googleMapsUrl: `https://www.google.com/maps?q=${f.koordinat.lat},${f.koordinat.lng}`,
      qrCodeUrl: buatQRCodeKoordinat(f.koordinat.lat, f.koordinat.lng),
    })),
  };

  // Download sebagai JSON
  const namaFile = `fasilitas_lengkap_jepara_${
    new Date().toISOString().split("T")[0]
  }`;
  const berhasil = downloadJSON(dataLengkap, namaFile);

  if (berhasil) {
    tampilkanNotifikasi(
      "success",
      "Data lengkap berhasil diexport dengan QR codes!"
    );
  } else {
    tampilkanNotifikasi("error", "Gagal export data lengkap");
  }
}

/**
 * Fungsi untuk menghitung statistik lengkap
 */
function hitungStatistikLengkap() {
  const kategoriCount = {};
  const koordinatBounds = {
    north: -Infinity,
    south: Infinity,
    east: -Infinity,
    west: Infinity,
  };

  daftarFasilitas.forEach((fasilitas) => {
    // Count kategori
    if (kategoriCount[fasilitas.kategori]) {
      kategoriCount[fasilitas.kategori]++;
    } else {
      kategoriCount[fasilitas.kategori] = 1;
    }

    // Calculate bounds
    const lat = parseFloat(fasilitas.koordinat.lat);
    const lng = parseFloat(fasilitas.koordinat.lng);

    if (lat > koordinatBounds.north) koordinatBounds.north = lat;
    if (lat < koordinatBounds.south) koordinatBounds.south = lat;
    if (lng > koordinatBounds.east) koordinatBounds.east = lng;
    if (lng < koordinatBounds.west) koordinatBounds.west = lng;
  });

  return {
    distribusiKategori: kategoriCount,
    wilayahCakupan: koordinatBounds,
    luasArea: hitungLuasArea(koordinatBounds),
    densitasFasilitas: (
      daftarFasilitas.length / hitungLuasArea(koordinatBounds)
    ).toFixed(2),
  };
}

/**
 * Fungsi untuk menghitung luas area (perkiraan)
 */
function hitungLuasArea(bounds) {
  const latDiff = bounds.north - bounds.south;
  const lngDiff = bounds.east - bounds.west;

  // Konversi derajat ke km (perkiraan kasar)
  const kmPerDegree = 111; // 1 derajat ≈ 111 km

  return (latDiff * kmPerDegree * lngDiff * kmPerDegree).toFixed(2);
}

/**
 * Fungsi untuk export ke format KML (Google Earth)
 */
async function exportKeKML() {
  if (daftarFasilitas.length === 0) {
    tampilkanNotifikasi("warning", "Tidak ada data untuk diexport");
    return;
  }

  const kmlContent = buatKMLContent();

  // Download sebagai file KML
  const blob = new Blob([kmlContent], {
    type: "application/vnd.google-earth.kml+xml",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `fasilitas_jepara_${
    new Date().toISOString().split("T")[0]
  }.kml`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  tampilkanNotifikasi(
    "success",
    "File KML berhasil diexport untuk Google Earth!"
  );
}

/**
 * Fungsi untuk membuat konten KML
 */
function buatKMLContent() {
  let placemarks = "";

  daftarFasilitas.forEach((fasilitas) => {
    const lat = parseFloat(fasilitas.koordinat.lat);
    const lng = parseFloat(fasilitas.koordinat.lng);

    if (validasiKoordinat(lat, lng)) {
      placemarks += `
    <Placemark>
      <name>${escapeHTML(fasilitas.nama)}</name>
      <description><![CDATA[
        <h3>${escapeHTML(fasilitas.nama)}</h3>
        <p><strong>Kategori:</strong> ${escapeHTML(fasilitas.kategori)}</p>
        <p><strong>Alamat:</strong> ${escapeHTML(fasilitas.alamat || "-")}</p>
        <p><strong>Koordinat:</strong> ${formatKoordinat(lat, lng, 6)}</p>
        ${
          fasilitas.deskripsi
            ? `<p><strong>Deskripsi:</strong> ${escapeHTML(
                fasilitas.deskripsi
              )}</p>`
            : ""
        }
        <p><strong>Tanggal Input:</strong> ${
          fasilitas.waktuDibuat
            ? new Date(fasilitas.waktuDibuat).toLocaleDateString("id-ID")
            : "-"
        }</p>
      ]]></description>
      <Point>
        <coordinates>${lng},${lat},0</coordinates>
      </Point>
      <Style>
        <IconStyle>
          <color>ff${getWarnaKategori(fasilitas.kategori).substring(1)}</color>
          <scale>1.2</scale>
        </IconStyle>
      </Style>
    </Placemark>`;
    }
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Fasilitas Umum Jepara</name>
    <description>Data fasilitas umum di Kabupaten Jepara, Jawa Tengah</description>
    <Style id="defaultStyle">
      <IconStyle>
        <scale>1.0</scale>
      </IconStyle>
    </Style>
    ${placemarks}
  </Document>
</kml>`;
}
