document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    // Mengubah target dari 'jurusan-nav' ke 'jurusan-filters'
    const jurusanNav = document.getElementById('jurusan-filters'); 
    const namaJurusanEl = document.getElementById('nama-jurusan');
    const sudahBekerjaContainer = document.getElementById('sudah-bekerja-container');
    const belumBekerjaContainer = document.getElementById('belum-bekerja-container');
    
    // Modal elements
    const modal = document.getElementById('modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalJudul = document.getElementById('modal-judul');
    const modalFoto = document.getElementById('modal-foto');
    const modalDeskripsi = document.getElementById('modal-deskripsi');
    const modalLink = document.getElementById('modal-link');

    let portfolioData = {};
    let jurusanSaatIni = '';

    // Fungsi untuk mengambil dan memproses data JSON
    async function loadPortfolioData() {
        try {
            const response = await fetch('/data/portofolio.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            portfolioData = await response.json();
            jurusanSaatIni = Object.keys(portfolioData)[0];
            
            setupJurusanNavigation();
            renderPortfolio(jurusanSaatIni);

        } catch (error) {
            console.error("Gagal memuat data portofolio:", error);
            namaJurusanEl.textContent = "Gagal memuat data portofolio.";
        }
    }

    // Fungsi untuk membuat card portofolio
    const createPortfolioCard = (data) => {
        const card = document.createElement('div');
        card.className = "bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300";

        let bekerjaInfo = '';
        if (data.bekerja) {
            bekerjaInfo = `<div class="mt-2">
                <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                    Bekerja di: ${data.bekerja}
                </span>
            </div>`;
        }

        card.innerHTML = `
            <div class="p-5">
                <h3 class="text-xl font-bold text-gray-900">${data.nama}</h3>
                <p class="text-sm text-gray-600 font-medium">${data.namaProject}</p>
                <p class="text-gray-700 mt-2 text-sm">${data.deskripsiSingkat}</p>
                ${bekerjaInfo}
                <button class="view-detail-btn mt-4 w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 transition">View Detail</button>
            </div>
        `;
        
        card.querySelector('.view-detail-btn').addEventListener('click', () => openModal(data));
        return card;
    };

    // Fungsi untuk merender portfolio berdasarkan jurusan
    const renderPortfolio = (jurusan) => {
        namaJurusanEl.textContent = `Jurusan ${jurusan}`;
        sudahBekerjaContainer.innerHTML = '';
        belumBekerjaContainer.innerHTML = '';

        const dataJurusan = portfolioData[jurusan];
        if (!dataJurusan) return;

        dataJurusan.forEach(item => {
            const card = createPortfolioCard(item);
            if (item.bekerja) {
                sudahBekerjaContainer.appendChild(card);
            } else {
                belumBekerjaContainer.appendChild(card);
            }
        });
    };
    
    // Fungsi untuk membuat tombol navigasi jurusan
    const setupJurusanNavigation = () => {
        jurusanNav.innerHTML = ''; 
        const jurusanKeys = Object.keys(portfolioData);
        jurusanKeys.forEach(jurusan => {
            const button = document.createElement('button');
            button.textContent = jurusan;
            button.className = `px-4 py-2 rounded-md text-sm font-medium transition`;
            
            if (jurusan === jurusanSaatIni) {
                button.classList.add('bg-blue-600', 'text-white', 'shadow');
            } else {
                button.classList.add('bg-white', 'text-gray-700', 'hover:bg-gray-200');
            }

            button.addEventListener('click', () => {
                jurusanSaatIni = jurusan;
                renderPortfolio(jurusan);
                updateNavButtons();
            });
            jurusanNav.appendChild(button);
        });
    };

    const updateNavButtons = () => {
         Array.from(jurusanNav.children).forEach(button => {
             button.classList.remove('bg-blue-600', 'text-white', 'shadow');
             button.classList.add('bg-white', 'text-gray-700', 'hover:bg-gray-200');
             if(button.textContent === jurusanSaatIni) {
                button.classList.add('bg-blue-600', 'text-white', 'shadow');
                button.classList.remove('bg-white', 'text-gray-700', 'hover:bg-gray-200');
             }
         });
    };

    // Fungsi untuk membuka modal
    const openModal = (data) => {
        modalJudul.textContent = data.namaProject;
        modalFoto.src = data.fotoProject;
        modalDeskripsi.textContent = data.deskripsiLengkap;
        modalLink.href = data.linkProject;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    // Fungsi untuk menutup modal
    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };
    
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Inisialisasi
    loadPortfolioData();
});