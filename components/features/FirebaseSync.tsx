// components/features/FirebaseSync.tsx
// Painel de sincronização em tempo real com Firebase.
// Design compacto e otimizado para web e mobile.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import { useAuth, SyncStatus } from '../../contexts/AuthContext';
import { useData } from '../../hooks/useData';
import { Button } from '../ui/Button';
import { Toast } from '../ui/Toast';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useToast } from '../../hooks/useToast';
import { createDefaultCategories } from '../../constants/defaultCategories';
import { createDefaultRecurringBills } from '../../constants/defaultRecurringBills';

interface FirebaseSyncProps {
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusLabel(status: SyncStatus): string {
  switch (status) {
    case 'syncing': return 'Sincronizando…';
    case 'synced':  return 'Sincronizado';
    case 'error':   return 'Erro';
    case 'offline': return 'Offline';
    default:        return 'Não sincronizado';
  }
}

function statusColor(status: SyncStatus): string {
  switch (status) {
    case 'syncing': return theme.colors.primary;
    case 'synced':  return '#4CAF50';
    case 'error':   return '#F44336';
    case 'offline': return '#FF9800';
    default:        return theme.colors.textDim;
  }
}

function statusIcon(status: SyncStatus): string {
  switch (status) {
    case 'syncing': return 'sync-alt';
    case 'synced':  return 'check-circle';
    case 'error':   return 'exclamation-circle';
    case 'offline': return 'wifi';
    default:        return 'cloud';
  }
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function FirebaseSync({ onClose }: FirebaseSyncProps) {
  const { user, loading, syncStatus, lastSyncedAt, signIn, signUp, logOut, manualSync } = useAuth();
  const {
    accounts,
    setAccounts,
    setTransactions,
    setPiggyBanks,
    setCreditCards,
    setRecurringBills,
    setCategories,
    setValuesHidden,
  } = useData();
  const { toast, showToast, hideToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ─── Autenticação ─────────────────────────────────────────────────────────

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      showToast('Preencha e-mail e senha', 'warning');
      return;
    }
    if (isSignUp && !displayName.trim()) {
      showToast('Preencha seu nome', 'warning');
      return;
    }
    setAuthLoading(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password, displayName.trim());
        showToast('Conta criada com sucesso!', 'success');
      } else {
        await signIn(email.trim(), password);
        showToast('Login realizado com sucesso!', 'success');
      }
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err: any) {
      const msg = parseFirebaseError(err?.code);
      showToast(msg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      showToast('Desconectado com sucesso', 'info');
      setShowLogoutConfirm(false);
    } catch {
      showToast('Erro ao desconectar', 'error');
    }
  };

  // ─── Sincronização manual ─────────────────────────────────────────────────

  const handleManualSync = async () => {
    setSyncLoading(true);
    try {
      await manualSync();
      showToast('Sincronizado!', 'success');
    } catch {
      showToast('Erro ao sincronizar', 'error');
    } finally {
      setSyncLoading(false);
    }
  };

  // ─── Reset de dados ───────────────────────────────────────────────────────

