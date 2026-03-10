import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { Button } from '../ui/Button';

interface RecurringBillsManagerProps {
  onClose: () => void;
}

export function RecurringBillsManager({ onClose }: RecurringBillsManagerProps) {
  const { recurringBills, addRecurringBill, deleteRecurringBill, toggleRecurringBillPaid } = useData();
  const [newBillName, setNewBillName] = useState('');

  const handleAddBill = () => {
    if (newBillName.trim()) {
      addRecurringBill({ name: newBillName.trim(), amount: 0, dueDay: 1, category: 'Outros', isPaid: false });
      setNewBillName('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome da conta recorrente"
          placeholderTextColor={theme.colors.textDim}
          value={newBillName}
          onChangeText={setNewBillName}
        />
        <Button title="Adicionar" onPress={handleAddBill} style={styles.addButton} />
      </View>
      <View style={styles.list}>
        {recurringBills.map((bill) => (
          <View key={bill.id} style={styles.item}>
            <TouchableOpacity onPress={() => toggleRecurringBillPaid(bill.id)} style={styles.checkbox}>
              <FontAwesome5 name={bill.isPaid ? 'check-square' : 'square'} size={20} color={bill.isPaid ? theme.colors.success : theme.colors.textDim} />
            </TouchableOpacity>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemText, bill.isPaid && styles.itemTextPaid]}>{bill.name}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteRecurringBill(bill.id)} style={styles.deleteButton}>
              <FontAwesome5 name="trash" size={14} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inputContainer: { marginBottom: 20 },
  input: { backgroundColor: theme.colors.darkLight, borderRadius: 8, padding: 12, color: theme.colors.text, marginBottom: 12 },
  addButton: { width: '100%' },
  list: { gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: theme.colors.darkLight, borderRadius: 8, gap: 12 },
  checkbox: { padding: 4 },
  itemInfo: { flex: 1 },
  itemText: { fontSize: 15, fontFamily: 'Inter-Medium', color: theme.colors.text },
  itemTextPaid: { textDecorationLine: 'line-through', color: theme.colors.textDim },
  deleteButton: { padding: 8 },
});
