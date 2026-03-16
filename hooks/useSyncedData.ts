// hooks/useSyncedData.ts
// Hook utilitário que combina useData + useAuth para facilitar
// o acesso ao estado de sincronização junto com os dados do app.

import { useData } from "./useData";
import { useAuth } from "../contexts/AuthContext";

export function useSyncedData() {
  const data = useData();
  const auth = useAuth();

  return {
    ...data,
    // Informações de autenticação e sincronização
    user: auth.user,
    syncStatus: auth.syncStatus,
    lastSyncedAt: auth.lastSyncedAt,
    isAuthenticated: !!auth.user,
    // Ações de autenticação
    signIn: auth.signIn,
    signUp: auth.signUp,
    logOut: auth.logOut,
    manualSync: auth.manualSync,
  };
}
