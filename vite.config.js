import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path'; // Baris ini mengimpor fungsi 'resolve'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: { // Konfigurasi ini ditambahkan untuk mendaftarkan semua halaman HTML
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        profil: resolve(__dirname, 'profil.html'),
        jurusan: resolve(__dirname, 'jurusan.html'),
        portofolio: resolve(__dirname, 'portofolio.html'),
        berita: resolve(__dirname, 'berita.html'),
        fasilitas: resolve(__dirname, 'fasilitas.html'),
      },
    },
  },
});