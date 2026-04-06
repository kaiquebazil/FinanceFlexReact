import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useData } from '../../hooks/useData';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Account, AccountType, Currency } from '../../types';

interface AccountEditFormProps {
  account: Account;
  onSave: () => void;
  onCancel: () => void;
}

const accountTypes: AccountType[] = ['Dinheiro', 'Banco', 'Crédito', 'Investimento', 'Digital', 'Outro'];
const currencies: Currency[] = ['BRL', 'USD', 'EUR', 'GBP', 'JPY'];

export function AccountEditForm({ account, onSave, onCancel }: AccountEditFormProps) {
  const { updateAccount } = useData();
  const { t, language } = useLanguage();
  const [name, setName] = useState(account.name);
  const [type, setType] = useState<AccountType>(account.type);
  const [currency, setCurrency] = useState<Currency>(account.currency);
  const [balance, setBalance] = useState(account.balance.toString());
  const [errors, setErrors] = useState<{ name?: string; balance?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; balance?: string } = {};
    if (!name.trim()) {
      newErrors.name = t.requiredField;
    }
    if (!balance) {
      newErrors.balance = t.requiredField;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const balanceNum = parseFloat(balance.replace(',', '.')) || account.balance;
    updateAccount(account.id, {
      name: name.trim(),
      type,
      currency,
      balance: balanceNum,
    });
    onSave();
  };

  return (
    <View style={styles.container}>
      <Input
        label={t.accountName}
        value={name}
        onChangeText={setName}
        placeholder={t.accountNamePlaceholder}
        error={errors.name}
      />

      <Text style={styles.label}>{t.accountType}</Text>
      <View style={styles.chipContainer}>
        {accountTypes.map((tType) => (
          <TouchableOpacity
            key={tType}
            style={[
              styles.chip,
              type === tType && styles.chipSelected,
            ]}
            onPress={() => setType(tType)}
          >
            <Text style={[
              styles.chipText,
              type === tType && styles.chipTextSelected,
            ]}>
              {tType}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t.currency}</Text>
      <View style={styles.chipContainer}>
        {currencies.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.chip,
              currency === c && styles.chipSelected,
            ]}
            onPress={() => setCurrency(c)}
          >
            <Text style={[
              styles.chipText,
              currency === c && styles.chipTextSelected,
            ]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label={`${t.currentBalance} (${language === 'pt-BR' ? 'R$' : '$'})`}
        value={balance}
        onChangeText={setBalance}
        keyboardType="numeric"
        placeholder={language === 'pt-BR' ? '0,00' : '0.00'}
        error={errors.balance}
      />

      <View style={styles.buttons}>
        <Button title={t.cancel} onPress={onCancel} variant="outline" style={styles.button} />
        <Button title={t.save} onPress={handleSave} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingVertical: 8,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  chipSelected: {
    backgroundColor: '#7c4dff',
    borderColor: '#7c4dff',
  },
  chipText: {
    color: '#b3b3b3',
    fontSize: 12,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});
