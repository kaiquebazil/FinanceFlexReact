import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useData } from '../../hooks/useData';

interface PiggyBankFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export function PiggyBankForm({ onSave, onCancel }: PiggyBankFormProps) {
  const { addPiggyBank } = useData();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');

  const handleSave = () => {
    if (name.trim() && targetAmount) {
      addPiggyBank({
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        color: '#7c4dff',
      });
      onSave();
    }
  };

  return (
    <View style={styles.container}>
      <Input label="Nome do Cofrinho" value={name} onChangeText={setName} placeholder="Ex: Viagem" />
      <Input label="Meta (R$)" value={targetAmount} onChangeText={setTargetAmount} placeholder="0.00" keyboardType="numeric" />
      <Input label="Valor Atual (R$)" value={currentAmount} onChangeText={setCurrentAmount} placeholder="0.00" keyboardType="numeric" />
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
