// contexts/AuthContext.tsx
// Gerencia o estado de autenticação do Firebase.
// Expõe o usuário atual, funções de login/logout e o status de sincronização.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInWithCredential,
  GoogleAuthProvider,
  Unsubscribe as FirebaseUnsubscribe,
} from "firebase/auth";
import * as GoogleSignIn from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();
import { auth } from "../firebase/config";
import {
  subscribeToRealTimeSync,
  uploadToCloud,
  downloadFromCloud,
  CloudData,
} from "../services/syncService";

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────
export type SyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;

  // Autenticação
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;

  // Sincronização manual
  manualSync: () => Promise<void>;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
interface AuthProviderProps {
  children: ReactNode;
  /** Callback chamado quando dados chegam do Firestore em tempo real */
  onRemoteDataReceived?: (data: CloudData) => void;
}

export function AuthProvider({
  children,
  onRemoteDataReceived,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Referência para o unsubscribe do listener em tempo real
  const realtimeUnsubRef = useRef<FirebaseUnsubscribe | null>(null);

  // ─── Observa mudanças de autenticação ───────────────────────────────────
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Cancela listener anterior (se houver)
      if (realtimeUnsubRef.current) {
        realtimeUnsubRef.current();
        realtimeUnsubRef.current = null;
      }

      if (firebaseUser) {
        // Faz download inicial ao logar
        try {
          setSyncStatus("syncing");
          await downloadFromCloud(firebaseUser.uid);
          setSyncStatus("synced");
          setLastSyncedAt(new Date());
        } catch (err) {
          console.warn("[AuthContext] Download inicial falhou:", err);
          setSyncStatus("error");
        }

        // Inicia listener em tempo real
        realtimeUnsubRef.current = subscribeToRealTimeSync(
          firebaseUser.uid,
          (data) => {
            setSyncStatus("synced");
            setLastSyncedAt(new Date());
            if (onRemoteDataReceived) {
              onRemoteDataReceived(data);
            }
          },
          () => setSyncStatus("error"),
        );
      } else {
        setSyncStatus("idle");
      }
    });

    return () => {
      unsubAuth();
      if (realtimeUnsubRef.current) {
        realtimeUnsubRef.current();
      }
    };
  }, [onRemoteDataReceived]);

  // ─── Login ───────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    setSyncStatus("syncing");
    await signInWithEmailAndPassword(auth, email, password);
    // O onAuthStateChanged cuida do resto
  };

  // ─── Cadastro ────────────────────────────────────────────────────────────
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    setSyncStatus("syncing");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
  };

  // ─── Logout ──────────────────────────────────────────────────────────────
  const logOut = async () => {
    if (realtimeUnsubRef.current) {
      realtimeUnsubRef.current();
      realtimeUnsubRef.current = null;
    }
    await signOut(auth);
    setSyncStatus("idle");
  };

  // ─── Recuperação de Senha ──────────────────────────────────────────────────
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // ─── Login com Google ──────────────────────────────────────────────────
  const [googleRequest, googleResponse, googlePromptAsync] =
    GoogleSignIn.useAuthRequest({
      clientId:
        "125982859538-mo2go22k69175rt79ccbif2a0hnkkaoc.apps.googleusercontent.com",
      useProxy: true, // Usa o proxy do Expo para contornar problemas de redirecionamento
    });

  const signInWithGoogle = async () => {
    try {
      setSyncStatus("syncing");
      const result = await googlePromptAsync();
      
      // Validar se o resultado existe e tem o tipo esperado
      if (!result) {
        throw new Error("Nenhuma resposta do Google Sign-In");
      }
      
      if (result.type === "cancel" || result.type === "dismiss") {
        setSyncStatus("idle");
        throw new Error("Login com Google foi cancelado pelo usuário");
      }
      
      if (result.type !== "success") {
        setSyncStatus("idle");
        throw new Error(`Tipo de resposta inesperado: ${result.type}`);
      }
      
      // Validar se params e id_token existem
      if (!result.params || !result.params.id_token) {
        setSyncStatus("idle");
        throw new Error("Token de ID não recebido do Google");
      }
      
      const { id_token } = result.params;
      const credential = GoogleAuthProvider.credential(id_token);
      await signInWithCredential(auth, credential);
      // O onAuthStateChanged cuida do resto
    } catch (err) {
      console.error("[AuthContext] Erro no login com Google:", err);
      setSyncStatus("error");
      throw err;
    }
  };

  // ─── Sincronização manual ────────────────────────────────────────────────
  const manualSync = async () => {
    if (!user) return;
    try {
      setSyncStatus("syncing");
      await uploadToCloud(user.uid);
      await downloadFromCloud(user.uid);
      setSyncStatus("synced");
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error("[AuthContext] Erro na sincronização manual:", err);
      setSyncStatus("error");
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        syncStatus,
        lastSyncedAt,
        signIn,
        signUp,
        logOut,
        resetPassword,
        signInWithGoogle,
        manualSync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
