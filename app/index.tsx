import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useData } from '../hooks/useData';
import { formatCurrency } from '../utils/currency';
import { theme } from '../constants/theme';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FAB } from '../components/ui/FAB';
import { Drawer } from '../components/ui/Drawer';
import { Calendar } from '../components/ui/Calendar';
import { AccountForm } from '../components/forms/AccountForm';
import { TransactionForm } from '../components/forms/TransactionForm';
import { PiggyBankForm } from '../components/forms/PiggyBankForm';
import { PiggyBankEditForm } from '../components/forms/PiggyBankEditForm';
import { CategoryManager } from '../components/features/CategoryManager';
import { RecurringBillsManager } from '../components/features/RecurringBillsManager';
import { CreditCardManager } from '../components/features/CreditCardManager';
import { BackupRestore } from '../components/features/BackupRestore';

export default function HomeScreen() {
  const { accounts, transactions, piggyBanks, categories, creditCards, recurringBills } = useData();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPiggyBankModal, setShowPiggyBankModal] = useState(false);
  const [showPiggyBankEditModal, setShowPiggyBankEditModal] = useState(false);
  const [selectedPiggyBank, setSelectedPiggyBank] = useState<any>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showRecurringBillsModal, setShowRecurringBillsModal] = useState(false);
  const [showCreditCardsModal, setShowCreditCardsModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer'>('income');
  const [valuesHidden, setValuesHidden] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'upcoming'>('today');
  const [showFABMenu, setShowFABMenu] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calcular resumo mensal
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const income = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(0) : '0';

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getFilteredTransactions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      
      if (selectedPeriod === 'today') {
        return tDate.toDateString() === today.toDateString();
      } else if (selectedPeriod === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return tDate >= weekAgo;
      } else if (selectedPeriod === 'month') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      } else if (selectedPeriod === 'upcoming') {
        return tDate > now;
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredTransactions = getFilteredTransactions();

  const formatValue = (value: number) => {
    if (valuesHidden) return '• • • • •';
    return formatCurrency(value, 'BRL');
  };

  const openTransactionModal = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setShowTransactionModal(true);
    setShowFABMenu(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.darker} />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <LinearGradient
          colors={['rgba(124, 77, 255, 0.15)', 'transparent']} 
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <FontAwesome5 name="wallet" size={24} color={theme.colors.primary} />
              <Text style={styles.logoText}>Finance Flex</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowDrawer(true)}
              style={styles.iconButton}
            >
              <FontAwesome5 name="bars" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Contas */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contas</Text>
            <Text style={styles.sectionSubtitle}>
              Total: {formatValue(totalBalance)}
            </Text>
          </View>
          <Card style={styles.card}>
            {accounts.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome5 name="credit-card" size={32} color={theme.colors.textDim} />
                <Text style={styles.emptyText}>Nenhuma conta cadastrada</Text>
              </View>
            ) : (
              accounts.map((account) => (
                <View key={account.id} style={styles.accountItem}>
                  <View style={styles.accountIcon}>
                    <FontAwesome5 name="credit-card" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountType}>{account.type}</Text>
                  </View>
                  <Text style={styles.accountBalance}>
                    {formatValue(account.balance)}
                  </Text>
                </View>
              ))
            )}
            <Button
              title="Adicionar Conta"
              icon="plus"
              onPress={() => setShowAccountModal(true)}
              variant="outline"
              style={styles.addButton}
            />
          </Card>
        </Animated.View>

        {/* Resumo Mensal */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Resumo Mensal</Text>
            <TouchableOpacity
              onPress={() => setValuesHidden(!valuesHidden)}
              style={styles.iconButton}
            >
              <FontAwesome5
                name={valuesHidden ? 'eye-slash' : 'eye'}
                size={18}
                color={theme.colors.textDim}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.summaryGrid}>
            {/* Receitas */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <FontAwesome5 name="arrow-down" size={16} color={theme.colors.success} />
              </View>
              <Text style={styles.summaryLabel}>Receitas</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                {formatValue(income)}
              </Text>
            </Card>

            {/* Despesas */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <FontAwesome5 name="arrow-up" size={16} color={theme.colors.danger} />
              </View>
              <Text style={styles.summaryLabel}>Despesas</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.danger }]}>
                {formatValue(expense)}
              </Text>
            </Card>

            {/* Saldo */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <FontAwesome5 name="wallet" size={16} color={theme.colors.info} />
              </View>
              <Text style={styles.summaryLabel}>Saldo</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.info }]}>
                {formatValue(balance)}
              </Text>
            </Card>

            {/* Percentagem */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <FontAwesome5 name="percent" size={16} color={theme.colors.warning} />
              </View>
              <Text style={styles.summaryLabel}>Percentagem</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.warning }]}>
                {valuesHidden ? '• •%' : `${savingsRate}%`}
              </Text>
              {parseInt(savingsRate) === 0 && !valuesHidden && (
                <FontAwesome5
                  name="exclamation-triangle"
                  size={14}
                  color={theme.colors.warning}
                  style={styles.warningIcon}
                />
              )}
            </Card>
          </View>
        </View>

        {/* Calendário de Pagamentos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calendário de Pagamentos</Text>
          <Card style={styles.card}>
            <Calendar transactions={transactions} recurringBills={recurringBills} />
          </Card>
        </View>

        {/* Transações Recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transações Recentes</Text>
            <TouchableOpacity>
              <FontAwesome5 name="sync-alt" size={16} color={theme.colors.textDim} />
            </TouchableOpacity>
          </View>
          <Card style={styles.card}>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, selectedPeriod === 'today' && styles.tabActive]}
                onPress={() => setSelectedPeriod('today')}
              >
                <Text style={[styles.tabText, selectedPeriod === 'today' && styles.tabTextActive]}>Hoje</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, selectedPeriod === 'week' && styles.tabActive]}
                onPress={() => setSelectedPeriod('week')}
              >
                <Text style={[styles.tabText, selectedPeriod === 'week' && styles.tabTextActive]}>Semana</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, selectedPeriod === 'month' && styles.tabActive]}
                onPress={() => setSelectedPeriod('month')}
              >
                <Text style={[styles.tabText, selectedPeriod === 'month' && styles.tabTextActive]}>Mês</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, selectedPeriod === 'upcoming' && styles.tabActive]}
                onPress={() => setSelectedPeriod('upcoming')}
              >
                <Text style={[styles.tabText, selectedPeriod === 'upcoming' && styles.tabTextActive]}>Próximos</Text>
              </TouchableOpacity>
            </View>
            {filteredTransactions.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome5 name="exchange-alt" size={32} color={theme.colors.textDim} />
                <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
              </View>
            ) : (
              filteredTransactions.map((transaction) => {
                const icon =
                  transaction.type === 'income'
                    ? 'arrow-down'
                    : transaction.type === 'expense'
                    ? 'arrow-up'
                    : 'exchange-alt';
                const color =
                  transaction.type === 'income'
                    ? theme.colors.success
                    : transaction.type === 'expense'
                    ? theme.colors.danger
                    : theme.colors.info;

                return (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={[styles.transactionIcon, { backgroundColor: `${color}20` }]}>
                      <FontAwesome5 name={icon} size={16} color={color} />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionName}>{transaction.description}</Text>
                      <Text style={styles.transactionCategory}>
                        {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                    <Text style={[styles.transactionAmount, { color }]}>
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatValue(transaction.amount)}
                    </Text>
                  </View>
                );
              })
            )}
          </Card>
        </View>

        {/* Cofrinhos */}
        {piggyBanks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cofrinhos</Text>
            <Card style={styles.card}>
              {piggyBanks.map((piggy) => {
                const progress = (piggy.currentAmount / piggy.targetAmount) * 100;
                return (
                  <View key={piggy.id} style={styles.piggyItem}>
                    <View style={styles.piggyHeader}>
                      <View style={styles.piggyIcon}>
                        <FontAwesome5 name="piggy-bank" size={18} color={piggy.color} />
                      </View>
                      <View style={styles.piggyInfo}>
                        <Text style={styles.piggyName}>{piggy.name}</Text>
                        <Text style={styles.piggyProgress}>
                          {formatValue(piggy.currentAmount)} / {formatValue(piggy.targetAmount)}
                        </Text>
                      </View>
                      <View style={styles.piggyActions}>
                        <Text style={styles.piggyPercentage}>{progress.toFixed(0)}%</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedPiggyBank(piggy);
                            setShowPiggyBankEditModal(true);
                          }}
                          style={styles.editButton}
                        >
                          <FontAwesome5 name="edit" size={14} color={theme.colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${Math.min(progress, 100)}%`, backgroundColor: piggy.color },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </Card>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB - Floating Action Button */}
      <FAB
        visible={!showDrawer}
        onPressMain={() => setShowFABMenu(!showFABMenu)}
        showMenu={showFABMenu}
        onPressIncome={() => openTransactionModal('income')}
        onPressExpense={() => openTransactionModal('expense')}
      />

      {/* Drawer Menu */}
      <Drawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        onNavigate={(screen) => {
          setShowDrawer(false);
          switch (screen) {
            case 'categories':
              setShowCategoriesModal(true);
              break;
            case 'recurring':
              setShowRecurringBillsModal(true);
              break;
            case 'creditCards':
              setShowCreditCardsModal(true);
              break;
            case 'piggyBanks':
              setShowPiggyBankModal(true);
              break;
            case 'backup':
              setShowBackupModal(true);
              break;
          }
        }}
      />

      {/* Modals */}
      <Modal visible={showAccountModal} onClose={() => setShowAccountModal(false)} title="Nova Conta">
        <AccountForm
          onSave={() => setShowAccountModal(false)}
          onCancel={() => setShowAccountModal(false)}
        />
      </Modal>

      <Modal
        visible={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title={transactionType === 'income' ? 'Nova Receita' : 'Nova Despesa'}
      >
        <TransactionForm
          onSave={() => setShowTransactionModal(false)}
          onCancel={() => setShowTransactionModal(false)}
        />
      </Modal>

      <Modal visible={showPiggyBankModal} onClose={() => setShowPiggyBankModal(false)} title="Novo Cofrinho">
        <PiggyBankForm
          onSave={() => setShowPiggyBankModal(false)}
          onCancel={() => setShowPiggyBankModal(false)}
        />
      </Modal>

      <Modal 
        visible={showPiggyBankEditModal} 
        onClose={() => {
          setShowPiggyBankEditModal(false);
          setSelectedPiggyBank(null);
        }} 
        title="Editar Cofrinho"
      >
        {selectedPiggyBank && (
          <PiggyBankEditForm
            piggyBank={selectedPiggyBank}
            onSave={() => {
              setShowPiggyBankEditModal(false);
              setSelectedPiggyBank(null);
            }}
            onCancel={() => {
              setShowPiggyBankEditModal(false);
              setSelectedPiggyBank(null);
            }}
          />
        )}
      </Modal>

      <Modal visible={showCategoriesModal} onClose={() => setShowCategoriesModal(false)} title="Categorias">
        <CategoryManager onClose={() => setShowCategoriesModal(false)} />
      </Modal>

      <Modal visible={showRecurringBillsModal} onClose={() => setShowRecurringBillsModal(false)} title="Contas Recorrentes">
        <RecurringBillsManager onClose={() => setShowRecurringBillsModal(false)} />
      </Modal>

      <Modal visible={showCreditCardsModal} onClose={() => setShowCreditCardsModal(false)} title="Cartões de Crédito">
        <CreditCardManager onClose={() => setShowCreditCardsModal(false)} />
      </Modal>

      <Modal visible={showBackupModal} onClose={() => setShowBackupModal(false)} title="Backup e Restauração">
        <BackupRestore onClose={() => setShowBackupModal(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.darker,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
    marginTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  hideButton: {
    padding: 10,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textDim,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    backgroundColor: theme.colors.darkLight,
  },
  summaryIconContainer: {
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
  },
  warningIcon: {
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  card: {
    padding: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.darkLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  accountType: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  addButton: {
    margin: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  transactionCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  piggyItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  piggyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  piggyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.darkLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  piggyInfo: {
    flex: 1,
  },
  piggyName: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  piggyProgress: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    marginTop: 2,
  },
  piggyPercentage: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginRight: 8,
  },
  piggyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.darkLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 10,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
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
});
