import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useData } from '../../hooks/useData';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';

interface PiggyBankActionFormProps {
  piggyBank: any;
  type: 'deposit' | 'withdraw';
  onSave: () => void;
  onCancel: () => void;
}

export function PiggyBankActionForm({ piggyBank, type, onSave, onCancel }: PiggyBankActionFormProps) {
  const { depositToPiggyBank, withdrawFromPiggyBank, accounts } = useData();
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
      <Text style={styles.title}>
        {type === 'deposit' ? 'Depositar no Cofrinho' : 'Retirar do Cofrinho'}
      </Text>
      <Text style={styles.subtitle}>{piggyBank.name}</Text>

      <Input 
        label="Valor (R$)" 
        value={amount} 
        onChangeText={setAmount} 
        placeholder="0,00" 
        keyboardType="numeric"
        autoFocus
      />

      <Text style={styles.label}>Selecione a conta</Text>
      <View style={styles.accountListContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountList}>
          {accounts.map(account => (
            <TouchableOpacity
              key={account.id}
              style={[
                styles.accountOption, 
                selectedAccountId === account.id && styles.accountOptionSelected
              ]}
              onPress={() => setSelectedAccountId(account.id)}
            >
              <Text style={[
                styles.accountText, 
                selectedAccountId === account.id && styles.accountTextSelected
              ]}>
                {account.name}
              </Text>
              <Text style={[
                styles.accountBalance,
                selectedAccountId === account.id && styles.accountTextSelected
              ]}>
                {formatCurrency(account.balance, 'BRL')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.buttons}>
        <Button title="Cancelar" onPress={onCancel} variant="outline" style={styles.button} />
        <Button 
          title="Confirmar" 
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
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: -12,
    marginBottom: 8,
  },
  label: {
    color: theme.colors.text,
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
    backgroundColor: theme.colors.darkLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 120,
  },
  accountOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  accountText: {
    color: theme.colors.textDim,
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  accountBalance: {
    color: theme.colors.text,
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
