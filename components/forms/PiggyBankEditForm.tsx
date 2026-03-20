import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useData } from '../../hooks/useData';
import type { PiggyBank } from '../../types';

interface PiggyBankEditFormProps {
  piggyBank: PiggyBank;
  onSave: () => void;
  onCancel: () => void;
}

export function PiggyBankEditForm({ piggyBank, onSave, onCancel }: PiggyBankEditFormProps) {
  const { updatePiggyBank, accounts } = useData();
  const [name, setName] = useState(piggyBank.name);
  const [targetAmount, setTargetAmount] = useState(piggyBank.targetAmount.toString());
  const [currentAmount, setCurrentAmount] = useState(piggyBank.currentAmount.toString());
  const [monthlyContribution, setMonthlyContribution] = useState(
    piggyBank.monthlyContribution?.toString() ?? '',
  );
  const [targetDate, setTargetDate] = useState(piggyBank.targetDate ?? '');
  const [selectedAccountId, setSelectedAccountId] = useState(piggyBank.accountId ?? '');

  const handleSave = () => {
    updatePiggyBank(piggyBank.id, {
      name: name.trim() || piggyBank.name,
      targetAmount: parseFloat(targetAmount) || piggyBank.targetAmount,
      currentAmount: parseFloat(currentAmount) || 0,
      monthlyContribution: monthlyContribution ? parseFloat(monthlyContribution) : undefined,
      targetDate: targetDate.trim() || undefined,
      accountId: selectedAccountId || undefined,
    });
    onSave();
  };

  return (
    <View style={styles.container}>
      <Input
        label="Nome do Cofrinho"
        value={name}
        onChangeText={setName}
        placeholder="Ex: Viagem"
      />

      <Input
        label="Meta (R$)"
        value={targetAmount}
        onChangeText={setTargetAmount}
        placeholder="0.00"
        keyboardType="numeric"
      />

      <Input
        label="Valor Atual (R$)"
        value={currentAmount}
        onChangeText={setCurrentAmount}
        placeholder="0.00"
        keyboardType="numeric"
      />

      <Input
        label="Contribuição Mensal Planejada (R$) — opcional"
        value={monthlyContribution}
        onChangeText={setMonthlyContribution}
        placeholder="Ex: 200.00"
        keyboardType="numeric"
      />

      <Input
        label="Data Alvo (DD/MM/AAAA) — opcional"
        value={targetDate}
        onChangeText={setTargetDate}
        placeholder="Ex: 31/12/2025"
      />

      {accounts.length > 0 && (
        <>
          <Text style={styles.label}>Vincular a uma conta (opcional)</Text>
          <View style={styles.accountList}>
            <TouchableOpacity
              style={[styles.accountOption, !selectedAccountId && styles.accountOptionSelected]}
              onPress={() => setSelectedAccountId('')}
            >
              <Text style={[styles.accountText, !selectedAccountId && styles.accountTextSelected]}>
                Nenhuma
              </Text>
            </TouchableOpacity>
            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountOption,
                  selectedAccountId === account.id && styles.accountOptionSelected,
                ]}
                onPress={() => setSelectedAccountId(account.id)}
              >
                <Text
                  style={[
                    styles.accountText,
                    selectedAccountId === account.id && styles.accountTextSelected,
                  ]}
                >
                  {account.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View style={styles.buttons}>
        <Button title="Cancelar" onPress={onCancel} variant="outline" style={styles.button} />
        <Button title="Salvar" onPress={handleSave} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  accountList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  accountOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  accountOptionSelected: {
    backgroundColor: '#7c4dff',
    borderColor: '#7c4dff',
  },
  accountText: {
    color: '#b3b3b3',
    fontSize: 12,
  },
  accountTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  button: { flex: 1 },
});
