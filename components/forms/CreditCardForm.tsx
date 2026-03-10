import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useData } from '../../hooks/useData';

interface CreditCardFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export function CreditCardForm({ onSave, onCancel }: CreditCardFormProps) {
  const { addCreditCard } = useData();
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [closingDay, setClosingDay] = useState('');

  const handleSave = () => {
    if (name.trim() && limit && dueDay && closingDay) {
      addCreditCard({
        name: name.trim(),
        limit: parseFloat(limit),
        dueDay: parseInt(dueDay),
        closingDay: parseInt(closingDay),
      });
      onSave();
    }
  };

  return (
    <View style={styles.container}>
      <Input label="Nome do Cartão" value={name} onChangeText={setName} placeholder="Ex: Nubank" />
      <Input label="Limite (R$)" value={limit} onChangeText={setLimit} placeholder="0.00" keyboardType="numeric" />
      <Input label="Dia do Vencimento" value={dueDay} onChangeText={setDueDay} placeholder="15" keyboardType="numeric" />
      <Input label="Dia do Fechamento" value={closingDay} onChangeText={setClosingDay} placeholder="10" keyboardType="numeric" />
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
