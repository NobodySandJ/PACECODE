// src/admin.js

// Impor fungsi-fungsi yang diperlukan dari Firebase SDK
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
    let portfolioData = []; // Akan menyimpan dokumen portfolio dari Firestore
    let guruData = [];      // Akan menyimpan dokumen guru dari Firestore
    let beritaData = [];    // Akan menyimpan dokumen berita dari Firestore
    let fasilitasData = []; // Akan menyimpan dokumen fasilitas dari Firestore
    let jurusanOptions = []; // Untuk mengisi dropdown

    // --- DOM ELEMENTS ---
    const headlineToggle = document.getElementById('headline-toggle');
    const modal = document.getElementById('admin-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');

    // --- INITIALIZATION ---
    // Mengatur toggle headline berdasarkan localStorage
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

    // Menutup modal jika area di luar modal diklik
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });
    
    // --- DATA LOADING & RENDERING ---
    async function loadAllData() {
        try {
            // Ambil data jurusan dari file JSON untuk mengisi dropdown
            const jurusanRes = await fetch('/data/jurusan.json');
            const jurusanJson = await jurusanRes.json();
            jurusanOptions = Object.keys(jurusanJson);

            // Render semua bagian
            renderAll();
            setupAllForms();
        } catch (error) {
            console.error('Error memuat data awal:', error);
            alert('Gagal memuat data konfigurasi. Periksa konsol untuk detail.');
        }
    }
    
    function renderAll() {
        renderPortfolio();
        renderGuru();
        renderBerita();
        renderFasilitas();
    }

    // --- PORTFOLIO CRUD ---
    async function renderPortfolio() {
        const listEl = document.getElementById('portfolio-list');
        const jurusanSelect = document.querySelector('#portfolio-form select[name="jurusan"]');
        
        jurusanSelect.innerHTML = jurusanOptions.map(j => `<option value="${j}">${j}</option>`).join('');
        listEl.innerHTML = '<p class="text-gray-500">Memuat data portfolio...</p>';

        const portfolioCol = collection(db, 'portfolio');
        const portfolioSnapshot = await getDocs(portfolioCol);
        
        portfolioData = portfolioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        listEl.innerHTML = '';

        if(portfolioData.length === 0) {
            listEl.innerHTML = '<p class="text-gray-500">Belum ada data portfolio.</p>';
            return;
        }

        portfolioData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'p-4 border rounded-lg flex justify-between items-center';
            div.innerHTML = `
                <div>
                    <p class="font-bold">${item.namaProject}</p>
                    <p class="text-sm text-gray-600">${item.nama} - ${item.jurusan}</p>
                </div>
                <div>
                    <button data-id="${item.id}" class="edit-portfolio px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">Edit</button>
                    <button data-id="${item.id}" class="delete-portfolio px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">Hapus</button>
                </div>`;
            listEl.appendChild(div);
        });

        listEl.querySelectorAll('.edit-portfolio').forEach(btn => btn.addEventListener('click', (e) => editPortfolio(e.target.dataset.id)));
        listEl.querySelectorAll('.delete-portfolio').forEach(btn => btn.addEventListener('click', (e) => deletePortfolio(e.target.dataset.id)));
    }

    async function editPortfolio(id) {
        const item = portfolioData.find(p => p.id === id);
        const body = `
            <form id="edit-portfolio-form" class="space-y-4">
                <input type="hidden" name="id" value="${item.id}">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Nama Siswa</label>
                    <input type="text" name="nama" value="${item.nama}" class="mt-1 block w-full p-2 border rounded-md">
                </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-700">Nama Proyek</label>
                    <input type="text" name="namaProject" value="${item.namaProject}" class="mt-1 block w-full p-2 border rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Deskripsi Singkat</label>
                    <textarea name="deskripsiSingkat" class="mt-1 block w-full p-2 border rounded-md">${item.deskripsiSingkat}</textarea>
                </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-700">URL Foto</label>
                    <input type="text" name="fotoProject" value="${item.fotoProject}" class="mt-1 block w-full p-2 border rounded-md">
                </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-700">Tempat Bekerja (opsional)</label>
                    <input type="text" name="bekerja" value="${item.bekerja || ''}" class="mt-1 block w-full p-2 border rounded-md">
                </div>
            </form>`;
        const footer = `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="save-btn" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Simpan</button>`;
        showModal(`Edit Portfolio: ${item.namaProject}`, body, footer);

        document.getElementById('save-btn').addEventListener('click', async () => {
            const form = document.getElementById('edit-portfolio-form');
            const formData = new FormData(form);
            const docRef = doc(db, "portfolio", id);
            await updateDoc(docRef, {
                nama: formData.get('nama'),
                namaProject: formData.get('namaProject'),
                deskripsiSingkat: formData.get('deskripsiSingkat'),
                fotoProject: formData.get('fotoProject'),
                bekerja: formData.get('bekerja') || null
            });
            renderPortfolio();
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
            renderPortfolio();
            hideModal();
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }

    // --- GURU, BERITA, FASILITAS (Placeholder functions, implementasi mirip Portfolio) ---
    async function renderGuru() {
        const listEl = document.getElementById('guru-list');
        listEl.innerHTML = '<p class="text-gray-500">Fitur kelola guru belum diimplementasikan.</p>';
        // Implementasi lengkap akan mirip dengan renderPortfolio, tetapi menargetkan collection 'guru'
    }

    async function renderBerita() {
        const listEl = document.getElementById('berita-list');
        listEl.innerHTML = '<p class="text-gray-500">Fitur kelola berita belum diimplementasikan.</p>';
        // Implementasi lengkap akan mirip dengan renderPortfolio, tetapi menargetkan collection 'berita'
    }

    async function renderFasilitas() {
         const listEl = document.getElementById('fasilitas-list');
         listEl.innerHTML = '<p class="text-gray-500">Fitur kelola fasilitas belum diimplementasikan.</p>';
         // Implementasi lengkap akan mirip dengan renderPortfolio, tetapi menargetkan collection 'fasilitas'
    }
    
    // --- FORM SETUP ---
    function setupAllForms() {
        // Form untuk menambah Portfolio
        document.getElementById('portfolio-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const newPortfolio = {
                nama: formData.get('nama'),
                namaProject: formData.get('namaProject'),
                deskripsiSingkat: formData.get('deskripsiSingkat'),
                bekerja: formData.get('bekerja') || null,
                fotoProject: formData.get('fotoProject'),
                jurusan: formData.get('jurusan'),
                deskripsiLengkap: "Deskripsi lengkap akan ditambahkan kemudian.",
                linkProject: "#"
            };

            try {
                const docRef = await addDoc(collection(db, "portfolio"), newPortfolio);
                console.log("Document written with ID: ", docRef.id);
                renderPortfolio();
                form.reset();
                alert('Portfolio berhasil ditambahkan!');
            } catch (error) {
                console.error("Error adding document: ", error);
                alert('Gagal menambahkan portfolio.');
            }
        });

        // Placeholder untuk form lainnya
        document.getElementById('guru-form').addEventListener('submit', e => {
            e.preventDefault();
            alert('Fitur tambah guru belum diimplementasikan.');
        });

        document.getElementById('berita-form').addEventListener('submit', e => {
            e.preventDefault();
            alert('Fitur tambah berita belum diimplementasikan.');
        });

        document.getElementById('fasilitas-form').addEventListener('submit', e => {
             e.preventDefault();
             alert('Fitur tambah fasilitas belum diimplementasikan.');
        });
    }
    
    // --- HELPERS ---
    // Fungsi untuk highlight navigasi sidebar berdasarkan posisi scroll
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