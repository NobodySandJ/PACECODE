// src/animations.js
import ScrollReveal from 'scrollreveal';

// Inisialisasi ScrollReveal dengan konfigurasi global
export const sr = ScrollReveal({
    distance: '60px',
    duration: 1500, // DIUBAH: Durasi animasi lebih cepat
    delay: 200,
    reset: false, // Animasi hanya akan berjalan sekali
});

// Fungsi untuk setup semua animasi
export function initScrollReveal() {
    const pathname = window.location.pathname;

    // Animasi untuk halaman utama (index)
    if (pathname === '/' || pathname.endsWith('index.html')) {
        sr.reveal('section h1', { delay: 250, origin: 'top' });
        sr.reveal('section .text-lg', { delay: 300, origin: 'bottom' });
        sr.reveal('section .btn-animated', { delay: 350, origin: 'bottom' });
        sr.reveal('.seksikepsek .relative', { delay: 250, origin: 'left' });
        sr.reveal('.seksikepsek div:not(.relative)', { delay: 300, origin: 'right' });
        sr.reveal('.bg-gray-50 .grid > div:nth-child(1)', { delay: 250, origin: 'left' });
        sr.reveal('.bg-gray-50 .grid > div:nth-child(2)', { delay: 300, origin: 'right' });
        sr.reveal('.bg-white .text-center h2', { delay: 150, origin: 'top' });
        sr.reveal('.bg-white .grid.md\\:grid-cols-3 .group', { delay: 200, origin: 'bottom', interval: 150 });
        sr.reveal('section.bg-gray-50:nth-of-type(2) h2', { delay: 150, origin: 'top' });
        sr.reveal('#jurusan-filters-index button', { delay: 200, origin: 'bottom', interval: 100 });
        sr.reveal('#portfolio-container-index > div', { delay: 250, origin: 'bottom', interval: 150 });
        sr.reveal('.bg-white section:last-of-type img', { delay: 250, origin: 'left' });
        sr.reveal('.bg-white section:last-of-type details', { delay: 300, origin: 'right', interval: 150 });
    }
    // Animasi untuk halaman jurusan
    else if (pathname.endsWith('jurusan.html')) {
        sr.reveal('.bg-purple-600 h1', { delay: 150, origin: 'left' });
        sr.reveal('.bg-purple-600 p', { delay: 200, origin: 'left' });
        sr.reveal('aside .bg-white', { delay: 250, origin: 'left' });
        sr.reveal('#gambar-utama', { delay: 200, origin: 'bottom', distance: '80px' });
        sr.reveal('#nama-jurusan', { delay: 250, origin: 'bottom' });
        sr.reveal('div > h3', { delay: 300, origin: 'top' });
        sr.reveal('#deskripsi-jurusan', { delay: 350, origin: 'bottom' });
        sr.reveal('#keahlian-list li', { delay: 300, origin: 'bottom', interval: 100 });
        sr.reveal('#guru-section h3', { delay: 150, origin: 'top' });
        sr.reveal('#guru-grid > div', { delay: 200, origin: 'bottom', interval: 100 });
    }
    // Animasi untuk halaman berita.html
    else if (pathname.endsWith('berita.html')) {
        sr.reveal('main > h1', { delay: 150, origin: 'top' });
        const sections = 'main .space-y-16 > section';
        sr.reveal(`${sections}:nth-of-type(1) h2`, { delay: 200, origin: 'left' });
        sr.reveal(`${sections}:nth-of-type(1) img`, { delay: 250, origin: 'left' });
        sr.reveal(`${sections}:nth-of-type(1) p`, { delay: 250, origin: 'right' });
        sr.reveal(`${sections}:nth-of-type(2) h2`, { delay: 150, origin: 'top' });
        sr.reveal(`${sections}:nth-of-type(2) img`, { delay: 200, origin: 'bottom', interval: 150 });
        sr.reveal(`${sections}:nth-of-type(2) p`, { delay: 250, origin: 'bottom' });
        sr.reveal(`${sections}:nth-of-type(3) div:first-child`, { delay: 200, origin: 'left' });
        sr.reveal(`${sections}:nth-of-type(3) img`, { delay: 200, origin: 'right', distance: '80px', scale: 0.9 });
        sr.reveal(`${sections}:nth-of-type(4) h2`, { delay: 150, origin: 'top' });
        sr.reveal(`${sections}:nth-of-type(4) img`, { delay: 200, origin: 'bottom', interval: 150, scale: 0.95 });
        sr.reveal(`${sections}:nth-of-type(4) p`, { delay: 250, origin: 'bottom' });
        sr.reveal(`${sections}:nth-of-type(5) h2`, { delay: 150, origin: 'top' });
        sr.reveal(`${sections}:nth-of-type(5) .grid > div`, { delay: 200, origin: 'bottom', interval: 150 });
        sr.reveal(`${sections}:nth-of-type(5) p`, { delay: 250, origin: 'bottom' });
    }
    // Animasi untuk halaman portofolio.html
    else if (pathname.endsWith('portofolio.html')) {
        sr.reveal('main section:first-of-type h1', { delay: 150, origin: 'top' });
        sr.reveal('main section:first-of-type p', { delay: 200, origin: 'bottom' });
        sr.reveal('#jurusan-filters button', { delay: 250, origin: 'bottom', interval: 100 });
        sr.reveal('#sudah-bekerja h2', { delay: 150, origin: 'left' });
        sr.reveal('#belum-bekerja h2', { delay: 150, origin: 'left' });
        sr.reveal('#sudah-bekerja-container > div', { delay: 200, origin: 'bottom', interval: 100 });
        sr.reveal('#belum-bekerja-container > div', { delay: 200, origin: 'bottom', interval: 100 });
        sr.reveal('section.bg-white h2', { delay: 150, origin: 'top' });
        sr.reveal('section.bg-white p', { delay: 200, origin: 'bottom' });
        sr.reveal('section.bg-white .flex > *', { delay: 250, origin: 'bottom', interval: 100 });
    }
    // Animasi untuk halaman profil.html
    else if (pathname.endsWith('profil.html')) {
        sr.reveal('.bg-purple-600 h1', { delay: 150, origin: 'left' });
        sr.reveal('.bg-purple-600 p', { delay: 200, origin: 'left' });
        sr.reveal('aside', { delay: 250, origin: 'left', distance: '80px' });
        sr.reveal('#sejarah', { delay: 200, origin: 'bottom' });
        sr.reveal('#visi-misi', { delay: 200, origin: 'bottom' });
        sr.reveal('#struktur', { delay: 200, origin: 'bottom' });
        sr.reveal('#fasilitas', { delay: 200, origin: 'bottom' });
        sr.reveal('#fasilitas .grid > div', { delay: 250, origin: 'bottom', interval: 100 });
    }
    // Animasi untuk halaman fasilitas.html
     else if (pathname.endsWith('fasilitas.html')) {
        sr.reveal('.bg-purple-600 h1', { delay: 150, origin: 'left' });
        sr.reveal('.bg-purple-600 p', { delay: 200, origin: 'left' });
        sr.reveal('.container.mx-auto.px-4.py-12 .text-center', { delay: 150, origin: 'top' });
        sr.reveal('.lg\\:col-span-2 > div', { delay: 200, origin: 'bottom', interval: 150 });
        sr.reveal('aside h3', { delay: 250, origin: 'top' });
        sr.reveal('aside .space-y-6 > div', { delay: 300, origin: 'right', interval: 150 });
    }
}