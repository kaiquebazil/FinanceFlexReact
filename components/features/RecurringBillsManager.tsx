import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency } from '../../utils/currency';

interface RecurringBillsManagerProps {
  onClose: () => void;
}

export function RecurringBillsManager({ onClose }: RecurringBillsManagerProps) {
  const { recurringBills, addRecurringBill, deleteRecurringBill, toggleRecurringBillPaid, categories } = useData();
  
  // Estados para o formulário
  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillDueDay, setNewBillDueDay] = useState('');
  const [newBillCategory, setNewBillCategory] = useState('Outros');
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; amount?: string; dueDay?: string }>({});

  // Filtrar apenas categorias de despesa
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleAddBill = () => {
    // Validações
    const newErrors: { name?: string; amount?: string; dueDay?: string } = {};
    
    if (!newBillName.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    const amountNum = parseFloat(newBillAmount?.replace(',', '.') ?? '0');
    if (!newBillAmount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Valor inválido';
    }
    
    const dueDayNum = parseInt(newBillDueDay);
    if (!newBillDueDay || isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 31) {
      newErrors.dueDay = 'Dia deve ser entre 1 e 31';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Adicionar a conta recorrente
    addRecurringBill({
      name: newBillName.trim(),
      amount: amountNum,
      dueDay: dueDayNum,
      category: newBillCategory,
      isPaid: false,
    });

    // Limpar formulário e fechar
    setNewBillName('');
    setNewBillAmount('');
    setNewBillDueDay('');
    setNewBillCategory('Outros');
    setErrors({});
    setShowForm(false);
  };

  const handleDeleteBill = (id: string, name: string) => {
    Alert.alert(
      'Excluir Conta Recorrente',
      `Tem certeza que deseja excluir "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: () => deleteRecurringBill(id),
          style: 'destructive'
        }
      ]
    );
  };

  // Ordenar contas por dia do vencimento
  const sortedBills = [...recurringBills].sort((a, b) => a.dueDay - b.dueDay);

  // Agrupar por status de pagamento
  const paidBills = sortedBills.filter(bill => bill.isPaid);
  const unpaidBills = sortedBills.filter(bill => !bill.isPaid);

  const renderBillItem = (bill: any) => (
    <View key={bill.id} style={styles.billItem}>
      <TouchableOpacity 
        onPress={() => toggleRecurringBillPaid(bill.id)} 
        style={styles.checkbox}
      >
        <FontAwesome5 
          name={bill.isPaid ? 'check-circle' : 'circle'} 
          size={24} 
          color={bill.isPaid ? theme.colors.success : theme.colors.textDim} 
        />
      </TouchableOpacity>
      
      <View style={styles.billInfo}>
        <View style={styles.billHeader}>
          <Text style={[styles.billName, bill.isPaid && styles.billNamePaid]}>
            {bill.name}
          </Text>
          <Text style={[styles.billAmount, bill.isPaid && styles.billAmountPaid]}>
            {formatCurrency(bill.amount, 'BRL')}
          </Text>
        </View>
        
        <View style={styles.billDetails}>
          <View style={styles.billDetail}>
            <FontAwesome5 name="calendar-alt" size={12} color={theme.colors.textDim} />
            <Text style={styles.billDetailText}>
              Dia {bill.dueDay}
            </Text>
          </View>
          
          {bill.category && (
            <View style={styles.billDetail}>
              <FontAwesome5 name="tag" size={12} color={theme.colors.textDim} />
              <Text style={styles.billDetailText}>
                {bill.category}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => handleDeleteBill(bill.id, bill.name)} 
        style={styles.deleteButton}
      >
        <FontAwesome5 name="trash" size={16} color={theme.colors.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Botão para adicionar nova conta */}
      {!showForm ? (
        <Button
          title="Nova Conta Recorrente"
          icon="plus"
          onPress={() => setShowForm(true)}
          style={styles.addButton}
        />
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Nova Conta Recorrente</Text>
          
          <Input
            label="Nome da conta"
            value={newBillName}
            onChangeText={setNewBillName}
            placeholder="Ex: Aluguel, Internet, Academia"
            error={errors.name}
          />

          <Input
            label="Valor (R$)"
            value={newBillAmount}
            onChangeText={setNewBillAmount}
            keyboardType="numeric"
            placeholder="0,00"
            error={errors.amount}
          />

          <Input
            label="Dia do Vencimento"
            value={newBillDueDay}
            onChangeText={setNewBillDueDay}
            keyboardType="numeric"
            placeholder="1 a 31"
            maxLength={2}
            error={errors.dueDay}
          />

          <Text style={styles.label}>Categoria</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <View style={styles.categoryContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  newBillCategory === 'Outros' && styles.categoryChipActive
                ]}
                onPress={() => setNewBillCategory('Outros')}
              >
                <Text style={[
                  styles.categoryChipText,
                  newBillCategory === 'Outros' && styles.categoryChipTextActive
                ]}>
                  Outros
                </Text>
              </TouchableOpacity>
              
              {expenseCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    newBillCategory === cat.name && styles.categoryChipActive
                  ]}
                  onPress={() => setNewBillCategory(cat.name)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    newBillCategory === cat.name && styles.categoryChipTextActive
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.formButtons}>
            <Button
              title="Cancelar"
              onPress={() => {
                setShowForm(false);
                setErrors({});
                setNewBillName('');
                setNewBillAmount('');
                setNewBillDueDay('');
                setNewBillCategory('Outros');
              }}
              variant="outline"
              style={styles.formButton}
            />
            <Button
              title="Salvar"
              onPress={handleAddBill}
              style={styles.formButton}
            />
          </View>
        </View>
      )}

      {/* Lista de contas a pagar */}
      {unpaidBills.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>A Pagar</Text>
            <Text style={styles.sectionCount}>{unpaidBills.length}</Text>
          </View>
          <View style={styles.billsList}>
            {unpaidBills.map(renderBillItem)}
          </View>
        </View>
      )}

      {/* Lista de contas pagas */}
      {paidBills.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pagas</Text>
            <Text style={styles.sectionCount}>{paidBills.length}</Text>
          </View>
          <View style={styles.billsList}>
            {paidBills.map(renderBillItem)}
          </View>
        </View>
      )}

      {/* Mensagem quando não há contas */}
      {recurringBills.length === 0 && !showForm && (
        <View style={styles.emptyState}>
          <FontAwesome5 name="calendar-alt" size={48} color={theme.colors.textDim} />
          <Text style={styles.emptyStateTitle}>Nenhuma conta recorrente</Text>
          <Text style={styles.emptyStateText}>
            Adicione contas fixas como aluguel, internet ou streaming para acompanhar seus gastos mensais.
          </Text>
        </View>
      )}

      {/* Resumo mensal */}
      {recurringBills.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Resumo Mensal</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de contas:</Text>
            <Text style={styles.summaryValue}>{recurringBills.length}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total a pagar:</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.danger }]}>
              {formatCurrency(
                unpaidBills.reduce((sum, bill) => sum + bill.amount, 0),
                'BRL'
              )}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total pago:</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
              {formatCurrency(
                paidBills.reduce((sum, bill) => sum + bill.amount, 0),
                'BRL'
              )}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.dark,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textDim,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  sectionCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textDim,
    backgroundColor: theme.colors.darkLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  billsList: {
    gap: 12,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  billInfo: {
    flex: 1,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  billName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  billNamePaid: {
    textDecorationLine: 'line-through',
    color: theme.colors.textDim,
  },
  billAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  billAmountPaid: {
    color: theme.colors.textDim,
  },
  billDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  billDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  billDetailText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryContainer: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
});