import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, StatusBar, Animated, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../hooks/useData';
import { ConfirmModal } from './ConfirmModal';

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

const { width } = Dimensions.get('window');

export function Drawer({ visible, onClose, onNavigate }: DrawerProps) {
  const router = useRouter();
  const theme = useAppTheme();
  const { user, syncStatus, logOut } = useAuth();
  const { resetToDefaults } = useData();
  const isLoggedIn = !!user;
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
          speed: 12,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

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
      console.error('Erro ao deslogar:', error);
    }
  };

  const getSyncColor = () => {
    if (!user) return theme.colors.textDim;
    switch (syncStatus) {
      case 'synced': return '#4CAF50';
      case 'syncing': return theme.colors.primary;
      case 'error': return '#F44336';
      default: return theme.colors.textDim;
    }
  };

  const getSyncText = () => {
    if (!user) return 'Não conectado';
    switch (syncStatus) {
      case 'synced': return 'Sincronizado';
      case 'syncing': return 'Sincronizando...';
      case 'error': return 'Erro na sincronização';
      default: return 'Aguardando...';
    }
  };

  const menuItems = [
    { id: 'transactions', icon: 'exchange-alt', label: 'Transações', iconColor: '#64B5F6' },
    { id: 'categories', icon: 'list-ul', label: 'Categorias', iconColor: '#81C784' },
    { id: 'recurring', icon: 'redo', label: 'Contas Recorrentes', iconColor: '#FFB74D' },
    { id: 'creditCards', icon: 'credit-card', label: 'Cartões de Crédito', iconColor: '#BA68C8' },
    { id: 'piggyBanks', icon: 'piggy-bank', label: 'Cofrinhos', iconColor: '#FF8A65' },
  ];

  return (
    <>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={onClose}
              activeOpacity={1}
            />
          </Animated.View>

          <Animated.View style={[
            styles.drawerContainer,
            { transform: [{ translateX: slideAnim }], backgroundColor: theme.colors.surface }
          ]}>
            <View style={styles.drawer}>
              {/* Cabeçalho */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <FontAwesome5 name="wallet" size={24} color={theme.colors.primary} />
                  <Text style={[styles.logoText, { color: theme.colors.text }]}>Finance Flex</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <FontAwesome5 name="times" size={20} color={theme.colors.textDim} />
                </TouchableOpacity>
              </View>

              {/* Info do usuário */}
              {isLoggedIn && (
                <TouchableOpacity
                  style={styles.userSection}
                  onPress={() => {
                    onNavigate('sync');
                    onClose();
                  }}
                >
                  <View style={styles.userInfo}>
                    <FontAwesome5 name="user-circle" size={32} color={theme.colors.primary} />
                    <View style={styles.userDetails}>
                      <Text style={[styles.userName, { color: theme.colors.text }]} numberOfLines={1}>{user.displayName || 'Usuário'}</Text>
                      <Text style={[styles.userEmail, { color: theme.colors.textDim }]} numberOfLines={1}>{user.email}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {/* Status de sincronização */}
              <TouchableOpacity 
                style={styles.syncStatusContainer}
                onPress={() => {
                  onNavigate('sync');
                  onClose();
                }}
              >
                <FontAwesome5
                  name="cloud"
                  size={14}
                  color={getSyncColor()}
                />
                <Text style={[styles.syncStatusText, { color: getSyncColor() }]}>
                  {getSyncText()}
                </Text>
              </TouchableOpacity>

              {/* Conteúdo do drawer */}
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Menu Principal */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>MENU PRINCIPAL</Text>
                  {menuItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuItem}
                      onPress={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuItemContent}>
                        <FontAwesome5
                          name={item.icon}
                          size={18}
                          color={item.iconColor}
                          style={styles.menuItemIcon}
                        />
                        <Text style={[styles.menuItemText, { color: theme.colors.text }]}>{item.label}</Text>
                      </View>
                      <FontAwesome5 name="chevron-right" size={16} color={theme.colors.textDim} />
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                {/* Configurações */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>SISTEMA</Text>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      onClose();
                      router.push('/settings');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemContent}>
                      <FontAwesome5
                        name="cog"
                        size={18}
                        color={theme.colors.textDim}
                        style={styles.menuItemIcon}
                      />
                      <Text style={[styles.menuItemText, { color: theme.colors.text }]}>Configurações</Text>
                    </View>
                    <FontAwesome5 name="chevron-right" size={16} color={theme.colors.textDim} />
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Rodapé */}
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>FinanceFlex v1.0.0</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <ConfirmModal
        visible={showResetConfirm}
        title="Apagar Tudo?"
        message="Isso removerá permanentemente todos os seus dados locais."
        type="danger"
        onConfirm={handleResetData}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmModal
        visible={showLogoutConfirm}
        title="Sair da Conta"
        message="Deseja realmente sair da sua conta?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  drawerContainer: {
    width: width * 0.8,
    height: '100%',
    maxWidth: 320,
  },
  drawer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  closeButton: {
    padding: 8,
  },
  userSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  syncStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  syncStatusText: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 4,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 24,
    textAlign: 'center',
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginTop: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  footerText: {
    fontSize: 12,
  },
});
