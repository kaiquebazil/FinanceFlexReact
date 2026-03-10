import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useData } from '../../hooks/useData';

interface PiggyBankFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export function PiggyBankForm({ onSave, onCancel }: PiggyBankFormProps) {
  const { addPiggyBank, accounts } = useData();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const handleSave = () => {
    if (name.trim() && targetAmount) {
      addPiggyBank({
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        color: '#7c4dff',
        accountId: selectedAccountId || undefined,
      });
      onSave();
    }
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
            {accounts.map(account => (
              <TouchableOpacity
                key={account.id}
                style={[styles.accountOption, selectedAccountId === account.id && styles.accountOptionSelected]}
                onPress={() => setSelectedAccountId(account.id)}
              >
                <Text style={[styles.accountText, selectedAccountId === account.id && styles.accountTextSelected]}>
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
    marginBottom: 16,
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