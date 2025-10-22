// src/admin.js

import { db, auth } from './firebase.js'; // Import auth
import {
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";
// *** Impor fungsi otentikasi ***
import { observeAuthState, isAdmin } from './auth.js'; // Pastikan file auth.js ada di src/

document.addEventListener('DOMContentLoaded', () => {
    // *** Referensi ke elemen pembungkus konten dan indikator loading ***
    const adminContentWrapper = document.getElementById('admin-content-wrapper');
    const loadingIndicator = document.getElementById('loading-indicator');

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

    // *** Pemeriksaan Otentikasi dan Otorisasi ***
    observeAuthState(async user => {
        if (user) {
            // Pengguna sudah login, periksa apakah dia admin
            const adminStatus = await isAdmin(user);
            if (adminStatus) {
                // Pengguna adalah admin, tampilkan konten dan mulai inisialisasi
                if(loadingIndicator) loadingIndicator.style.display = 'none';
                if(adminContentWrapper) adminContentWrapper.classList.remove('hidden');
                initializeAdminDashboard(); // Panggil fungsi inisialisasi
            } else {
                // Pengguna login tapi bukan admin
                if(loadingIndicator) loadingIndicator.innerHTML = '<p class="text-xl text-red-600">Akses Ditolak. Anda bukan admin.</p>';
                alert("Akses ditolak. Anda bukan admin.");
                window.location.href = 'index.html'; // Alihkan ke halaman utama
            }
        } else {
            // Pengguna belum login
            if(loadingIndicator) loadingIndicator.innerHTML = '<p class="text-xl text-red-600">Silakan login sebagai admin.</p>';
            alert("Silakan login untuk mengakses halaman admin.");
            window.location.href = 'login.html'; // Alihkan ke halaman login
        }
    });

    // *** Fungsi untuk inisialisasi dashboard setelah admin terverifikasi ***
    function initializeAdminDashboard() {
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
    }

    // --- MODAL FUNCTIONS ---
    function showModal(title, bodyHtml, footerHtml) {
        if (!modal || !modalTitle || !modalBody || !modalFooter) return;
        modalTitle.textContent = title;
        modalBody.innerHTML = bodyHtml;
        modalFooter.innerHTML = footerHtml;
        modal.classList.remove('hidden');
    }

    function hideModal() {
        if (!modal || !modalBody || !modalFooter) return;
        modal.classList.add('hidden');
        modalBody.innerHTML = '';
        modalFooter.innerHTML = '';
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal();
            }
        });
    }

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
            alert('Gagal memuat data konfigurasi. Periksa konsol untuk detail.');
        }
    }

    async function renderAll() {
        await renderPortfolio();
        await renderGuru();
        await renderBerita();
        await renderFasilitas();
    }

    function setupJurusanOptions() {
        const jurusanSet = new Set(portfolioData.map(item => item.jurusan));
        jurusanOptions = [...jurusanSet].sort(); // Sortir jurusan

        // Perbarui semua dropdown di halaman
        const jurusanSelects = document.querySelectorAll('select[name="jurusan"]');
        jurusanSelects.forEach(select => {
             // Simpan nilai yang dipilih sebelumnya (jika ada, untuk form edit)
            const previousValue = select.value;
            select.innerHTML = '<option value="">-- Pilih Jurusan --</option>'; // Opsi default
            select.innerHTML += jurusanOptions.map(j => `<option value="${j}">${j}</option>`).join('');
             // Setel kembali ke nilai sebelumnya jika memungkinkan
            if (previousValue && jurusanOptions.includes(previousValue)) {
                select.value = previousValue;
            }
        });
    }

    // --- GENERIC CRUD FUNCTIONS ---
    async function renderItems(collectionName, listElementId, dataArray, editHandler, deleteHandler) {
        const listEl = document.getElementById(listElementId);
        if (!listEl) {
            console.error(`Elemen dengan ID '${listElementId}' tidak ditemukan.`);
            return;
        }
        listEl.innerHTML = `<p class="text-gray-500">Memuat data ${collectionName}...</p>`;

        try {
            const colRef = collection(db, collectionName);
            const snapshot = await getDocs(colRef);

            dataArray.length = 0; // Kosongkan array
            snapshot.docs.forEach(doc => dataArray.push({ id: doc.id, ...doc.data() }));
            listEl.innerHTML = '';

            if (dataArray.length === 0) {
                listEl.innerHTML = `<p class="text-gray-500">Belum ada data ${collectionName}.</p>`;
                return;
            }

            // Sortir data (misal berdasarkan nama atau judul jika ada)
            dataArray.sort((a, b) => {
                const nameA = a.namaProject || a.nama || a.judul || a.id;
                const nameB = b.namaProject || b.nama || b.judul || b.id;
                return nameA.localeCompare(nameB);
            });


            dataArray.forEach(item => {
                const div = document.createElement('div');
                div.className = 'p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm'; // Tambahkan style
                const title = item.namaProject || item.nama || item.judul || `Item ID: ${item.id}`; // Handle jika tidak ada nama/judul
                const subtitle = item.jurusan || item.ringkasan || item.id; // Tampilkan ID jika tidak ada subtitle lain
                div.innerHTML = `
                    <div>
                        <p class="font-bold text-gray-800">${title}</p>
                        <p class="text-sm text-gray-600">${subtitle}</p>
                    </div>
                    <div class="space-x-2"> {/* Tambahkan space antar tombol */}
                        <button data-id="${item.id}" class="edit-btn px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors">Edit</button>
                        <button data-id="${item.id}" class="delete-btn px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors">Hapus</button>
                    </div>`;
                listEl.appendChild(div);
            });

            // Pindahkan event listener ke wrapper untuk efisiensi jika daftar panjang
            listEl.addEventListener('click', (e) => {
                 if (e.target.classList.contains('edit-btn')) {
                     editHandler(e.target.dataset.id);
                 } else if (e.target.classList.contains('delete-btn')) {
                    const item = dataArray.find(i => i.id === e.target.dataset.id);
                    const itemName = item.namaProject || item.nama || item.judul || `Item ID ${item.id}`;
                    // Panggil wrapper delete
                    deleteItemWrapper(deleteHandler, e.target.dataset.id, itemName, collectionName);
                 }
            });

        } catch (error) {
            console.error(`Gagal memuat data ${collectionName}:`, error);
            listEl.innerHTML = `<p class="text-red-500">Gagal memuat data ${collectionName}.</p>`;
        }
    }

     // --- Wrapper untuk fungsi delete dengan pemeriksaan admin ---
     async function deleteItemWrapper(deleteFunc, id, itemName, collectionName) {
        const user = auth.currentUser;
        const adminStatus = await isAdmin(user);
        if (!adminStatus) {
            alert("Operasi hapus gagal: Anda tidak memiliki hak admin.");
            return;
        }

        // Tampilkan modal konfirmasi sebelum benar-benar menghapus
        const body = `<p>Anda yakin ingin menghapus data ${collectionName}: <strong>${itemName}</strong>?</p><p class="text-red-600 text-sm mt-2">Tindakan ini tidak dapat dibatalkan.</p>`;
        const footer = `<button id="cancel-delete-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="confirm-delete-btn" data-id="${id}" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Hapus</button>`;
        showModal('Konfirmasi Hapus', body, footer);

        const confirmBtn = document.getElementById('confirm-delete-btn');
        const cancelBtn = document.getElementById('cancel-delete-btn');

        // Gunakan .onclick agar listener sebelumnya terganti
        confirmBtn.onclick = async () => {
             // Pemeriksaan admin lagi tepat sebelum aksi delete
             const currentUser = auth.currentUser;
             const currentAdminStatus = await isAdmin(currentUser);
             if (!currentAdminStatus) {
                 alert("Operasi hapus gagal: Anda tidak lagi memiliki hak admin.");
                 hideModal();
                 return;
             }
             await deleteFunc(id); // Panggil fungsi delete spesifik (deletePortfolio, deleteGuru, dll.)
        };

        cancelBtn.onclick = hideModal;
    }


    // --- Portfolio Section ---
    async function renderPortfolio() {
        await renderItems('portfolio', 'portfolio-list', portfolioData, editPortfolio, deletePortfolio);
        setupJurusanOptions(); // Pastikan opsi jurusan diperbarui setelah render portfolio
    }

    async function editPortfolio(id) {
        const item = portfolioData.find(p => p.id === id);
        if (!item) {
            alert("Data portfolio tidak ditemukan.");
            return;
        }
        // Pastikan jurusanOptions sudah terisi
        if (jurusanOptions.length === 0) await loadAllData(); // Load ulang jika belum ada

        const jurusanOptionsHtml = jurusanOptions.map(j => `<option value="${j}" ${item.jurusan === j ? 'selected' : ''}>${j}</option>`).join('');
        const body = `
            <form id="edit-portfolio-form" class="space-y-4">
                <input type="hidden" name="id" value="${item.id}">
                <div><label class="block text-sm font-medium text-gray-700">Nama Siswa</label><input type="text" name="nama" value="${item.nama || ''}" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></div>
                <div><label class="block text-sm font-medium text-gray-700">Nama Proyek</label><input type="text" name="namaProject" value="${item.namaProject || ''}" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></div>
                <div><label class="block text-sm font-medium text-gray-700">Deskripsi Singkat</label><textarea name="deskripsiSingkat" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">${item.deskripsiSingkat || ''}</textarea></div>
                <div><label class="block text-sm font-medium text-gray-700">URL Foto</label><input type="url" name="fotoProject" value="${item.fotoProject || ''}" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></div>
                <div><label class="block text-sm font-medium text-gray-700">Jurusan</label><select name="jurusan" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"><option value="">-- Pilih Jurusan --</option>${jurusanOptionsHtml}</select></div>
                <div><label class="block text-sm font-medium text-gray-700">Tempat Bekerja (opsional)</label><input type="text" name="bekerja" value="${item.bekerja || ''}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></div>
            </form>`;
        const footer = `<button id="cancel-edit-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="save-edit-btn" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Simpan Perubahan</button>`;
        showModal(`Edit Portfolio: ${item.namaProject || 'Item'}`, body, footer);

        document.getElementById('save-edit-btn').onclick = async () => {
             // *** Pemeriksaan admin sebelum menyimpan ***
            const user = auth.currentUser;
            const adminStatus = await isAdmin(user);
            if (!adminStatus) {
                alert("Operasi simpan gagal: Anda tidak memiliki hak admin.");
                hideModal();
                return;
            }

            const form = document.getElementById('edit-portfolio-form');
             if (!form.checkValidity()) {
                 alert("Harap isi semua field yang wajib diisi.");
                 form.reportValidity(); // Tampilkan pesan error bawaan browser
                 return;
             }
            const formData = new FormData(form);
            const updatedData = {
                nama: formData.get('nama'),
                namaProject: formData.get('namaProject'),
                deskripsiSingkat: formData.get('deskripsiSingkat'),
                fotoProject: formData.get('fotoProject'),
                jurusan: formData.get('jurusan'),
                bekerja: formData.get('bekerja') || null // Set null jika kosong
            };

            const saveBtn = document.getElementById('save-edit-btn');
            saveBtn.disabled = true;
            saveBtn.textContent = 'Menyimpan...';

            try {
                await updateDoc(doc(db, "portfolio", id), updatedData);
                await renderPortfolio(); // Muat ulang daftar setelah update
                hideModal();
                alert("Data portfolio berhasil diperbarui.");
            } catch (error) {
                console.error("Error updating portfolio:", error);
                alert("Gagal memperbarui data portfolio.");
                 saveBtn.disabled = false;
                 saveBtn.textContent = 'Simpan Perubahan';
            }
        };
        document.getElementById('cancel-edit-btn').onclick = hideModal;
    }

    async function deletePortfolio(id) {
        // Fungsi ini dipanggil dari dalam deleteItemWrapper,
        // jadi tidak perlu cek admin lagi di sini.
        try {
            await deleteDoc(doc(db, "portfolio", id));
            await renderPortfolio(); // Muat ulang daftar
            setupJurusanOptions(); // Perbarui opsi jurusan jika ada yg hilang
            hideModal(); // Tutup modal konfirmasi
             alert("Data portfolio berhasil dihapus.");
        } catch (error) {
            console.error("Error deleting portfolio:", error);
            alert("Gagal menghapus data portfolio.");
             hideModal();
        }
    }

    // --- Guru Section ---
    async function renderGuru() {
        await renderItems('guru', 'guru-list', guruData, editGuru, deleteGuru);
    }

    async function editGuru(id) {
        const item = guruData.find(g => g.id === id);
         if (!item) {
            alert("Data guru tidak ditemukan.");
            return;
        }

        // Pastikan jurusanOptions sudah terisi
        if (jurusanOptions.length === 0) await loadAllData();

        const jurusanOptionsHtml = jurusanOptions.map(j => `<option value="${j}" ${item.jurusan === j ? 'selected' : ''}>${j}</option>`).join('');
        const body = `
            <form id="edit-guru-form" class="space-y-4">
                <input type="hidden" name="id" value="${item.id}">
                <div><label class="block text-sm font-medium text-gray-700">Nama Guru</label><input type="text" name="nama" value="${item.nama || ''}" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></div>
                <div><label class="block text-sm font-medium text-gray-700">URL Foto</label><input type="url" name="foto" value="${item.foto || ''}" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></div>
                <div><label class="block text-sm font-medium text-gray-700">Jurusan</label><select name="jurusan" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"><option value="">-- Pilih Jurusan --</option>${jurusanOptionsHtml}</select></div>
            </form>`;
        const footer = `<button id="cancel-edit-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="save-edit-btn" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Simpan Perubahan</button>`;
        showModal(`Edit Guru: ${item.nama || 'Item'}`, body, footer);

         document.getElementById('save-edit-btn').onclick = async () => {
             const user = auth.currentUser;
             const adminStatus = await isAdmin(user);
             if (!adminStatus) {
                 alert("Operasi simpan gagal: Anda tidak memiliki hak admin.");
                 hideModal();
                 return;
             }
             const form = document.getElementById('edit-guru-form');
             if (!form.checkValidity()) {
                 alert("Harap isi semua field yang wajib diisi.");
                 form.reportValidity();
                 return;
             }
             const formData = new FormData(form);
             const updatedData = {
                 nama: formData.get('nama'),
                 foto: formData.get('foto'),
                 jurusan: formData.get('jurusan')
             };
             const saveBtn = document.getElementById('save-edit-btn');
             saveBtn.disabled = true;
             saveBtn.textContent = 'Menyimpan...';
             try {
                 await updateDoc(doc(db, "guru", id), updatedData);
                 await renderGuru();
                 hideModal();
                 alert("Data guru berhasil diperbarui.");
             } catch (error) {
                 console.error("Error updating guru:", error);
                 alert("Gagal memperbarui data guru.");
                 saveBtn.disabled = false;
                 saveBtn.textContent = 'Simpan Perubahan';
             }
         };
         document.getElementById('cancel-edit-btn').onclick = hideModal;
    }

    async function deleteGuru(id) {
         try {
            await deleteDoc(doc(db, "guru", id));
            await renderGuru();
            hideModal();
            alert("Data guru berhasil dihapus.");
        } catch (error) {
            console.error("Error deleting guru:", error);
            alert("Gagal menghapus data guru.");
            hideModal();
        }
    }


    // --- Berita Section ---
    async function renderBerita() {
        await renderItems('berita', 'berita-list', beritaData, editBerita, deleteBerita);
    }

    async function editBerita(id) {
        const item = beritaData.find(b => b.id === id);
        if (!item) {
             alert("Data berita tidak ditemukan.");
             return;
         }
        const body = `
            <form id="edit-berita-form" class="space-y-4">
                 <input type="hidden" name="id" value="${item.id}">
                <div><label class="block text-sm font-medium text-gray-700">Judul Berita</label><input type="text" name="judul" value="${item.judul || ''}" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></div>
                <div><label class="block text-sm font-medium text-gray-700">Ringkasan</label><textarea name="ringkasan" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">${item.ringkasan || ''}</textarea></div>
                <div><label class="block text-sm font-medium text-gray-700">URL Gambar</label><input type="url" name="gambar" value="${item.gambar || ''}" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></div>
            </form>`;
        const footer = `<button id="cancel-edit-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="save-edit-btn" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Simpan Perubahan</button>`;
        showModal(`Edit Berita: ${item.judul || 'Item'}`, body, footer);

         document.getElementById('save-edit-btn').onclick = async () => {
             const user = auth.currentUser;
             const adminStatus = await isAdmin(user);
             if (!adminStatus) {
                 alert("Operasi simpan gagal: Anda tidak memiliki hak admin.");
                 hideModal();
                 return;
             }
             const form = document.getElementById('edit-berita-form');
              if (!form.checkValidity()) {
                 alert("Harap isi semua field yang wajib diisi.");
                 form.reportValidity();
                 return;
             }
             const formData = new FormData(form);
             const updatedData = {
                 judul: formData.get('judul'),
                 ringkasan: formData.get('ringkasan'),
                 gambar: formData.get('gambar')
             };
              const saveBtn = document.getElementById('save-edit-btn');
             saveBtn.disabled = true;
             saveBtn.textContent = 'Menyimpan...';
             try {
                 await updateDoc(doc(db, "berita", id), updatedData);
                 await renderBerita();
                 hideModal();
                  alert("Data berita berhasil diperbarui.");
             } catch (error) {
                 console.error("Error updating berita:", error);
                 alert("Gagal memperbarui data berita.");
                  saveBtn.disabled = false;
                 saveBtn.textContent = 'Simpan Perubahan';
             }
         };
         document.getElementById('cancel-edit-btn').onclick = hideModal;
    }

    async function deleteBerita(id) {
         try {
            await deleteDoc(doc(db, "berita", id));
            await renderBerita();
            hideModal();
             alert("Data berita berhasil dihapus.");
        } catch (error) {
            console.error("Error deleting berita:", error);
            alert("Gagal menghapus data berita.");
             hideModal();
        }
    }


    // --- Fasilitas Section ---
    async function renderFasilitas() {
        await renderItems('fasilitas', 'fasilitas-list', fasilitasData, editFasilitas, deleteFasilitas);
    }

    async function editFasilitas(id) {
       const item = fasilitasData.find(f => f.id === id);
        if (!item) {
             alert("Data fasilitas tidak ditemukan.");
             return;
         }
        const body = `
            <form id="edit-fasilitas-form" class="space-y-4">
                 <input type="hidden" name="id" value="${item.id}">
                <div><label class="block text-sm font-medium text-gray-700">Nama Fasilitas</label><input type="text" name="nama" value="${item.nama || ''}" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></div>
                <div><label class="block text-sm font-medium text-gray-700">URL Gambar</label><input type="url" name="gambar" value="${item.gambar || ''}" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></div>
            </form>`;
        const footer = `<button id="cancel-edit-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="save-edit-btn" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Simpan Perubahan</button>`;
        showModal(`Edit Fasilitas: ${item.nama || 'Item'}`, body, footer);

         document.getElementById('save-edit-btn').onclick = async () => {
             const user = auth.currentUser;
             const adminStatus = await isAdmin(user);
             if (!adminStatus) {
                 alert("Operasi simpan gagal: Anda tidak memiliki hak admin.");
                 hideModal();
                 return;
             }
             const form = document.getElementById('edit-fasilitas-form');
             if (!form.checkValidity()) {
                 alert("Harap isi semua field yang wajib diisi.");
                 form.reportValidity();
                 return;
             }
             const formData = new FormData(form);
             const updatedData = {
                 nama: formData.get('nama'),
                 gambar: formData.get('gambar')
             };
              const saveBtn = document.getElementById('save-edit-btn');
             saveBtn.disabled = true;
             saveBtn.textContent = 'Menyimpan...';
             try {
                 await updateDoc(doc(db, "fasilitas", id), updatedData);
                 await renderFasilitas();
                 hideModal();
                 alert("Data fasilitas berhasil diperbarui.");
             } catch (error) {
                 console.error("Error updating fasilitas:", error);
                 alert("Gagal memperbarui data fasilitas.");
                  saveBtn.disabled = false;
                 saveBtn.textContent = 'Simpan Perubahan';
             }
         };
         document.getElementById('cancel-edit-btn').onclick = hideModal;
    }

    async function deleteFasilitas(id) {
         try {
            await deleteDoc(doc(db, "fasilitas", id));
            await renderFasilitas();
            hideModal();
             alert("Data fasilitas berhasil dihapus.");
        } catch (error) {
            console.error("Error deleting fasilitas:", error);
            alert("Gagal menghapus data fasilitas.");
             hideModal();
        }
    }

    // --- FORM SETUP ---
    function setupAllForms() {
        // Generic function for handling form submission
        async function handleFormSubmit(e, collectionName, dataMapper, renderFunc) {
            e.preventDefault();
            const form = e.target;
            const submitButton = form.querySelector('button[type="submit"]');

            // *** Pemeriksaan admin sebelum submit ***
            const user = auth.currentUser;
            const adminStatus = await isAdmin(user);
            if (!adminStatus) {
                alert("Operasi tambah gagal: Anda tidak memiliki hak admin.");
                return;
            }

            // Validasi form sebelum submit
             if (!form.checkValidity()) {
                 alert("Harap isi semua field yang wajib diisi.");
                 form.reportValidity(); // Tampilkan pesan error bawaan browser
                 return;
             }

            submitButton.disabled = true;
            submitButton.textContent = 'Menambahkan...';

            try {
                const formData = new FormData(form);
                const newData = dataMapper(formData);
                await addDoc(collection(db, collectionName), newData);
                await renderFunc();

                // Jika data portfolio baru ditambahkan, perbarui opsi jurusan
                if (collectionName === 'portfolio') {
                    setupJurusanOptions(); // Update dropdowns di semua form
                }

                form.reset();
                alert(`${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)} berhasil ditambahkan!`);
            } catch (error) {
                console.error(`Error adding ${collectionName}: `, error);
                alert(`Gagal menambahkan ${collectionName}. Periksa konsol untuk detail.`);
            } finally {
                submitButton.disabled = false;
                // Menggunakan innerHTML agar bisa menggunakan capitalize di CSS jika perlu
                submitButton.innerHTML = `Tambah ${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}`;
            }
        }

        const portfolioForm = document.getElementById('portfolio-form');
        if (portfolioForm) {
            portfolioForm.addEventListener('submit', (e) => handleFormSubmit(e, 'portfolio', (formData) => ({
                nama: formData.get('nama') || 'Nama Default', // Beri default jika perlu
                namaProject: formData.get('namaProject') || 'Proyek Default',
                deskripsiSingkat: formData.get('deskripsiSingkat') || '',
                bekerja: formData.get('bekerja') || null,
                fotoProject: formData.get('fotoProject') || 'https://placehold.co/600x400',
                jurusan: formData.get('jurusan') || 'Umum', // Pastikan jurusan tidak null
                deskripsiLengkap: formData.get('deskripsiSingkat') || "Deskripsi lengkap menyusul.", // Gunakan deskripsi singkat sbg default
                linkProject: "#" // Link default
            }), renderPortfolio));
        }

        const guruForm = document.getElementById('guru-form');
        if (guruForm) {
            guruForm.addEventListener('submit', (e) => handleFormSubmit(e, 'guru', (formData) => ({
                nama: formData.get('nama') || 'Nama Guru',
                foto: formData.get('foto') || 'https://placehold.co/200x200',
                jurusan: formData.get('jurusan') || 'Umum' // Pastikan ada jurusan
            }), renderGuru));
        }

        const beritaForm = document.getElementById('berita-form');
        if (beritaForm) {
            beritaForm.addEventListener('submit', (e) => handleFormSubmit(e, 'berita', (formData) => ({
                judul: formData.get('judul') || 'Judul Berita',
                ringkasan: formData.get('ringkasan') || '',
                gambar: formData.get('gambar') || 'https://placehold.co/600x400'
            }), renderBerita));
        }

        const fasilitasForm = document.getElementById('fasilitas-form');
        if (fasilitasForm) {
            fasilitasForm.addEventListener('submit', (e) => handleFormSubmit(e, 'fasilitas', (formData) => ({
                nama: formData.get('nama') || 'Nama Fasilitas',
                gambar: formData.get('gambar') || 'https://placehold.co/600x400'
            }), renderFasilitas));
        }
    }

    // --- HELPERS ---
    function setupScrollSpy() {
        const sections = document.querySelectorAll('main section[id]');
        const navLinks = document.querySelectorAll('#admin-nav a');

        if (sections.length === 0 || navLinks.length === 0) return; // Keluar jika elemen tidak ada

        const observer = new IntersectionObserver((entries) => {
            let activeFound = false;
            entries.forEach(entry => {
                 const link = document.querySelector(`#admin-nav a[href="#${entry.target.id}"]`);
                if (entry.isIntersecting && entry.intersectionRatio >= 0.25) { // Sesuaikan ratio jika perlu
                     link?.classList.add('active');
                     activeFound = true; // Tandai jika ada yang aktif berdasarkan intersection
                 } else {
                     link?.classList.remove('active');
                 }
            });

             // Jika tidak ada section yang intersecting (misal di paling atas/bawah), aktifkan link pertama
            if (!activeFound && window.scrollY < 200) { // Cek jika scroll di dekat atas
                navLinks.forEach(link => link.classList.remove('active'));
                 if(navLinks[0]) navLinks[0].classList.add('active');
            }

        }, {
             rootMargin: "-100px 0px -60% 0px", // Margin atas lebih kecil agar link aktif lebih cepat saat scroll ke bawah
             threshold: [0, 0.25, 0.5] // Trigger di beberapa titik intersection
         });


        sections.forEach(section => observer.observe(section));

        // Tambahkan event listener untuk klik link navigasi agar scroll halus
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                navLinks.forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');
                // Scroll behavior sudah diatur smooth via CSS/HTML
            });
        });
    }

}); // End of DOMContentLoaded