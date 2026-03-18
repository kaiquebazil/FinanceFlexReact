// firebase/config.ts
import { initializeApp } from "firebase/app";
import { initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD8A1XDlezTHhBpMBbMBGI9ldPNNGpGHfo",
  authDomain: "finance-flex-db123.firebaseapp.com",
  projectId: "finance-flex-db123",
  storageBucket: "finance-flex-db123.firebasestorage.app",
  messagingSenderId: "125982859538",
  appId: "1:125982859538:web:c15d8615a946fb0e58d3cb",
  measurementId: "G-CTGSBCF2KS",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// ✅ Configura Auth com persistência
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };
export default app;