import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, StatusBar, Animated, Dimensions, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
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

  const actionItems = [
    { id: 'sync', icon: 'cloud', label: 'Sincronização em Nuvem', iconColor: '#64B5F6' },
    { id: 'reset', icon: 'trash-alt', label: 'Apagar Todos os Dados', iconColor: '#fc2020', danger: false },
  ];

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          {/* Fundo escuro com fade */}
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={onClose}
              activeOpacity={1}
            />
          </Animated.View>

          {/* Drawer lateral com animação */}
          <Animated.View style={[
            styles.drawerContainer,
            { transform: [{ translateX: slideAnim }] }
          ]}>
            <View style={styles.drawer}>
              {/* Cabeçalho */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../../assets/images/icon.png')}
                    style={{ width: 32, height: 32, resizeMode: 'contain' }}
                  />
                  <Text style={styles.logoText}>Finance Flex</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <FontAwesome5 name="times" size={20} color={theme.colors.textDim} />
                </TouchableOpacity>
              </View>

              {/* Info do usuário com link para portfólio */}
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
                      <Text style={styles.userName} numberOfLines={1}>{user.displayName || 'Usuário'}</Text>
                      <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
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
                  <Text style={styles.sectionTitle}>MENU PRINCIPAL</Text>
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
                        <Text style={styles.menuItemText}>{item.label}</Text>
                      </View>
                      <FontAwesome5 name="chevron-right" size={16} color={theme.colors.textDim} />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Divisor */}
                <View style={styles.divider} />

                {/* Ações Rápidas - AGORA COM O BOTÃO APAGAR */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>AÇÕES RÁPIDAS</Text>
                  {actionItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuItem}
                      onPress={() => {
                        if (item.id === 'reset') {
                          setShowResetConfirm(true);
                        } else {
                          onNavigate(item.id);
                          onClose();
                        }
                      }}
                      activeOpacity={0.4}
                    >
                      <View style={styles.menuItemContent}>
                        <FontAwesome5
                          name={item.icon}
                          size={18}
                          color={item.iconColor}
                          style={styles.menuItemIcon}
                        />
                        <Text style={styles.menuItemText}>{item.label}</Text>
                      </View>
                      <FontAwesome5 name="chevron-right" size={16} color={theme.colors.textDim} />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Seção de Usuário - SÓ APARECE QUANDO LOGADO */}
                {isLoggedIn && (
                  <>
                    <View style={styles.divider} />
                    
                    <View style={styles.section}>
                      <Text style={[styles.sectionTitle, styles.userSectionTitle]}>CONTA</Text>
                      
                      {/* Botão Sair */}
                      <TouchableOpacity
                        style={[styles.menuItem, styles.logoutItem]}
                        onPress={() => setShowLogoutConfirm(true)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.menuItemContent}>
                          <FontAwesome5
                            name="sign-out-alt"
                            size={18}
                            color={theme.colors.danger}
                            style={styles.menuItemIcon}
                          />
                          <Text style={[styles.menuItemText, styles.logoutText]}>
                            Sair da Conta
                          </Text>
                        </View>
                        <FontAwesome5 name="chevron-right" size={16} color={theme.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* Rodapé com informações do criador */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>© 2026 Finance Flex</Text>
                  <TouchableOpacity
                    onPress={() => {
                      try {
                        const Linking = require('react-native').Linking;
                        Linking.openURL('https://kaiquebazil.github.io/portifolio/');
                      } catch (e) {
                        console.error('Erro ao abrir portfólio:', e);
                      }
                    }}
                  >
                    <Text style={styles.creatorText}>Criador: Kaique Bazil →</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal de confirmação para logout */}
      <ConfirmModal
        visible={showLogoutConfirm}
        title="Sair da Conta"
        message="Tem certeza que deseja sair? Seus dados locais serão mantidos."
        type="warning"
        confirmText="Sair"
        cancelText="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Modal de confirmação para apagar dados - VERSÃO MELHORADA */}
      <ConfirmModal
        visible={showResetConfirm}
        title="⚠️ Apagar Todos os Dados?"
        message="Esta ação é irreversível e apagará TODOS os seus dados, incluindo transações, categorias, contas recorrentes, cartões de crédito e cofrinhos."
        type="danger"
        confirmText="Sim"
        cancelText="Cancelar"
        onConfirm={handleResetData}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  drawerContainer: {
    width: '80%',
    maxWidth: 320,
    backgroundColor: theme.colors.dark,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  drawer: {
    flex: 1,
    backgroundColor: theme.colors.dark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
  },
  userSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.darkLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: theme.colors.textDim,
    marginTop: 2,
  },
  portfolioLink: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  syncStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.darkLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  syncStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  syncEmail: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textDim,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textDim,
    marginBottom: 12,
    marginTop: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  userSectionTitle: {
    color: theme.colors.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 30,
    textAlign: 'center',
  },
  menuItemText: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  logoutText: {
    color: theme.colors.danger,
  },
  logoutItem: {
    backgroundColor: 'rgba(255, 61, 0, 0.05)',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.textDim,
    marginBottom: 4,
  },
  creatorText: {
    fontSize: 11,
    color: theme.colors.textDim,
    fontStyle: 'italic',
  },
});