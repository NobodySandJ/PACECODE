// src/main.js

import './style.css';
import { initScrollReveal } from './animation.js';

// Fungsi untuk menandai link navigasi yang aktif
const setActiveLink = () => {
    const cleanPath = (path) => {
        if (path.endsWith('index.html')) return '/';
        if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
        return path;
    };
    const currentPath = cleanPath(window.location.pathname);
    const profileSubPages = ['/fasilitas.html', '/guru.html', '/galeri.html'];
    document.querySelectorAll('header > nav .nav-link').forEach(link => {
        link.classList.remove('active-nav');
        const linkPath = cleanPath(new URL(link.href).pathname);
        if (linkPath === currentPath || (profileSubPages.includes(currentPath) && linkPath === '/profil.html')) {
            link.classList.add('active-nav');
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // --- SETUP UI DASAR ---
    const hamburgerButton = document.getElementById('hamburger-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const dropdownLinks = document.querySelectorAll('.nav-link-dropdown');

    if (hamburgerButton && mobileMenu) {
        hamburgerButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    }

    const closeAllDropdowns = () => {
        document.querySelectorAll('.dropdown-panel').forEach(p => {
            p.classList.remove('visible', 'opacity-100', 'translate-y-0');
            p.classList.add('invisible', 'opacity-0', '-translate-y-2');
        });
    };

    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const targetPanel = link.nextElementSibling;
            const isTargetPanelOpen = !targetPanel.classList.contains('invisible');
            closeAllDropdowns();
            if (!isTargetPanelOpen) {
                 targetPanel.classList.remove('invisible', 'opacity-0', '-translate-y-2');
                 targetPanel.classList.add('visible', 'opacity-100', 'translate-y-0');
            }
        });
    });

    document.addEventListener('click', closeAllDropdowns);
    setActiveLink();

    // --- LOGIKA HEADLINE BERITA ---
    const headlineSection = document.getElementById('headline-berita');
    const headlineContainer = document.getElementById('headline-container');
    // Ambil status dari localStorage, defaultnya 'true' (aktif)
    const headlineEnabled = localStorage.getItem('headlineEnabled') !== 'false';

    async function loadHeadlineBerita() {
        if (!headlineEnabled || !headlineSection) {
            if (headlineSection) headlineSection.style.display = 'none';
            return;
        }
        try {
            // Memastikan fetch ke file yang benar: berita.json
            const response = await fetch('/data/berita.json');
            if (!response.ok) throw new Error('Data berita tidak ditemukan, pastikan file public/data/berita.json ada.');
            
            const beritaData = await response.json();
            
            headlineContainer.innerHTML = beritaData.slice(0, 3).map(berita => `
                <div class="bg-gray-50 rounded-lg overflow-hidden group">
                    <img src="${berita.gambar}" alt="${berita.judul}" class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div class="p-6">
                        <h3 class="text-xl font-semibold mb-2">${berita.judul}</h3>
                        <p class="text-gray-600 leading-relaxed">${berita.ringkasan}</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Gagal memuat berita headline:', error);
            headlineSection.style.display = 'none';
        }
    }
    
    loadHeadlineBerita();

    // --- LOGIKA PORTOFOLIO DI INDEX ---
    const portfolioContainerIndex = document.getElementById("portfolio-container-index");
    const jurusanFiltersIndex = document.getElementById("jurusan-filters-index");

    if (portfolioContainerIndex && jurusanFiltersIndex) {
        let portfolioData = {};
        let jurusanSaatIni = "";

        const renderPortfolioIndex = (jurusan) => {
            const dataJurusan = portfolioData[jurusan] || [];
            portfolioContainerIndex.innerHTML = dataJurusan.slice(0, 4).map(item => `
                <div class="bg-white rounded-lg shadow-md overflow-hidden group transform transition-all duration-300 hover:-translate-y-2">
                    <div class="relative">
                        <img src="${item.fotoProject}" alt="${item.namaProject}" class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105">
                    </div>
                    <div class="p-5">
                        <h3 class="text-lg font-bold text-gray-800 truncate">${item.namaProject}</h3>
                        <p class="text-sm text-gray-500 mb-3">oleh ${item.nama}</p>
                        <a href="portofolio.html" class="text-sm font-semibold text-purple-600 hover:text-purple-800">Lihat Detail →</a>
                    </div>
                </div>
            `).join('');
        };

        const updateFilterButtonsIndex = () => {
            jurusanFiltersIndex.querySelectorAll('button').forEach(button => {
                const isSelected = button.textContent === jurusanSaatIni;
                button.classList.toggle("bg-purple-600", isSelected);
                button.classList.toggle("text-white", isSelected);
                button.classList.toggle("bg-gray-200", !isSelected);
                button.classList.toggle("text-gray-700", !isSelected);
            });
        };
        
        const setupJurusanFiltersIndex = () => {
            const jurusanKeys = Object.keys(portfolioData);
            jurusanFiltersIndex.innerHTML = jurusanKeys.map(jurusan => 
                `<button class="px-4 py-2 text-sm font-medium rounded-full transition hover:bg-gray-300">${jurusan}</button>`
            ).join('');
            
            jurusanFiltersIndex.querySelectorAll('button').forEach(button => {
                button.addEventListener("click", () => {
                    jurusanSaatIni = button.textContent;
                    renderPortfolioIndex(jurusanSaatIni);
                    updateFilterButtonsIndex();
                });
            });
        };

        const loadPortfolioDataIndex = async () => {
            try {
                const response = await fetch("/data/portofolio.json");
                if (!response.ok) throw new Error('Gagal memuat data portofolio');
                portfolioData = await response.json();
                jurusanSaatIni = Object.keys(portfolioData)[0];
                setupJurusanFiltersIndex();
                renderPortfolioIndex(jurusanSaatIni);
                updateFilterButtonsIndex();
            } catch (error) {
                console.error(error);
                portfolioContainerIndex.innerHTML = `<p class="text-center text-red-500 col-span-full">Gagal memuat data portofolio.</p>`;
            }
        };

        loadPortfolioDataIndex();
    }
    
    initScrollReveal();
});