import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../hooks/useData';
import { validateAccount } from '../../utils/validation';
import type { AccountType, Currency } from '../../types';

interface AccountFormProps {
  onSave: () => void;
  onCancel: () => void;
}

const accountTypes: AccountType[] = ['Dinheiro', 'Banco', 'Crédito', 'Investimento', 'Digital', 'Outro'];
const currencies: Currency[] = ['BRL', 'USD', 'EUR', 'GBP', 'JPY'];

export const AccountForm = ({ onSave, onCancel }: AccountFormProps) => {
  const { colors } = useTheme();
  const { addAccount } = useData();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('Banco');
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [balance, setBalance] = useState('');
  const [errors, setErrors] = useState<{ name?: string; balance?: string }>({});

  const handleSave = () => {
    const balanceNum = parseFloat(balance?.replace(',', '.') ?? '0');
    const validation = validateAccount(name, balanceNum);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    addAccount({
      name: name.trim(),
      type,
      currency,
      balance: balanceNum,
    });
    
    onSave();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]}>
      <Input
        label="Nome da Conta"
        value={name}
        onChangeText={setName}
        error={errors.name}
        placeholder="Ex: Nubank, Itaú, Carteira"
      />

      <Text style={[styles.label, { color: colors.text }]}>Tipo de Conta</Text>
      <View style={styles.chipContainer}>
        {accountTypes.map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.chip,
              { backgroundColor: colors.surfaceDark, borderColor: colors.border },
              type === t && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setType(t)}
          >
            <Text style={[
              styles.chipText,
              { color: colors.textSecondary },
              type === t && styles.chipTextActive,
            ]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Moeda</Text>
      <View style={styles.chipContainer}>
        {currencies.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.chip,
              { backgroundColor: colors.surfaceDark, borderColor: colors.border },
              currency === c && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setCurrency(c)}
          >
            <Text style={[
              styles.chipText,
              { color: colors.textSecondary },
              currency === c && styles.chipTextActive,
            ]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label="Saldo Inicial"
        value={balance}
        onChangeText={setBalance}
        keyboardType="numeric"
        placeholder="0,00"
        error={errors.balance}
      />

      <View style={styles.buttons}>
        <Button title="Salvar" onPress={handleSave} />
        <Button title="Cancelar" onPress={onCancel} variant="secondary" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  buttons: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
});
