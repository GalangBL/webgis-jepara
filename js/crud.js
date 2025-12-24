// ============================================
// MODUL CRUD FASILITAS
// File: crud.js
// Deskripsi: Mengelola operasi Create, Read, Update, Delete fasilitas dengan localStorage
// ============================================

// ============================================
// VARIABEL GLOBAL CRUD
// ============================================

let daftarFasilitas = []; // Array untuk menyimpan semua data fasilitas
let daftarFasilitasFilter = []; // Array hasil filter (untuk search/filter)
const STORAGE_KEY = "webgis_fasilitas"; // Key untuk localStorage

// Pagination
let halamanSekarang = 1;
const itemPerHalaman = 10;

// ============================================
// LOAD DATA DARI LOCALSTORAGE
// ============================================

/**
 * Fungsi untuk memuat data fasilitas dari localStorage
 * Dipanggil saat aplikasi pertama kali dimuat
 */
function muatDataFasilitas() {
  try {
    const dataLokal = ambilDariLokalStorage(STORAGE_KEY, []);

    if (Array.isArray(dataLokal)) {
      daftarFasilitas = dataLokal;
      daftarFasilitasFilter = [...daftarFasilitas];
      logConsole(
        `${daftarFasilitas.length} fasilitas dimuat dari localStorage`,
        "success"
      );
    } else {
      daftarFasilitas = [];
      daftarFasilitasFilter = [];
    }

    // Render ke UI
    renderTabelFasilitas();
    renderSemuaMarker(daftarFasilitas);
    updateStatistik();
    updateChartKategori();
  } catch (error) {
    console.error("Gagal memuat data:", error);
    daftarFasilitas = [];
    daftarFasilitasFilter = [];
  }
}

// ============================================
// SIMPAN DATA KE LOCALSTORAGE
// ============================================

/**
 * Fungsi untuk menyimpan semua data fasilitas ke localStorage
 * @returns {boolean} - True jika berhasil
 */
function simpanDataFasilitas() {
  try {
    const berhasil = simpanKeLokalStorage(STORAGE_KEY, daftarFasilitas);

    if (berhasil) {
      logConsole("Data berhasil disimpan ke localStorage", "success");
    }

    return berhasil;
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    return false;
  }
}

// ============================================
// CREATE - TAMBAH FASILITAS BARU
// ============================================

/**
 * Fungsi untuk menambah fasilitas baru
 * @param {object} dataFasilitas - Data fasilitas baru
 * @returns {boolean} - True jika berhasil
 */
function tambahFasilitas(dataFasilitas) {
  try {
    // Validasi data
    if (!validasiDataFasilitas(dataFasilitas)) {
      tampilkanNotifikasi("error", "Data tidak valid. Mohon periksa kembali.");
      return false;
    }

    // Buat object fasilitas lengkap
    const fasilitasBaru = {
      id: buatIdUnik(),
      nama: dataFasilitas.nama.trim(),
      kategori: dataFasilitas.kategori,
      alamat: dataFasilitas.alamat ? dataFasilitas.alamat.trim() : "",
      koordinat: {
        lat: parseFloat(dataFasilitas.lat),
        lng: parseFloat(dataFasilitas.lng),
      },
      deskripsi: dataFasilitas.deskripsi ? dataFasilitas.deskripsi.trim() : "",
      waktuDibuat: new Date().toISOString(),
      waktuDiubah: null,
    };

    // Tambahkan ke array
    daftarFasilitas.push(fasilitasBaru);
    daftarFasilitasFilter.push(fasilitasBaru);

    // Simpan ke localStorage
    simpanDataFasilitas();

    // Update UI
    renderTabelFasilitas();
    tambahMarkerFasilitas(fasilitasBaru);
    updateStatistik();
    updateChartKategori();

    // Hapus marker sementara
    hapusMarkerSementara();

    // Notifikasi sukses
    tampilkanNotifikasi(
      "success",
      `Fasilitas "${fasilitasBaru.nama}" berhasil ditambahkan!`
    );

    // Zoom ke marker baru
    setTimeout(() => {
      panKeMarker(fasilitasBaru.id);
    }, 500);

    logConsole(`Fasilitas baru ditambahkan: ${fasilitasBaru.nama}`, "success");

    return true;
  } catch (error) {
    console.error("Gagal menambah fasilitas:", error);
    tampilkanNotifikasi(
      "error",
      "Gagal menambah fasilitas. Silakan coba lagi."
    );
    return false;
  }
}

