// firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence, 
  browserLocalPersistence, 
  setPersistence 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// ✅ SOLUÇÃO DEFINITIVA PARA PERSISTÊNCIA NO REACT NATIVE
// O erro de resolução de módulo "firebase/auth/react-native" acontece quando o Metro 
// tenta encontrar o arquivo físico, mas nas versões atuais do Firebase (v11+), 
// o getReactNativePersistence deve ser importado diretamente de 'firebase/auth'.

let auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(err => {
    console.warn("[Firebase] Erro na persistência Web:", err);
  });
} else {
  try {
    // Tenta inicializar com a persistência do AsyncStorage
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // Caso já tenha sido inicializado ou ocorra erro, usa a instância padrão
    auth = getAuth(app);
  }
}

const db = getFirestore(app);

export { auth, db };
export default app;
