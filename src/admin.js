// src/admin.js

import { db } from './firebase.js';
import { 
    collection, 
    getDocs, 
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc 
} from "firebase/firestore";

document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL STATE ---
    let portfolioData = [];
    let guruData = [];
    let beritaData = [];
    let fasilitasData = [];
    let jurusanOptions = []; // Akan diisi dari data Firestore

    // --- DOM ELEMENTS ---
    const headlineToggle = document.getElementById('headline-toggle');
    const modal = document.getElementById('admin-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');

    // --- INITIALIZATION ---
    if (headlineToggle) {
        const headlineStatus = localStorage.getItem('headlineEnabled');
        headlineToggle.checked = headlineStatus === null ? true : headlineStatus === 'true';
        headlineToggle.addEventListener('change', () => {
            localStorage.setItem('headlineEnabled', headlineToggle.checked);
        });
    }
    
    // Memuat semua data dan menyiapkan UI
    loadAllData();
    setupScrollSpy();

    // --- MODAL FUNCTIONS ---
    function showModal(title, bodyHtml, footerHtml) {
        modalTitle.textContent = title;
        modalBody.innerHTML = bodyHtml;
        modalFooter.innerHTML = footerHtml;
        modal.classList.remove('hidden');
    }

    function hideModal() {
        modal.classList.add('hidden');
        modalBody.innerHTML = '';
        modalFooter.innerHTML = '';
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });
    
    // --- DATA LOADING & RENDERING ---
    async function loadAllData() {
        try {
            // Render semua bagian terlebih dahulu
            await renderAll();
            // Setelah semua data (terutama portfolio) dimuat, kita bisa mendapatkan opsi jurusan
            setupJurusanOptions();
            // Baru setelah itu, siapkan semua form
            setupAllForms();
        } catch (error) {
            console.error('Error memuat data awal:', error);
            // Alert ini seharusnya tidak muncul lagi
            alert('Gagal memuat data konfigurasi. Periksa konsol untuk detail.');
        }
    }
    
    async function renderAll() {
        // renderPortfolio harus dijalankan pertama untuk mendapatkan daftar jurusan
        await renderPortfolio(); 
        await renderGuru();
        await renderBerita();
        await renderFasilitas();
    }

    // Fungsi baru untuk mengisi dropdown jurusan dari data portfolio yang ada
    function setupJurusanOptions() {
        const jurusanSet = new Set(portfolioData.map(item => item.jurusan));
        jurusanOptions = [...jurusanSet];
        
        // Perbarui semua dropdown di halaman
        const jurusanSelects = document.querySelectorAll('select[name="jurusan"]');
        jurusanSelects.forEach(select => {
            select.innerHTML = jurusanOptions.map(j => `<option value="${j}">${j}</option>`).join('');
        });
    }

    // --- GENERIC CRUD FUNCTIONS ---
    async function renderItems(collectionName, listElementId, dataArray, editHandler, deleteHandler) {
        const listEl = document.getElementById(listElementId);
        listEl.innerHTML = `<p class="text-gray-500">Memuat data ${collectionName}...</p>`;
        
        const colRef = collection(db, collectionName);
        const snapshot = await getDocs(colRef);
        
        dataArray.length = 0; // Kosongkan array
        snapshot.docs.forEach(doc => dataArray.push({ id: doc.id, ...doc.data() }));
        listEl.innerHTML = '';

        if (dataArray.length === 0) {
            listEl.innerHTML = `<p class="text-gray-500">Belum ada data ${collectionName}.</p>`;
            return;
        }

        dataArray.forEach(item => {
            const div = document.createElement('div');
            div.className = 'p-4 border rounded-lg flex justify-between items-center';
            const title = item.namaProject || item.nama || item.judul;
            const subtitle = item.jurusan || item.ringkasan || `ID: ${item.id}`;
            div.innerHTML = `
                <div>
                    <p class="font-bold">${title}</p>
                    <p class="text-sm text-gray-600">${subtitle}</p>
                </div>
                <div>
                    <button data-id="${item.id}" class="edit-btn px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">Edit</button>
                    <button data-id="${item.id}" class="delete-btn px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">Hapus</button>
                </div>`;
            listEl.appendChild(div);
        });

        listEl.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => editHandler(e.target.dataset.id)));
        listEl.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => deleteHandler(e.target.dataset.id)));
    }

    // --- Portfolio Section ---
    async function renderPortfolio() {
        await renderItems('portfolio', 'portfolio-list', portfolioData, editPortfolio, deletePortfolio);
    }

    async function editPortfolio(id) {
        const item = portfolioData.find(p => p.id === id);
        const jurusanOptionsHtml = jurusanOptions.map(j => `<option value="${j}" ${item.jurusan === j ? 'selected' : ''}>${j}</option>`).join('');
        const body = `
            <form id="edit-portfolio-form" class="space-y-4">
                <input type="hidden" name="id" value="${item.id}">
                <div><label class="block text-sm">Nama Siswa</label><input type="text" name="nama" value="${item.nama}" class="mt-1 block w-full p-2 border rounded-md"></div>
                <div><label class="block text-sm">Nama Proyek</label><input type="text" name="namaProject" value="${item.namaProject}" class="mt-1 block w-full p-2 border rounded-md"></div>
                <div><label class="block text-sm">Deskripsi Singkat</label><textarea name="deskripsiSingkat" class="mt-1 block w-full p-2 border rounded-md">${item.deskripsiSingkat}</textarea></div>
                <div><label class="block text-sm">URL Foto</label><input type="text" name="fotoProject" value="${item.fotoProject}" class="mt-1 block w-full p-2 border rounded-md"></div>
                <div><label class="block text-sm">Jurusan</label><select name="jurusan" class="mt-1 block w-full p-2 border rounded-md">${jurusanOptionsHtml}</select></div>
                <div><label class="block text-sm">Tempat Bekerja (opsional)</label><input type="text" name="bekerja" value="${item.bekerja || ''}" class="mt-1 block w-full p-2 border rounded-md"></div>
            </form>`;
        const footer = `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="save-btn" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Simpan</button>`;
        showModal(`Edit Portfolio: ${item.namaProject}`, body, footer);

        document.getElementById('save-btn').addEventListener('click', async () => {
            const form = document.getElementById('edit-portfolio-form');
            const formData = new FormData(form);
            await updateDoc(doc(db, "portfolio", id), {
                nama: formData.get('nama'),
                namaProject: formData.get('namaProject'),
                deskripsiSingkat: formData.get('deskripsiSingkat'),
                fotoProject: formData.get('fotoProject'),
                jurusan: formData.get('jurusan'),
                bekerja: formData.get('bekerja') || null
            });
            await renderPortfolio();
            hideModal();
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }

    async function deletePortfolio(id) {
        const item = portfolioData.find(p => p.id === id);
        const body = `<p>Anda yakin ingin menghapus portfolio <strong>${item.namaProject}</strong>?</p>`;
        const footer = `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="confirm-delete-btn" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Hapus</button>`;
        showModal('Konfirmasi Hapus', body, footer);

        document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
            await deleteDoc(doc(db, "portfolio", id));
            await renderPortfolio();
            setupJurusanOptions(); // Update jurusan options in case a whole category is deleted
            hideModal();
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }

    // --- Guru Section ---
    async function renderGuru() {
        await renderItems('guru', 'guru-list', guruData, editGuru, deleteGuru);
    }
    
    // (Fungsi editGuru dan deleteGuru sama seperti sebelumnya, tidak perlu diubah)
    async function editGuru(id) {
        const item = guruData.find(g => g.id === id);
        const jurusanOptionsHtml = jurusanOptions.map(j => `<option value="${j}" ${item.jurusan === j ? 'selected' : ''}>${j}</option>`).join('');
        const body = `
            <form id="edit-guru-form" class="space-y-4">
                <div><label class="block text-sm">Nama Guru</label><input type="text" name="nama" value="${item.nama}" class="mt-1 block w-full p-2 border rounded-md"></div>
                <div><label class="block text-sm">URL Foto</label><input type="text" name="foto" value="${item.foto}" class="mt-1 block w-full p-2 border rounded-md"></div>
                <div><label class="block text-sm">Jurusan</label><select name="jurusan" class="mt-1 block w-full p-2 border rounded-md">${jurusanOptionsHtml}</select></div>
            </form>`;
        const footer = `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded">Batal</button><button id="save-btn" class="px-4 py-2 bg-indigo-600 text-white rounded">Simpan</button>`;
        showModal(`Edit Guru: ${item.nama}`, body, footer);

        document.getElementById('save-btn').addEventListener('click', async () => {
            const form = document.getElementById('edit-guru-form');
            const formData = new FormData(form);
            await updateDoc(doc(db, "guru", id), {
                nama: formData.get('nama'),
                foto: formData.get('foto'),
                jurusan: formData.get('jurusan')
            });
            await renderGuru();
            hideModal();
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }
    async function deleteGuru(id) {
        const item = guruData.find(g => g.id === id);
        showModal('Konfirmasi Hapus', `<p>Anda yakin ingin menghapus guru <strong>${item.nama}</strong>?</p>`, `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded">Batal</button><button id="confirm-delete-btn" class="px-4 py-2 bg-red-600 text-white rounded">Hapus</button>`);
        document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
            await deleteDoc(doc(db, "guru", id));
            await renderGuru();
            hideModal();
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }

    // --- Berita Section ---
    async function renderBerita() {
        await renderItems('berita', 'berita-list', beritaData, editBerita, deleteBerita);
    }
    
    // (Fungsi editBerita dan deleteBerita sama seperti sebelumnya, tidak perlu diubah)
     async function editBerita(id) {
        const item = beritaData.find(b => b.id === id);
        const body = `
            <form id="edit-berita-form" class="space-y-4">
                <div><label class="block text-sm">Judul Berita</label><input type="text" name="judul" value="${item.judul}" class="mt-1 block w-full p-2 border rounded-md"></div>
                <div><label class="block text-sm">Ringkasan</label><textarea name="ringkasan" class="mt-1 block w-full p-2 border rounded-md">${item.ringkasan}</textarea></div>
                <div><label class="block text-sm">URL Gambar</label><input type="text" name="gambar" value="${item.gambar}" class="mt-1 block w-full p-2 border rounded-md"></div>
            </form>`;
        const footer = `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded">Batal</button><button id="save-btn" class="px-4 py-2 bg-indigo-600 text-white rounded">Simpan</button>`;
        showModal(`Edit Berita: ${item.judul}`, body, footer);

        document.getElementById('save-btn').addEventListener('click', async () => {
            const form = document.getElementById('edit-berita-form');
            const formData = new FormData(form);
            await updateDoc(doc(db, "berita", id), {
                judul: formData.get('judul'),
                ringkasan: formData.get('ringkasan'),
                gambar: formData.get('gambar')
            });
            await renderBerita();
            hideModal();
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }
    async function deleteBerita(id) {
        const item = beritaData.find(b => b.id === id);
        showModal('Konfirmasi Hapus', `<p>Anda yakin ingin menghapus berita <strong>${item.judul}</strong>?</p>`, `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded">Batal</button><button id="confirm-delete-btn" class="px-4 py-2 bg-red-600 text-white rounded">Hapus</button>`);
        document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
            await deleteDoc(doc(db, "berita", id));
            await renderBerita();
            hideModal();
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }

    // --- Fasilitas Section ---
    async function renderFasilitas() {
        await renderItems('fasilitas', 'fasilitas-list', fasilitasData, editFasilitas, deleteFasilitas);
    }
    
    // (Fungsi editFasilitas dan deleteFasilitas sama seperti sebelumnya, tidak perlu diubah)
     async function editFasilitas(id) {
        const item = fasilitasData.find(f => f.id === id);
        const body = `
            <form id="edit-fasilitas-form" class="space-y-4">
                <div><label class="block text-sm">Nama Fasilitas</label><input type="text" name="nama" value="${item.nama}" class="mt-1 block w-full p-2 border rounded-md"></div>
                <div><label class="block text-sm">URL Gambar</label><input type="text" name="gambar" value="${item.gambar}" class="mt-1 block w-full p-2 border rounded-md"></div>
            </form>`;
        const footer = `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded">Batal</button><button id="save-btn" class="px-4 py-2 bg-indigo-600 text-white rounded">Simpan</button>`;
        showModal(`Edit Fasilitas: ${item.nama}`, body, footer);

        document.getElementById('save-btn').addEventListener('click', async () => {
            const form = document.getElementById('edit-fasilitas-form');
            const formData = new FormData(form);
            await updateDoc(doc(db, "fasilitas", id), {
                nama: formData.get('nama'),
                gambar: formData.get('gambar')
            });
            await renderFasilitas();
            hideModal();
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }
    async function deleteFasilitas(id) {
        const item = fasilitasData.find(f => f.id === id);
        showModal('Konfirmasi Hapus', `<p>Anda yakin ingin menghapus fasilitas <strong>${item.nama}</strong>?</p>`, `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded">Batal</button><button id="confirm-delete-btn" class="px-4 py-2 bg-red-600 text-white rounded">Hapus</button>`);
        document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
            await deleteDoc(doc(db, "fasilitas", id));
            await renderFasilitas();
            hideModal();
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }
    
    // --- FORM SETUP ---
    function setupAllForms() {
        // Generic function for handling form submission
        async function handleFormSubmit(e, collectionName, dataMapper, renderFunc) {
            e.preventDefault();
            const form = e.target;
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Menambahkan...';

            try {
                const newData = dataMapper(new FormData(form));
                await addDoc(collection(db, collectionName), newData);
                await renderFunc();
                
                // Jika data portfolio baru ditambahkan, perbarui opsi jurusan
                if (collectionName === 'portfolio') {
                    setupJurusanOptions();
                }

                form.reset();
                alert(`${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)} berhasil ditambahkan!`);
            } catch (error) {
                console.error(`Error adding ${collectionName}: `, error);
                alert(`Gagal menambahkan ${collectionName}.`);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = `Tambah ${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}`;
            }
        }

        document.getElementById('portfolio-form').addEventListener('submit', (e) => handleFormSubmit(e, 'portfolio', (formData) => ({
            nama: formData.get('nama'),
            namaProject: formData.get('namaProject'),
            deskripsiSingkat: formData.get('deskripsiSingkat'),
            bekerja: formData.get('bekerja') || null,
            fotoProject: formData.get('fotoProject'),
            jurusan: formData.get('jurusan'),
            deskripsiLengkap: "Deskripsi lengkap akan ditambahkan kemudian.",
            linkProject: "#"
        }), renderPortfolio));

        document.getElementById('guru-form').addEventListener('submit', (e) => handleFormSubmit(e, 'guru', (formData) => ({
            nama: formData.get('nama'),
            foto: formData.get('foto'),
            jurusan: formData.get('jurusan')
        }), renderGuru));

        document.getElementById('berita-form').addEventListener('submit', (e) => handleFormSubmit(e, 'berita', (formData) => ({
            judul: formData.get('judul'),
            ringkasan: formData.get('ringkasan'),
            gambar: formData.get('gambar')
        }), renderBerita));

        document.getElementById('fasilitas-form').addEventListener('submit', (e) => handleFormSubmit(e, 'fasilitas', (formData) => ({
            nama: formData.get('nama'),
            gambar: formData.get('gambar')
        }), renderFasilitas));
    }
    
    // --- HELPERS ---
    function setupScrollSpy() {
        const sections = document.querySelectorAll('main section[id]');
        const navLinks = document.querySelectorAll('#admin-nav a');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href').substring(1) === entry.target.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { rootMargin: "-40% 0px -60% 0px" });

        sections.forEach(section => observer.observe(section));
    }
});