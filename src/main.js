// src/main.js

import './style.css';
// Impor FUNGSI inisialisasi dari animation.js, bukan library-nya langsung
import { initScrollReveal } from './animation.js';

// Fungsi untuk menandai link navigasi yang aktif
const setActiveLink = () => {
    const cleanPath = (path) => {
        if (path.endsWith('index.html')) {
            return '/';
        }
        if (path.length > 1 && path.endsWith('/')) {
            return path.slice(0, -1);
        }
        return path;
    };

    const currentPath = cleanPath(window.location.pathname);
    const profileSubPages = ['/fasilitas.html', '/guru.html', '/galeri.html'];

    const desktopLinks = document.querySelectorAll('header > nav .nav-link');
    desktopLinks.forEach(link => {
        link.classList.remove('active-nav');
        const linkPath = cleanPath(new URL(link.href).pathname);
        if (linkPath === currentPath || (profileSubPages.includes(currentPath) && linkPath === '/profil.html')) {
            link.classList.add('active-nav');
        }
    });

    const mobileLinks = document.querySelectorAll('#mobile-menu a');
    mobileLinks.forEach(link => {
        link.classList.remove('text-indigo-600', 'font-bold', 'bg-indigo-50');
        const linkPath = cleanPath(new URL(link.href).pathname);
        const hasHash = new URL(link.href).hash !== '';

        if ((linkPath === currentPath && !hasHash) || (profileSubPages.includes(currentPath) && linkPath === '/profil.html' && !hasHash)) {
            link.classList.add('text-indigo-600', 'font-bold', 'bg-indigo-50');
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerButton = document.getElementById('hamburger-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const dropdownLinks = document.querySelectorAll('.nav-link-dropdown');
    const dropdownLinksMobile = document.querySelectorAll('.nav-link-dropdown-mobile');

    if (hamburgerButton && mobileMenu) {
        hamburgerButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

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

    document.addEventListener('click', () => closeAllDropdowns());
    
    setActiveLink();

    // --- LOGIKA UNTUK HEADLINE BERITA ---
    const headlineSection = document.getElementById('headline-berita');
    const headlineContainer = document.getElementById('headline-container');
    const headlineEnabled = localStorage.getItem('headlineEnabled') !== 'false';

    async function loadHeadlineBerita() {
        if (!headlineEnabled) {
            if (headlineSection) headlineSection.style.display = 'none';
            return;
        }
        try {
            const response = await fetch('/data/berita.json');
            if (!response.ok) throw new Error('Data berita tidak ditemukan');
            const beritaData = await response.json();
            
            if (headlineContainer) {
                headlineContainer.innerHTML = '';
                beritaData.slice(0, 3).forEach(berita => {
                    const beritaCard = document.createElement('div');
                    beritaCard.className = 'bg-gray-50 rounded-lg overflow-hidden group';
                    beritaCard.innerHTML = `
                        <img src="${berita.gambar}" alt="${berita.judul}" class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div class="p-6">
                            <h3 class="text-xl font-semibold mb-2">${berita.judul}</h3>
                            <p class="text-gray-600 leading-relaxed">${berita.ringkasan}</p>
                        </div>
                    `;
                    headlineContainer.appendChild(beritaCard);
                });
            }
        } catch (error) {
            console.error('Gagal memuat berita headline:', error);
            if (headlineSection) headlineSection.style.display = 'none';
        }
    }
    
    if (headlineSection) {
        loadHeadlineBerita();
    }

    // --- LOGIKA UNTUK PORTOFOLIO DI INDEX ---
    const portfolioContainerIndex = document.getElementById("portfolio-container-index");
    const jurusanFiltersIndex = document.getElementById("jurusan-filters-index");

    if (portfolioContainerIndex && jurusanFiltersIndex) {
        let portfolioData = {};
        let jurusanSaatIni = "";

        const renderPortfolioIndex = (jurusan) => {
            portfolioContainerIndex.innerHTML = "";
            const dataJurusan = portfolioData[jurusan] || [];
            const slicedData = dataJurusan.slice(0, 4);
            slicedData.forEach((item) => {
                const card = createPortfolioCardIndex(item);
                portfolioContainerIndex.appendChild(card);
            });
        };

        const createPortfolioCardIndex = (data) => {
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
        };

        const updateFilterButtonsIndex = () => {
            Array.from(jurusanFiltersIndex.children).forEach((button) => {
                button.classList.remove("bg-purple-600", "text-white");
                button.classList.add("bg-gray-200", "text-gray-700", "hover:bg-gray-300");
                if (button.textContent === jurusanSaatIni) {
                    button.classList.add("bg-purple-600", "text-white");
                    button.classList.remove("bg-gray-200", "text-gray-700", "hover:bg-gray-300");
                }
            });
        };
        
        const setupJurusanFiltersIndex = () => {
            jurusanFiltersIndex.innerHTML = "";
            const jurusanKeys = Object.keys(portfolioData);
            jurusanKeys.forEach((jurusan) => {
                const button = document.createElement("button");
                button.textContent = jurusan;
                button.className = "px-4 py-2 text-sm font-medium rounded-full transition";
                button.addEventListener("click", () => {
                    jurusanSaatIni = jurusan;
                    renderPortfolioIndex(jurusan);
                    updateFilterButtonsIndex();
                });
                jurusanFiltersIndex.appendChild(button);
            });
             updateFilterButtonsIndex();
        };

        const loadPortfolioDataIndex = async () => {
            try {
                const response = await fetch("/data/portofolio.json");
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                portfolioData = await response.json();
                jurusanSaatIni = Object.keys(portfolioData)[0];
                setupJurusanFiltersIndex();
                renderPortfolioIndex(jurusanSaatIni);
            } catch (error) {
                console.error("Gagal memuat data portofolio:", error);
                portfolioContainerIndex.innerHTML = `<p class="text-center text-red-500 col-span-full">Gagal memuat data portofolio.</p>`;
            }
        };

        loadPortfolioDataIndex();
    }
    
    // Inisialisasi animasi setelah semua konten dinamis dimuat
    initScrollReveal();
});