import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { formatCurrency } from '../../utils/currency';

interface TransactionFormProps {
  visible: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  onSave: (data: any) => void;
}

// Gerar array de anos (2020 até 2030)
const YEARS = Array.from({ length: 11 }, (_, i) => (2020 + i).toString());
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

export function TransactionForm({ visible, onClose, type, onSave }: TransactionFormProps) {
  const { accounts, categories } = useData();
  
  // Estados do formulário
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  
  // Estados de data
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate().toString());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear().toString());
  
  // Estados para modais de seleção
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  
  // Estados de erro
  const [errors, setErrors] = useState<any>({});

  // Filtrar categorias por tipo
  const filteredCategories = categories.filter(c => c.type === type);

  // Formatar valor enquanto digita
  const handleAmountChange = (text: string) => {
    // Remove tudo que não é número
    const cleanText = text.replace(/[^0-9]/g, '');
    
    if (cleanText === '') {
      setAmount('');
      return;
    }
    
    // Converte para número e formata
    const numberValue = parseFloat(cleanText) / 100;
    setAmount(numberValue.toFixed(2).replace('.', ','));
  };

  // Formatar data para exibição
  const getFormattedDate = () => {
    return `${selectedDay.toString().padStart(2, '0')}/${(selectedMonth + 1).toString().padStart(2, '0')}/${selectedYear}`;
  };

  // Validar dia do mês
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleDaySelect = (day: string) => {
    const daysInMonth = getDaysInMonth(selectedMonth, parseInt(selectedYear));
    if (parseInt(day) > daysInMonth) {
      setSelectedDay(daysInMonth.toString());
    } else {
      setSelectedDay(day);
    }
  };

  // Quando muda o mês/ano, ajustar o dia se necessário
  React.useEffect(() => {
    const daysInMonth = getDaysInMonth(selectedMonth, parseInt(selectedYear));
    if (parseInt(selectedDay) > daysInMonth) {
      setSelectedDay(daysInMonth.toString());
    }
  }, [selectedMonth, selectedYear]);

  // Validar e salvar
  const handleSave = () => {
    const newErrors: any = {};
    
    // Validar valor
    const amountValue = parseFloat(amount?.replace(',', '.') || '0');
    if (!amount || amountValue <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }
    
    // Validar categoria
    if (!selectedCategory) {
      newErrors.category = 'Selecione uma categoria';
    }
    
    // Validar conta
    if (!selectedAccount) {
      newErrors.account = 'Selecione uma conta';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Criar objeto da transação com a data selecionada
    const transaction = {
      type,
      amount: amountValue,
      description: description.trim() || (type === 'income' ? 'Receita' : 'Despesa'),
      category: selectedCategory.name,
      categoryId: selectedCategory.id,
      accountId: selectedAccount.id,
      accountName: selectedAccount.name,
      date: new Date(parseInt(selectedYear), selectedMonth, parseInt(selectedDay)).toISOString(),
      formattedDate: getFormattedDate()
    };

    onSave(transaction);
    resetForm();
    onClose();
  };

  // Resetar formulário
  const resetForm = () => {
    const today = new Date();
    setAmount('');
    setDescription('');
    setSelectedCategory(null);
    setSelectedAccount(null);
    setSelectedDay(today.getDate().toString());
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear().toString());
    setErrors({});
  };

  // Cancelar
  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // Renderizar item de categoria
  const renderCategoryItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.selectItem}
      onPress={() => {
        setSelectedCategory(item);
        setShowCategoryModal(false);
        setErrors({ ...errors, category: null });
      }}
    >
      <FontAwesome5 name={item.icon || 'tag'} size={16} color={theme.colors.primary} />
      <Text style={styles.selectItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Renderizar item de conta
  const renderAccountItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.selectItem}
      onPress={() => {
        setSelectedAccount(item);
        setShowAccountModal(false);
        setErrors({ ...errors, account: null });
      }}
    >
      <FontAwesome5 
        name={item.type === 'Dinheiro' ? 'money-bill-wave' : 'university'} 
        size={16} 
        color={theme.colors.primary} 
      />
      <View style={styles.accountInfo}>
        <Text style={styles.selectItemText}>{item.name}</Text>
        <Text style={styles.accountBalance}>
          {formatCurrency(item.balance, item.currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <FontAwesome5 
                name={type === 'income' ? 'arrow-down' : 'arrow-up'} 
                size={20} 
                color={type === 'income' ? theme.colors.success : theme.colors.danger} 
              />
              <Text style={styles.title}>
                {type === 'income' ? 'Nova Receita' : 'Nova Despesa'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color={theme.colors.textDim} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Tipo de Transação */}
            <View style={styles.field}>
              <Text style={styles.label}>Tipo de Transação</Text>
              <View style={styles.typeBadge}>
                <Text style={[styles.typeText, { color: type === 'income' ? theme.colors.success : theme.colors.danger }]}>
                  {type === 'income' ? 'Receita' : 'Despesa'}
                </Text>
              </View>
            </View>

            {/* Valor */}
            <View style={styles.field}>
              <Text style={styles.label}>Valor</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>R$</Text>
                <TextInput
                  style={[styles.amountInput, errors.amount && styles.inputError]}
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0,00"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>
              {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
            </View>

            {/* Descrição */}
            <View style={styles.field}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Descrição da transação"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            {/* Categoria */}
            <View style={styles.field}>
              <Text style={styles.label}>Categoria</Text>
              <TouchableOpacity
                style={[styles.selectButton, errors.category && styles.inputError]}
                onPress={() => setShowCategoryModal(true)}
              >
                {selectedCategory ? (
                  <View style={styles.selectButtonContent}>
                    <FontAwesome5 name={selectedCategory.icon || 'tag'} size={16} color={theme.colors.primary} />
                    <Text style={styles.selectButtonText}>{selectedCategory.name}</Text>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Selecione a categoria</Text>
                )}
                <FontAwesome5 name="chevron-down" size={14} color={theme.colors.textDim} />
              </TouchableOpacity>
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>

            {/* Conta */}
            <View style={styles.field}>
              <Text style={styles.label}>Conta</Text>
              <TouchableOpacity
                style={[styles.selectButton, errors.account && styles.inputError]}
                onPress={() => setShowAccountModal(true)}
              >
                {selectedAccount ? (
                  <View style={styles.selectButtonContent}>
                    <FontAwesome5 
                      name={selectedAccount.type === 'Dinheiro' ? 'money-bill-wave' : 'university'} 
                      size={16} 
                      color={theme.colors.primary} 
                    />
                    <View>
                      <Text style={styles.selectButtonText}>{selectedAccount.name}</Text>
                      <Text style={styles.selectBalance}>
                        {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Selecione Conta</Text>
                )}
                <FontAwesome5 name="chevron-down" size={14} color={theme.colors.textDim} />
              </TouchableOpacity>
              {errors.account && <Text style={styles.errorText}>{errors.account}</Text>}
            </View>

            {/* Data - NOVO SISTEMA FUNCIONAL */}
            <View style={styles.field}>
              <Text style={styles.label}>Data</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDateModal(true)}
              >
                <FontAwesome5 name="calendar-alt" size={16} color={theme.colors.primary} />
                <Text style={styles.dateText}>{getFormattedDate()}</Text>
                <FontAwesome5 name="chevron-down" size={14} color={theme.colors.textDim} />
              </TouchableOpacity>
            </View>

            {/* Botões */}
            <View style={styles.footer}>
              <Button
                title="Cancelar"
                onPress={handleCancel}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title="Salvar Transação"
                onPress={handleSave}
                style={styles.saveButton}
              />
            </View>
          </ScrollView>

          {/* Modal de Seleção de Categoria */}
          <Modal
            visible={showCategoryModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowCategoryModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.selectionModal}>
                <View style={styles.selectionHeader}>
                  <Text style={styles.selectionTitle}>Selecione uma categoria</Text>
                  <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                    <FontAwesome5 name="times" size={20} color={theme.colors.textDim} />
                  </TouchableOpacity>
                </View>
                
                {filteredCategories.length === 0 ? (
                  <View style={styles.emptyState}>
                    <FontAwesome5 name="tags" size={40} color={theme.colors.textDim} />
                    <Text style={styles.emptyText}>Nenhuma categoria encontrada</Text>
                  </View>
                ) : (
                  <FlatList
                    data={filteredCategories}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCategoryItem}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>
            </View>
          </Modal>

          {/* Modal de Seleção de Conta */}
          <Modal
            visible={showAccountModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowAccountModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.selectionModal}>
                <View style={styles.selectionHeader}>
                  <Text style={styles.selectionTitle}>Selecione uma conta</Text>
                  <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                    <FontAwesome5 name="times" size={20} color={theme.colors.textDim} />
                  </TouchableOpacity>
                </View>
                
                {accounts.length === 0 ? (
                  <View style={styles.emptyState}>
                    <FontAwesome5 name="wallet" size={40} color={theme.colors.textDim} />
                    <Text style={styles.emptyText}>Nenhuma conta encontrada</Text>
                  </View>
                ) : (
                  <FlatList
                    data={accounts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAccountItem}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>
            </View>
          </Modal>

          {/* Modal de Seleção de Data */}
          <Modal
            visible={showDateModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDateModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.dateModal}>
                <View style={styles.selectionHeader}>
                  <Text style={styles.selectionTitle}>Selecione a Data</Text>
                  <TouchableOpacity onPress={() => setShowDateModal(false)}>
                    <FontAwesome5 name="times" size={20} color={theme.colors.textDim} />
                  </TouchableOpacity>
                </View>

                {/* Seletor de Ano */}
                <View style={styles.dateSection}>
                  <Text style={styles.dateSectionLabel}>Ano</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                    {YEARS.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.dateOption,
                          selectedYear === year && styles.dateOptionSelected
                        ]}
                        onPress={() => setSelectedYear(year)}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          selectedYear === year && styles.dateOptionTextSelected
                        ]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Seletor de Mês */}
                <View style={styles.dateSection}>
                  <Text style={styles.dateSectionLabel}>Mês</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                    {MONTHS.map((month, index) => (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.dateOption,
                          selectedMonth === index && styles.dateOptionSelected
                        ]}
                        onPress={() => setSelectedMonth(index)}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          selectedMonth === index && styles.dateOptionTextSelected
                        ]}>
                          {month.substring(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Seletor de Dia */}
                <View style={styles.dateSection}>
                  <Text style={styles.dateSectionLabel}>Dia</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                    {DAYS.map((day) => {
                      const daysInMonth = getDaysInMonth(selectedMonth, parseInt(selectedYear));
                      if (parseInt(day) > daysInMonth) return null;
                      return (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.dateOption,
                            selectedDay === day && styles.dateOptionSelected
                          ]}
                          onPress={() => handleDaySelect(day)}
                        >
                          <Text style={[
                            styles.dateOptionText,
                            selectedDay === day && styles.dateOptionTextSelected
                          ]}>
                            {day.padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Botão Confirmar */}
                <Button
                  title="Confirmar Data"
                  onPress={() => setShowDateModal(false)}
                  style={styles.confirmButton}
                />
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 5,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textDim,
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: theme.colors.darkLight,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.darkLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  currencySymbol: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    paddingHorizontal: 15,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    paddingVertical: 12,
    paddingRight: 15,
  },
  input: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 5,
  },
  selectButton: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  selectButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  selectBalance: {
    fontSize: 12,
    color: theme.colors.textDim,
    marginTop: 2,
  },
  placeholderText: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  dateButton: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  selectionModal: {
    backgroundColor: theme.colors.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  dateModal: {
    backgroundColor: theme.colors.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  selectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectItemText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  accountInfo: {
    flex: 1,
  },
  accountBalance: {
    fontSize: 12,
    color: theme.colors.textDim,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textDim,
    marginTop: 10,
  },
  dateSection: {
    marginBottom: 20,
  },
  dateSectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textDim,
    marginBottom: 10,
  },
  dateScroll: {
    flexDirection: 'row',
  },
  dateOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.darkLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dateOptionText: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: 'Inter-Medium',
  },
  dateOptionTextSelected: {
    color: '#fff',
  },
  confirmButton: {
    marginTop: 20,
  },
});