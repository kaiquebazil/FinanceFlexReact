import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { formatCurrency } from '../../utils/currency';
import { Button } from '../ui/Button';

interface TransactionsModalProps {
  visible: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'income' | 'expense' | 'transfer';
type PeriodType = 'today' | 'week' | 'month' | 'year';

export function TransactionsModal({ visible, onClose }: TransactionsModalProps) {
  const { transactions, accounts, categories } = useData();
  
  // Estados de filtro
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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
      case 'income': return theme.colors.success;
      case 'expense': return theme.colors.danger;
      case 'transfer': return theme.colors.info;
      default: return theme.colors.textDim;
    }
  };

  const uniqueCategories = [...new Set(transactions.map(t => t.category))].filter(Boolean);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={styles.title}>Transferências</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={theme.colors.textDim} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Filtros */}
            <View style={styles.filtersContainer}>
              {/* Filtro por tipo */}
              <Text style={styles.filterLabel}>Filtrar por:</Text>
              <View style={styles.filterRow}>
                {(['all', 'income', 'expense', 'transfer'] as const).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      selectedFilter === filter && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text style={[
                      styles.filterChipText,
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
              <Text style={styles.filterLabel}>Período:</Text>
              <View style={styles.filterRow}>
                {(['today', 'week', 'month', 'year'] as const).map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.filterChip,
                      selectedPeriod === period && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedPeriod === period && styles.filterChipTextActive
                    ]}>
                      {period === 'today' ? 'Hoje' :
                       period === 'week' ? 'Semana' :
                       period === 'month' ? 'Mês' : 'Ano'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Filtro por categoria */}
              <Text style={styles.filterLabel}>Categoria:</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={styles.categorySelectorText}>
                  {selectedCategory === 'all' ? 'Todas' : selectedCategory}
                </Text>
                <FontAwesome5 
                  name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'} 
                  size={14} 
                  color={theme.colors.textDim} 
                />
              </TouchableOpacity>

              {showCategoryDropdown && (
                <View style={styles.dropdown}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedCategory('all');
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>Todas</Text>
                  </TouchableOpacity>
                  {uniqueCategories.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Resumo dos totais */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Receitas</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                  {formatCurrency(totals.income, 'BRL')}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Despesas</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.danger }]}>
                  {formatCurrency(totals.expense, 'BRL')}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Saldo</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.info }]}>
                  {formatCurrency(totals.income - totals.expense, 'BRL')}
                </Text>
              </View>
            </View>

            {/* Lista de transações */}
            <View style={styles.transactionsList}>
              {Object.keys(groupedTransactions).length === 0 ? (
                <View style={styles.emptyState}>
                  <FontAwesome5 name="exchange-alt" size={40} color={theme.colors.textDim} />
                  <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
                </View>
              ) : (
                Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
                  <View key={date}>
                    <Text style={styles.dateHeader}>{date}</Text>
                    {dateTransactions.map(t => {
                      const icon = getIconForType(t.type);
                      const color = getColorForType(t.type);
                      
                      return (
                        <View key={t.id} style={styles.transactionItem}>
                          <View style={[styles.transactionIcon, { backgroundColor: `${color}20` }]}>
                            <FontAwesome5 name={icon} size={16} color={color} />
                          </View>
                          
                          <View style={styles.transactionContent}>
                            <View style={styles.transactionHeader}>
                              <Text style={styles.transactionDescription}>
                                {t.description || (t.type === 'income' ? 'Receita' : 
                                 t.type === 'expense' ? 'Despesa' : 'Transferência')}
                              </Text>
                              <Text style={[styles.transactionAmount, { color }]}>
                                {t.type === 'expense' ? '- ' : '+ '}
                                {formatCurrency(t.amount, 'BRL')}
                              </Text>
                            </View>
                            
                            <View style={styles.transactionDetails}>
                              <Text style={styles.transactionCategory}>{t.category}</Text>
                              <Text style={styles.transactionAccount}>
                                {getAccountName(t.accountId)}
                                {t.toAccountId && ` → ${getAccountName(t.toAccountId)}`}
                              </Text>
                            </View>
                          </View>
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
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textDim,
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
    backgroundColor: theme.colors.darkLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.darkLight,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 5,
  },
  categorySelectorText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  dropdown: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 15,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dropdownItemText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textDim,
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
    color: theme.colors.primary,
    marginVertical: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.darkLight,
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
    color: theme.colors.text,
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
    color: theme.colors.textDim,
  },
  transactionAccount: {
    fontSize: 12,
    color: theme.colors.textDim,
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
  closeButton: {
    marginTop: 10,
  },
});