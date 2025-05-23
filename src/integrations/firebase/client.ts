// Firebase configuration file
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBY8MJdrDUP4uDHpQz8GjkCRbbpfs481Es",
  authDomain: "arrastaai-c96e6.firebaseapp.com",
  projectId: "arrastaai-c96e6",
  storageBucket: "arrastaai-c96e6.firebasestorage.app",
  messagingSenderId: "725027862533",
  appId: "1:725027862533:web:dca3f2099f5b936ebd846c",
  measurementId: "G-B5EFQCX70F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

export default app;
