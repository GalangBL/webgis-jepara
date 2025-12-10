// ============================================
// APLIKASI UTAMA - WEBGIS FASILITAS UMUM
// File: app.js
// Deskripsi: File utama yang menginisialisasi aplikasi
// ============================================

/**
 * Fungsi utama yang dijalankan saat DOM sudah ready
 * Entry point aplikasi
 */
document.addEventListener("DOMContentLoaded", function () {
  logConsole("========================================", "info");
  logConsole("WebGIS Fasilitas Umum - Starting...", "info");
  logConsole("========================================", "info");

  // 1. Inisialisasi Peta Leaflet
  try {
    inisialisasiPeta();
    logConsole("✓ Peta berhasil diinisialisasi", "success");
  } catch (error) {
    console.error("✗ Gagal inisialisasi peta:", error);
  }

  // 2. Load Data dari localStorage
  try {
    muatDataFasilitas();
    logConsole("✓ Data fasilitas dimuat", "success");
  } catch (error) {
    console.error("✗ Gagal load data:", error);
  }

  // 3. Setup Event Listeners
  try {
    setupEventListeners();
    logConsole("✓ Event listeners terpasang", "success");
  } catch (error) {
    console.error("✗ Gagal setup event listeners:", error);
  }

  // 4. Setup Filter Kategori
  try {
    setupFilterKategori();
    logConsole("✓ Filter kategori siap", "success");
  } catch (error) {
    console.error("✗ Gagal setup filter:", error);
  }

  // 5. Setup Pencarian Cerdas
  try {
    setupPencarianCerdas();
    logConsole("✓ Pencarian cerdas siap", "success");
  } catch (error) {
    console.error("✗ Gagal setup pencarian cerdas:", error);
  }

  // 6. Update Chart
  try {
    updateChartKategori();
    logConsole("✓ Chart kategori dirender", "success");
  } catch (error) {
    console.error("✗ Gagal render chart:", error);
  }

  // 7. Inisialisasi Lucide Icons
  try {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
      logConsole("✓ Lucide icons diinisialisasi", "success");
    }
  } catch (error) {
    console.error("✗ Gagal inisialisasi icons:", error);
  }

  // 8. Sembunyikan Loading Screen
  sembunyikanLoading();

  logConsole("========================================", "info");
  logConsole("✓ Aplikasi siap digunakan!", "success");
  logConsole("========================================", "info");

  // Tampilkan welcome notification
  setTimeout(() => {
    tampilkanNotifikasi("success", "Selamat datang di WebGIS Fasilitas Umum!");
  }, 1000);
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

/**
 * Handle error yang tidak tertangkap
 */
window.addEventListener("error", function (event) {
  console.error("Global Error:", event.error);
  tampilkanNotifikasi("error", "Terjadi kesalahan. Silakan refresh halaman.");
});

/**
 * Handle promise rejection yang tidak tertangkap
 */
window.addEventListener("unhandledrejection", function (event) {
  console.error("Unhandled Promise Rejection:", event.reason);
  tampilkanNotifikasi("error", "Terjadi kesalahan pada operasi asynchronous.");
});

// ============================================
// KEYBOARD SHORTCUTS (OPTIONAL)
// ============================================

/**
 * Setup keyboard shortcuts untuk akses cepat
 */
document.addEventListener("keydown", function (e) {
  // Ctrl + N: Fokus ke form tambah fasilitas
  if (e.ctrlKey && e.key === "n") {
    e.preventDefault();
    switchTab("form");
    document.getElementById("inputNama")?.focus();
  }

  // Ctrl + F: Fokus ke search
  if (e.ctrlKey && e.key === "f") {
    e.preventDefault();
    switchTab("filter");
    document.getElementById("inputCari")?.focus();
  }

  // Ctrl + S: Fokus ke stats
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    switchTab("stats");
  }

  // ESC: Tutup modal jika terbuka
  if (e.key === "Escape") {
    const modal = document.getElementById("modalEdit");
    if (modal && modal.classList.contains("active")) {
      tutupModalEdit();
    }
  }
});

// ============================================
// CONSOLE INFO (DEVELOPMENT)
// ============================================

console.log(
  "%c🗺️ WebGIS Fasilitas Umum",
  "font-size: 20px; font-weight: bold; color: #3b82f6;"
);
console.log(
  "%cSistem Informasi Geografis Berbasis Web",
  "font-size: 12px; color: #94a3b8;"
);
console.log(
  "%cDeveloped with ❤️ using Leaflet.js, Chart.js, SweetAlert2",
  "font-size: 10px; color: #64748b;"
);
console.log("");
console.log("%cKeyboard Shortcuts:", "font-weight: bold; color: #10b981;");
console.log("  Ctrl + N : Tambah Fasilitas Baru");
console.log("  Ctrl + F : Cari/Filter Data");
console.log("  Ctrl + S : Lihat Statistik");
console.log("  ESC      : Tutup Modal");
console.log("");

// ============================================
// EXPOSE KE GLOBAL (UNTUK DEBUGGING)
// ============================================

// Hanya di development mode
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  window.debugWebGIS = {
    daftarFasilitas,
    peta,
    grupMarker,
    resetData: function () {
      if (confirm("Reset semua data? Tindakan ini tidak dapat dibatalkan!")) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    },
    exportData: function () {
      console.log(JSON.stringify(daftarFasilitas, null, 2));
    },
  };

  console.log(
    "%c[DEBUG] window.debugWebGIS tersedia untuk debugging",
    "color: #f59e0b; font-weight: bold;"
  );
}
