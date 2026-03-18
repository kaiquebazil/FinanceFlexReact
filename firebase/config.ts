// firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, connectAuthEmulator } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import { Platform } from 'react-native';

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

// Configura a autenticação com persistência
let auth;

if (Platform.OS === 'web') {
  // Para web, usa browserLocalPersistence
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn("[Firebase] Erro ao configurar persistência web:", error);
  });
} else {
  // Para React Native (iOS/Android), usa AsyncStorage
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // Se já foi inicializado, apenas pega a instância existente
    auth = getAuth(app);
  }
}

const db = getFirestore(app);

export { auth, db };
export default app;
