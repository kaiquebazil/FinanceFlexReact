import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../hooks/useData';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency } from '../../utils/currency';

interface RecurringBillsManagerProps {
  onClose: () => void;
}

export function RecurringBillsManager({ onClose }: RecurringBillsManagerProps) {
  const { colors, isDark } = useTheme();
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

  const renderBillItem = (bill: any) => {
    const category = categories.find(c => c.name === bill.category);
    const categoryIcon = category?.icon || 'tag';

    return (
    <View key={bill.id} style={[styles.billItem, { backgroundColor: isDark ? colors.surfaceDark : '#fff', borderColor: colors.border }]}>
      <TouchableOpacity 
        onPress={() => toggleRecurringBillPaid(bill.id)} 
        style={styles.checkbox}
      >
        <FontAwesome5 
          name={bill.isPaid ? 'check-circle' : 'circle'} 
          size={24} 
          color={bill.isPaid ? colors.success : colors.textDim} 
        />
      </TouchableOpacity>
      
      <View style={styles.billInfo}>
        <View style={styles.billHeader}>
          <Text style={[styles.billName, { color: colors.text }, bill.isPaid && styles.billNamePaid]}>
            {bill.name}
          </Text>
          <Text style={[styles.billAmount, { color: colors.text }, bill.isPaid && styles.billAmountPaid]}>
            {formatCurrency(bill.amount, 'BRL')}
          </Text>
        </View>
        
        <View style={styles.billDetails}>
          <View style={styles.billDetail}>
            <FontAwesome5 name="calendar-alt" size={12} color={colors.textDim} />
            <Text style={[styles.billDetailText, { color: colors.textDim }]}>
              Dia {bill.dueDay}
            </Text>
          </View>
          
          {bill.category && (
            <View style={styles.billDetail}>
              <FontAwesome5 name={categoryIcon} size={12} color={colors.textDim} />
              <Text style={[styles.billDetailText, { color: colors.textDim }]}>
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
        <FontAwesome5 name="trash" size={16} color={colors.danger} />
      </TouchableOpacity>
    </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Botão para adicionar nova conta */}
      {!showForm ? (
        <Button
          title="Nova Conta Recorrente"
          icon="plus"
          onPress={() => setShowForm(true)}
          style={styles.addButton}
        />
      ) : (
        <View style={[styles.formContainer, { backgroundColor: isDark ? colors.surfaceDark : '#f8f8f8', borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.text }]}>Nova Conta Recorrente</Text>
          
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

          <Text style={[styles.label, { color: colors.textDim }]}>Categoria</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <View style={styles.categoryContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  { backgroundColor: isDark ? colors.surface : '#eee', borderColor: colors.border },
                  newBillCategory === 'Outros' && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setNewBillCategory('Outros')}
              >
                <Text style={[
                  styles.categoryChipText,
                  { color: colors.text },
                  newBillCategory === 'Outros' && { color: '#fff' }
                ]}>
                  Outros
                </Text>
              </TouchableOpacity>
              
              {expenseCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: isDark ? colors.surface : '#eee', borderColor: colors.border },
                    newBillCategory === cat.name && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setNewBillCategory(cat.name)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    { color: colors.text },
                    newBillCategory === cat.name && { color: '#fff' }
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>A Pagar</Text>
            <View style={[styles.sectionCountBadge, { backgroundColor: colors.danger + '20' }]}>
              <Text style={[styles.sectionCount, { color: colors.danger }]}>{unpaidBills.length}</Text>
            </View>
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pagas</Text>
            <View style={[styles.sectionCountBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.sectionCount, { color: colors.success }]}>{paidBills.length}</Text>
            </View>
          </View>
          <View style={styles.billsList}>
            {paidBills.map(renderBillItem)}
          </View>
        </View>
      )}

      {/* Mensagem quando não há contas */}
      {recurringBills.length === 0 && !showForm && (
        <View style={styles.emptyState}>
          <FontAwesome5 name="calendar-alt" size={48} color={colors.textDim} />
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Nenhuma conta recorrente</Text>
          <Text style={[styles.emptyStateText, { color: colors.textDim }]}>
            Adicione contas fixas como aluguel, internet ou streaming para acompanhar seus gastos mensais.
          </Text>
        </View>
      )}

      {/* Resumo mensal */}
      {recurringBills.length > 0 && (
        <View style={[styles.summaryContainer, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
          <Text style={[styles.summaryTitle, { color: colors.primary }]}>Resumo Mensal</Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textDim }]}>Total de contas:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{recurringBills.length}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textDim }]}>Total a pagar:</Text>
            <Text style={[styles.summaryValue, { color: colors.danger }]}>
              {formatCurrency(unpaidBills.reduce((acc, b) => acc + b.amount, 0), 'BRL')}
            </Text>
          </View>
        </View>
      )}
    </View>
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
    marginTop: 8,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
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
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  sectionCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionCount: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  billsList: {
    gap: 10,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkbox: {
    marginRight: 12,
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
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  billNamePaid: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  billAmount: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
  },
  billAmountPaid: {
    opacity: 0.6,
  },
  billDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  billDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  billDetailText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  summaryValue: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
  },
});
