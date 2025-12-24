// ============================================
// ERROR HANDLER & FALLBACK FUNCTIONS
// File: error-handler.js
// Deskripsi: Menangani error dan menyediakan fallback untuk fungsi yang mungkin gagal
// ============================================

/**
 * Global error handler untuk menangkap error yang tidak tertangkap
 */
window.addEventListener("error", function (event) {
  console.error("Global Error:", event.error);

  // Jangan tampilkan notifikasi untuk error minor
  if (event.error && event.error.message) {
    const message = event.error.message.toLowerCase();

    // Skip error untuk resource loading (CDN, images, etc)
    if (
      message.includes("loading") ||
      message.includes("network") ||
      message.includes("fetch")
    ) {
      return;
    }

    // Tampilkan notifikasi untuk error serius
    if (typeof tampilkanNotifikasi === "function") {
      tampilkanNotifikasi(
        "error",
        "Terjadi kesalahan. Silakan refresh halaman jika masalah berlanjut."
      );
    }
  }
});

/**
 * Handler untuk promise rejection yang tidak tertangkap
 */
window.addEventListener("unhandledrejection", function (event) {
  console.error("Unhandled Promise Rejection:", event.reason);

  // Prevent default browser behavior
  event.preventDefault();

  // Log untuk debugging
  if (typeof logConsole === "function") {
    logConsole(`Promise rejection: ${event.reason}`, "error");
  }
});

/**
 * Fungsi untuk memastikan dependencies tersedia
 */
function checkDependencies() {
  const dependencies = [
    { name: "Leaflet", check: () => typeof L !== "undefined" },
    { name: "Chart.js", check: () => typeof Chart !== "undefined" },
    { name: "SweetAlert2", check: () => typeof Swal !== "undefined" },
    { name: "Lucide Icons", check: () => typeof lucide !== "undefined" },
  ];

  const missing = [];

  dependencies.forEach((dep) => {
    try {
      if (!dep.check()) {
        missing.push(dep.name);
      }
    } catch (error) {
      missing.push(dep.name);
    }
  });

  if (missing.length > 0) {
    console.warn("Missing dependencies:", missing);

    if (typeof tampilkanNotifikasi === "function") {
      tampilkanNotifikasi(
        "warning",
        `Beberapa fitur mungkin tidak tersedia: ${missing.join(", ")}`
      );
    }
  }

  return missing.length === 0;
}

/**
 * Fungsi untuk retry operasi yang gagal
 */
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }

      console.warn(`Operation failed, retrying... (${i + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Fungsi untuk safe function call dengan fallback
 */
function safeCall(fn, fallback = null, ...args) {
  try {
    if (typeof fn === "function") {
      return fn(...args);
    } else {
      console.warn("Function not available:", fn);
      return fallback;
    }
  } catch (error) {
    console.error("Error calling function:", error);
    return fallback;
  }
}

/**
 * Fungsi untuk safe DOM manipulation
 */
function safeGetElement(id) {
  try {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element not found: ${id}`);
    }
    return element;
  } catch (error) {
    console.error(`Error getting element ${id}:`, error);
    return null;
  }
}

/**
 * Fungsi untuk safe event listener attachment
 */
function safeAddEventListener(elementId, event, handler) {
  try {
    const element = safeGetElement(elementId);
    if (element && typeof handler === "function") {
      element.addEventListener(event, handler);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error adding event listener to ${elementId}:`, error);
    return false;
  }
}

/**
 * Fungsi untuk memvalidasi dan membersihkan input
 */
function sanitizeInput(input) {
  if (typeof input !== "string") {
    return "";
  }

  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
}

/**
 * Fungsi untuk safe localStorage operations
 */
const safeStorage = {
  get: function (key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return defaultValue;
    }
  },

  set: function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error writing to localStorage:", error);
      return false;
    }
  },

  remove: function (key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing from localStorage:", error);
      return false;
    }
  },
};

/**
 * Fungsi untuk network connectivity check
 */
async function checkNetworkConnectivity() {
  try {
    const response = await fetch("https://www.google.com/favicon.ico", {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-cache",
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Initialize error handling when DOM is ready
 */
document.addEventListener("DOMContentLoaded", function () {
  // Check dependencies after a short delay
  setTimeout(() => {
    checkDependencies();
  }, 2000);

  // Check network connectivity
  checkNetworkConnectivity().then((isOnline) => {
    if (!isOnline) {
      console.warn("Network connectivity issues detected");
      if (typeof tampilkanNotifikasi === "function") {
        tampilkanNotifikasi(
          "warning",
          "Koneksi internet terbatas. Beberapa fitur mungkin tidak berfungsi optimal."
        );
      }
    }
  });
});

// Export functions for use in other modules
if (typeof window !== "undefined") {
  window.errorHandler = {
    checkDependencies,
    retryOperation,
    safeCall,
    safeGetElement,
    safeAddEventListener,
    sanitizeInput,
    safeStorage,
    checkNetworkConnectivity,
  };
}
