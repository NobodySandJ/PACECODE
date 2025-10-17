// src/main.js

import './style.css';
import { initScrollReveal } from './animation.js';
// Impor fungsi-fungsi yang diperlukan dari Firebase SDK
import { db } from './firebase.js';
import { collection, getDocs, query, limit } from "firebase/firestore";

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

    // --- LOGIKA HEADLINE BERITA DARI FIREBASE ---
    const headlineSection = document.getElementById('headline-berita');
    const headlineContainer = document.getElementById('headline-container');
    const headlineEnabled = localStorage.getItem('headlineEnabled') !== 'false';

    async function loadHeadlineBerita() {
        if (!headlineEnabled || !headlineSection) {
            if (headlineSection) headlineSection.style.display = 'none';
            return;
        }
        try {
            // Mengambil 3 berita teratas dari koleksi 'berita'
            const beritaCol = collection(db, 'berita');
            const q = query(beritaCol, limit(3));
            const beritaSnapshot = await getDocs(q);
            const beritaData = beritaSnapshot.docs.map(doc => doc.data());

            if (beritaData.length === 0) {
                 throw new Error('Tidak ada data berita di Firestore.');
            }

            headlineContainer.innerHTML = beritaData.map(berita => `
                <div class="bg-gray-50 rounded-lg overflow-hidden group">
                    <img src="${berita.gambar}" alt="${berita.judul}" class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div class="p-6">
                        <h3 class="text-xl font-semibold mb-2">${berita.judul}</h3>
                        <p class="text-gray-600 leading-relaxed">${berita.ringkasan}</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Gagal memuat berita headline dari Firestore:', error);
            if(headlineSection) headlineSection.style.display = 'none';
        }
    }
    
    loadHeadlineBerita();

    // --- LOGIKA PORTOFOLIO DI INDEX DARI FIREBASE ---
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
                const portfolioCol = collection(db, 'portfolio');
                const portfolioSnapshot = await getDocs(portfolioCol);
                const portfolioList = portfolioSnapshot.docs.map(doc => doc.data());
                
                // Mengelompokkan data berdasarkan jurusan
                portfolioData = {};
                portfolioList.forEach(item => {
                    const { jurusan } = item;
                    if (!portfolioData[jurusan]) {
                        portfolioData[jurusan] = [];
                    }
                    portfolioData[jurusan].push(item);
                });

                if (Object.keys(portfolioData).length > 0) {
                    jurusanSaatIni = Object.keys(portfolioData)[0];
                    setupJurusanFiltersIndex();
                    renderPortfolioIndex(jurusanSaatIni);
                    updateFilterButtonsIndex();
                } else {
                    throw new Error("Tidak ada data portfolio di Firestore.");
                }
            } catch (error) {
                console.error('Gagal memuat data portofolio dari Firestore:', error);
                portfolioContainerIndex.innerHTML = `<p class="text-center text-red-500 col-span-full">Gagal memuat data portofolio.</p>`;
            }
        };

        loadPortfolioDataIndex();
    }
    
    initScrollReveal();
});