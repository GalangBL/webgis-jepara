// ===================================
// MODUL UI & INTERACTIONS
// File: ui.js
// Deskripsi: Mengelola interaksi UI, modal, toast, chart, dan event listeners
// ============================================

// ============================================
// VARIABEL GLOBAL UI
// ============================================

let chartKategori = null; // Instance Chart.js

// Daftar kategori fasilitas
const DAFTAR_KATEGORI = [
  "Sekolah",
  "Rumah Sakit",
  "Kantor Pemerintahan",
  "Masjid",
  "Taman",
  "Pasar",
  "Bank",
  "Universitas",
];

// ============================================
// SETUP EVENT LISTENERS
// ============================================

/**
 * Fungsi untuk setup semua event listeners
 * Dipanggil saat DOM sudah ready
 */
function setupEventListeners() {
  // Form Tambah Fasilitas
  const formFasilitas = document.getElementById("formFasilitas");
  if (formFasilitas) {
    formFasilitas.addEventListener("submit", tanganiSubmitFormTambah);
  }

  // Button Reset Form
  const btnReset = document.getElementById("btnReset");
  if (btnReset) {
    btnReset.addEventListener("click", resetFormTambah);
  }

  // Form Edit
  const formEdit = document.getElementById("formEdit");
  if (formEdit) {
    formEdit.addEventListener("submit", tanganiSubmitFormEdit);
  }

  // Button Close Modal
  const btnCloseModal = document.getElementById("btnCloseModal");
  const btnCancelEdit = document.getElementById("btnCancelEdit");

  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", tutupModalEdit);
  }

  if (btnCancelEdit) {
    btnCancelEdit.addEventListener("click", tutupModalEdit);
  }

  // Click di luar modal untuk tutup
  const modal = document.getElementById("modalEdit");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        tutupModalEdit();
      }
    });
  }

  // Tab Navigation
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");
      switchTab(tabName);
    });
  });

  // Search Input dengan debounce
  const inputCari = document.getElementById("inputCari");
  if (inputCari) {
    inputCari.addEventListener(
      "input",
      debounce((e) => {
        cariPasilitas(e.target.value);
      }, 300)
    );
  }

  // Button Reset Filter
  const btnResetFilter = document.getElementById("btnResetFilter");
  if (btnResetFilter) {
    btnResetFilter.addEventListener("click", resetFilter);
  }

  // Button Export JSON
  const btnExportJSON = document.getElementById("btnExportJSON");
  if (btnExportJSON) {
    btnExportJSON.addEventListener("click", eksporJSON);
  }

  // Button Export GeoJSON
  const btnExportGeoJSON = document.getElementById("btnExportGeoJSON");
  if (btnExportGeoJSON) {
    btnExportGeoJSON.addEventListener("click", eksporGeoJSON);
  }

  // Button Export Peta
  const btnExportPeta = document.getElementById("btnExportPeta");
  if (btnExportPeta) {
    btnExportPeta.addEventListener("click", eksporPetaSebagaiGambar);
  }

  // Button Print Peta
  const btnPrintPeta = document.getElementById("btnPrintPeta");
  if (btnPrintPeta) {
    btnPrintPeta.addEventListener("click", printPetaInteraktif);
  }

  // Button Export KML
  const btnExportKML = document.getElementById("btnExportKML");
  if (btnExportKML) {
    btnExportKML.addEventListener("click", exportKeKML);
  }

  // Button Export Lengkap
  const btnExportLengkap = document.getElementById("btnExportLengkap");
  if (btnExportLengkap) {
    btnExportLengkap.addEventListener("click", exportDataLengkap);
  }

  // Button Import
  const btnImport = document.getElementById("btnImport");
  const inputImport = document.getElementById("inputImport");

  if (btnImport && inputImport) {
    btnImport.addEventListener("click", () => {
      inputImport.click();
    });

    inputImport.addEventListener("change", tanganiImportFile);
  }

  // Map Control Buttons
  const btnPusatkanPeta = document.getElementById("btnPusatkanPeta");
  if (btnPusatkanPeta) {
    btnPusatkanPeta.addEventListener("click", pusatkanPeta);
  }

  const btnLokasiSaya = document.getElementById("btnLokasiSaya");
  if (btnLokasiSaya) {
    btnLokasiSaya.addEventListener("click", dapatkanLokasiSaya);
  }

  const btnToggleKoordinat = document.getElementById("btnToggleKoordinat");
  if (btnToggleKoordinat) {
    btnToggleKoordinat.addEventListener("click", toggleKoordinatDisplay);
  }

  const btnToggleTabel = document.getElementById("btnToggleTabel");
  if (btnToggleTabel) {
    btnToggleTabel.addEventListener("click", toggleTabel);
  }

  // Setup checkbox filter kategori
  setupFilterKategori();
}

