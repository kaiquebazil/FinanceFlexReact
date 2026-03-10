import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
  const { setPiggyBanks, piggyBanks } = useData();
  const [currentAmount, setCurrentAmount] = useState(piggyBank.currentAmount.toString());

  const handleSave = () => {
    const updatedPiggyBanks = piggyBanks.map(p => 
      p.id === piggyBank.id 
        ? { ...p, currentAmount: parseFloat(currentAmount) || 0 }
        : p
    );
    setPiggyBanks(updatedPiggyBanks);
    onSave();
  };

  return (
    <View style={styles.container}>
      <Input 
        label="Valor Atual (R$)" 
        value={currentAmount} 
        onChangeText={setCurrentAmount} 
        placeholder="0.00" 
        keyboardType="numeric" 
      />
      <View style={styles.buttons}>
        <Button title="Cancelar" onPress={onCancel} variant="outline" style={styles.button} />
        <Button title="Salvar" onPress={handleSave} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  button: { flex: 1 },
});
