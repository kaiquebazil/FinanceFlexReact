// components/features/FirebaseSync.tsx
// Painel de sincronização em tempo real com Firebase.
// Permite login/cadastro, exibe status da sincronização e
// oferece botão de sincronização manual.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth, SyncStatus } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Toast } from '../ui/Toast';
import { useToast } from '../../hooks/useToast';

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
  const { toast, showToast, hideToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // ─── Autenticação ─────────────────────────────────────────────────────────

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      showToast('Preencha e-mail e senha', 'warning');
      return;
    }
    setAuthLoading(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
        showToast('Conta criada com sucesso!', 'success');
      } else {
        await signIn(email.trim(), password);
        showToast('Login realizado com sucesso!', 'success');
      }
      setEmail('');
      setPassword('');
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <FontAwesome5 name="cloud" size={48} color={theme.colors.primary} />
          <Text style={styles.title}>Sincronização em Tempo Real</Text>
          <Text style={styles.subtitle}>
            Seus dados ficam salvos na nuvem e sincronizados automaticamente
            entre todos os seus dispositivos.
          </Text>
        </View>

        {user ? (
          // ─── Usuário logado ──────────────────────────────────────────────
          <>
            {/* Card de status */}
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <FontAwesome5
                  name={statusIcon(syncStatus)}
                  size={20}
                  color={statusColor(syncStatus)}
                />
                <Text style={[styles.statusText, { color: statusColor(syncStatus) }]}>
                  {statusLabel(syncStatus)}
                </Text>
                {syncStatus === 'syncing' && (
                  <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginLeft: 6 }} />
                )}
              </View>

              {lastSyncedAt && (
                <Text style={styles.lastSync}>
                  Última sincronização:{' '}
                  {lastSyncedAt.toLocaleString('pt-BR')}
                </Text>
              )}

              <View style={styles.realtimeBadge}>
                <FontAwesome5 name="bolt" size={12} color="#4CAF50" />
                <Text style={styles.realtimeBadgeText}>
                  Sincronização em tempo real ativa
                </Text>
              </View>
            </View>

            {/* Info do usuário */}
            <View style={styles.userCard}>
              <FontAwesome5 name="user-circle" size={24} color={theme.colors.primary} />
              <View style={styles.userInfo}>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userUid}>ID: {user.uid.slice(0, 12)}…</Text>
              </View>
            </View>

            {/* Botões */}
            <View style={styles.buttons}>
              <Button
                title={syncLoading ? 'Sincronizando…' : '🔄 Sincronizar Agora'}
                onPress={handleManualSync}
                loading={syncLoading}
                style={styles.button}
              />
              <Button
                title="🚪 Sair da Conta"
                onPress={handleLogout}
                variant="outline"
                style={styles.button}
              />
            </View>

            {/* Nota informativa */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 A sincronização em tempo real funciona automaticamente.
                Qualquer alteração feita em outro dispositivo aparece aqui
                em segundos, sem precisar pressionar nenhum botão.
              </Text>
            </View>
          </>
        ) : (
          // ─── Usuário não logado ──────────────────────────────────────────
          <>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {isSignUp ? 'Criar Conta' : 'Entrar na Conta'}
              </Text>

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
                onPress={() => setIsSignUp(!isSignUp)}
                style={styles.toggleAuth}
              >
                <Text style={styles.toggleAuthText}>
                  {isSignUp
                    ? 'Já tem uma conta? Entrar'
                    : 'Não tem conta? Criar agora'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                🔒 Seus dados ficam protegidos com autenticação Firebase.
                Cada usuário tem seu próprio espaço privado na nuvem.{'\n\n'}
                📱 Após o login, a sincronização em tempo real é ativada
                automaticamente — seus dados aparecem em todos os dispositivos
                instantaneamente.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

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
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  lastSync: {
    color: theme.colors.textDim,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  realtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  realtimeBadgeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    color: theme.colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
  },
  userUid: {
    color: theme.colors.textDim,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 2,
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
  buttons: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    marginBottom: 0,
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
  infoBox: {
    backgroundColor: 'rgba(124, 77, 255, 0.08)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  infoText: {
    color: theme.colors.textDim,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
});
