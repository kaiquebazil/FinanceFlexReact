import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

export function Drawer({ visible, onClose, onNavigate }: DrawerProps) {
  const menuItems = [
    { id: 'transactions', icon: 'exchange-alt', label: 'Transações' },
    { id: 'categories', icon: 'list-ul', label: 'Categorias' },
    { id: 'recurring', icon: 'redo', label: 'Contas Recorrentes' },
    { id: 'creditCards', icon: 'credit-card', label: 'Cartões de Crédito' },
    // { id: 'piggyBanks', icon: 'piggy-bank', label: 'Cofrinhos' },
  ];

  const actionItems = [
    { id: 'backup', icon: 'download', label: 'Backup e Restauração' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.drawer}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <FontAwesome5 name="wallet" size={24} color={theme.colors.primary} />
              <Text style={styles.logoText}>Finance Flex</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color={theme.colors.textDim} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>NAVEGAÇÃO</Text>
              {menuItems.map((item) => (
                <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => onNavigate(item.id)}>
                  <FontAwesome5 name={item.icon} size={16} color={theme.colors.text} />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AÇÕES RÁPIDAS</Text>
              {actionItems.map((item) => (
                <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => onNavigate(item.id)}>
                  <FontAwesome5 name={item.icon} size={16} color={theme.colors.text} />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  drawer: { width: '80%', maxWidth: 320, backgroundColor: theme.colors.dark, borderLeftWidth: 1, borderLeftColor: theme.colors.border, marginTop: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoText: { fontSize: 18, fontFamily: 'Inter-Bold', color: theme.colors.text },
  closeButton: { padding: 8 },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontFamily: 'Inter-SemiBold', color: theme.colors.textDim, marginBottom: 12, letterSpacing: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  menuItemText: { flex: 1, fontSize: 15, fontFamily: 'Inter-Medium', color: theme.colors.text },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 16 },
});
