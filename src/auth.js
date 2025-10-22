// src/auth.js
import { auth, db } from './firebase.js'; // Assuming db might be needed later for roles
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Needed for checking/setting admin roles

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const errorMessageElement = document.getElementById('error-message');

// --- Utility to show errors ---
function showAuthError(message) {
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
        errorMessageElement.classList.remove('hidden');
    }
    console.error("Auth Error:", message);
}

// --- Login Handler ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        if (errorMessageElement) errorMessageElement.classList.add('hidden');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('User logged in:', userCredential.user);
            // Redirect based on role after successful login
            await checkRoleAndRedirect(userCredential.user);
        } catch (error) {
            showAuthError(error.message);
        }
    });
}

// --- Register Handler ---
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = registerForm.email.value;
        const password = registerForm.password.value;
        const confirmPassword = registerForm['confirm-password'].value;
        if (errorMessageElement) errorMessageElement.classList.add('hidden');

        if (password !== confirmPassword) {
            showAuthError("Passwords do not match.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User registered:', userCredential.user);
            // Optionally set a default role (e.g., 'user') in Firestore here
            // await setDoc(doc(db, "users", userCredential.user.uid), { role: "user" });
            alert("Registrasi berhasil! Silakan login.");
            window.location.href = 'login.html'; // Redirect to login page
        } catch (error) {
            showAuthError(error.message);
        }
    });
}

// --- Logout Function (can be called from anywhere) ---
export async function handleLogout() {
    try {
        await signOut(auth);
        console.log('User logged out');
        window.location.href = 'index.html'; // Redirect to home after logout
    } catch (error) {
        console.error('Logout failed:', error);
        alert('Logout gagal.');
    }
}

// --- Check Auth State (e.g., in main.js or specific pages) ---
export function observeAuthState(callback) {
    return onAuthStateChanged(auth, callback);
}

// --- Check User Role and Redirect ---
// This assumes you have a 'users' collection in Firestore
// where each document ID is the user's UID and contains a 'role' field.
export async function checkRoleAndRedirect(user) {
    if (!user) {
        window.location.href = 'index.html'; // Or login page
        return;
    }
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
             // If trying to access admin page directly OR logging in
            if (window.location.pathname.endsWith('admin.html') || window.location.pathname.endsWith('login.html')) {
                 window.location.href = 'admin.html';
            } else {
                 // Already logged in as admin on another page, stay there or go home
                 // Optionally: Redirect to admin if preferred: window.location.href = 'admin.html';
                 console.log("Admin logged in on:", window.location.pathname);
            }
        } else {
            // If user is not admin and tries to access admin.html, redirect them
            if (window.location.pathname.endsWith('admin.html')) {
                alert("Akses ditolak. Anda bukan admin.");
                window.location.href = 'index.html';
            } else if (window.location.pathname.endsWith('login.html')) {
                 // Regular user logged in, redirect to home
                 window.location.href = 'index.html';
            } else {
                 // Regular user on a regular page, stay there
                 console.log("User logged in on:", window.location.pathname);
            }
        }
    } catch (error) {
        console.error("Error checking user role:", error);
        // Default redirect if role check fails
        if (window.location.pathname.endsWith('admin.html')) {
             alert("Gagal memverifikasi akses. Mengalihkan ke Beranda.");
             window.location.href = 'index.html';
        } else if (window.location.pathname.endsWith('login.html')){
             window.location.href = 'index.html';
        }
    }
}

// --- Check if user is admin (for protecting actions) ---
export async function isAdmin(user) {
    if (!user) return false;
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        return userDocSnap.exists() && userDocSnap.data().role === 'admin';
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}