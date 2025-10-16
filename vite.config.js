import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        profil: resolve(__dirname, 'profil.html'),
        jurusan: resolve(__dirname, 'jurusan.html'),
        portofolio: resolve(__dirname, 'portofolio.html'),
        berita: resolve(__dirname, 'berita.html'),
        fasilitas: resolve(__dirname, 'fasilitas.html'),
        guru: resolve(__dirname, 'guru.html'),
        galeri: resolve(__dirname, 'galeri.html'), // Tambahkan baris ini
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});