// ============================================
// READ - AMBIL DATA FASILITAS
// ============================================

/**
 * Fungsi untuk mengambil satu fasilitas berdasarkan ID
 * @param {string} id - ID fasilitas
 * @returns {object|null} - Object fasilitas atau null
 */
function ambilFasilitasById(id) {
  return daftarFasilitas.find((fasilitas) => fasilitas.id === id) || null;
}

/**
 * Fungsi untuk mengambil semua fasilitas
 * @returns {Array} - Array semua fasilitas
 */
function ambilSemuaFasilitas() {
  return [...daftarFasilitas];
}

/**
 * Fungsi untuk mengambil fasilitas berdasarkan kategori
 * @param {string} kategori - Nama kategori
 * @returns {Array} - Array fasilitas dengan kategori tertentu
 */
function ambilFasilitasByKategori(kategori) {
  return daftarFasilitas.filter((fasilitas) => fasilitas.kategori === kategori);
}

// ============================================
// UPDATE - EDIT FASILITAS
// ============================================

/**
 * Fungsi untuk update/edit data fasilitas existing
 * @param {string} id - ID fasilitas yang akan diupdate
 * @param {object} dataBaru - Data baru untuk fasilitas
 * @returns {boolean} - True jika berhasil
 */
function updateFasilitas(id, dataBaru) {
  try {
    // Cari index fasilitas
    const index = daftarFasilitas.findIndex((f) => f.id === id);

    if (index === -1) {
      tampilkanNotifikasi("error", "Fasilitas tidak ditemukan.");
      return false;
    }

    // Validasi data baru
    if (!validasiDataFasilitas(dataBaru)) {
      tampilkanNotifikasi("error", "Data tidak valid. Mohon periksa kembali.");
      return false;
    }

    // Update data (manual, untuk mempertahankan waktuDibuat)
    const fasilitasLama = daftarFasilitas[index];

    daftarFasilitas[index] = {
      id: id,
      nama: dataBaru.nama.trim(),
      kategori: dataBaru.kategori,
      alamat: dataBaru.alamat ? dataBaru.alamat.trim() : "",
      koordinat: {
        lat: parseFloat(dataBaru.lat),
        lng: parseFloat(dataBaru.lng),
      },
      deskripsi: dataBaru.deskripsi ? dataBaru.deskripsi.trim() : "",
      waktuDibuat: fasilitasLama.waktuDibuat,
      waktuDiubah: new Date().toISOString(),
    };

    // Update di array filter juga
    const indexFilter = daftarFasilitasFilter.findIndex((f) => f.id === id);
    if (indexFilter !== -1) {
      daftarFasilitasFilter[indexFilter] = daftarFasilitas[index];
    }

    // Simpan ke localStorage
    simpanDataFasilitas();

    // Update UI
    renderTabelFasilitas();
    updateMarker(id, daftarFasilitas[index]);
    updateStatistik();
    updateChartKategori();

    // Notifikasi sukses
    tampilkanNotifikasi(
      "success",
      `Fasilitas "${daftarFasilitas[index].nama}" berhasil diupdate!`
    );

    logConsole(`Fasilitas ${id} berhasil diupdate`, "success");

    return true;
  } catch (error) {
    console.error("Gagal update fasilitas:", error);
    tampilkanNotifikasi("error", "Gagal update fasilitas. Silakan coba lagi.");
    return false;
  }
}

// ============================================
// DELETE - HAPUS FASILITAS
// ============================================

/**
 * Fungsi untuk menghapus fasilitas
 * @param {string} id - ID fasilitas yang akan dihapus
 * @returns {boolean} - True jika berhasil
 */
