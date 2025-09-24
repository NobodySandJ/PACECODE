import './style.css'
import ScrollReveal from 'scrollreveal';

// Inisialisasi ScrollReveal
const sr = ScrollReveal({
    distance: '60px',
    duration: 1000,
    delay: 700,
});

sr.reveal('.seksikepsek', {
    delay: 500,
    origin: 'bottom',
    opacity: 0,
    easing: 'ease-in-out',
    reset: true
});

document.addEventListener('DOMContentLoaded', () => {
    // ===================================
    // LOGIKA BARU: MENU HAMBURGER MOBILE
    // ===================================
    const hamburgerButton = document.getElementById('hamburger-button');
    const mobileMenu = document.getElementById('mobile-menu');

    hamburgerButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // ===================================
    // LOGIKA LAMA: NAVBAR DROPDOWN DESKTOP
    // ===================================
    const dropdownLinks = document.querySelectorAll('.nav-link-dropdown');
    const closeAllDropdowns = () => {
        document.querySelectorAll('.dropdown-panel').forEach(panel => {
            panel.classList.remove('visible', 'opacity-100', 'translate-y-0');
            panel.classList.add('invisible', 'opacity-0', '-translate-y-2');
        });
    };

    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const targetPanel = link.nextElementSibling;
            const isTargetPanelOpen = !targetPanel.classList.contains('invisible');

            closeAllDropdowns();

            if (!isTargetPanelOpen && targetPanel) {
                targetPanel.classList.remove('invisible', 'opacity-0', '-translate-y-2');
                targetPanel.classList.add('visible', 'opacity-100', 'translate-y-0');
            }
        });
    });

    document.addEventListener('click', () => {
        closeAllDropdowns();
    });
});