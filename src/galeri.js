// src/galeri.js
import './style.css';
import { sr, initScrollReveal } from './animation.js';
import './main.js'; // Impor main.js untuk fungsionalitas header

document.addEventListener('DOMContentLoaded', () => {
    const filtersContainer = document.getElementById('gallery-filters');
    const galleryContainer = document.getElementById('gallery-container');
    let galleryData = {};
    let currentCategory = 'Semua';

    // Fungsi untuk memuat data galeri dari file JSON
    async function loadGalleryData() {
        try {
            const response = await fetch('/data/galeri.json');
            if (!response.ok) throw new Error('Data galeri tidak ditemukan');
            galleryData = await response.json();
            
            // Setelah data dimuat, siapkan filter dan tampilkan galeri awal
            setupFilters();
            renderGallery();

        } catch (error) {
            console.error('Gagal memuat data galeri:', error);
            galleryContainer.innerHTML = `<p class="text-center text-red-500 col-span-full">Gagal memuat data galeri.</p>`;
        }
    }

    // Fungsi untuk membuat tombol-tombol filter berdasarkan kategori dari data
    function setupFilters() {
        if (!filtersContainer) return;
        const categories = ['Semua', ...Object.keys(galleryData)];
        filtersContainer.innerHTML = categories.map(category => `
            <button class="filter-btn px-4 py-2 text-sm font-medium rounded-full transition" data-category="${category}">
                ${category}
            </button>
        `).join('');
        
        updateFilterButtons();
        
        // Tambahkan event listener untuk setiap tombol filter
        filtersContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                currentCategory = e.target.dataset.category;
                renderGallery(); // Render ulang galeri saat filter diklik
            }
        });
    }

    // Fungsi untuk memperbarui tampilan visual tombol filter yang aktif
    function updateFilterButtons() {
        const buttons = filtersContainer.querySelectorAll('.filter-btn');
        buttons.forEach(button => {
            if (button.dataset.category === currentCategory) {
                button.classList.add('bg-purple-600', 'text-white');
                button.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
            } else {
                button.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
                button.classList.remove('bg-purple-600', 'text-white');
            }
        });
    }

    // Fungsi untuk menampilkan gambar di galeri berdasarkan kategori yang dipilih
    function renderGallery() {
        if (!galleryContainer) return;
        galleryContainer.innerHTML = '';
        
        const itemsToRender = [];
        if (currentCategory === 'Semua') {
            // Jika 'Semua' dipilih, gabungkan semua gambar dari semua kategori
            Object.values(galleryData).forEach(categoryItems => {
                itemsToRender.push(...categoryItems);
            });
        } else {
            // Jika kategori spesifik dipilih, ambil gambar dari kategori itu saja
            itemsToRender.push(...(galleryData[currentCategory] || []));
        }

        // Buat elemen HTML untuk setiap item gambar dan tambahkan ke kontainer
        itemsToRender.forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'group relative overflow-hidden rounded-lg shadow-lg cursor-pointer';
            galleryItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end p-4">
                    <div class="text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <h3 class="font-bold">${item.title}</h3>
                        <p class="text-sm">${item.description}</p>
                    </div>
                </div>
            `;
            galleryContainer.appendChild(galleryItem);
        });
        
        updateFilterButtons();

        // Terapkan kembali animasi ScrollReveal ke item yang baru dirender
        sr.reveal('#gallery-container > .group', {
            delay: 100,
            origin: 'bottom',
            interval: 50,
            cleanup: true // 'cleanup: true' penting agar animasi dapat diulang saat filter
        });
    }

    // Panggil fungsi utama untuk memuat data dan inisialisasi animasi
    loadGalleryData();
    initScrollReveal(); 
});