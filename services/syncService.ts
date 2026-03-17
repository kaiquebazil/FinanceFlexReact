// services/syncService.ts
/**
 * Responsável por toda a comunicação com o Firebase Firestore.
 * O app SEMPRE lê do AsyncStorage (storage.ts).
 * O Firebase é usado APENAS para backup na nuvem e sincronização manual entre dispositivos.
 * ATENÇÃO: Para sincronizar entre dispositivos, é necessário:
 * 1. Clicar em "Sincronizar" no dispositivo onde as transações foram adicionadas.
 * 2. Clicar em "Sincronizar" no dispositivo que deve receber as informações.
 */

import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { storage } from "./storage";

// Chave usada no AsyncStorage para o snapshot consolidado
export const SYNC_KEY = "financeflex_data";

// Estrutura do documento salvo no Firestore
export interface CloudData {
  accounts: any[];
  transactions: any[];
  piggyBanks: any[];
  creditCards: any[];
  creditCardTransactions: any[];
  recurringBills: any[];
  categories: any[];
  invoices: any[];
  invoicePayments: any[];
  updatedAt?: any;
}

// ───────────────────────────────────────────────────────────────────────────────
// Caminho do documento no Firestore:
//   users/{userId}/data/main
// ───────────────────────────────────────────────────────────────────────────────
function getUserDocRef(userId: string) {
  return doc(db, "users", userId, "data", "main");
}

// ───────────────────────────────────────────────────────────────────────────────
// Envia os dados locais para o Firestore (sincronização manual)
// ───────────────────────────────────────────────────────────────────────────────
export async function uploadToCloud(userId: string): Promise<void> {
  const localData = await storage.getAllData();
  const docRef = getUserDocRef(userId);

  await setDoc(docRef, {
    ...localData,
    updatedAt: serverTimestamp(),
  });
}

// ───────────────────────────────────────────────────────────────────────────────
// Baixa os dados do Firestore e salva no AsyncStorage (sincronização manual)
// ───────────────────────────────────────────────────────────────────────────────
export async function downloadFromCloud(userId: string): Promise<CloudData | null> {
  return new Promise((resolve, reject) => {
    const docRef = getUserDocRef(userId);
    const { getDoc } = require("firebase/firestore");

    getDoc(docRef)
      .then(async (snap: any) => {
        if (!snap.exists()) {
          resolve(null);
          return;
        }
        const data: CloudData = snap.data();
        await storage.importData(data);
        resolve(data);
      })
      .catch(reject);
  });
}

// ───────────────────────────────────────────────────────────────────────────────
// Sincronização manual completa (upload + download)
// ───────────────────────────────────────────────────────────────────────────────
export async function fullSync(userId: string): Promise<CloudData | null> {
  await uploadToCloud(userId);
  return await downloadFromCloud(userId);
}

// ───────────────────────────────────────────────────────────────────────────────
// Listener em TEMPO REAL (apenas para atualizações externas)
// Retorna uma função de cancelamento (unsubscribe).
// ATENÇÃO: Este listener só é acionado por alterações externas (outros dispositivos).
// ───────────────────────────────────────────────────────────────────────────────
export function subscribeToRealTimeSync(
  userId: string,
  onDataReceived: (data: CloudData) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const docRef = getUserDocRef(userId);

  const unsubscribe = onSnapshot(
    docRef,
    { includeMetadataChanges: false },
    async (snap) => {
      if (!snap.exists()) return;

      // Ignora atualizações originadas do próprio dispositivo
      if (snap.metadata.fromCache) return;

      const data: CloudData = snap.data() as CloudData;

      // Persiste localmente
      await storage.importData(data);

      // Notifica o contexto para atualizar o estado React
      onDataReceived(data);
    },
    (error) => {
      console.error("[SyncService] Erro no listener em tempo real:", error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}