// ============================================
// TAB SWITCHING
// ============================================

/**
 * Fungsi untuk switch antar tab di sidebar
 * @param {string} namaTab - Nama tab yang akan ditampilkan
 */
function switchTab(namaTab) {
  // Hapus class active dari semua tab button
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => btn.classList.remove("active"));

  // Tambah class active ke tab button yang diklik
  const activeBtn = document.querySelector(`.tab-btn[data-tab="${namaTab}"]`);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }

  // Sembunyikan semua tab content
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach((content) => content.classList.remove("active"));

  // Tampilkan tab content yang sesuai
  const activeContent = document.getElementById(
    `tab${namaTab.charAt(0).toUpperCase() + namaTab.slice(1)}`
  );
  if (activeContent) {
    activeContent.classList.add("active");
  }
}

// ============================================
// FORM TAMBAH FASILITAS
// ============================================

/**
 * Fungsi untuk handle submit form tambah fasilitas
 * @param {Event} e - Event object
 */
function tanganiSubmitFormTambah(e) {
  e.preventDefault();

  // Ambil data dari form
  const dataForm = {
    nama: document.getElementById("inputNama").value,
    kategori: document.getElementById("inputKategori").value,
    alamat: document.getElementById("inputAlamat").value,
    lat: document.getElementById("inputLat").value,
    lng: document.getElementById("inputLng").value,
    deskripsi: document.getElementById("inputDeskripsi").value,
  };

  // Panggil fungsi tambah fasilitas
  const berhasil = tambahFasilitas(dataForm);

  if (berhasil) {
    // Reset form
    resetFormTambah();
  }
}

/**
 * Fungsi untuk reset form tambah fasilitas
 */
function resetFormTambah() {
  // Gunakan fungsi reset yang baru
  resetFormCerdas();
}

// ============================================
// MODAL EDIT FASILITAS
// ============================================

/**
 * Fungsi untuk membuka modal edit
 * @param {string} id - ID fasilitas yang akan diedit
 */
