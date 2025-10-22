// src/main.js
import './style.css';
import { initScrollReveal } from './animation.js';
import { db, auth } from './firebase.js'; // Import auth
import { collection, getDocs, query, limit } from "firebase/firestore";
// *** ADD THIS: Import auth functions from auth.js ***
import { observeAuthState, handleLogout, isAdmin } from './auth.js';


// ... (rest of existing main.js code like setActiveLink, loadHeadlineBerita, loadPortfolioDataIndex)

// *** ADD THIS: Function to update header UI based on auth state ***
function updateHeaderUI(user) {
    const userSpecificElements = document.getElementById('user-specific-elements'); // Need to add this div in header HTML
    const loginRegisterElements = document.getElementById('login-register-elements'); // Need to add this div in header HTML
    const adminLinkElement = document.getElementById('admin-link'); // Need to add this link in header HTML


    if (user) {
        // User is logged in
        if (userSpecificElements) {
            isAdmin(user).then(adminStatus => {
                 userSpecificElements.innerHTML = `
                    <span>Halo, ${user.email}</span>
                    ${adminStatus ? '<a href="admin.html" class="nav-link" id="admin-link">Admin</a>' : ''}
                    <button id="logout-button" class="ml-4 text-sm font-medium text-red-600 hover:text-red-800">Logout</button>
                `;
                 userSpecificElements.classList.remove('hidden');
                 // Add event listener for the logout button
                 const logoutButton = document.getElementById('logout-button');
                 if (logoutButton) {
                     logoutButton.addEventListener('click', handleLogout);
                 }
            });


        }
        if (loginRegisterElements) loginRegisterElements.classList.add('hidden');


    } else {
        // User is logged out
        if (userSpecificElements) userSpecificElements.classList.add('hidden');
        if (loginRegisterElements) {
             loginRegisterElements.innerHTML = `
                <a href="login.html" class="nav-link">Login</a>
                <a href="register.html" class="nav-link">Register</a>
            `;
            loginRegisterElements.classList.remove('hidden');
        }
        if (adminLinkElement) adminLinkElement.classList.add('hidden'); // Hide admin link if logged out
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // ... (existing DOMContentLoaded code)

    // *** ADD THIS: Observe auth state and update UI ***
    observeAuthState(user => {
        updateHeaderUI(user);

         // If on admin page, check authorization again (important!)
        if (window.location.pathname.endsWith('admin.html')) {
            if (!user) {
                alert("Silakan login untuk mengakses halaman admin.");
                window.location.href = 'login.html';
            } else {
                isAdmin(user).then(adminStatus => {
                    if (!adminStatus) {
                         alert("Akses ditolak. Anda bukan admin.");
                         window.location.href = 'index.html';
                    }
                     // else: User is admin, allow them to stay. Content loading is handled in admin.js
                });
            }
        }
    });


    // Ensure header HTML has placeholders for dynamic elements
    const navUl = document.querySelector('header nav ul.hidden.md\\:flex'); // Adjust selector if needed
    if (navUl && !document.getElementById('auth-elements-placeholder')) {
        const authPlaceholder = document.createElement('div');
        authPlaceholder.id = 'auth-elements-placeholder';
        authPlaceholder.className = 'flex items-center space-x-4 ml-auto'; // Use ml-auto to push to the right
        authPlaceholder.innerHTML = `
            <div id="user-specific-elements" class="hidden flex items-center space-x-2"></div>
            <div id="login-register-elements" class="hidden flex items-center space-x-4"></div>
        `;
        // Insert before the "Contact Us" button if it exists, otherwise append
         const contactButton = navUl.nextElementSibling; // Assuming button is next sibling
         if(contactButton && contactButton.tagName === 'BUTTON'){
              navUl.parentElement.insertBefore(authPlaceholder, contactButton);
         } else {
             navUl.parentElement.appendChild(authPlaceholder);
         }


    }


    loadHeadlineBerita(); // Call existing functions
    if (portfolioContainerIndex && jurusanFiltersIndex) {
        loadPortfolioDataIndex();
    }
    initScrollReveal();
});