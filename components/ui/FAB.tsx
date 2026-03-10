import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface FABProps {
  visible: boolean;
  onPressMain: () => void;
  showMenu: boolean;
  onPressIncome: () => void;
  onPressExpense: () => void;
}

export function FAB({ visible, onPressMain, showMenu, onPressIncome, onPressExpense }: FABProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      {showMenu && (
        <>
          <TouchableOpacity style={[styles.fab, styles.fabIncome]} onPress={onPressIncome}>
            <FontAwesome5 name="arrow-down" size={18} color="#fff" />
            <Text style={styles.fabLabel}>Nova Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.fab, styles.fabExpense]} onPress={onPressExpense}>
            <FontAwesome5 name="arrow-up" size={18} color="#fff" />
            <Text style={styles.fabLabel}>Nova Despesa</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity style={[styles.fab, styles.fabMain]} onPress={onPressMain}>
        <FontAwesome5 name={showMenu ? 'times' : 'plus'} size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'flex-end',
    gap: 16,
    zIndex: 1000,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabMain: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 0,
  },
  fabIncome: {
    backgroundColor: theme.colors.success,
  },
  fabExpense: {
    backgroundColor: theme.colors.danger,
  },
  fabLabel: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
