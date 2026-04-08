// components/features/SettingsManager.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../hooks/useData';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/ConfirmModal';

interface SettingsManagerProps {
  visible: boolean;
  onClose: () => void;
  onOpenSync: () => void;
  onOpenBackup: () => void;
}

interface SettingItem {
  id: string;
  icon: string;
  label: string;
  value?: string;
  color?: string;
  danger?: boolean;
  showToggle?: boolean;
  showArrow?: boolean;
  action: () => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export function SettingsManager({ visible, onClose, onOpenSync, onOpenBackup }: SettingsManagerProps) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, syncStatus, logOut } = useAuth();
  const { resetToDefaults } = useData();
  const { t, language, toggleLanguage } = useLanguage();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isLoggedIn = !!user;

  const handleResetData = () => {
    resetToDefaults();
    setShowResetConfirm(false);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setShowLogoutConfirm(false);
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getSyncColor = () => {
    if (!user) return colors.textDim;
    switch (syncStatus) {
      case 'synced':
        return '#4CAF50';
      case 'syncing':
        return theme.colors.primary;
      case 'error':
        return '#F44336';
      default:
        return colors.textDim;
    }
  };

  const getSyncText = () => {
    if (!user) return t.notConnected;
    switch (syncStatus) {
      case 'synced':
        return t.synced;
      case 'syncing':
        return t.syncing;
      case 'error':
        return t.syncError;
      default:
        return t.waiting;
    }
  };

  const settingsSections: SettingSection[] = [
    {
      title: t.language,
      items: [
        {
          id: 'language',
          icon: 'globe',
          label: t.selectLanguage,
          value: language === 'pt-BR' ? t.portuguese : t.english,
          action: toggleLanguage,
          showToggle: true,
        },
      ],
    },
    {
      title: t.settings,
      items: [
        {
          id: 'theme',
          icon: isDark ? 'sun' : 'moon',
          label: t.toggleTheme,
          value: isDark ? 'Light' : 'Dark',
          action: toggleTheme,
          showToggle: true,
        },
      ],
    },
    {
      title: t.cloudSyncTitle,
      items: [
        {
          id: 'sync',
          icon: 'cloud',
          label: t.syncTitle,
          value: getSyncText(),
          color: getSyncColor(),
          action: () => {
            onClose();
            onOpenSync();
          },
          showArrow: true,
        },
        {
          id: 'backup',
          icon: 'database',
          label: t.backupRestoreTitle,
          action: () => {
            onClose();
            onOpenBackup();
          },
          showArrow: true,
        },
      ],
    },
    {
      title: t.dataControl,
      items: [
        {
          id: 'reset',
          icon: 'trash-alt',
          label: t.deleteAllData,
          action: () => setShowResetConfirm(true),
          danger: true,
        },
      ],
    },
  ];

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {/* Cabeçalho */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>{t.settings}</Text>
              <TouchableOpacity onPress={onClose}>
                <FontAwesome5 name="times" size={20} color={colors.textDim} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Status do Usuário */}
              {isLoggedIn && (
                <View style={[styles.userCard, { backgroundColor: colors.surfaceDark, borderColor: colors.border }]}>
                  <View style={styles.userInfo}>
                    <FontAwesome5 name="user-circle" size={40} color={colors.primary} />
                    <View style={styles.userDetails}>
                      <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                        {user.displayName || t.user}
                      </Text>
                      <Text style={[styles.userEmail, { color: colors.textDim }]} numberOfLines={1}>
                        {user.email}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Seções de Configurações */}
              {settingsSections.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textDim }]}>
                    {section.title}
                  </Text>
                  <View style={[styles.sectionContent, { backgroundColor: colors.surfaceDark, borderColor: colors.border }]}>
                    {section.items.map((item, itemIndex) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.settingItem,
                          itemIndex < section.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                        ]}
                        onPress={item.action}
                      >
                        <View style={styles.settingLeft}>
                          <FontAwesome5
                            name={item.icon}
                            size={18}
                            color={item.danger ? colors.danger : item.color || colors.primary}
                            style={styles.settingIcon}
                          />
                          <Text
                            style={[
                              styles.settingLabel,
                              { color: item.danger ? colors.danger : colors.text },
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                        <View style={styles.settingRight}>
                          {item.value && (
                            <Text style={[styles.settingValue, { color: colors.textDim }]}>
                              {item.value}
                            </Text>
                          )}
                          {item.showToggle && (
                            <View style={[styles.toggle, { backgroundColor: colors.primary }]}>
                              <Text style={styles.toggleText}>
                                {item.id === 'language'
                                  ? (language === 'pt-BR' ? 'BR' : 'EN')
                                  : (isDark ? '☀️' : '🌙')}
                              </Text>
                            </View>
                          )}
                          {item.showArrow && (
                            <FontAwesome5 name="chevron-right" size={14} color={colors.textDim} />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              {/* Seção da Conta (apenas logado) */}
              {isLoggedIn && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textDim }]}>
                    {t.account}
                  </Text>
                  <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: colors.danger + '15', borderColor: colors.danger }]}
                    onPress={() => setShowLogoutConfirm(true)}
                  >
                    <FontAwesome5 name="sign-out-alt" size={18} color={colors.danger} />
                    <Text style={[styles.logoutText, { color: colors.danger }]}>
                      {t.logout}
                    </Text>
                    <FontAwesome5 name="chevron-right" size={14} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Sobre */}
              <View style={[styles.aboutSection, { borderTopColor: colors.border }]}>
                <Text style={[styles.aboutTitle, { color: colors.text }]}>
                  FinanceFlex
                </Text>
                <Text style={[styles.aboutVersion, { color: colors.textDim }]}>
                  v5.1.1
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      Linking.openURL('https://kaiquebazil.github.io/portifolio/');
                    } catch (e) {
                      console.error('Error opening portfolio:', e);
                    }
                  }}
                >
                  <Text style={[styles.aboutCreator, { color: colors.primary }]}>
                    {t.creator}
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.copyright, { color: colors.textMuted }]}>
                  {t.copyright}
                </Text>
              </View>
            </ScrollView>

            {/* Botão Fechar */}
            <Button
              title={t.close}
              onPress={onClose}
              variant="outline"
              style={styles.closeButton}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de confirmação para logout */}
      <ConfirmModal
        visible={showLogoutConfirm}
        title={t.logout}
        message={t.logoutConfirm}
        type="warning"
        confirmText={t.logout}
        cancelText={t.cancel}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Modal de confirmação para apagar dados */}
      <ConfirmModal
        visible={showResetConfirm}
        title={`⚠️ ${t.deleteAllData}`}
        message={t.deleteAllConfirm}
        type="danger"
        confirmText={t.confirm}
        cancelText={t.cancel}
        onConfirm={handleResetData}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 30,
    textAlign: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  toggle: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 44,
    alignItems: 'center',
  },
  toggleText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  logoutText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  aboutSection: {
    marginTop: 10,
    paddingTop: 24,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  aboutCreator: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
  },
  copyright: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  closeButton: {
    marginTop: 10,
  },
});
