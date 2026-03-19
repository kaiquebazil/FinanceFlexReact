// firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8A1XDlezTHhBpMBbMBGI9ldPNNGpGHfo",
  authDomain: "finance-flex-db123.firebaseapp.com",
  projectId: "finance-flex-db123",
  storageBucket: "finance-flex-db123.firebasestorage.app",
  messagingSenderId: "125982859538",
  appId: "1:125982859538:web:c15d8615a946fb0e58d3cb",
  measurementId: "G-CTGSBCF2KS",
};

// Evita reinicializar o app em hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;
