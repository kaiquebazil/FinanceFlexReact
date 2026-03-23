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
import { useTheme } from '../../contexts/ThemeContext';
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

function statusColor(status: SyncStatus, primaryColor: string): string {
  switch (status) {
    case 'syncing': return primaryColor;
    case 'synced':  return '#4CAF50';
    case 'error':   return '#F44336';
    case 'offline': return '#FF9800';
    default:        return '#888888';
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
  const { colors, isDark } = useTheme();
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
      setShowBenefits(false);
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
      setShowBenefits(true);
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

  // Cores dinâmicas derivadas do tema
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : colors.surfaceDark;
  const inputBg = isDark ? colors.dark : colors.surfaceDark;
  const currentStatusColor = statusColor(syncStatus, colors.primary);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textDim }]}>Carregando…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoid}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 32 : 0}
    >
      {/* Notificação fixa no topo */}
      {modalNotif.visible && (
        <View style={[
          styles.modalNotification,
          modalNotif.type === 'error' && styles.notifError,
          modalNotif.type === 'success' && styles.notifSuccess,
          modalNotif.type === 'warning' && styles.notifWarning,
          modalNotif.type === 'info' && { backgroundColor: colors.primary },
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
          <View style={[styles.headerIconWrap, { backgroundColor: isDark ? 'rgba(124,77,255,0.15)' : 'rgba(108,63,255,0.1)' }]}>
            <FontAwesome5 name="cloud" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Sincronização em Tempo Real</Text>
          <Text style={[styles.subtitle, { color: colors.textDim }]}>
            Seus dados ficam salvos na nuvem e sincronizados automaticamente
            entre todos os seus dispositivos.
          </Text>
        </View>

        {user ? (
          // ─── Usuário logado ──────────────────────────────────────────────
          <>
            {/* Card de status */}
            <View style={[styles.statusCard, { backgroundColor: cardBg, borderLeftColor: colors.primary }]}>
              <View style={styles.statusRow}>
                <FontAwesome5
                  name={statusIcon(syncStatus)}
                  size={20}
                  color={currentStatusColor}
                />
                <Text style={[styles.statusText, { color: currentStatusColor }]}>
                  {statusLabel(syncStatus)}
                </Text>
                {syncStatus === 'syncing' && (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 6 }} />
                )}
              </View>

              {lastSyncedAt && (
                <Text style={[styles.lastSync, { color: colors.textDim }]}>
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
            <View style={[styles.userCard, { backgroundColor: cardBg }]}>
              <View style={styles.userAvatar}>
                <FontAwesome5 name="user-circle" size={32} color={colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{user.displayName || 'Usuário'}</Text>
                <Text style={[styles.userEmail, { color: colors.textDim }]}>{user.email}</Text>
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
            <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(124,77,255,0.1)' : 'rgba(108,63,255,0.08)' }]}>
              <Text style={[styles.infoText, { color: colors.text }]}>
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
            <View style={[styles.formCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>
                {isSignUp ? 'Criar Conta' : 'Entrar na Conta'}
              </Text>

              {isSignUp && (
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: colors.text, borderColor: colors.border }]}
                  placeholder="Seu nome completo"
                  placeholderTextColor={colors.textDim}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  editable={!authLoading}
                />
              )}

              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: colors.text, borderColor: colors.border }]}
                placeholder="E-mail"
                placeholderTextColor={colors.textDim}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!authLoading}
              />

              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: colors.text, borderColor: colors.border }]}
                placeholder="Senha (mínimo 6 caracteres)"
                placeholderTextColor={colors.textDim}
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
                  <Text style={[styles.toggleAuthText, { color: colors.primary }]}>
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
                    <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Esqueceu a senha?</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Benefícios - Mostrar apenas quando deslogado */}
            {showBenefits && (
              <View style={[styles.benefitsBox, { backgroundColor: cardBg, borderLeftColor: colors.primary }]}>
                <Text style={[styles.benefitsTitle, { color: colors.text }]}>✨ Benefícios da Sincronização</Text>

                {[
                  { icon: 'cloud-upload-alt', name: 'Backup Automático', desc: 'Seus dados são salvos na nuvem com segurança' },
                  { icon: 'sync-alt', name: 'Sincronização em Tempo Real', desc: 'Alterações aparecem em todos os seus dispositivos instantaneamente' },
                  { icon: 'lock', name: 'Dados Protegidos', desc: 'Criptografia Firebase garante privacidade total' },
                  { icon: 'mobile-alt', name: 'Acesso em Qualquer Lugar', desc: 'Use o app em múltiplos dispositivos sem perder dados' },
                ].map((benefit) => (
                  <View key={benefit.icon} style={styles.benefitItem}>
                    <FontAwesome5 name={benefit.icon} size={16} color={colors.primary} />
                    <View style={styles.benefitContent}>
                      <Text style={[styles.benefitName, { color: colors.text }]}>{benefit.name}</Text>
                      <Text style={[styles.benefitDesc, { color: colors.textDim }]}>{benefit.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Info box */}
            <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(124,77,255,0.1)' : 'rgba(108,63,255,0.08)' }]}>
              <Text style={[styles.infoText, { color: colors.text }]}>
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
            style={[
              styles.forgotInput,
              {
                backgroundColor: inputBg,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="seu@email.com"
            placeholderTextColor={colors.textDim}
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
    justifyContent: 'flex-start',
  },
  modalNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    zIndex: 1000,
    borderRadius: 8,
    marginBottom: 8,
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
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'Inter-Regular',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
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
  },
  userEmail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  buttons: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
  formCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    borderWidth: 1,
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
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
  forgotPasswordLink: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  forgotInput: {
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    borderWidth: 1,
    width: '100%',
  },
  benefitsBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  benefitsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
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
  },
  benefitDesc: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
    lineHeight: 16,
  },
  infoBox: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
});
