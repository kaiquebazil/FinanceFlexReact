// components/features/TransactionsModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
  TouchableWithoutFeedback
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../hooks/useData';
import { formatCurrency } from '../../utils/currency';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Toast } from '../ui/Toast';
import { useToast } from '../../hooks/useToast';

interface TransactionsModalProps {
  visible: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'income' | 'expense' | 'transfer';
type PeriodType = 'all' | 'today' | 'week' | 'month' | 'year';

export function TransactionsModal({ visible, onClose }: TransactionsModalProps) {
  const { colors, isDark } = useTheme();
  const { transactions, accounts, categories, deleteTransaction } = useData();
  const { toast, showToast, hideToast } = useToast();
  
  // Estados de filtro
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Estados para confirmação de deleção
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);

  // Filtrar transações
  const getFilteredTransactions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return transactions.filter(t => {
      // Filtro por tipo
      if (selectedFilter !== 'all' && t.type !== selectedFilter) {
        return false;
      }

      // Filtro por período
      const tDate = new Date(t.date);
      if (selectedPeriod === 'today') {
        if (tDate.toDateString() !== today.toDateString()) return false;
      } else if (selectedPeriod === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (tDate < weekAgo) return false;
      } else if (selectedPeriod === 'month') {
        if (tDate.getMonth() !== now.getMonth() || tDate.getFullYear() !== now.getFullYear()) return false;
      } else if (selectedPeriod === 'year') {
        if (tDate.getFullYear() !== now.getFullYear()) return false;
      }

      // Filtro por categoria
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredTransactions = getFilteredTransactions();

  // Agrupar por data
  const groupedTransactions: { [key: string]: typeof transactions } = {};
  filteredTransactions.forEach(t => {
    const date = new Date(t.date).toLocaleDateString('pt-BR');
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    groupedTransactions[date].push(t);
  });

  // Calcular totais
  const totals = filteredTransactions.reduce((acc, t) => {
    if (t.type === 'income') acc.income += t.amount;
    if (t.type === 'expense') acc.expense += t.amount;
    if (t.type === 'transfer') acc.transfer += t.amount;
    return acc;
  }, { income: 0, expense: 0, transfer: 0 });

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.name || 'Conta desconhecida';
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'income': return 'arrow-down';
      case 'expense': return 'arrow-up';
      case 'transfer': return 'exchange-alt';
      default: return 'circle';
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'income': return colors.success;
      case 'expense': return colors.danger;
      case 'transfer': return colors.info;
      default: return colors.textDim;
    }
  };

  const uniqueCategories = [...new Set(transactions.map(t => t.category))].filter(Boolean);

