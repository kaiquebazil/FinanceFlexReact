// components/features/FirebaseSync.tsx
// Painel de sincronização em tempo real com Firebase.
// Design moderno com animações e feedback visual em tempo real.

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
    case 'error':   return 'Erro na sincronização';
    case 'offline': return 'Sem conexão';
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
      showToast('Dados sincronizados com sucesso!', 'success');
    } catch {
      showToast('Erro ao sincronizar. Verifique sua conexão.', 'error');
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
    showToast('✅ Dados resetados para o padrão!', 'success');
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando…</Text>
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
            {/* Card de Perfil com Gradiente */}
            <LinearGradient
              colors={[theme.colors.primary + '20', theme.colors.primary + '08']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileCard}
            >
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <FontAwesome5 name="user-circle" size={48} color={theme.colors.primary} />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{user.displayName || 'Usuário'}</Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                </View>
              </View>

              {/* Status de Sincronização em Tempo Real */}
              <View style={styles.syncStatusContainer}>
                <View style={styles.syncStatusBadge}>
                  <FontAwesome5
                    name={statusIcon(syncStatus)}
                    size={16}
                    color={statusColor(syncStatus)}
                  />
                  <Text style={[styles.syncStatusText, { color: statusColor(syncStatus) }]}>
                    {statusLabel(syncStatus)}
                  </Text>
                  {syncStatus === 'syncing' && (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </View>

                {lastSyncedAt && (
                  <Text style={styles.lastSyncText}>
                    {lastSyncedAt.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
              </View>

              {/* Badge de Sincronização em Tempo Real */}
              <View style={styles.realtimeBadge}>
                <FontAwesome5 name="bolt" size={12} color="#4CAF50" />
                <Text style={styles.realtimeBadgeText}>
                  Sincronização em tempo real ativa
                </Text>
              </View>
            </LinearGradient>

            {/* Estatísticas */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <FontAwesome5 name="wallet" size={20} color={theme.colors.primary} />
                <Text style={styles.statValue}>{accounts.length}</Text>
                <Text style={styles.statLabel}>Contas</Text>
              </View>
              <View style={styles.statCard}>
                <FontAwesome5 name="exchange-alt" size={20} color="#4CAF50" />
                <Text style={styles.statValue}>∞</Text>
                <Text style={styles.statLabel}>Sincronizado</Text>
              </View>
              <View style={styles.statCard}>
                <FontAwesome5 name="shield-alt" size={20} color="#FF9800" />
                <Text style={styles.statValue}>✓</Text>
                <Text style={styles.statLabel}>Seguro</Text>
              </View>
            </View>

            {/* Botões de Ação */}
            <View style={styles.buttons}>
              <Button
                title={syncLoading ? '🔄 Sincronizando…' : '🔄 Sincronizar Agora'}
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
                title="🚪 Sair da Conta"
                onPress={() => setShowLogoutConfirm(true)}
                variant="outline"
                style={styles.button}
              />
            </View>

            {/* Informações */}
            <View style={styles.infoBox}>
              <View style={styles.infoItem}>
                <FontAwesome5 name="bolt" size={16} color={theme.colors.primary} />
                <Text style={styles.infoText}>
                  Sincronização automática em tempo real ativada
                </Text>
              </View>
              <View style={styles.infoItem}>
                <FontAwesome5 name="shield-alt" size={16} color={theme.colors.primary} />
                <Text style={styles.infoText}>
                  Dados criptografados e seguros no Firebase
                </Text>
              </View>
              <View style={styles.infoItem}>
                <FontAwesome5 name="mobile-alt" size={16} color={theme.colors.primary} />
                <Text style={styles.infoText}>
                  Sincroniza entre todos seus dispositivos
                </Text>
              </View>
            </View>
          </>
        ) : (
          // ─── Usuário não logado ──────────────────────────────────────────
          <>
            {/* Cabeçalho Atraente */}
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primary + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <FontAwesome5 name="cloud" size={60} color="#fff" />
              <Text style={styles.headerTitle}>Sincronize seus Dados</Text>
              <Text style={styles.headerSubtitle}>
                Acesse suas finanças em qualquer lugar, em qualquer dispositivo
              </Text>
            </LinearGradient>

            {/* Card de Benefícios */}
            <View style={styles.benefitsCard}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <FontAwesome5 name="sync-alt" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Sincronização em Tempo Real</Text>
                  <Text style={styles.benefitDesc}>Atualizações instantâneas em todos os dispositivos</Text>
                </View>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <FontAwesome5 name="lock" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Segurança Garantida</Text>
                  <Text style={styles.benefitDesc}>Autenticação Firebase com criptografia</Text>
                </View>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <FontAwesome5 name="mobile-alt" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Multi-Dispositivo</Text>
                  <Text style={styles.benefitDesc}>Acesse de celular, tablet ou computador</Text>
                </View>
              </View>
            </View>

            {/* Formulário */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {isSignUp ? 'Criar Conta' : 'Entrar na Conta'}
              </Text>

              {isSignUp && (
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome completo"
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
                placeholder="Senha (mínimo 6 caracteres)"
                placeholderTextColor={theme.colors.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Button
                title={authLoading
                  ? (isSignUp ? 'Criando conta…' : 'Entrando…')
                  : (isSignUp ? '✅ Criar Conta' : '🔑 Entrar')}
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
                  {isSignUp
                    ? 'Já tem uma conta? Entrar'
                    : 'Não tem conta? Criar agora'}
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
        message="Tem certeza que deseja sair? Seus dados locais serão mantidos, mas a sincronização em tempo real será desativada."
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
        message="Tem certeza que deseja resetar todos os dados? Esta ação é irreversível!"
        type="danger"
        confirmText="Sim, Apagar Tudo"
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
      return 'Este e-mail já está cadastrado';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres';
    case 'auth/invalid-email':
      return 'E-mail inválido';
    case 'auth/network-request-failed':
      return 'Sem conexão com a internet';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde';
    default:
      return 'Erro ao autenticar. Tente novamente';
  }
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    color: theme.colors.textDim,
    marginTop: 12,
    fontFamily: 'Inter-Regular',
  },

  // ─── Usuário Logado ──────────────────────────────────────────────────────

  profileCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: theme.colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  profileEmail: {
    color: theme.colors.textDim,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  syncStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.darker + '60',
    borderRadius: 10,
  },
  syncStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncStatusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  lastSyncText: {
    color: theme.colors.textDim,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  realtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  realtimeBadgeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    color: theme.colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  statLabel: {
    color: theme.colors.textDim,
    fontFamily: 'Inter-Regular',
    fontSize: 11,
  },
  buttons: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    marginBottom: 0,
  },
  infoBox: {
    gap: 12,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.colors.darkLight,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  infoText: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
  },

  // ─── Usuário Não Logado ──────────────────────────────────────────────────

  headerGradient: {
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.9,
  },
  benefitsCard: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 14,
  },
  benefitItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    color: theme.colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginBottom: 2,
  },
  benefitDesc: {
    color: theme.colors.textDim,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    color: theme.colors.text,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.darker,
    borderRadius: 8,
    padding: 12,
    color: theme.colors.text,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleAuth: {
    marginTop: 12,
    alignItems: 'center',
  },
  toggleAuthText: {
    color: theme.colors.primary,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});
