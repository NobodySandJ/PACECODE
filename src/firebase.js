// src/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// BARIS INI PENTING: Mengimpor fungsi untuk Firestore
import { getFirestore } from "firebase/firestore";
// *** ADD THIS: Import Firebase Auth functions ***
import { getAuth } from "firebase/auth";
// TODO: Pastikan konfigurasi ini sesuai dengan yang ada di Firebase Console Anda
const firebaseConfig = {
  apiKey: "AIzaSyDXHVQSAyUOIlQdKkDfZvxY3j5V7VcfLYM",
  authDomain: "website-smkn1dlanggu.firebaseapp.com",
  projectId: "website-smkn1dlanggu",
  storageBucket: "website-smkn1dlanggu.firebasestorage.app",
  messagingSenderId: "200130984841",
  appId: "1:200130984841:web:f5167ad3bb9f8aa1d6bf58",
  measurementId: "G-G39SJ8ECSZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// BARIS INI PENTING: Inisialisasi Firestore dan EKSPOR instance 'db'
// agar bisa digunakan di file lain.
export const db = getFirestore(app);

// *** ADD THIS: Initialize Firebase Auth and export it ***
export const auth = getAuth(app);