  // Handler para deletar transação
  const handleDeletePress = (transaction: any) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      showToast('Transferência excluída com sucesso!', 'success');
      setShowDeleteConfirm(false);
      setTransactionToDelete(null);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {/* Cabeçalho */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>Todas as Transações</Text>
              <TouchableOpacity onPress={onClose}>
                <FontAwesome5 name="times" size={20} color={colors.textDim} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="none">
              {/* Filtros */}
              <View style={styles.filtersContainer}>
                {/* Filtro por tipo */}
                <Text style={[styles.filterLabel, { color: colors.textDim }]}>Filtrar por:</Text>
                <View style={styles.filterRow}>
                  {(['all', 'income', 'expense', 'transfer'] as const).map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterChip,
                        { backgroundColor: colors.surfaceDark, borderColor: colors.border },
                        selectedFilter === filter && styles.filterChipActive
                      ]}
                      onPress={() => setSelectedFilter(filter)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        { color: colors.text },
                        selectedFilter === filter && styles.filterChipTextActive
                      ]}>
                        {filter === 'all' ? 'Todas' :
                         filter === 'income' ? 'Receitas' :
                         filter === 'expense' ? 'Despesas' : 'Transferências'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Filtro por período */}
                <Text style={[styles.filterLabel, { color: colors.textDim }]}>Período</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                  {(['all', 'today', 'week', 'month', 'year'] as const).map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={[
                        styles.filterChip,
                        { 
                          backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, 
                          borderColor: colors.border 
                        },
                        selectedPeriod === period && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setSelectedPeriod(period)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        { color: colors.textDim },
                        selectedPeriod === period && { color: '#fff', fontFamily: 'Inter-SemiBold' }
                      ]}>
                        {period === 'all' ? 'Tudo' :
                         period === 'today' ? 'Hoje' :
                         period === 'week' ? 'Semana' :
                         period === 'month' ? 'Mês' : 'Ano'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Filtro por categoria */}
                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.textDim }]}>Categoria</Text>
                  <TouchableOpacity
                    style={[styles.selectButton, { backgroundColor: colors.surfaceDark, borderColor: colors.border }]}
                    onPress={() => setShowCategoryModal(true)}
                  >
                    <View style={styles.selectButtonContent}>
                      <FontAwesome5
                        name="tag"
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={[styles.selectButtonText, { color: colors.text }]}>
                        {selectedCategory === 'all' ? 'Todas' : selectedCategory}
                      </Text>
                    </View>
                    <FontAwesome5 
                      name="chevron-down" 
                      size={14} 
                      color={colors.textDim} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Resumo dos totais */}
              <View style={[styles.summaryContainer, { backgroundColor: colors.surfaceDark }]}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.textDim }]}>Receitas</Text>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>
                    {formatCurrency(totals.income, 'BRL')}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.textDim }]}>Despesas</Text>
                  <Text style={[styles.summaryValue, { color: colors.danger }]}>
                    {formatCurrency(totals.expense, 'BRL')}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.textDim }]}>Saldo</Text>
                  <Text style={[styles.summaryValue, { color: colors.info }]}>
                    {formatCurrency(totals.income - totals.expense, 'BRL')}
                  </Text>
                </View>
              </View>

              {/* Lista de transações */}
              <View style={styles.transactionsList}>
                {Object.keys(groupedTransactions).length === 0 ? (
                  <View style={styles.emptyState}>
                    <FontAwesome5 name="exchange-alt" size={40} color={colors.textDim} />
                    <Text style={[styles.emptyText, { color: colors.textDim }]}>Nenhuma transação encontrada</Text>
                  </View>
                ) : (
                  Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
                    <View key={date}>
                      <Text style={[styles.dateHeader, { color: colors.primary }]}>{date}</Text>
                      {dateTransactions.map(t => {
                        const icon = getIconForType(t.type);
                        const color = getColorForType(t.type);
                        
                        return (
                          <View key={t.id} style={[styles.transactionItem, { backgroundColor: colors.surfaceDark }]}>
                            <View style={[styles.transactionIcon, { backgroundColor: `${color}20` }]}>
                              <FontAwesome5 name={icon} size={16} color={color} />
                            </View>
                            
                            <View style={styles.transactionContent}>
                              <View style={styles.transactionHeader}>
                                <Text style={[styles.transactionDescription, { color: colors.text }]}>
                                  {t.description || (t.type === 'income' ? 'Receita' : 
                                   t.type === 'expense' ? 'Despesa' : 'Transferência')}
                                </Text>
                                <Text style={[styles.transactionAmount, { color }]}>
                                  {t.type === 'expense' ? '- ' : '+ '}
                                  {formatCurrency(t.amount, 'BRL')}
                                </Text>
                              </View>
                              
                              <View style={styles.transactionDetails}>
                                <Text style={[styles.transactionCategory, { color: colors.textDim }]}>{t.category}</Text>
                                <Text style={[styles.transactionAccount, { color: colors.textDim }]}>
                                  {getAccountName(t.accountId)}
                                  {t.toAccountId && ` → ${getAccountName(t.toAccountId)}`}
                                </Text>
                              </View>
                            </View>

                            {/* Botão de deletar */}
                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={() => handleDeletePress(t)}
                            >
                              <FontAwesome5 name="trash" size={16} color={colors.danger} />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  ))
                )}
              </View>
            </ScrollView>

            {/* Botão Fechar */}
            <Button
              title="Fechar"
              onPress={onClose}
              style={styles.closeButton}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação para Deletar */}
      <ConfirmModal
        visible={showDeleteConfirm}
        title="Excluir Transferência"
        message={`Tem certeza que deseja excluir esta transferência?\n\n${transactionToDelete?.description || 'Transferência'} - ${formatCurrency(transactionToDelete?.amount || 0, 'BRL')}`}
        type="danger"
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setTransactionToDelete(null);
        }}
      />

      {/* Toast para feedback */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Modal de Seleção de Categoria */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
          <View style={[styles.bottomSheetOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }]}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.selectionModalContent, { backgroundColor: colors.surface }]}>
                <View style={[styles.selectionHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.selectionTitle, { color: colors.text }]}>
                    Selecione uma categoria
                  </Text>
                  <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                    <FontAwesome5
                      name="times"
                      size={20}
                      color={colors.textDim}
                    />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={['all', ...uniqueCategories]}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => {
                    const category = categories.find(c => c.name === item);
                    return (
                      <TouchableOpacity
                        style={[styles.selectItem, { borderBottomColor: colors.border }]}
                        onPress={() => {
                          setSelectedCategory(item);
                          setShowCategoryModal(false);
                        }}
                      >
                        <FontAwesome5
                          name={item === 'all' ? 'tag' : (category?.icon || 'tag')}
                          size={16}
                          color={colors.primary}
                        />
                        <Text style={[styles.selectItemText, { color: colors.text }]}>
                          {item === 'all' ? 'Todas' : item}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 10,
    marginTop: 5,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 13,
  },
  filterChipTextActive: {
    color: '#fff',
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
  selectionModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
    width: '100%',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  selectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  transactionsList: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginVertical: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  transactionAmount: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionCategory: {
    fontSize: 12,
  },
  transactionAccount: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
  },
  closeButton: {
    marginTop: 10,
  },
});