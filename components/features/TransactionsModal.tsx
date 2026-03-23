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
              {/* Filtros de Tipo (Estilo Abas da Home) */}
              <View style={styles.tabs}>
                {(['all', 'income', 'expense', 'transfer'] as const).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.tab,
                      selectedFilter === filter && styles.tabActive,
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text style={[
                      styles.tabText,
                      selectedFilter === filter && styles.tabTextActive,
                    ]}>
                      {filter === 'all' ? 'Todas' :
                       filter === 'income' ? 'Receitas' :
                       filter === 'expense' ? 'Despesas' : 'Transferências'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Filtros de Período (Estilo Chips/Botões) */}
              <View style={styles.filtersContainer}>
                <Text style={[styles.filterLabel, { color: colors.textDim }]}>Período</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                  {(['today', 'week', 'month', 'year'] as const).map((period) => (
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
                        {period === 'today' ? 'Hoje' :
                         period === 'week' ? 'Semana' :
                         period === 'month' ? 'Mês' : 'Ano'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Filtro por categoria (Estilo Chips) */}
                {filteredCategoriesForType.length > 0 && (
                  <>
                    <Text style={[styles.filterLabel, { color: colors.textDim }]}>Categoria</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                      <TouchableOpacity
                        style={[
                          styles.filterChip,
                          { 
                            backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, 
                            borderColor: colors.border 
                          },
                          selectedCategory === 'all' && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                        onPress={() => setSelectedCategory('all')}
                      >
                        <Text style={[
                          styles.filterChipText,
                          { color: colors.textDim },
                          selectedCategory === 'all' && { color: '#fff', fontFamily: 'Inter-SemiBold' }
                        ]}>
                          Todas
                        </Text>
                      </TouchableOpacity>
                      {filteredCategoriesForType.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.filterChip,
                            { 
                              backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, 
                              borderColor: colors.border 
                            },
                            selectedCategory === cat.name && { backgroundColor: "rgb(124, 77, 255)" }
                          ]}
                          onPress={() => setSelectedCategory(cat.name)}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <FontAwesome5
                              name={cat.icon || 'tag'}
                              size={12}
                              color={'#fff'} 
                            />
                            <Text style={[
                              styles.filterChipText,
                              { color: colors.textDim },
                              selectedCategory === cat.name && { color: '#fff', fontFamily: 'Inter-SemiBold' }
                            ]}>
                              {cat.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}
              </View>

              {/* Lista de transações */}
              {Object.keys(groupedTransactions).length === 0 ? (
                <View style={styles.emptyState}>
                  <FontAwesome5 name="exchange-alt" size={32} color={colors.textDim} />
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
                        <View style={[styles.transactionIcon, { backgroundColor: `${getColorForType(t.type)}20` }]}>
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
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textDim,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
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
