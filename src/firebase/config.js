import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration Firebase - À REMPLACER par vos propres credentials
const firebaseConfig = {
  apiKey: "AIzaSyDbuvB0RAtwh270HnfFmbcQs8q0Id01gPE",
  authDomain: "dca-dashboard.firebaseapp.com",
  projectId: "dca-dashboard",
  storageBucket: "dca-dashboard.firebasestorage.app",
  messagingSenderId: "276828580026",
  appId: "1:276828580026:web:09c1d5c70ebb2ed6913a83"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Export des services Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
