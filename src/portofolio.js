// src/portofolio.js

import { sr } from './animation.js';
// Impor fungsi-fungsi yang diperlukan dari Firebase SDK
import { db } from './firebase.js'; 
import { collection, getDocs } from "firebase/firestore"; 

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const jurusanNav = document.getElementById('jurusan-filters');
    const sudahBekerjaContainer = document.getElementById('sudah-bekerja-container');
    const belumBekerjaContainer = document.getElementById('belum-bekerja-container');
    const modalContainer = document.getElementById('modal');

    // --- State ---
    let portfolioData = {};
    let jurusanSaatIni = '';

    // --- Konfigurasi Warna ---
    const jurusanColors = {
        "Rekayasa Perangkat Lunak": { border: "border-blue-500", button: "bg-blue-600 hover:bg-blue-700", tag: "text-blue-600" },
        "Teknik Komputer dan Jaringan": { border: "border-red-500", button: "bg-red-600 hover:bg-red-700", tag: "text-red-600" },
        "Desain Komunikasi Visual": { border: "border-green-500", button: "bg-green-600 hover:bg-green-700", tag: "text-green-600" },
        "Animasi": { border: "border-gray-700", button: "bg-gray-800 hover:bg-gray-900", tag: "text-gray-700" },
        "Kuliner": { border: "border-orange-500", button: "bg-orange-500 hover:bg-orange-600", tag: "text-orange-500" },
        "Perhotelan": { border: "border-yellow-500", button: "bg-yellow-500 hover:bg-yellow-600", tag: "text-yellow-500" }
    };
    const defaultColors = { border: "border-indigo-500", button: "bg-indigo-600 hover:bg-indigo-700", tag: "text-indigo-600" };

    /**
     * Mengambil data dari Firestore dan mengubahnya menjadi format yang bisa digunakan
     */
    async function loadPortfolioData() {
        try {
            sudahBekerjaContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">Memuat data...</p>';
            belumBekerjaContainer.innerHTML = '';
            
            const portfolioCol = collection(db, 'portfolio');
            const portfolioSnapshot = await getDocs(portfolioCol);
            
            const portfolioList = portfolioSnapshot.docs.map(doc => doc.data());

            // Mengelompokkan data portfolio berdasarkan jurusan
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
                setupJurusanNavigation();
                renderPortfolio(jurusanSaatIni);
            } else {
                 sudahBekerjaContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">Belum ada data portfolio untuk ditampilkan.</p>';
            }

        } catch (error) {
            console.error("Gagal memuat data portofolio dari Firestore:", error);
            sudahBekerjaContainer.innerHTML = '<p class="col-span-full text-center text-red-500">Gagal memuat data. Silakan coba lagi nanti.</p>';
        }
    }

    /**
     * Membuat HTML untuk satu kartu portfolio
     */
    const createPortfolioCard = (data, jurusan) => {
        const colors = jurusanColors[jurusan] || defaultColors;
        const card = document.createElement('div');
        card.className = `bg-white rounded-lg shadow-lg overflow-hidden group transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-t-4 ${colors.border}`;

        const bekerjaBadge = data.bekerja
            ? `<span class="absolute top-3 right-3 text-xs font-semibold inline-block py-1 px-3 uppercase rounded-full text-green-600 bg-green-200">
                 ✔ Bekerja di ${data.bekerja}
               </span>`
            : '';

        card.innerHTML = `
            <div class="relative">
                <img src="${data.fotoProject}" alt="${data.namaProject}" class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110">
                ${bekerjaBadge}
            </div>
            <div class="p-5">
                <p class="text-sm font-semibold mb-1 ${colors.tag}">${jurusan}</p>
                <h3 class="text-lg font-bold text-gray-900 truncate">${data.namaProject}</h3>
                <p class="text-sm text-gray-500 mb-2">oleh ${data.nama}</p>
                <p class="text-gray-700 mt-2 text-sm h-16 overflow-hidden">${data.deskripsiSingkat}</p>
                <button class="view-detail-btn mt-4 w-full text-white py-2 rounded-md transition font-semibold ${colors.button}">
                    Lihat Detail
                </button>
            </div>
        `;

        card.querySelector('.view-detail-btn').addEventListener('click', () => openModal(data));
        return card;
    };
    
    /**
     * Merender semua kartu portfolio ke dalam kontainer yang sesuai
     */
    const renderPortfolio = (jurusan) => {
        sudahBekerjaContainer.innerHTML = '';
        belumBekerjaContainer.innerHTML = '';

        const dataJurusan = portfolioData[jurusan];
        if (!dataJurusan) return;

        let sudahBekerjaCount = 0;
        let belumBekerjaCount = 0;

        dataJurusan.forEach(item => {
            const card = createPortfolioCard(item, jurusan);
            if (item.bekerja) {
                sudahBekerjaContainer.appendChild(card);
                sudahBekerjaCount++;
            } else {
                belumBekerjaContainer.appendChild(card);
                belumBekerjaCount++;
            }
        });
        
        if (sudahBekerjaCount === 0) {
            sudahBekerjaContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">Belum ada lulusan yang bekerja dari jurusan ini.</p>';
        }
        if (belumBekerjaCount === 0) {
            belumBekerjaContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">Semua lulusan dari jurusan ini sudah bekerja.</p>';
        }

        // Terapkan kembali animasi ScrollReveal ke elemen yang baru dirender
        sr.reveal('#sudah-bekerja-container > div', { delay: 100, origin: 'bottom', interval: 50, cleanup: true });
        sr.reveal('#belum-bekerja-container > div', { delay: 100, origin: 'bottom', interval: 50, cleanup: true });
    };

    /**
     * Membuat tombol filter jurusan
     */
    const setupJurusanNavigation = () => {
        jurusanNav.innerHTML = '';
        const jurusanKeys = Object.keys(portfolioData);
        jurusanKeys.forEach(jurusan => {
            const button = document.createElement('button');
            button.textContent = jurusan;
            button.className = `px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border-2`;
            button.addEventListener('click', () => {
                jurusanSaatIni = jurusan;
                renderPortfolio(jurusan);
                updateNavButtons();
            });
            jurusanNav.appendChild(button);
        });
        updateNavButtons(); // Panggil untuk set state awal
    };

    /**
     * Memperbarui tampilan tombol filter yang aktif
     */
    const updateNavButtons = () => {
        Array.from(jurusanNav.children).forEach(button => {
            const isSelected = button.textContent === jurusanSaatIni;
            button.classList.toggle('bg-indigo-600', isSelected);
            button.classList.toggle('text-white', isSelected);
            button.classList.toggle('border-indigo-600', isSelected);
            button.classList.toggle('bg-white', !isSelected);
            button.classList.toggle('text-gray-700', !isSelected);
            button.classList.toggle('border-gray-300', !isSelected);
            button.classList.toggle('hover:bg-indigo-50', !isSelected);
            button.classList.toggle('hover:border-indigo-500', !isSelected);
        });
    };

    /**
     * Menampilkan modal dengan detail proyek
     */
    const openModal = (data) => {
        modalContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0" id="modal-content">
                <img src="${data.fotoProject}" alt="${data.namaProject}" class="w-full h-64 object-cover rounded-t-lg">
                <div class="p-6">
                    <h3 class="text-2xl font-bold mb-2" id="modal-judul">${data.namaProject}</h3>
                    <p class="text-sm text-gray-500 mb-4">Oleh: ${data.nama} - ${data.jurusan}</p>
                    <p class="text-gray-700" id="modal-deskripsi">${data.deskripsiLengkap || data.deskripsiSingkat}</p>
                </div>
                <div class="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end">
                    <button id="close-modal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Tutup</button>
                </div>
            </div>
        `;
        
        modalContainer.classList.remove('hidden');
        modalContainer.classList.add('flex');
        
        // Animasi saat modal muncul
        setTimeout(() => {
            document.getElementById('modal-content').classList.remove('scale-95', 'opacity-0');
            document.getElementById('modal-content').classList.add('scale-100', 'opacity-100');
        }, 10);

        document.getElementById('close-modal').addEventListener('click', closeModal);
    };

    /**
     * Menutup modal
     */
    const closeModal = () => {
        const modalContent = document.getElementById('modal-content');
        if (modalContent) {
            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');
        }
        setTimeout(() => {
            modalContainer.classList.add('hidden');
            modalContainer.classList.remove('flex');
            modalContainer.innerHTML = '';
        }, 200); // Tunggu animasi selesai
    };

    // Menutup modal jika area di luar diklik
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeModal();
        }
    });

    // Memulai proses
    loadPortfolioData();
});