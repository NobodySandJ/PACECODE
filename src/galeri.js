// src/galeri.js
import './style.css';
import { sr, initScrollReveal } from './animation.js';
import './main.js'; // Impor main.js untuk fungsionalitas header
// Impor fungsi-fungsi yang diperlukan dari Firebase SDK
import { db } from './firebase.js';
import { collection, getDocs } from "firebase/firestore";

document.addEventListener('DOMContentLoaded', () => {
    const filtersContainer = document.getElementById('gallery-filters');
    const galleryContainer = document.getElementById('gallery-container');
    let galleryData = {}; // Format: { "Kategori 1": [item1, item2], "Kategori 2": [item3] }
    let currentCategory = 'Semua';

    // Fungsi untuk memuat data galeri dari Firestore
    async function loadGalleryData() {
        try {
            galleryContainer.innerHTML = `<p class="text-center text-gray-500 col-span-full">Memuat galeri...</p>`;
            const galeriCol = collection(db, 'galeri');
            const galeriSnapshot = await getDocs(galeriCol);
            const galeriList = galeriSnapshot.docs.map(doc => doc.data());
            
            // Mengelompokkan data galeri berdasarkan kategori
            galleryData = {};
            galeriList.forEach(item => {
                const { kategori } = item;
                if (!kategori) return; // Lewati item tanpa kategori
                if (!galleryData[kategori]) {
                    galleryData[kategori] = [];
                }
                galleryData[kategori].push(item);
            });

            if (Object.keys(galleryData).length === 0) {
                throw new Error("Tidak ada data galeri di Firestore.");
            }
            
            setupFilters();
            renderGallery();

        } catch (error) {
            console.error('Gagal memuat data galeri dari Firestore:', error);
            galleryContainer.innerHTML = `<p class="text-center text-red-500 col-span-full">Gagal memuat data galeri.</p>`;
        }
    }

    // Fungsi untuk membuat tombol-tombol filter
    function setupFilters() {
        if (!filtersContainer) return;
        const categories = ['Semua', ...Object.keys(galleryData)];
        filtersContainer.innerHTML = categories.map(category => `
            <button class="filter-btn px-4 py-2 text-sm font-medium rounded-full transition" data-category="${category}">
                ${category}
            </button>
        `).join('');
        
        updateFilterButtons();
        
        filtersContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                currentCategory = e.target.dataset.category;
                renderGallery();
            }
        });
    }

    // Fungsi untuk memperbarui tampilan visual tombol filter
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

    // Fungsi untuk menampilkan gambar di galeri
    function renderGallery() {
        if (!galleryContainer) return;
        galleryContainer.innerHTML = '';
        
        const itemsToRender = [];
        if (currentCategory === 'Semua') {
            Object.values(galleryData).forEach(categoryItems => {
                itemsToRender.push(...categoryItems);
            });
        } else {
            itemsToRender.push(...(galleryData[currentCategory] || []));
        }

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

        sr.reveal('#gallery-container > .group', {
            delay: 100,
            origin: 'bottom',
            interval: 50,
            cleanup: true
        });
    }

    loadGalleryData();
    initScrollReveal();
});