import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useData } from '../../hooks/useData';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency } from '../../utils/currency';

interface PiggyBankActionFormProps {
  piggyBank: any;
  type: 'deposit' | 'withdraw';
  onSave: () => void;
  onCancel: () => void;
}

export function PiggyBankActionForm({ piggyBank, type, onSave, onCancel }: PiggyBankActionFormProps) {
  const { colors } = useTheme();
  const { depositToPiggyBank, withdrawFromPiggyBank, accounts } = useData();
  const { t, language } = useLanguage();
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(piggyBank.accountId || (accounts.length > 0 ? accounts[0].id : ''));

  const handleConfirm = () => {
    const value = parseFloat(amount.replace(',', '.'));
    if (isNaN(value) || value <= 0) return;

    if (type === 'deposit') {
      const success = depositToPiggyBank(piggyBank.id, selectedAccountId, value);
      if (success) onSave();
    } else {
      const success = withdrawFromPiggyBank(piggyBank.id, selectedAccountId, value);
      if (success) onSave();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {type === 'deposit' ? t.depositToPiggyBank : t.withdrawFromPiggyBank}
      </Text>
      <Text style={[styles.subtitle, { color: colors.primary }]}>{piggyBank.name}</Text>

      <Input
        label={`${t.amount} (${language === 'pt-BR' ? 'R$' : '$'})`}
        value={amount}
        onChangeText={setAmount}
        placeholder={language === 'pt-BR' ? "0,00" : "0.00"}
        keyboardType="numeric"
        autoFocus
      />

      <Text style={[styles.label, { color: colors.text }]}>{t.selectAccount}</Text>
      <View style={styles.accountListContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountList}>
          {accounts.map(account => (
            <TouchableOpacity
              key={account.id}
              style={[
                styles.accountOption, 
                { backgroundColor: colors.surfaceDark, borderColor: colors.border },
                selectedAccountId === account.id && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setSelectedAccountId(account.id)}
            >
              <Text style={[
                styles.accountText, 
                { color: colors.textDim },
                selectedAccountId === account.id && styles.accountTextSelected
              ]}>
                {account.name}
              </Text>
              <Text style={[
                styles.accountBalance,
                { color: colors.text },
                selectedAccountId === account.id && styles.accountTextSelected
              ]}>
                {formatCurrency(account.balance, 'BRL')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.buttons}>
        <Button title={t.cancel} onPress={onCancel} variant="outline" style={styles.button} />
        <Button
          title={t.confirm}
          onPress={handleConfirm}
          style={styles.button}
          disabled={!amount || !selectedAccountId}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: -12,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  accountListContainer: {
    marginHorizontal: -20,
  },
  accountList: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
  },
  accountOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
  },
  accountText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  accountBalance: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  accountTextSelected: {
    color: '#fff',
  },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  button: { flex: 1 },
});
