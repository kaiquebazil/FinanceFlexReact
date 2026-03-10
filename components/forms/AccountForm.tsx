import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { validateAccount } from '../../utils/validators';
import type { AccountType, Currency } from '../../types';

interface AccountFormProps {
  onSave: () => void;
  onCancel: () => void;
}

const accountTypes: AccountType[] = ['Dinheiro', 'Banco', 'Crédito', 'Investimento', 'Digital', 'Outro'];
const currencies: Currency[] = ['BRL', 'USD', 'EUR', 'GBP', 'JPY'];

export const AccountForm = ({ onSave, onCancel }: AccountFormProps) => {
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
    <ScrollView style={styles.container}>
      <Input
        label="Nome da Conta"
        value={name}
        onChangeText={setName}
        error={errors.name}
        placeholder="Ex: Nubank, Itaú, Carteira"
      />

      <Text style={styles.label}>Tipo de Conta</Text>
      <View style={styles.chipContainer}>
        {accountTypes.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, type === t && styles.chipActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Moeda</Text>
      <View style={styles.chipContainer}>
        {currencies.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, currency === c && styles.chipActive]}
            onPress={() => setCurrency(c)}
          >
            <Text style={[styles.chipText, currency === c && styles.chipTextActive]}>{c}</Text>
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
    color: theme.colors.text,
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
    backgroundColor: theme.colors.darkLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textSecondary,
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