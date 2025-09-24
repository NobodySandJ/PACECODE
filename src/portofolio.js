document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const jurusanNav = document.getElementById('jurusan-filters');
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

    // Skema Warna untuk Setiap Jurusan
    const jurusanColors = {
        "Rekayasa Perangkat Lunak": {
            border: "border-blue-500",
            button: "bg-blue-600 hover:bg-blue-700",
            tag: "text-blue-600"
        },
        "Teknik Komputer dan Jaringan": {
            border: "border-red-500",
            button: "bg-red-600 hover:bg-red-700",
            tag: "text-red-600"
        },
        "Desain Komunikasi Visual": {
            border: "border-green-500",
            button: "bg-green-600 hover:bg-green-700",
            tag: "text-green-600"
        },
        "Animasi": {
            border: "border-gray-700",
            button: "bg-gray-800 hover:bg-gray-900",
            tag: "text-gray-700"
        },
        "Kuliner": {
            border: "border-orange-500",
            button: "bg-orange-500 hover:bg-orange-600",
            tag: "text-orange-500"
        },
        "Perhotelan": {
            border: "border-yellow-500",
            button: "bg-yellow-500 hover:bg-yellow-600",
            tag: "text-yellow-500"
        }
    };
    
    // Default color jika jurusan tidak ditemukan
    const defaultColors = {
        border: "border-indigo-500",
        button: "bg-indigo-600 hover:bg-indigo-700",
        tag: "text-indigo-600"
    };


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
        }
    }

    // Fungsi createPortfolioCard diperbarui untuk menerima 'jurusan'
    const createPortfolioCard = (data, jurusan) => {
        const colors = jurusanColors[jurusan] || defaultColors;

        const card = document.createElement('div');
        // Menambahkan kelas border dari skema warna
        card.className = `bg-white rounded-lg shadow-lg overflow-hidden group transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-t-4 ${colors.border}`;

        const bekerjaBadge = data.bekerja
            ? `<span class="absolute top-3 right-3 text-xs font-semibold inline-block py-1 px-3 uppercase rounded-full text-green-600 bg-green-200">
                 ✔ Bekerja di ${data.bekerja}
               </span>`
            : '';

        card.innerHTML = `
            <div class="relative">
                <img src="${data.fotoProject}" alt="${data.namaProject}" class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110">
                ${bekerjaBadge}
            </div>
            <div class="p-5">
                <p class="text-sm font-semibold mb-1 ${colors.tag}">${jurusan}</p>
                <h3 class="text-lg font-bold text-gray-900 truncate">${data.namaProject}</h3>
                <p class="text-sm text-gray-500 mb-2">oleh ${data.nama}</p>
                <p class="text-gray-700 mt-2 text-sm h-16 overflow-hidden">${data.deskripsiSingkat}</p>
                <button class="view-detail-btn mt-4 w-full text-white py-2 rounded-md transition font-semibold ${colors.button}">
                    Lihat Detail
                </button>
            </div>
        `;

        card.querySelector('.view-detail-btn').addEventListener('click', () => openModal(data));
        return card;
    };

    // Fungsi renderPortfolio diperbarui untuk mengirim 'jurusan' ke createPortfolioCard
    const renderPortfolio = (jurusan) => {
        sudahBekerjaContainer.innerHTML = '';
        belumBekerjaContainer.innerHTML = '';

        const dataJurusan = portfolioData[jurusan];
        if (!dataJurusan) return;

        dataJurusan.forEach(item => {
            // Mengirim nama jurusan saat membuat kartu
            const card = createPortfolioCard(item, jurusan);
            if (item.bekerja) {
                sudahBekerjaContainer.appendChild(card);
            } else {
                belumBekerjaContainer.appendChild(card);
            }
        });
    };

    const setupJurusanNavigation = () => {
        jurusanNav.innerHTML = '';
        const jurusanKeys = Object.keys(portfolioData);
        jurusanKeys.forEach(jurusan => {
            const button = document.createElement('button');
            button.textContent = jurusan;
            button.className = `px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border-2`;

            if (jurusan === jurusanSaatIni) {
                button.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
            } else {
                button.classList.add('bg-white', 'text-gray-700', 'border-gray-300', 'hover:bg-indigo-50', 'hover:border-indigo-500');
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
            button.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
            button.classList.add('bg-white', 'text-gray-700', 'border-gray-300', 'hover:bg-indigo-50', 'hover:border-indigo-500');
            if (button.textContent === jurusanSaatIni) {
                button.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
                button.classList.remove('bg-white', 'text-gray-700', 'border-gray-300', 'hover:bg-indigo-50', 'hover:border-indigo-500');
            }
        });
    };

    // Fungsi modal tetap sama
    const openModal = (data) => {
        modalJudul.textContent = data.namaProject;
        modalFoto.src = data.fotoProject;
        modalDeskripsi.textContent = data.deskripsiLengkap;
        modalLink.href = data.linkProject;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    // PERBAIKAN: Tambahkan pengecekan sebelum menambahkan event listener
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    loadPortfolioData();
});