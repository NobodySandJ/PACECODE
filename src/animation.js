// src/animations.js
import ScrollReveal from 'scrollreveal';

// Inisialisasi ScrollReveal dengan konfigurasi global
export const sr = ScrollReveal({
    distance: '60px',
    duration: 2500,
    delay: 400,
    reset: true,
});

// Fungsi untuk setup semua animasi
export function initScrollReveal() {
    const pathname = window.location.pathname;

    // Animasi untuk halaman utama (index)
    if (pathname === '/' || pathname.endsWith('index.html')) {
        sr.reveal('section h1', { delay: 500, origin: 'top' });
        sr.reveal('section .text-lg', { delay: 600, origin: 'bottom' });
        sr.reveal('section .btn-animated', { delay: 700, origin: 'bottom' });
        sr.reveal('.seksikepsek .relative', { delay: 500, origin: 'left' });
        sr.reveal('.seksikepsek div:not(.relative)', { delay: 600, origin: 'right' });
        sr.reveal('.bg-gray-50 .grid > div:nth-child(1)', { delay: 500, origin: 'left' });
        sr.reveal('.bg-gray-50 .grid > div:nth-child(2)', { delay: 600, origin: 'right' });
        sr.reveal('.bg-white .text-center h2', { delay: 200, origin: 'top' });
        sr.reveal('.bg-white .grid.md\\:grid-cols-3 .group', { delay: 300, origin: 'bottom', interval: 200 });
        sr.reveal('section.bg-gray-50:nth-of-type(2) h2', { delay: 200, origin: 'top' });
        sr.reveal('#jurusan-filters-index button', { delay: 300, origin: 'bottom', interval: 100 });
        sr.reveal('#portfolio-container-index > div', { delay: 500, origin: 'bottom', interval: 200 });
        sr.reveal('.bg-white section:last-of-type img', { delay: 500, origin: 'left' });
        sr.reveal('.bg-white section:last-of-type details', { delay: 600, origin: 'right', interval: 200 });
    }
    // Animasi untuk halaman jurusan
    else if (pathname.endsWith('jurusan.html')) {
        sr.reveal('.bg-purple-600 h1', { delay: 200, origin: 'left' });
        sr.reveal('.bg-purple-600 p', { delay: 300, origin: 'left' });
        sr.reveal('aside .bg-white', { delay: 400, origin: 'left' });
        sr.reveal('#gambar-utama', { delay: 300, origin: 'bottom', distance: '80px' });
        sr.reveal('#nama-jurusan', { delay: 400, origin: 'bottom' });
        sr.reveal('div > h3', { delay: 500, origin: 'top' });
        sr.reveal('#deskripsi-jurusan', { delay: 600, origin: 'bottom' });
        sr.reveal('#keahlian-list li', { delay: 500, origin: 'bottom', interval: 100 });
        sr.reveal('#guru-section h3', { delay: 200, origin: 'top' });
        sr.reveal('#guru-grid > div', { delay: 300, origin: 'bottom', interval: 150 });
    }
    // ==========================================================
    // PERBAIKAN: Animasi untuk halaman berita.html
    // ==========================================================
    else if (pathname.endsWith('berita.html')) {
        // Judul Utama
        sr.reveal('main > h1', { delay: 200, origin: 'top' });

        // Gunakan selector yang lebih tepat: 'main .space-y-16 > section'
        const sections = 'main .space-y-16 > section';

        // Section 1: Berita Terbaru
        sr.reveal(`${sections}:nth-of-type(1) h2`, { delay: 300, origin: 'left' });
        sr.reveal(`${sections}:nth-of-type(1) img`, { delay: 400, origin: 'left' });
        sr.reveal(`${sections}:nth-of-type(1) p`, { delay: 400, origin: 'right' });

        // Section 2: Pendelegasian Lomba
        sr.reveal(`${sections}:nth-of-type(2) h2`, { delay: 200, origin: 'top' });
        sr.reveal(`${sections}:nth-of-type(2) img`, { delay: 300, origin: 'bottom', interval: 200 });
        sr.reveal(`${sections}:nth-of-type(2) p`, { delay: 400, origin: 'bottom' });

        // Section 3: Juara Harapan
        sr.reveal(`${sections}:nth-of-type(3) div:first-child`, { delay: 300, origin: 'left' });
        sr.reveal(`${sections}:nth-of-type(3) img`, { delay: 300, origin: 'right', distance: '80px', scale: 0.9 });

        // Section 4: Ekstrakurikuler
        sr.reveal(`${sections}:nth-of-type(4) h2`, { delay: 200, origin: 'top' });
        sr.reveal(`${sections}:nth-of-type(4) img`, { delay: 300, origin: 'bottom', interval: 200, scale: 0.95 });
        sr.reveal(`${sections}:nth-of-type(4) p`, { delay: 400, origin: 'bottom' });
        
        // Section 5: Upacara
        sr.reveal(`${sections}:nth-of-type(5) h2`, { delay: 200, origin: 'top' });
        sr.reveal(`${sections}:nth-of-type(5) .grid > div`, { delay: 300, origin: 'bottom', interval: 200 });
        sr.reveal(`${sections}:nth-of-type(5) p`, { delay: 400, origin: 'bottom' });
    }
}