  const DEFAULT_ACCOUNTS = [
    {
      id: 'default-cash-1',
      name: 'Dinheiro',
      type: 'Dinheiro' as const,
      currency: 'BRL' as const,
      balance: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-bank-1',
      name: 'Banco Digital',
      type: 'Banco' as const,
      currency: 'BRL' as const,
      balance: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  const handleResetData = () => {
    setAccounts(DEFAULT_ACCOUNTS);
    setCategories(createDefaultCategories());
    setRecurringBills(createDefaultRecurringBills());
    setTransactions([]);
    setPiggyBanks([]);
    setCreditCards([]);
    setValuesHidden(false);

    setShowResetConfirm(false);
    showToast('✅ Dados resetados!', 'success');
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      >
        {user ? (
          // ─── Usuário logado ──────────────────────────────────────────────
          <>
            {/* Card de Perfil Compacto */}
            <LinearGradient
              colors={[theme.colors.primary + '20', theme.colors.primary + '08']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileCard}
            >
              <View style={styles.profileHeader}>
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={styles.logoImage}
                />
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{user.displayName || 'Usuário'}</Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                </View>
              </View>

              {/* Status de Sincronização */}
              <View style={styles.syncStatusBadge}>
                <FontAwesome5
                  name={statusIcon(syncStatus)}
                  size={14}
                  color={statusColor(syncStatus)}
                />
                <Text style={[styles.syncStatusText, { color: statusColor(syncStatus) }]}>
                  {statusLabel(syncStatus)}
                </Text>
                {syncStatus === 'syncing' && (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </View>
            </LinearGradient>

            {/* Botões de Ação */}
            <View style={styles.buttons}>
              <Button
                title={syncLoading ? '🔄' : '🔄 Sincronizar'}
                onPress={handleManualSync}
                loading={syncLoading}
                style={styles.button}
              />
              <Button
                title="🗑️ Apagar Tudo"
                onPress={() => setShowResetConfirm(true)}
                variant="danger"
                style={styles.button}
              />
              <Button
                title="🚪 Sair"
                onPress={() => setShowLogoutConfirm(true)}
                variant="outline"
                style={styles.button}
              />
            </View>
          </>
        ) : (
          // ─── Usuário não logado ──────────────────────────────────────────
          <>
            {/* Logo e Título */}
            <View style={styles.headerSection}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.headerLogo}
              />
              <Text style={styles.headerTitle}>Finance Flex</Text>
              <Text style={styles.headerSubtitle}>
                Sincronize seus dados na nuvem
              </Text>
            </View>

            {/* Formulário Compacto */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {isSignUp ? 'Criar Conta' : 'Entrar'}
              </Text>

              {isSignUp && (
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome"
                  placeholderTextColor={theme.colors.textDim}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor={theme.colors.textDim}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={theme.colors.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Button
                title={authLoading ? '…' : (isSignUp ? '✅ Criar' : '🔑 Entrar')}
                onPress={handleAuth}
                loading={authLoading}
                style={styles.button}
              />

              <TouchableOpacity
                onPress={() => {
                  setIsSignUp(!isSignUp);
                  setDisplayName('');
                  setEmail('');
                  setPassword('');
                }}
                style={styles.toggleAuth}
              >
                <Text style={styles.toggleAuthText}>
                  {isSignUp ? 'Já tem conta? Entrar' : 'Criar conta'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal de confirmação de logout */}
      <ConfirmModal
        visible={showLogoutConfirm}
        title="Sair da Conta?"
        message="Seus dados locais serão mantidos."
        type="warning"
        confirmText="Sair"
        cancelText="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Modal de confirmação de reset */}
      <ConfirmModal
        visible={showResetConfirm}
        title="⚠️ Apagar Todos os Dados?"
        message="Esta ação é irreversível!"
        type="danger"
        confirmText="Sim, Apagar"
        onConfirm={handleResetData}
        onCancel={() => setShowResetConfirm(false)}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </>
  );
}

// ─── Utilitário ───────────────────────────────────────────────────────────────

function parseFirebaseError(code?: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos';
    case 'auth/email-already-in-use':
      return 'E-mail já cadastrado';
    case 'auth/weak-password':
      return 'Senha muito fraca';
    case 'auth/invalid-email':
      return 'E-mail inválido';
    case 'auth/network-request-failed':
      return 'Sem conexão';
    case 'auth/too-many-requests':
      return 'Muitas tentativas';
    default:
      return 'Erro ao autenticar';
  }
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Usuário Logado ──────────────────────────────────────────────────────

  profileCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: theme.colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  profileEmail: {
    color: theme.colors.textDim,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  syncStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.darker + '60',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  syncStatusText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
  },
  buttons: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    marginBottom: 0,
  },

  // ─── Usuário Não Logado ──────────────────────────────────────────────────

  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  headerLogo: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: {
    color: theme.colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.darker,
    borderRadius: 8,
    padding: 10,
    color: theme.colors.text,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleAuth: {
    marginTop: 10,
    alignItems: 'center',
  },
  toggleAuthText: {
    color: theme.colors.primary,
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
});
