// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);