function bukaModalEdit(id) {
  const fasilitas = ambilFasilitasById(id);

  if (!fasilitas) {
    tampilkanNotifikasi("error", "Fasilitas tidak ditemukan");
    return;
  }

  // Isi form edit dengan data fasilitas
  document.getElementById("editId").value = fasilitas.id;
  document.getElementById("editNama").value = fasilitas.nama;
  document.getElementById("editKategori").value = fasilitas.kategori;
  document.getElementById("editAlamat").value = fasilitas.alamat || "";
  document.getElementById("editLat").value = fasilitas.koordinat.lat;
  document.getElementById("editLng").value = fasilitas.koordinat.lng;
  document.getElementById("editDeskripsi").value = fasilitas.deskripsi || "";

  // Tampilkan modal
  const modal = document.getElementById("modalEdit");
  if (modal) {
    modal.classList.add("active");
  }

  // Tampilkan notifikasi instruksi
  tampilkanNotifikasi("info", "Klik pada peta untuk mengubah lokasi fasilitas");

  // Update icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/**
 * Fungsi untuk tutup modal edit
 */
function tutupModalEdit() {
  const modal = document.getElementById("modalEdit");
  if (modal) {
    modal.classList.remove("active");
  }

  // Reset form
  const formEdit = document.getElementById("formEdit");
  if (formEdit) {
    formEdit.reset();
  }

  // Hapus marker sementara
  hapusMarkerSementara();

  // Reset variabel global
  fasilitasYangDiedit = null;
}

/**
 * Fungsi untuk handle submit form edit
 * @param {Event} e - Event object
 */
function tanganiSubmitFormEdit(e) {
  e.preventDefault();

  const id = document.getElementById("editId").value;

  // Ambil data dari form edit
  const dataBaru = {
    nama: document.getElementById("editNama").value,
    kategori: document.getElementById("editKategori").value,
    alamat: document.getElementById("editAlamat").value,
    lat: document.getElementById("editLat").value,
    lng: document.getElementById("editLng").value,
    deskripsi: document.getElementById("editDeskripsi").value,
  };

  // Update fasilitas
  const berhasil = updateFasilitas(id, dataBaru);

  if (berhasil) {
    // Tutup modal
    tutupModalEdit();
  }
}

// ============================================
// TOAST NOTIFICATION
// ============================================

/**
 * Fungsi untuk menampilkan toast notification
 * @param {string} tipe - Tipe notifikasi: 'success', 'error', 'info', 'warning'
 * @param {string} pesan - Pesan yang akan ditampilkan
 */
function tampilkanNotifikasi(tipe, pesan) {
  const toast = document.getElementById("toast");
  const toastIcon = document.getElementById("toastIcon");
  const toastMessage = document.getElementById("toastMessage");

  if (!toast || !toastIcon || !toastMessage) return;

  // Hapus class tipe sebelumnya
  toast.className = "toast";

  // Tambah class untuk tipe
  toast.classList.add(tipe);

  // Set icon berdasarkan tipe
  let iconName = "info";
  switch (tipe) {
    case "success":
      iconName = "check-circle";
      break;
    case "error":
      iconName = "x-circle";
      break;
    case "warning":
      iconName = "alert-circle";
      break;
    case "info":
      iconName = "info";
      break;
  }

  toastIcon.setAttribute("data-lucide", iconName);
  toastMessage.textContent = pesan;

  // Update Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Tampilkan toast
  toast.classList.add("active");

  // Sembunyikan setelah 3 detik
  setTimeout(() => {
    toast.classList.remove("active");
  }, 3000);
}

// ============================================
// CHART KATEGORI (PIE CHART)
// ============================================

/**
 * Fungsi untuk membuat/update chart kategori
 */
function updateChartKategori() {
  const ctx = document.getElementById("chartKategori");

  if (!ctx) return;

  // Hitung jumlah per kategori
  const kategoriCount = {};

  daftarFasilitas.forEach((fasilitas) => {
    if (kategoriCount[fasilitas.kategori]) {
      kategoriCount[fasilitas.kategori]++;
    } else {
      kategoriCount[fasilitas.kategori] = 1;
    }
  });

  // Siapkan data untuk chart
  const labels = Object.keys(kategoriCount);
  const data = Object.values(kategoriCount);
  const colors = labels.map((kategori) => getWarnaKategori(kategori));

  // Hapus chart lama jika ada
  if (chartKategori) {
    chartKategori.destroy();
  }

  // Buat chart baru
  chartKategori = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderColor: "#1e293b",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#f1f5f9",
            padding: 10,
            font: {
              size: 12,
              family: "Inter",
            },
          },
        },
        tooltip: {
          backgroundColor: "#0f172a",
          titleColor: "#f1f5f9",
          bodyColor: "#94a3b8",
          borderColor: "#475569",
          borderWidth: 1,
          padding: 12,
          displayColors: true,
        },
      },
    },
  });
}

// ============================================
// FILTER KATEGORI (CHECKBOX)
// ============================================

/**
 * Fungsi untuk setup checkbox filter kategori
 */
function setupFilterKategori() {
  const container = document.getElementById("filterKategori");

  if (!container) return;

  // Build checkbox untuk setiap kategori
  let htmlCheckbox = "";

  DAFTAR_KATEGORI.forEach((kategori) => {
    const warna = getWarnaKategori(kategori);

    htmlCheckbox += `
      <div class="checkbox-item">
        <input type="checkbox" id="filter-${kategori}" value="${kategori}">
        <label for="filter-${kategori}">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${warna}; margin-right: 8px;"></span>
          ${kategori}
        </label>
      </div>
    `;
  });

  container.innerHTML = htmlCheckbox;

  // Setup event listener untuk setiap checkbox
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      // Ambil semua kategori yang dicek
      const kategoriTerpilih = Array.from(checkboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);

      // Filter data
      filterByKategori(kategoriTerpilih);
    });
  });
}

