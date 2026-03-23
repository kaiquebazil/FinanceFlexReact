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
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth, SyncStatus } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/ConfirmModal';

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
  const { 
    user, 
    loading, 
    syncStatus, 
    lastSyncedAt, 
    signIn, 
    signUp, 
    logOut, 
    resetPassword, 
    manualSync,
    uploadData,
    downloadData
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);
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
    } catch (err: any) {
      showModalNotif('Erro na autenticação. Verifique seus dados.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      showModalNotif('Desconectado com sucesso', 'info');
      setShowLogoutConfirm(false);
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
      showModalNotif('E-mail de recuperação enviado!', 'success');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (err: any) {
      showModalNotif('Erro ao enviar e-mail de recuperação.', 'error');
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
      showModalNotif('Erro ao sincronizar.', 'error');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleUploadData = async () => {
    setSyncLoading(true);
    try {
      await uploadData();
      showModalNotif('Dados enviados para a nuvem!', 'success');
      setShowUploadConfirm(false);
    } catch {
      showModalNotif('Erro ao enviar dados.', 'error');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleDownloadData = async () => {
    setSyncLoading(true);
    try {
      await downloadData();
      showModalNotif('Dados baixados da nuvem!', 'success');
      setShowDownloadConfirm(false);
    } catch {
      showModalNotif('Erro ao baixar dados.', 'error');
    } finally {
      setSyncLoading(false);
    }
  };

  // Cores dinâmicas derivadas do tema
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : colors.surface;
  const currentStatusColor = statusColor(syncStatus, colors.primary);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textDim }]}>Carregando…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.keyboardAvoid, { backgroundColor: colors.background }]}
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
          <Text style={[styles.title, { color: colors.text }]}>Sincronização na Nuvem</Text>
          <Text style={[styles.subtitle, { color: colors.textDim }]}>
            Mantenha seus dados seguros e sincronizados entre todos os seus dispositivos.
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

              <View style={[styles.realtimeBadge, { backgroundColor: isDark ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)' }]}>
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

            {/* Opções de Sincronização */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Controle de Dados</Text>
            
            <View style={styles.syncOptionsGrid}>
              <TouchableOpacity 
                style={[styles.syncOptionCard, { backgroundColor: cardBg, borderColor: colors.border }]}
                onPress={() => setShowUploadConfirm(true)}
              >
                <View style={[styles.syncOptionIcon, { backgroundColor: 'rgba(124, 77, 255, 0.1)' }]}>
                  <FontAwesome5 name="cloud-upload-alt" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.syncOptionTitle, { color: colors.text }]}>Enviar Dados</Text>
                <Text style={[styles.syncOptionDesc, { color: colors.textDim }]}>Salva seus dados locais na nuvem</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.syncOptionCard, { backgroundColor: cardBg, borderColor: colors.border }]}
                onPress={() => setShowDownloadConfirm(true)}
              >
                <View style={[styles.syncOptionIcon, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                  <FontAwesome5 name="cloud-download-alt" size={20} color="#4CAF50" />
                </View>
                <Text style={[styles.syncOptionTitle, { color: colors.text }]}>Baixar Dados</Text>
                <Text style={[styles.syncOptionDesc, { color: colors.textDim }]}>Substitui dados locais pelos da nuvem</Text>
              </TouchableOpacity>
            </View>

            <Button
              title={syncLoading ? 'Sincronizando…' : '🔄 Sincronização Completa'}
              onPress={handleManualSync}
              loading={syncLoading}
              style={styles.fullSyncButton}
            />

            <Button
              title="🚪 Sair da Conta"
              onPress={() => setShowLogoutConfirm(true)}
              variant="outline"
              style={styles.logoutButton}
            />

            {/* Nota informativa */}
            <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(124, 77, 255, 0.1)' : 'rgba(124, 77, 255, 0.05)' }]}>
              <Text style={[styles.infoText, { color: colors.text }]}>
                💡 Use o <Text style={{ fontWeight: 'bold' }}>Enviar Dados</Text> para garantir que seu backup está atualizado antes de trocar de aparelho. Use o <Text style={{ fontWeight: 'bold' }}>Baixar Dados</Text> apenas se quiser restaurar um backup antigo.
              </Text>
            </View>
          </>
        ) : (
          // ─── Usuário deslogado ───────────────────────────────────────────
          <View style={[styles.formCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              {isSignUp ? 'Criar Nova Conta' : 'Acesse sua Conta'}
            </Text>

            {isSignUp && (
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? colors.surfaceDark : colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Seu Nome"
                placeholderTextColor={colors.textDim}
                value={displayName}
                onChangeText={setDisplayName}
              />
            )}

            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.surfaceDark : colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="E-mail"
              placeholderTextColor={colors.textDim}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.surfaceDark : colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Senha"
              placeholderTextColor={colors.textDim}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title={isSignUp ? 'Criar Conta' : 'Entrar'}
              onPress={handleAuth}
              loading={authLoading}
              style={{ marginTop: 8 }}
            />

            <View style={styles.authLinks}>
              <TouchableOpacity
                onPress={() => setIsSignUp(!isSignUp)}
                style={styles.toggleAuth}
              >
                <Text style={[styles.toggleAuthText, { color: colors.primary }]}>
                  {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
                </Text>
              </TouchableOpacity>

              {!isSignUp && (
                <TouchableOpacity
                  onPress={() => setShowForgotPassword(true)}
                  style={styles.forgotPasswordLink}
                >
                  <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Esqueci minha senha</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modais de Confirmação */}
      <ConfirmModal
        visible={showLogoutConfirm}
        title="Sair da Conta"
        message="Tem certeza que deseja sair? Você precisará fazer login novamente para sincronizar seus dados."
        type="warning"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmModal
        visible={showUploadConfirm}
        title="Enviar Dados para Nuvem"
        message="Isso irá substituir os dados salvos na nuvem pelos dados atuais deste dispositivo. Deseja continuar?"
        type="info"
        onConfirm={handleUploadData}
        onCancel={() => setShowUploadConfirm(false)}
      />

      <ConfirmModal
        visible={showDownloadConfirm}
        title="Baixar Dados da Nuvem"
        message="ATENÇÃO: Isso irá substituir TODOS os dados locais deste dispositivo pelos dados salvos na nuvem. Esta ação não pode ser desfeita. Deseja continuar?"
        type="danger"
        onConfirm={handleDownloadData}
        onCancel={() => setShowDownloadConfirm(false)}
      />

      {/* Esqueci Senha */}
      <ConfirmModal
        visible={showForgotPassword}
        title="Recuperar Senha"
        message="Digite seu e-mail para receber o link de recuperação."
        onConfirm={handleForgotPassword}
        onCancel={() => setShowForgotPassword(false)}
        customContent={
          <TextInput
            style={[styles.forgotInput, { backgroundColor: isDark ? colors.surfaceDark : colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="seu@email.com"
            placeholderTextColor={colors.textDim}
            value={forgotEmail}
            onChangeText={setForgotEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        }
      />
    </KeyboardAvoidingView>
  );
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
    marginTop: 12,
    fontFamily: 'Inter-Regular',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  headerIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 8,
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
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  syncOptionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  syncOptionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  syncOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  syncOptionTitle: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  syncOptionDesc: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 14,
  },
  fullSyncButton: {
    marginBottom: 12,
  },
  logoutButton: {
    marginBottom: 20,
  },
  formCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
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
    gap: 4,
    marginTop: 12,
  },
  toggleAuth: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  toggleAuthText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
  forgotPasswordLink: {
    paddingVertical: 4,
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
    marginTop: 16,
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
