// src/main.js

import './style.css';
import ScrollReveal from 'scrollreveal';

// Fungsi untuk menandai link navigasi yang aktif
const setActiveLink = () => {
    const cleanPath = (path) => {
        if (path.endsWith('index.html')) {
            return path.substring(0, path.length - 'index.html'.length);
        }
        if (path.length > 1 && path.endsWith('/')) {
            return path.slice(0, -1);
        }
        return path;
    };

    const currentPath = cleanPath(window.location.pathname);

    // --- Menu Desktop ---
    const desktopLinks = document.querySelectorAll('header > nav .nav-link');
    desktopLinks.forEach(link => {
        link.classList.remove('active-nav');
        const linkPath = cleanPath(new URL(link.href).pathname);

        // Menambahkan kondisi untuk halaman fasilitas
        if (linkPath === currentPath || (currentPath === '/fasilitas.html' && linkPath === '/profil.html')) {
            link.classList.add('active-nav');
        }
    });

    // --- Menu Mobile ---
    const mobileLinks = document.querySelectorAll('#mobile-menu a');
    mobileLinks.forEach(link => {
        link.classList.remove('text-indigo-600', 'font-bold', 'bg-indigo-50');
        const linkPath = cleanPath(new URL(link.href).pathname);
        const hasHash = new URL(link.href).hash !== '';

        // Hanya tandai link utama (yang tidak punya hash) atau
        // link lain yang path-nya cocok
        if (linkPath === currentPath && !hasHash) {
            link.classList.add('text-indigo-600', 'font-bold', 'bg-indigo-50');
        }
        
        // Kondisi khusus untuk halaman fasilitas, tandai "Profil" sebagai aktif
        if (currentPath === '/fasilitas.html' && linkPath === '/profil.html' && !hasHash) {
            link.classList.add('text-indigo-600', 'font-bold', 'bg-indigo-50');
        }
    });
};

// Inisialisasi ScrollReveal
const sr = ScrollReveal({
    distance: '60px',
    duration: 1000,
    delay: 700,
});

sr.reveal('.seksikepsek', {
    delay: 500,
    origin: 'bottom',
    opacity: 0,
    easing: 'ease-in-out',
    reset: true
});

document.addEventListener('DOMContentLoaded', () => {
    // ===================================
    // LOGIKA UMUM (dijalankan di semua halaman)
    // ===================================
    const hamburgerButton = document.getElementById('hamburger-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const dropdownLinks = document.querySelectorAll('.nav-link-dropdown');

    // 1. Logika Hamburger
    if (hamburgerButton && mobileMenu) {
        hamburgerButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 2. Logika Dropdown Desktop
    const closeAllDropdowns = () => {
        document.querySelectorAll('.dropdown-panel').forEach(panel => {
            panel.classList.remove('visible', 'opacity-100', 'translate-y-0');
            panel.classList.add('invisible', 'opacity-0', '-translate-y-2');
        });
    };

    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const targetPanel = link.nextElementSibling;
            const isTargetPanelOpen = !targetPanel.classList.contains('invisible');
            closeAllDropdowns();
            if (!isTargetPanelOpen && targetPanel) {
                targetPanel.classList.remove('invisible', 'opacity-0', '-translate-y-2');
                targetPanel.classList.add('visible', 'opacity-100', 'translate-y-0');
            }
        });
    });

    document.addEventListener('click', () => closeAllDropdowns());
    
    // 3. Panggil fungsi untuk menandai navigasi aktif
    setActiveLink();
    
    // ===================================
    // LOGIKA DROPDOWN MOBILE
    // ===================================
    const dropdownLinksMobile = document.querySelectorAll('.nav-link-dropdown-mobile');

    dropdownLinksMobile.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const targetPanel = link.nextElementSibling;
            if (targetPanel) {
                targetPanel.classList.toggle('hidden');
            }
        });
    });

    // ===================================
    // LOGIKA TAMPILAN PORTOFOLIO DI INDEX (Halaman Utama)
    // ===================================
    const portfolioContainerIndex = document.getElementById("portfolio-container-index");
    const jurusanFiltersIndex = document.getElementById("jurusan-filters-index");

    if (portfolioContainerIndex && jurusanFiltersIndex) {
        let portfolioData = {};
        let jurusanSaatIni = "";

        async function loadPortfolioData() {
            try {
                const response = await fetch("/data/portofolio.json");
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                portfolioData = await response.json();
                jurusanSaatIni = Object.keys(portfolioData)[0];
                setupJurusanFilters();
                renderPortfolio(jurusanSaatIni);
            } catch (error) {
                console.error("Gagal memuat data portofolio:", error);
                portfolioContainerIndex.innerHTML = `<p class="text-center text-red-500 col-span-full">Gagal memuat data portofolio.</p>`;
            }
        }

        function renderPortfolio(jurusan) {
            portfolioContainerIndex.innerHTML = "";
            const dataJurusan = portfolioData[jurusan];
            if (!dataJurusan) return;
            const slicedData = dataJurusan.slice(0, 4);
            slicedData.forEach((item) => {
                const card = createPortfolioCard(item);
                portfolioContainerIndex.appendChild(card);
            });
        }

        function createPortfolioCard(data) {
            const card = document.createElement("div");
            card.className = "bg-white rounded-lg shadow-md overflow-hidden group transform transition-all duration-300 hover:-translate-y-2";
            card.innerHTML = `
              <div class="relative">
                  <img src="${data.fotoProject}" alt="${data.namaProject}" class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105">
              </div>
              <div class="p-5">
                  <h3 class="text-lg font-bold text-gray-800 truncate">${data.namaProject}</h3>
                  <p class="text-sm text-gray-500 mb-3">oleh ${data.nama}</p>
                  <a href="portofolio.html" class="text-sm font-semibold text-purple-600 hover:text-purple-800">Lihat Detail →</a>
              </div>
            `;
            return card;
        }

        function setupJurusanFilters() {
            jurusanFiltersIndex.innerHTML = "";
            const jurusanKeys = Object.keys(portfolioData);
            jurusanKeys.forEach((jurusan) => {
                const button = document.createElement("button");
                button.textContent = jurusan;
                button.className = "px-4 py-2 text-sm font-medium rounded-full transition";
                if (jurusan === jurusanSaatIni) {
                    button.classList.add("bg-purple-600", "text-white");
                } else {
                    button.classList.add("bg-gray-200", "text-gray-700", "hover:bg-gray-300");
                }
                button.addEventListener("click", () => {
                    jurusanSaatIni = jurusan;
                    renderPortfolio(jurusan);
                    updateFilterButtons();
                });
                jurusanFiltersIndex.appendChild(button);
            });
        }

        function updateFilterButtons() {
            Array.from(jurusanFiltersIndex.children).forEach((button) => {
                button.classList.remove("bg-purple-600", "text-white");
                button.classList.add("bg-gray-200", "text-gray-700", "hover:bg-gray-300");
                if (button.textContent === jurusanSaatIni) {
                    button.classList.add("bg-purple-600", "text-white");
                    button.classList.remove("bg-gray-200", "text-gray-700", "hover:bg-gray-300");
                }
            });
        }

        loadPortfolioData();
    }
});