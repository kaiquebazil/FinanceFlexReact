// app/settings.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme, sharedStyles } from '../constants/theme';
import { useData } from '../hooks/useData';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Toast } from '../components/ui/Toast';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { valuesHidden, setValuesHidden, resetToDefaults } = useData();
  const { user, logOut, syncStatus, manualSync } = useAuth();
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const handleResetData = () => {
    resetToDefaults();
    setShowResetConfirm(false);
    showToast('Dados resetados com sucesso!', 'success');
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setShowLogoutConfirm(false);
      router.replace('/');
    } catch (error) {
      showToast('Erro ao sair da conta', 'error');
    }
  };

  const handleSync = async () => {
    if (!user) {
      showToast('Faça login para sincronizar', 'info');
      return;
    }
    try {
      await manualSync();
      showToast('Sincronização concluída!', 'success');
    } catch (error) {
      showToast('Erro na sincronização', 'error');
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement, color = theme.colors.text }: any) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: theme.colors.border }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
        <FontAwesome5 name={icon} size={18} color={color === theme.colors.text ? theme.colors.primary : color} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: theme.colors.textDim }]}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <FontAwesome5 name="chevron-right" size={14} color={theme.colors.textMuted} />)}
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>{title.toUpperCase()}</Text>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Configurações</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Perfil / Conta */}
        <View style={styles.section}>
          <SectionTitle title="Conta e Sincronização" />
          {user ? (
            <>
              <SettingItem 
                icon="user-circle" 
                title={user.displayName || 'Usuário'} 
                subtitle={user.email}
              />
              <SettingItem 
                icon="sync" 
                title="Sincronizar Agora" 
                subtitle={`Status: ${syncStatus}`}
                onPress={handleSync}
              />
              <SettingItem 
                icon="sign-out-alt" 
                title="Sair da Conta" 
                onPress={() => setShowLogoutConfirm(true)}
                color={theme.colors.danger}
              />
            </>
          ) : (
            <SettingItem 
              icon="user-plus" 
              title="Entrar ou Criar Conta" 
              subtitle="Sincronize seus dados na nuvem"
              onPress={() => router.push('/')} // Ajustar conforme o fluxo de login
            />
          )}
        </View>

        {/* Preferências */}
        <View style={styles.section}>
          <SectionTitle title="Preferências" />
          <SettingItem 
            icon="eye-slash" 
            title="Ocultar Valores" 
            subtitle="Esconde saldos na tela inicial"
            rightElement={
              <Switch 
                value={valuesHidden} 
                onValueChange={setValuesHidden}
                trackColor={{ false: '#767577', true: theme.colors.primaryLight }}
                thumbColor={valuesHidden ? theme.colors.primary : '#f4f3f4'}
              />
            }
          />
          <SettingItem 
            icon="moon" 
            title="Tema Escuro" 
            subtitle={theme.isDark ? "Ativado (segue o sistema)" : "Desativado (segue o sistema)"}
            rightElement={
              <View style={styles.themeBadge}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>AUTO</Text>
              </View>
            }
          />
        </View>

        {/* Dados */}
        <View style={styles.section}>
          <SectionTitle title="Dados e Segurança" />
          <SettingItem 
            icon="file-export" 
            title="Exportar Dados (CSV)" 
            onPress={() => showToast('Funcionalidade em breve!', 'info')}
          />
          <SettingItem 
            icon="trash-alt" 
            title="Apagar Todos os Dados" 
            subtitle="Ação irreversível"
            onPress={() => setShowResetConfirm(true)}
            color={theme.colors.danger}
          />
        </View>

        {/* Sobre */}
        <View style={styles.section}>
          <SectionTitle title="Sobre" />
          <SettingItem icon="info-circle" title="Versão" subtitle="1.0.0" />
          <SettingItem icon="star" title="Avaliar o App" onPress={() => {}} />
          <SettingItem icon="shield-alt" title="Política de Privacidade" onPress={() => {}} />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>FinanceFlex © 2024</Text>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>Desenvolvido com ❤️</Text>
        </View>
      </ScrollView>

      {/* Modais */}
      <ConfirmModal
        visible={showResetConfirm}
        title="Apagar Tudo?"
        message="Isso removerá permanentemente todas as suas contas, transações e configurações locais. Esta ação não pode ser desfeita."
        type="danger"
        onConfirm={handleResetData}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmModal
        visible={showLogoutConfirm}
        title="Sair da Conta"
        message="Deseja realmente sair da sua conta? Seus dados locais permanecerão salvos."
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  themeBadge: {
    backgroundColor: '#7c4dff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
