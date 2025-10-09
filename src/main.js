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

        if (linkPath === currentPath && !hasHash) {
            link.classList.add('text-indigo-600', 'font-bold', 'bg-indigo-50');
        }
        
        if (currentPath === '/fasilitas.html' && linkPath === '/profil.html' && !hasHash) {
            link.classList.add('text-indigo-600', 'font-bold', 'bg-indigo-50');
        }
    });
};

// ===================================
// INISIALISASI SCROLL REVEAL
// ===================================
const sr = ScrollReveal({
    distance: '60px',
    duration: 2500, // Durasi animasi lebih lama untuk efek lebih halus
    delay: 400,
    reset: true, // Animasi akan berulang setiap kali elemen masuk viewport
});

// Animasi untuk halaman index.html
if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    // Hero Section
    sr.reveal('section h1', { delay: 500, origin: 'top' });
    sr.reveal('section .text-lg', { delay: 600, origin: 'bottom' });
    sr.reveal('section .btn-animated', { delay: 700, origin: 'bottom' });

    // Sambutan Kepala Sekolah
    sr.reveal('.seksikepsek .relative', { delay: 500, origin: 'left' });
    sr.reveal('.seksikepsek div:not(.relative)', { delay: 600, origin: 'right' });

    // Visi & Misi
    sr.reveal('.bg-gray-50 .grid > div:nth-child(1)', { delay: 500, origin: 'left' });
    sr.reveal('.bg-gray-50 .grid > div:nth-child(2)', { delay: 600, origin: 'right' });
    
    // Kegiatan Terbaru
    sr.reveal('.bg-white .text-center h2', { delay: 200, origin: 'top' });
    sr.reveal('.bg-white .grid.md\\:grid-cols-3 .group', { delay: 300, origin: 'bottom', interval: 200 });
    
    // Portofolio
    sr.reveal('section.bg-gray-50:nth-of-type(2) h2', { delay: 200, origin: 'top' });
    sr.reveal('#jurusan-filters-index button', { delay: 300, origin: 'bottom', interval: 100 });
    sr.reveal('#portfolio-container-index > div', { delay: 500, origin: 'bottom', interval: 200 });
    
    // FAQ
    sr.reveal('.bg-white section:last-of-type img', { delay: 500, origin: 'left' });
    sr.reveal('.bg-white section:last-of-type details', { delay: 600, origin: 'right', interval: 200 });
}


document.addEventListener('DOMContentLoaded', () => {
    const hamburgerButton = document.getElementById('hamburger-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const dropdownLinks = document.querySelectorAll('.nav-link-dropdown');

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

    document.addEventListener('click', () => closeAllDropdowns());
    
    setActiveLink();
    
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
            // Re-apply reveal ke elemen baru
            sr.reveal('#portfolio-container-index > div', { delay: 200, origin: 'bottom', interval: 100, cleanup: true });
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