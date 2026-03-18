// Painel de sincronização em tempo real com Firebase.
// Permite login/cadastro, exibe status da sincronização e
// oferece botão de sincronização manual.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth, SyncStatus } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Toast } from '../ui/Toast';
import { ConfirmModal } from '../ui/ConfirmModal';
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
  const { user, loading, syncStatus, lastSyncedAt, signIn, signUp, logOut, resetPassword, manualSync } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Notificacoes internas do modal (fixas no topo)
  const [modalNotif, setModalNotif] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showModalNotif = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setModalNotif({ visible: true, message, type });
    setTimeout(() => setModalNotif(prev => ({ ...prev, visible: false })), 4000);
  };

  // Mostrar benefícios apenas na primeira vez que o usuário vê o modal deslogado
  useEffect(() => {
    if (!user) {
      setShowBenefits(true);
    }
  }, [user]);

  // ─── Autenticação ─────────────────────────────────────────────────────────

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      showModalNotif('Preencha e-mail e senha', 'warning');
      return;
    }
    if (isSignUp && !displayName.trim()) {
      showModalNotif('Preencha seu nome', 'warning');
      return;
    }
    setAuthLoading(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password, displayName.trim());
        showModalNotif('Conta criada com sucesso!', 'success');
      } else {
        await signIn(email.trim(), password);
        showModalNotif('Login realizado com sucesso!', 'success');
      }
      setEmail('');
      setPassword('');
      setDisplayName('');
      setShowBenefits(false); // Ocultar benefícios após login
    } catch (err: any) {
      const msg = parseFirebaseError(err?.code);
      showModalNotif(msg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      showModalNotif('Desconectado com sucesso', 'info');
      setShowLogoutConfirm(false);
      setShowBenefits(true); // Mostrar benefícios novamente ao deslogar
    } catch {
      showModalNotif('Erro ao desconectar', 'error');
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      showModalNotif('Digite seu e-mail', 'warning');
      return;
    }
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail.trim());
      showModalNotif('E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'success');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (err: any) {
      const msg = parseFirebaseError(err?.code);
      showModalNotif(msg, 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  // ─── Sincronização manual ─────────────────────────────────────────────────

  const handleManualSync = async () => {
    setSyncLoading(true);
    try {
      await manualSync();
      showModalNotif('Dados sincronizados com sucesso!', 'success');
    } catch {
      showModalNotif('Erro ao sincronizar. Verifique sua conexão.', 'error');
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Notificação fixa no topo */}
      {modalNotif.visible && (
        <View style={[
          styles.modalNotification,
          modalNotif.type === 'error' && styles.notifError,
          modalNotif.type === 'success' && styles.notifSuccess,
          modalNotif.type === 'warning' && styles.notifWarning,
          modalNotif.type === 'info' && styles.notifInfo,
        ]}>
          <FontAwesome5
            name={modalNotif.type === 'error' ? 'exclamation-circle' : modalNotif.type === 'success' ? 'check-circle' : 'info-circle'}
            size={16}
            color="#fff"
            style={styles.notifIcon}
          />
          <Text style={styles.notifText}>{modalNotif.message}</Text>
        </View>
      )}

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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

            {/* Info do usuário - SEM ID */}
            <View style={styles.userCard}>
              <View style={styles.userAvatar}>
                <FontAwesome5 name="user-circle" size={32} color={theme.colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.displayName || 'Usuário'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
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
                onPress={() => setShowLogoutConfirm(true)}
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
            {/* Formulário de autenticação */}
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
                  editable={!authLoading}
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
                editable={!authLoading}
              />

              <TextInput
                style={styles.input}
                placeholder="Senha (mínimo 6 caracteres)"
                placeholderTextColor={theme.colors.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!authLoading}
              />

              <Button
                title={authLoading
                  ? (isSignUp ? 'Criando conta…' : 'Entrando…')
                  : (isSignUp ? '✅ Criar Conta' : '🔑 Entrar')}
                onPress={handleAuth}
                loading={authLoading}
                style={styles.button}
              />

              <View style={styles.authLinks}>
                <TouchableOpacity
                  onPress={() => {
                    setIsSignUp(!isSignUp);
                    setDisplayName('');
                    setEmail('');
                    setPassword('');
                    setShowForgotPassword(false);
                  }}
                  style={styles.toggleAuth}
                >
                  <Text style={styles.toggleAuthText}>
                    {isSignUp
                      ? 'Já tem uma conta? Entrar'
                      : 'Não tem conta? Criar agora'}
                  </Text>
                </TouchableOpacity>

                {!isSignUp && (
                  <TouchableOpacity
                    onPress={() => setShowForgotPassword(true)}
                    style={styles.forgotPasswordLink}
                  >
                    <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Benefícios - Mostrar apenas quando deslogado (primeira vez) */}
            {showBenefits && (
              <View style={styles.benefitsBox}>
                <Text style={styles.benefitsTitle}>✨ Benefícios da Sincronização</Text>
                
                <View style={styles.benefitItem}>
                  <FontAwesome5 name="cloud-upload-alt" size={16} color={theme.colors.primary} />
                  <View style={styles.benefitContent}>
                    <Text style={styles.benefitName}>Backup Automático</Text>
                    <Text style={styles.benefitDesc}>Seus dados são salvos na nuvem com segurança</Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <FontAwesome5 name="sync-alt" size={16} color={theme.colors.primary} />
                  <View style={styles.benefitContent}>
                    <Text style={styles.benefitName}>Sincronização em Tempo Real</Text>
                    <Text style={styles.benefitDesc}>Alterações aparecem em todos os seus dispositivos instantaneamente</Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <FontAwesome5 name="lock" size={16} color={theme.colors.primary} />
                  <View style={styles.benefitContent}>
                    <Text style={performance.now() > 0 ? styles.benefitName : styles.benefitName}>Dados Protegidos</Text>
                    <Text style={styles.benefitDesc}>Criptografia Firebase garante privacidade total</Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <FontAwesome5 name="mobile-alt" size={16} color={theme.colors.primary} />
                  <View style={styles.benefitContent}>
                    <Text style={styles.benefitName}>Acesso em Qualquer Lugar</Text>
                    <Text style={styles.benefitDesc}>Use o app em múltiplos dispositivos sem perder dados</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Info box - Mostrar sempre */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                🔒 Seus dados ficam protegidos com autenticação Firebase.
                Cada usuário tem seu próprio espaço privado na nuvem.
              </Text>
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

      {/* Modal de esqueci a senha */}
      <ConfirmModal
        visible={showForgotPassword}
        title="Recuperar Senha"
        message="Digite seu e-mail para receber um link de recuperação"
        type="info"
        confirmText={forgotLoading ? 'Enviando...' : 'Enviar'}
        cancelText="Cancelar"
        onConfirm={handleForgotPassword}
        onCancel={() => {
          setShowForgotPassword(false);
          setForgotEmail('');
        }}
        customContent={
          <TextInput
            style={styles.forgotInput}
            placeholder="seu@email.com"
            placeholderTextColor={theme.colors.textDim}
            value={forgotEmail}
            onChangeText={setForgotEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        }
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
    backgroundColor: theme.colors.dark,
  },
  modalNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    zIndex: 1000,
  },
  notifError: {
    backgroundColor: '#F44336',
  },
  notifSuccess: {
    backgroundColor: '#4CAF50',
  },
  notifWarning: {
    backgroundColor: '#FF9800',
  },
  notifInfo: {
    backgroundColor: theme.colors.primary,
  },
  notifIcon: {
    marginRight: 4,
  },
  notifText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    backgroundColor: theme.colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    flex: 1,
  },
  lastSync: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    marginBottom: 8,
  },
  realtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  realtimeBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#4CAF50',
    marginLeft: 6,
  },
  userCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    marginTop: 4,
  },
  buttons: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
  formCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.inputBg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: theme.colors.text,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: theme.colors.textDim,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  socialButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
  authLinks: {
    gap: 12,
    marginTop: 12,
  },
  toggleAuth: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleAuthText: {
    color: theme.colors.primary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
  forgotPasswordLink: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  forgotInput: {
    backgroundColor: theme.colors.inputBg,
    borderRadius: 8,
    padding: 12,
    color: theme.colors.text,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  benefitsBox: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  benefitsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  benefitContent: {
    marginLeft: 12,
    flex: 1,
  },
  benefitName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  benefitDesc: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    marginTop: 2,
    lineHeight: 16,
  },
  infoBox: {
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
    lineHeight: 18,
  },
});