// ============================================
// EXPORT & IMPORT
// ============================================

/**
 * Fungsi untuk export data ke JSON
 */
function eksporJSON() {
  if (daftarFasilitas.length === 0) {
    tampilkanNotifikasi("warning", "Tidak ada data untuk diexport");
    return;
  }

  const namaFile = `fasilitas_${new Date().toISOString().split("T")[0]}`;
  const berhasil = downloadJSON(daftarFasilitas, namaFile);

  if (berhasil) {
    tampilkanNotifikasi("success", "Data berhasil diexport ke JSON");
  } else {
    tampilkanNotifikasi("error", "Gagal export data");
  }
}

/**
 * Fungsi untuk export data ke GeoJSON
 */
function eksporGeoJSON() {
  if (daftarFasilitas.length === 0) {
    tampilkanNotifikasi("warning", "Tidak ada data untuk diexport");
    return;
  }

  const namaFile = `fasilitas_geojson_${
    new Date().toISOString().split("T")[0]
  }`;
  const berhasil = downloadGeoJSON(daftarFasilitas, namaFile);

  if (berhasil) {
    tampilkanNotifikasi("success", "Data berhasil diexport ke GeoJSON");
  } else {
    tampilkanNotifikasi("error", "Gagal export GeoJSON");
  }
}

/**
 * Fungsi untuk handle import file JSON
 * @param {Event} e - Event object
 */
async function tanganiImportFile(e) {
  const file = e.target.files[0];

  if (!file) return;

  // Cek apakah file JSON
  if (!file.name.endsWith(".json")) {
    tampilkanNotifikasi("error", "Hanya file JSON yang didukung");
    return;
  }

  try {
    // Baca file
    const text = await file.text();
    const data = JSON.parse(text);

    // Validasi apakah array
    if (!Array.isArray(data)) {
      tampilkanNotifikasi("error", "Format file tidak valid");
      return;
    }

    // Konfirmasi
    const hasil = await Swal.fire({
      title: "Import Data?",
      html: `Ditemukan <strong>${data.length}</strong> data.<br>Import akan mengganti semua data yang ada.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Import!",
      cancelButtonText: "Batal",
      background: "#1e293b",
      color: "#f1f5f9",
    });

    if (!hasil.isConfirmed) {
      return;
    }

    // Replace data
    daftarFasilitas = data;
    daftarFasilitasFilter = [...daftarFasilitas];

    // Simpan ke localStorage
    simpanDataFasilitas();

    // Update UI
    renderTabelFasilitas();
    renderSemuaMarker(daftarFasilitas);
    updateStatistik();
    updateChartKategori();

    tampilkanNotifikasi("success", `${data.length} data berhasil diimport`);

    // Reset input file
    e.target.value = "";
  } catch (error) {
    console.error("Gagal import file:", error);
    tampilkanNotifikasi(
      "error",
      "Gagal membaca file. Pastikan format JSON valid."
    );
  }
}

// ============================================
// TOGGLE TABEL
// ============================================

/**
 * Fungsi untuk toggle tampilan tabel (collapse/expand)
 */
function toggleTabel() {
  const tableContainer = document.getElementById("tableContainer");

  if (tableContainer) {
    tableContainer.classList.toggle("collapsed");
  }
}

// ============================================
// LIHAT DETAIL FASILITAS (DARI POPUP)
// ============================================

/**
 * Fungsi untuk lihat detail fasilitas (scroll ke tabel dan highlight)
 * @param {string} id - ID fasilitas
 */
function lihatDetailFasilitas(id) {
  // Tutup popup peta
  peta.closePopup();

  // Scroll ke tabel
  scrollKeElement(".table-container");

  // Delay sebentar lalu highlight row
  setTimeout(() => {
    highlightRowTabel(id);
  }, 300);
}

// ============================================
// LOADING SCREEN
// ============================================

/**
 * Fungsi untuk sembunyikan loading screen
 */
function sembunyikanLoading() {
  const loadingScreen = document.getElementById("loadingScreen");

  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add("hidden");
    }, 500);
  }
}
