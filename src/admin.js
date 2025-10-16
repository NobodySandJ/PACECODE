document.addEventListener('DOMContentLoaded', () => {
    const headlineToggle = document.getElementById('headline-toggle');

    // Pastikan elemen ada sebelum menambahkan event listener
    if (headlineToggle) {
        // Cek status dari localStorage saat halaman dimuat
        const headlineStatus = localStorage.getItem('headlineEnabled');
        
        // Jika tidak ada status (pertama kali), set default ke true (aktif)
        if (headlineStatus === null) {
            headlineToggle.checked = true;
            localStorage.setItem('headlineEnabled', 'true');
        } else {
            headlineToggle.checked = headlineStatus === 'true';
        }

        // Simpan perubahan ke localStorage saat toggle diubah
        headlineToggle.addEventListener('change', () => {
            localStorage.setItem('headlineEnabled', headlineToggle.checked);
        });
    }
});