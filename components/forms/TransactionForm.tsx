import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import type { TransactionType } from '../../types';

interface TransactionFormProps {
  onSave: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date: string;
    accountId: string;
    toAccountId?: string;
  }) => void;
  onCancel: () => void;
}

export const TransactionForm = ({ onSave, onCancel }: TransactionFormProps) => {
  const { accounts, categories } = useData();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState(accounts?.[0]?.id ?? '');
  const [toAccountId, setToAccountId] = useState('');
  const [errors, setErrors] = useState<any>({});

  const filteredCategories = categories?.filter((c) => 
    type === 'transfer' ? false : c?.type === type
  ) ?? [];

  const handleSave = () => {
    const newErrors: any = {};
    if (!amount || parseFloat(amount?.replace(',', '.') ?? '0') <= 0) {
      newErrors.amount = 'Valor inválido';
    }
    if (!category && type !== 'transfer') newErrors.category = 'Categoria obrigatória';
    if (!accountId) newErrors.accountId = 'Conta obrigatória';
    if (type === 'transfer' && !toAccountId) newErrors.toAccountId = 'Conta destino obrigatória';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      type,
      amount: parseFloat(amount?.replace(',', '.') ?? '0'),
      category: type === 'transfer' ? 'Transferência' : category,
      description,
      date: new Date().toISOString(),
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Tipo</Text>
      <View style={styles.typeContainer}>
        {['income', 'expense', 'transfer'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeButton, type === t && styles.typeButtonActive]}
            onPress={() => setType(t as TransactionType)}
          >
            <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
              {t === 'income' ? 'Receita' : t === 'expense' ? 'Despesa' : 'Transferência'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label="Valor"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        error={errors?.amount}
      />

      {type !== 'transfer' && (
        <View>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.chipContainer}>
            {filteredCategories?.map((c) => (
              <TouchableOpacity
                key={c?.id}
                style={[styles.chip, category === c?.name && styles.chipActive]}
                onPress={() => setCategory(c?.name ?? '')}
              >
                <Text style={[styles.chipText, category === c?.name && styles.chipTextActive]}>
                  {c?.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors?.category && <Text style={styles.error}>{errors.category}</Text>}
        </View>
      )}

      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Conta {type === 'transfer' ? 'Origem' : ''}</Text>
      <View style={styles.chipContainer}>
        {accounts?.map((a) => (
          <TouchableOpacity
            key={a?.id}
            style={[styles.chip, accountId === a?.id && styles.chipActive]}
            onPress={() => setAccountId(a?.id ?? '')}
          >
            <Text style={[styles.chipText, accountId === a?.id && styles.chipTextActive]}>
              {a?.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {type === 'transfer' && (
        <View>
          <Text style={styles.label}>Conta Destino</Text>
          <View style={styles.chipContainer}>
            {accounts?.filter((a) => a?.id !== accountId)?.map((a) => (
              <TouchableOpacity
                key={a?.id}
                style={[styles.chip, toAccountId === a?.id && styles.chipActive]}
                onPress={() => setToAccountId(a?.id ?? '')}
              >
                <Text style={[styles.chipText, toAccountId === a?.id && styles.chipTextActive]}>
                  {a?.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors?.toAccountId && <Text style={styles.error}>{errors.toAccountId}</Text>}
        </View>
      )}

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
  typeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  typeButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.button,
    backgroundColor: theme.colors.darkLight,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  typeText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  typeTextActive: {
    color: '#fff',
    fontWeight: '600',
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
  error: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  buttons: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
});