async function hapusFasilitas(id) {
  try {
    // Cari fasilitas
    const fasilitas = ambilFasilitasById(id);

    if (!fasilitas) {
      tampilkanNotifikasi("error", "Fasilitas tidak ditemukan.");
      return false;
    }

    // Konfirmasi dengan SweetAlert2
    const hasil = await Swal.fire({
      title: "Hapus Fasilitas?",
      html: `Apakah Anda yakin ingin menghapus:<br><strong>${fasilitas.nama}</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      background: "#1e293b",
      color: "#f1f5f9",
    });

    if (!hasil.isConfirmed) {
      return false;
    }

    // Hapus dari array
    daftarFasilitas = daftarFasilitas.filter((f) => f.id !== id);
    daftarFasilitasFilter = daftarFasilitasFilter.filter((f) => f.id !== id);

    // Simpan ke localStorage
    simpanDataFasilitas();

    // Update UI
    renderTabelFasilitas();
    hapusMarker(id);
    updateStatistik();
    updateChartKategori();

    // Notifikasi sukses
    tampilkanNotifikasi(
      "success",
      `Fasilitas "${fasilitas.nama}" berhasil dihapus!`
    );

    logConsole(`Fasilitas ${id} berhasil dihapus`, "success");

    return true;
  } catch (error) {
    console.error("Gagal hapus fasilitas:", error);
    tampilkanNotifikasi("error", "Gagal hapus fasilitas. Silakan coba lagi.");
    return false;
  }
}

// ============================================
// VALIDASI DATA FASILITAS
// ============================================

/**
 * Fungsi untuk validasi data fasilitas sebelum disimpan
 * @param {object} data - Data yang akan divalidasi
 * @returns {boolean} - True jika valid
 */
function validasiDataFasilitas(data) {
  // Cek nama
  if (!tidakKosong(data.nama)) {
    tampilkanNotifikasi("error", "Nama fasilitas harus diisi");
    return false;
  }

  // Cek kategori
  if (!tidakKosong(data.kategori)) {
    tampilkanNotifikasi("error", "Kategori fasilitas harus dipilih");
    return false;
  }

  // Cek koordinat
  if (!adalahAngka(data.lat) || !adalahAngka(data.lng)) {
    tampilkanNotifikasi("error", "Koordinat tidak valid");
    return false;
  }

  const lat = parseFloat(data.lat);
  const lng = parseFloat(data.lng);

  // Validasi koordinat dalam wilayah Jepara
  if (!validasiKoordinatJepara(lat, lng)) {
    tampilkanNotifikasi(
      "error",
      "Koordinat harus berada dalam wilayah Kabupaten Jepara"
    );
    return false;
  }

  return true;
}

// ============================================
// RENDER TABEL FASILITAS
// ============================================

/**
 * Fungsi untuk merender tabel data fasilitas
 */
function renderTabelFasilitas() {
  const tbody = document.getElementById("tabelFasilitas");

  if (!tbody) {
    console.error("Element tabelFasilitas tidak ditemukan");
    return;
  }

  // Jika tidak ada data
  if (daftarFasilitasFilter.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="6">
          <i data-lucide="inbox"></i>
          <p>Belum ada data fasilitas</p>
          <small>Klik pada peta atau isi form untuk menambah data</small>
        </td>
      </tr>
    `;

    // Update icons
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

    return;
  }

  // Hitung data untuk halaman sekarang
  const indexAwal = (halamanSekarang - 1) * itemPerHalaman;
  const indexAkhir = indexAwal + itemPerHalaman;
  const dataHalamanIni = daftarFasilitasFilter.slice(indexAwal, indexAkhir);

  // Build HTML rows
  let htmlRows = "";

  dataHalamanIni.forEach((fasilitas, idx) => {
    const nomer = indexAwal + idx + 1;

    htmlRows += `
      <tr data-id="${fasilitas.id}" onclick="highlightRowTabel('${
      fasilitas.id
    }')">
        <td>${nomer}</td>
        <td><strong>${escapeHTML(fasilitas.nama)}</strong></td>
        <td>
          <span class="badge" style="background: ${getWarnaKategori(
            fasilitas.kategori
          )}">
            ${escapeHTML(fasilitas.kategori)}
          </span>
        </td>
        <td>${escapeHTML(fasilitas.alamat || "-")}</td>
        <td>
          <small>${formatKoordinat(
            fasilitas.koordinat.lat,
            fasilitas.koordinat.lng,
            4
          )}</small>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-action btn-view" onclick="event.stopPropagation(); panKeMarker('${
              fasilitas.id
            }')" title="Lihat di Peta">
              <i data-lucide="eye"></i>
            </button>
            <button class="btn-action btn-edit" onclick="event.stopPropagation(); bukaModalEdit('${
              fasilitas.id
            }')" title="Edit">
              <i data-lucide="pencil"></i>
            </button>
            <button class="btn-action btn-delete" onclick="event.stopPropagation(); hapusFasilitas('${
              fasilitas.id
            }')" title="Hapus">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = htmlRows;

  // Update total data di UI
  const totalDataEl = document.getElementById("totalData");
  if (totalDataEl) {
    totalDataEl.textContent = daftarFasilitasFilter.length;
  }

  // Render pagination
  renderPagination();

  // Update Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// ============================================
// PAGINATION
// ============================================

/**
 * Fungsi untuk render kontrol pagination
 */
function renderPagination() {
  const paginationEl = document.getElementById("pagination");

  if (!paginationEl) return;

  const totalHalaman = Math.ceil(daftarFasilitasFilter.length / itemPerHalaman);

  // Jika hanya 1 halaman atau tidak ada data, sembunyikan pagination
  if (totalHalaman <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  let htmlPagination = '<div class="pagination-controls">';

  // Tombol Previous
  htmlPagination += `
    <button class="pagination-btn ${halamanSekarang === 1 ? "disabled" : ""}" 
            onclick="gantiHalaman(${halamanSekarang - 1})"
            ${halamanSekarang === 1 ? "disabled" : ""}>
      <i data-lucide="chevron-left"></i>
      Prev
    </button>
  `;

  // Nomor halaman
  htmlPagination += '<div class="pagination-numbers">';

  for (let i = 1; i <= totalHalaman; i++) {
    // Tampilkan maksimal 5 nomor halaman
    if (
      i === 1 ||
      i === totalHalaman ||
      (i >= halamanSekarang - 1 && i <= halamanSekarang + 1)
    ) {
      htmlPagination += `
        <button class="pagination-number ${
          i === halamanSekarang ? "active" : ""
        }"
                onclick="gantiHalaman(${i})">
          ${i}
        </button>
      `;
    } else if (i === halamanSekarang - 2 || i === halamanSekarang + 2) {
      htmlPagination += '<span class="pagination-dots">...</span>';
    }
  }

  htmlPagination += "</div>";

  // Tombol Next
  htmlPagination += `
    <button class="pagination-btn ${
      halamanSekarang === totalHalaman ? "disabled" : ""
    }"
            onclick="gantiHalaman(${halamanSekarang + 1})"
            ${halamanSekarang === totalHalaman ? "disabled" : ""}>
      Next
      <i data-lucide="chevron-right"></i>
    </button>
  `;

  htmlPagination += "</div>";

  paginationEl.innerHTML = htmlPagination;

  // Update icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/**
 * Fungsi untuk ganti halaman pagination
 * @param {number} halaman - Nomor halaman tujuan
 */
function gantiHalaman(halaman) {
  const totalHalaman = Math.ceil(daftarFasilitasFilter.length / itemPerHalaman);

  if (halaman < 1 || halaman > totalHalaman) {
    return;
  }

  halamanSekarang = halaman;
  renderTabelFasilitas();

  // Scroll ke tabel
  scrollKeElement(".table-container");
}

// ============================================
// HIGHLIGHT ROW TABEL
// ============================================

/**
 * Fungsi untuk highlight row di tabel dan pan ke marker
 * @param {string} id - ID fasilitas
 */
function highlightRowTabel(id) {
  // Hapus highlight sebelumnya
  const allRows = document.querySelectorAll(".data-table tbody tr");
  allRows.forEach((row) => row.classList.remove("highlighted"));

  // Tambah highlight ke row yang diklik
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (row) {
    row.classList.add("highlighted");

    // Auto-remove highlight setelah 3 detik
    setTimeout(() => {
      row.classList.remove("highlighted");
    }, 3000);
  }

  // Pan peta ke marker
  panKeMarker(id);
}

// ============================================
// FILTER & SEARCH
// ============================================

/**
 * Fungsi untuk filter data berdasarkan keyword pencarian
 * @param {string} keyword - Keyword pencarian
 */
function cariPasilitas(keyword) {
  if (!keyword || keyword.trim() === "") {
    // Jika kosong, tampilkan semua
    daftarFasilitasFilter = [...daftarFasilitas];
  } else {
    const keywordLower = keyword.toLowerCase().trim();

    daftarFasilitasFilter = daftarFasilitas.filter((fasilitas) => {
      return (
        fasilitas.nama.toLowerCase().includes(keywordLower) ||
        fasilitas.kategori.toLowerCase().includes(keywordLower) ||
        (fasilitas.alamat &&
          fasilitas.alamat.toLowerCase().includes(keywordLower)) ||
        (fasilitas.deskripsi &&
          fasilitas.deskripsi.toLowerCase().includes(keywordLower))
      );
    });
  }

  // Reset ke halaman 1
  halamanSekarang = 1;

  // Render ulang
  renderTabelFasilitas();
  renderSemuaMarker(daftarFasilitasFilter);
}

/**
 * Fungsi untuk filter berdasarkan kategori (multi-select)
 * @param {Array} kategoriDipilih - Array kategori yang dipilih
 */
function filterByKategori(kategoriDipilih) {
  if (!kategoriDipilih || kategoriDipilih.length === 0) {
    // Jika tidak ada yang dipilih, tampilkan semua
    daftarFasilitasFilter = [...daftarFasilitas];
  } else {
    daftarFasilitasFilter = daftarFasilitas.filter((fasilitas) => {
      return kategoriDipilih.includes(fasilitas.kategori);
    });
  }

  // Reset ke halaman 1
  halamanSekarang = 1;

  // Render ulang
  renderTabelFasilitas();
  renderSemuaMarker(daftarFasilitasFilter);
}

/**
 * Fungsi untuk reset semua filter
 */
function resetFilter() {
  daftarFasilitasFilter = [...daftarFasilitas];
  halamanSekarang = 1;

  // Reset input search
  const inputCari = document.getElementById("inputCari");
  if (inputCari) {
    inputCari.value = "";
  }

  // Uncheck semua checkbox kategori
  const checkboxes = document.querySelectorAll(
    '#filterKategori input[type="checkbox"]'
  );
  checkboxes.forEach((cb) => (cb.checked = false));

  // Render ulang
  renderTabelFasilitas();
  renderSemuaMarker(daftarFasilitas);

  tampilkanNotifikasi("info", "Filter direset");
}

// ============================================
// UPDATE STATISTIK
// ============================================

/**
 * Fungsi untuk update statistik di header dan sidebar
 */
function updateStatistik() {
  // Total fasilitas
  const totalFasilitasEl = document.getElementById("totalFasilitas");
  if (totalFasilitasEl) {
    totalFasilitasEl.textContent = daftarFasilitas.length;
  }

  // Hitung per kategori
  const jumlahSekolah = daftarFasilitas.filter(
    (f) => f.kategori === "Sekolah"
  ).length;
  const jumlahRumahSakit = daftarFasilitas.filter(
    (f) => f.kategori === "Rumah Sakit"
  ).length;

  const totalSekolahEl = document.getElementById("totalSekolah");
  const totalRumahSakitEl = document.getElementById("totalRumahSakit");

  if (totalSekolahEl) totalSekolahEl.textContent = jumlahSekolah;
  if (totalRumahSakitEl) totalRumahSakitEl.textContent = jumlahRumahSakit;

  // Update detail stats di sidebar
  updateStatsDetail();
}

/**
 * Fungsi untuk update detail stats per kategori di sidebar
 */
function updateStatsDetail() {
  const statsDetailEl = document.getElementById("statsDetail");

  if (!statsDetailEl) return;

  // Hitung jumlah per kategori
  const kategoriCount = {};

  daftarFasilitas.forEach((fasilitas) => {
    if (kategoriCount[fasilitas.kategori]) {
      kategoriCount[fasilitas.kategori]++;
    } else {
      kategoriCount[fasilitas.kategori] = 1;
    }
  });

  // Build HTML
  let htmlStats = "";

  for (let kategori in kategoriCount) {
    htmlStats += `
      <div class="stats-item">
        <span class="stats-item-label">${kategori}</span>
        <span class="stats-item-value">${kategoriCount[kategori]}</span>
      </div>
    `;
  }

  if (htmlStats === "") {
    htmlStats =
      '<p style="color: var(--text-muted); text-align: center;">Belum ada data</p>';
  }

  statsDetailEl.innerHTML = htmlStats;
}
