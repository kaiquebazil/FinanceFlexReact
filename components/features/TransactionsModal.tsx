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
  Alert
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
type PeriodType = 'today' | 'week' | 'month' | 'year';

export function TransactionsModal({ visible, onClose }: TransactionsModalProps) {
  const { colors, isDark } = useTheme();
  const { transactions, accounts, categories, deleteTransaction } = useData();
  const { toast, showToast, hideToast } = useToast();
  
  // Estados de filtro
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  // Obter categorias filtradas por tipo de transação
  const getCategoriesByType = () => {
    if (selectedFilter === 'all' || selectedFilter === 'transfer') {
      return [];
    }
    return categories.filter(cat => cat.type === selectedFilter);
  };

  const filteredCategoriesForType = getCategoriesByType();

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
                        { 
                          backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, 
                          borderColor: colors.border 
                        },
                        selectedFilter === filter && [styles.filterChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
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
                <Text style={[styles.filterLabel, { color: colors.textDim }]}>Período:</Text>
                <View style={styles.filterRow}>
                  {(['today', 'week', 'month', 'year'] as const).map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={[
                        styles.filterChip,
                        { 
                          backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, 
                          borderColor: colors.border 
                        },
                        selectedPeriod === period && [styles.filterChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
                      ]}
                      onPress={() => setSelectedPeriod(period)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        { color: colors.text },
                        selectedPeriod === period && styles.filterChipTextActive
                      ]}>
                        {period === 'today' ? 'Hoje' :
                         period === 'week' ? 'Semana' :
                         period === 'month' ? 'Mês' : 'Ano'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Filtro por categoria - BOTÕES EM GRADE */}
                {filteredCategoriesForType.length > 0 && (
                  <>
                    <Text style={[styles.filterLabel, { color: colors.textDim }]}>Categoria:</Text>
                    <View style={styles.categoryGrid}>
                      <TouchableOpacity
                        style={[
                          styles.categoryFilterButton,
                          { 
                            backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, 
                            borderColor: colors.border 
                          },
                          selectedCategory === 'all' && [styles.categoryFilterButtonActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
                        ]}
                        onPress={() => setSelectedCategory('all')}
                      >
                        <Text style={[
                          styles.categoryFilterButtonText,
                          { color: colors.text },
                          selectedCategory === 'all' && styles.categoryFilterButtonTextActive
                        ]}>
                          Todas
                        </Text>
                      </TouchableOpacity>
                      {filteredCategoriesForType.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryFilterButton,
                            {
                              backgroundColor: selectedCategory === cat.name ? cat.color : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                              borderColor: selectedCategory === cat.name ? cat.color : (isDark ? `${cat.color}40` : `${cat.color}60`),
                            },
                            selectedCategory === cat.name && styles.categoryFilterButtonActive
                          ]}
                          onPress={() => setSelectedCategory(cat.name)}
                        >
                          <FontAwesome5
                            name={cat.icon || 'tag'}
                            size={12}
                            color={selectedCategory === cat.name ? '#fff' : cat.color}
                          />
                          <Text style={[
                            styles.categoryFilterButtonText,
                            { color: selectedCategory === cat.name ? '#fff' : colors.text },
                            selectedCategory === cat.name && styles.categoryFilterButtonTextActive
                          ]}>
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </View>

              {/* Lista de transações */}
              {Object.keys(groupedTransactions).length === 0 ? (
                <View style={styles.emptyState}>
                  <FontAwesome5 name="receipt" size={48} color={colors.textDim} />
                  <Text style={[styles.emptyText, { color: colors.textDim }]}>Nenhuma transação encontrada</Text>
                </View>
              ) : (
                Object.entries(groupedTransactions).map(([date, items]) => (
                  <View key={date} style={styles.dateGroup}>
                    <Text style={[styles.dateHeader, { color: colors.textDim }]}>{date}</Text>
                    {items.map((t) => (
                      <TouchableOpacity 
                        key={t.id} 
                        style={[styles.transactionItem, { borderBottomColor: colors.border }]}
                        onLongPress={() => handleDeletePress(t)}
                      >
                        <View style={[styles.transactionIcon, { backgroundColor: `${getColorForType(t.type)}15` }]}>
                          <FontAwesome5 name={getIconForType(t.type)} size={16} color={getColorForType(t.type)} />
                        </View>
                        <View style={styles.transactionContent}>
                          <View style={styles.transactionHeader}>
                            <Text style={[styles.transactionDescription, { color: colors.text }]} numberOfLines={1}>
                              {t.description}
                            </Text>
                            <Text style={[
                              styles.transactionAmount, 
                              { color: t.type === 'income' ? colors.success : (t.type === 'expense' ? colors.danger : colors.info) }
                            ]}>
                              {t.type === 'expense' ? '-' : (t.type === 'income' ? '+' : '')} {formatCurrency(t.amount)}
                            </Text>
                          </View>
                          <View style={styles.transactionDetails}>
                            <Text style={[styles.transactionCategory, { color: colors.textDim }]}>{t.category}</Text>
                            <Text style={[styles.transactionAccount, { color: colors.textDim }]}>
                              {t.type === 'transfer' ? `${getAccountName(t.fromAccountId)} → ${getAccountName(t.toAccountId)}` : getAccountName(t.accountId)}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePress(t)}>
                          <FontAwesome5 name="trash-alt" size={14} color={colors.danger} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={showDeleteConfirm}
        title="Excluir Transação"
        message="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <Toast {...toast} onHide={hideToast} />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  filterChipActive: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  filterChipTextActive: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryFilterButton: {
    width: '31%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
  },
  categoryFilterButtonActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryFilterButtonText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  categoryFilterButtonTextActive: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
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
});
