import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage"; 
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyC7HOuFtfFUgZGDtsM2HUjnMNTN5CPDn9A",
  authDomain: "invoice-app-9e56a.firebaseapp.com",
  projectId: "invoice-app-9e56a",
  storageBucket: "invoice-app-9e56a.firebasestorage.app",
  messagingSenderId: "695886156319",
  appId: "1:695886156319:web:80f026ede96d6d40df7b2a",
  measurementId: "G-RWB2EX5328"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app); 
export const db = getFirestore(app);     
