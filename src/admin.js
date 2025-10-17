document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL STATE ---
    let portfolioData = {};
    let jurusanData = {};
    let beritaData = [];
    let fasilitasData = []; // Dikelola di memori

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
            const [portfolioRes, jurusanRes, beritaRes] = await Promise.all([
                fetch('/data/portofolio.json'),
                fetch('/data/jurusan.json'),
                fetch('/data/berita.json')
            ]);
            portfolioData = await portfolioRes.json();
            jurusanData = await jurusanRes.json();
            beritaData = await beritaRes.json();
            
            renderAll();
            setupAllForms();
        } catch (error) {
            console.error('Error memuat data:', error);
            alert('Gagal memuat data. Periksa konsol untuk detail.');
        }
    }
    
    function renderAll() {
        renderPortfolio();
        renderGuru();
        renderBerita();
        renderFasilitas();
    }

    function renderPortfolio() {
        const listEl = document.getElementById('portfolio-list');
        const jurusanSelect = document.querySelector('#portfolio-form select[name="jurusan"]');
        const jurusanList = Object.keys(jurusanData);
        
        jurusanSelect.innerHTML = jurusanList.map(j => `<option value="${j}">${j}</option>`).join('');
        listEl.innerHTML = '';

        for (const jurusan in portfolioData) {
            portfolioData[jurusan].forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'p-4 border rounded-lg flex justify-between items-center';
                div.innerHTML = `
                    <div>
                        <p class="font-bold">${item.namaProject}</p>
                        <p class="text-sm text-gray-600">${item.nama} - ${jurusan}</p>
                    </div>
                    <div>
                        <button class="edit-portfolio px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">Edit</button>
                        <button class="delete-portfolio px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">Hapus</button>
                    </div>`;
                div.querySelector('.edit-portfolio').addEventListener('click', () => editPortfolio(jurusan, index));
                div.querySelector('.delete-portfolio').addEventListener('click', () => deletePortfolio(jurusan, index));
                listEl.appendChild(div);
            });
        }
    }
    
    function renderGuru() {
        const listEl = document.getElementById('guru-list');
        listEl.innerHTML = '';
        for (const jurusan in jurusanData) {
            jurusanData[jurusan].guru?.forEach((guru, index) => {
                const div = document.createElement('div');
                div.className = 'p-4 border rounded-lg flex justify-between items-center';
                div.innerHTML = `
                    <div>
                        <p class="font-bold">${guru.nama}</p>
                    </div>
                    <div>
                        <button class="edit-guru px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">Edit</button>
                        <button class="delete-guru px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">Hapus</button>
                    </div>`;
                div.querySelector('.edit-guru').addEventListener('click', () => editGuru(jurusan, index));
                div.querySelector('.delete-guru').addEventListener('click', () => deleteGuru(jurusan, index));
                listEl.appendChild(div);
            });
        }
    }
    
    function renderBerita() {
        const listEl = document.getElementById('berita-list');
        listEl.innerHTML = '';
        beritaData.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'p-4 border rounded-lg flex justify-between items-center';
            const isActive = item.aktif === undefined ? true : item.aktif; // Default to active if undefined
            div.innerHTML = `
                <div>
                    <p class="font-bold">${item.judul}</p>
                    <p class="text-sm ${isActive ? 'text-green-600' : 'text-gray-500'}">${isActive ? 'Aktif' : 'Nonaktif'}</p>
                </div>
                <div>
                    <button class="toggle-berita px-3 py-1 ${isActive ? 'bg-gray-500' : 'bg-green-500'} text-white rounded text-sm">
                        ${isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button class="edit-berita px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">Edit</button>
                    <button class="delete-berita px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">Hapus</button>
                </div>`;
            div.querySelector('.toggle-berita').addEventListener('click', () => toggleBerita(index));
            div.querySelector('.edit-berita').addEventListener('click', () => editBerita(index));
            div.querySelector('.delete-berita').addEventListener('click', () => deleteBerita(index));
            listEl.appendChild(div);
        });
    }

    function renderFasilitas() {
         const listEl = document.getElementById('fasilitas-list');
         listEl.innerHTML = '';
         fasilitasData.forEach((item, index) => {
             const div = document.createElement('div');
             div.className = 'p-4 border rounded-lg flex justify-between items-center';
             div.innerHTML = `
                <div>
                    <p class="font-bold">${item.nama}</p>
                </div>
                <div>
                    <img src="${item.gambar}" class="w-16 h-16 object-cover rounded-lg inline-block mr-4"/>
                    <button class="delete-fasilitas px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">Hapus</button>
                </div>`;
             div.querySelector('.delete-fasilitas').addEventListener('click', () => deleteFasilitas(index));
             listEl.appendChild(div);
         });
    }
    
    // --- EDIT & DELETE FUNCTIONS ---
    
    function editPortfolio(jurusan, index) {
        const item = portfolioData[jurusan][index];
        const body = `
            <form id="edit-portfolio-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Nama Siswa</label>
                    <input type="text" name="nama" value="${item.nama}" class="mt-1 block w-full p-2 border rounded-md">
                </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-700">Nama Proyek</label>
                    <input type="text" name="namaProject" value="${item.namaProject}" class="mt-1 block w-full p-2 border rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Deskripsi</label>
                    <textarea name="deskripsiSingkat" class="mt-1 block w-full p-2 border rounded-md">${item.deskripsiSingkat}</textarea>
                </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-700">URL Foto</label>
                    <input type="text" name="fotoProject" value="${item.fotoProject}" class="mt-1 block w-full p-2 border rounded-md">
                </div>
            </form>`;
        const footer = `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="save-btn" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Simpan</button>`;
        showModal(`Edit Portfolio: ${item.namaProject}`, body, footer);

        document.getElementById('save-btn').addEventListener('click', () => {
            const form = document.getElementById('edit-portfolio-form');
            const formData = new FormData(form);
            portfolioData[jurusan][index] = {
                ...portfolioData[jurusan][index],
                nama: formData.get('nama'),
                namaProject: formData.get('namaProject'),
                deskripsiSingkat: formData.get('deskripsiSingkat'),
                fotoProject: formData.get('fotoProject')
            };
            renderPortfolio();
            hideModal();
            console.log("Updated Portfolio JSON:", JSON.stringify(portfolioData, null, 2));
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }

    function deletePortfolio(jurusan, index) {
        const item = portfolioData[jurusan][index];
        const body = `<p>Anda yakin ingin menghapus portfolio <strong>${item.namaProject}</strong>?</p>`;
        const footer = `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="confirm-delete-btn" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Hapus</button>`;
        showModal('Konfirmasi Hapus', body, footer);

        document.getElementById('confirm-delete-btn').addEventListener('click', () => {
            portfolioData[jurusan].splice(index, 1);
            renderPortfolio();
            hideModal();
            console.log("Updated Portfolio JSON:", JSON.stringify(portfolioData, null, 2));
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }
    
    function editGuru(jurusan, index) {
        const guru = jurusanData[jurusan].guru[index];
        const body = `
            <form id="edit-guru-form" class="space-y-4">
                 <div>
                    <label class="block text-sm font-medium text-gray-700">Nama Guru</label>
                    <input type="text" name="nama" value="${guru.nama}" class="mt-1 block w-full p-2 border rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">URL Foto</label>
                    <input type="text" name="foto" value="${guru.foto}" class="mt-1 block w-full p-2 border rounded-md">
                </div>
            </form>`;
        const footer = `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="save-btn" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Simpan</button>`;
        showModal(`Edit Guru: ${guru.nama}`, body, footer);
        document.getElementById('save-btn').addEventListener('click', () => {
            const form = document.getElementById('edit-guru-form');
            const formData = new FormData(form);
            jurusanData[jurusan].guru[index] = {
                nama: formData.get('nama'),
                foto: formData.get('foto')
            };
            renderGuru();
            hideModal();
            console.log("Updated Jurusan JSON:", JSON.stringify(jurusanData, null, 2));
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }

     function deleteGuru(jurusan, index) {
        const guru = jurusanData[jurusan].guru[index];
        const body = `<p>Anda yakin ingin menghapus guru <strong>${guru.nama}</strong>?</p>`;
        const footer = `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="confirm-delete-btn" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Hapus</button>`;
        showModal('Konfirmasi Hapus', body, footer);
        document.getElementById('confirm-delete-btn').addEventListener('click', () => {
            jurusanData[jurusan].guru.splice(index, 1);
            renderGuru();
            hideModal();
            console.log("Updated Jurusan JSON:", JSON.stringify(jurusanData, null, 2));
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }


    function editBerita(index) {
        const item = beritaData[index];
        const body = `
             <form id="edit-berita-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Judul Berita</label>
                    <input type="text" name="judul" value="${item.judul}" class="mt-1 block w-full p-2 border rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Ringkasan</label>
                    <textarea name="ringkasan" class="mt-1 block w-full p-2 border rounded-md">${item.ringkasan}</textarea>
                </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-700">URL Gambar</label>
                    <input type="text" name="gambar" value="${item.gambar}" class="mt-1 block w-full p-2 border rounded-md">
                </div>
            </form>`;
        const footer = `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="save-btn" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Simpan</button>`;
        showModal(`Edit Berita: ${item.judul}`, body, footer);

        document.getElementById('save-btn').addEventListener('click', () => {
            const form = document.getElementById('edit-berita-form');
            const formData = new FormData(form);
            beritaData[index] = {
                ...beritaData[index],
                judul: formData.get('judul'),
                ringkasan: formData.get('ringkasan'),
                gambar: formData.get('gambar'),
            };
            renderBerita();
            hideModal();
            console.log("Updated Berita JSON:", JSON.stringify(beritaData, null, 2));
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }
    
    function deleteBerita(index) {
        const item = beritaData[index];
        const body = `<p>Anda yakin ingin menghapus berita <strong>${item.judul}</strong>?</p>`;
        const footer = `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="confirm-delete-btn" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Hapus</button>`;
        showModal('Konfirmasi Hapus', body, footer);
        document.getElementById('confirm-delete-btn').addEventListener('click', () => {
            beritaData.splice(index, 1);
            renderBerita();
            hideModal();
            console.log("Updated Berita JSON:", JSON.stringify(beritaData, null, 2));
        });
        document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }
    
    function deleteFasilitas(index) {
        const item = fasilitasData[index];
        const body = `<p>Anda yakin ingin menghapus fasilitas <strong>${item.nama}</strong>?</p>`;
        const footer = `<button id="cancel-btn" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                        <button id="confirm-delete-btn" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Hapus</button>`;
        showModal('Konfirmasi Hapus', body, footer);

        document.getElementById('confirm-delete-btn').addEventListener('click', () => {
            fasilitasData.splice(index, 1);
            renderFasilitas();
            hideModal();
        });
         document.getElementById('cancel-btn').addEventListener('click', hideModal);
    }

    function toggleBerita(index) {
        // Jika properti 'aktif' tidak ada, anggap saja true (aktif)
        const currentState = beritaData[index].aktif === undefined ? true : beritaData[index].aktif;
        beritaData[index].aktif = !currentState;
        renderBerita();
        console.log("Updated Berita JSON:", JSON.stringify(beritaData, null, 2));
    }


    // --- FORM SETUP ---
    function setupAllForms() {
        document.getElementById('portfolio-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const jurusan = formData.get('jurusan');
            const newPortfolio = {
                nama: formData.get('nama'),
                namaProject: formData.get('namaProject'),
                deskripsiSingkat: formData.get('deskripsiSingkat'),
                bekerja: formData.get('bekerja') || null,
                fotoProject: formData.get('fotoProject'),
                deskripsiLengkap: "Deskripsi lengkap default.",
                linkProject: "#"
            };
            if (!portfolioData[jurusan]) portfolioData[jurusan] = [];
            portfolioData[jurusan].push(newPortfolio);
            renderPortfolio();
            form.reset();
            console.log("Updated Portfolio JSON:", JSON.stringify(portfolioData, null, 2));
        });

        document.getElementById('guru-form').addEventListener('submit', e => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const newGuru = { nama: formData.get('nama'), foto: formData.get('foto') };
            const firstJurusan = Object.keys(jurusanData)[0];
            if (!jurusanData[firstJurusan].guru) jurusanData[firstJurusan].guru = [];
            jurusanData[firstJurusan].guru.push(newGuru);
            renderGuru();
            form.reset();
            console.log("Updated Jurusan JSON:", JSON.stringify(jurusanData, null, 2));
        });

        document.getElementById('berita-form').addEventListener('submit', e => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const newBerita = {
                judul: formData.get('judul'),
                ringkasan: formData.get('ringkasan'),
                gambar: formData.get('gambar'),
                aktif: true
            };
            beritaData.push(newBerita);
            renderBerita();
            form.reset();
            console.log("Updated Berita JSON:", JSON.stringify(beritaData, null, 2));
        });

        document.getElementById('fasilitas-form').addEventListener('submit', e => {
             e.preventDefault();
             const form = e.target;
             const formData = new FormData(form);
             fasilitasData.push({
                 nama: formData.get('nama'),
                 gambar: formData.get('gambar'),
             });
             renderFasilitas();
             form.reset();
        });
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