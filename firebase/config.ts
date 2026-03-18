// firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

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

// Configura autenticação com persistência:
// - Android/iOS: usa AsyncStorage para manter o usuário logado entre sessões
// - Web: usa a persistência padrão do Firebase (localStorage)
//
// NOTA: getReactNativePersistence é importado de 'firebase/auth' (não de 'firebase/auth/react-native').
// O subpath 'firebase/auth/react-native' foi removido no Firebase SDK v9+ modular.
// O Metro Bundler resolve 'firebase/auth' para o bundle react-native correto automaticamente
// via o campo 'react-native' no package.json do @firebase/auth.
let auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // App já inicializado (hot reload) — reutiliza a instância existente
    auth = getAuth(app);
  }
}

const db = getFirestore(app);

export { auth, db };
export default app;
