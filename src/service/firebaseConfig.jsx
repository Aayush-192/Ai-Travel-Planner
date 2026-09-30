// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_AUTH_API_KEY,
  authDomain: "travel-tracker-78d4b.firebaseapp.com",
  projectId: "travel-tracker-78d4b",
  storageBucket: "travel-tracker-78d4b.firebasestorage.app",
  messagingSenderId: "704200714091",
  appId: "1:704200714091:web:6cfbdf5e62cad210684e2e",
  measurementId: "G-PJEWV4P01X"
};

// Initialize Firebase

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// const analytics = getAnalytics(app);