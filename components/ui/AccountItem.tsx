import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';  // ← CORRIGIDO: era @expo/-icons
import { theme } from '../../constants/theme';
import type { Account } from '../../types';

interface AccountItemProps {
  account: Account;
  onEdit: () => void;
  onDelete: () => void;
  formatValue: (value: number) => string;
}

export const AccountItem = ({ account, onEdit, onDelete, formatValue }: AccountItemProps) => {
  const getIconName = (type: string) => {
    switch (type) {
      case 'Dinheiro': return 'money-bill-wave';
      case 'Banco': return 'university';
      case 'Crédito': return 'credit-card';
      case 'Investimento': return 'chart-line';
      case 'Digital': return 'mobile-alt';
      default: return 'wallet';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <FontAwesome5 name={getIconName(account.type)} size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{account.name}</Text>
        <Text style={styles.type}>{account.type}</Text>
      </View>
      <View style={styles.balanceContainer}>
        <Text style={styles.balance}>{formatValue(account.balance)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <FontAwesome5 name="edit" size={14} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <FontAwesome5 name="trash" size={14} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.darkLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  type: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    marginTop: 2,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
});