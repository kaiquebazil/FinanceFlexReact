import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BackupRestore } from "../components/features/BackupRestore";
import { CategoryManager } from "../components/features/CategoryManager";
import { CreditCardManager } from "../components/features/CreditCardManager";
import { RecurringBillsManager } from "../components/features/RecurringBillsManager";
import { TransactionsModal } from "../components/features/TransactionsModal";
import { AccountEditForm } from "../components/forms/AccountEditForm";
import { AccountForm } from "../components/forms/AccountForm";
import { PiggyBankEditForm } from "../components/forms/PiggyBankEditForm";
import { PiggyBankForm } from "../components/forms/PiggyBankForm";
import { TransactionForm } from "../components/forms/TransactionForm";
import { AccountItem } from "../components/ui/AccountItem";
import { Button } from "../components/ui/Button";
import { Calendar } from "../components/ui/Calendar";
import { Card } from "../components/ui/Card";
import { Drawer } from "../components/ui/Drawer";
import { FAB } from "../components/ui/FAB";
import { Modal } from "../components/ui/Modal";
import { theme } from "../constants/theme";
import { useData } from "../hooks/useData";
import { formatCurrency } from "../utils/currency";

export default function HomeScreen() {
  const {
    accounts,
    transactions,
    piggyBanks,
    categories,
    creditCards,
    recurringBills,
    addTransaction,
    deleteAccount,
    updateAccountBalance,
    getTotalBalance,
    getMonthlySummary,
    valuesHidden,
    setValuesHidden,
  } = useData();

  // Estados para modais
  const [showDrawer, setShowDrawer] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAccountEditModal, setShowAccountEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  // Estados para transação
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "income",
  );

  const [showPiggyBankModal, setShowPiggyBankModal] = useState(false);
  const [showPiggyBankEditModal, setShowPiggyBankEditModal] = useState(false);
  const [selectedPiggyBank, setSelectedPiggyBank] = useState<any>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showRecurringBillsModal, setShowRecurringBillsModal] = useState(false);
  const [showCreditCardsModal, setShowCreditCardsModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Estados de filtro
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month" | "upcoming"
  >("today");

  // Estados do FAB
  const [showFABMenu, setShowFABMenu] = useState(false);

  // Animações
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

  // Resumo mensal
  const summary = getMonthlySummary();
  const totalBalance = getTotalBalance();

  // Filtrar transações
  const getFilteredTransactions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return transactions
      .filter((t) => {
        const tDate = new Date(t.date);

        if (selectedPeriod === "today") {
          return tDate.toDateString() === today.toDateString();
        } else if (selectedPeriod === "week") {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return tDate >= weekAgo;
        } else if (selectedPeriod === "month") {
          return (
            tDate.getMonth() === now.getMonth() &&
            tDate.getFullYear() === now.getFullYear()
          );
        } else if (selectedPeriod === "upcoming") {
          return tDate > now;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredTransactions = getFilteredTransactions();

  const formatValue = (value: number) => {
    if (valuesHidden) return "• • • • •";
    return formatCurrency(value, "BRL");
  };

  // ==================== HANDLES DE TRANSAÇÃO ====================
  const handleOpenTransaction = (type: "income" | "expense") => {
    setTransactionType(type);
    setShowTransactionModal(true);
    setShowFABMenu(false);
  };

  const handleSaveTransaction = (data: any) => {
    // Criar nova transação
    const newTransaction = {
      id: Date.now().toString(),
      type: data.type,
      amount: data.amount,
      description: data.description,
      category: data.category,
      accountId: data.accountId,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Adicionar transação
    addTransaction(newTransaction);

    // Mostrar mensagem de sucesso
    Alert.alert(
      "✅ Sucesso",
      `${data.type === "income" ? "Receita" : "Despesa"} adicionada com sucesso!`,
      [{ text: "OK" }],
    );
  };

  // ==================== HANDLES DE CONTA ====================
  const handleEditAccount = (account: any) => {
    setSelectedAccount(account);
    setShowAccountEditModal(true);
  };

  const handleDeleteAccount = (accountId: string) => {
    deleteAccount(accountId);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.darker}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <LinearGradient
          colors={["rgba(124, 77, 255, 0.15)", "transparent"]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <FontAwesome5
                name="wallet"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.logoText}>Finance Flex</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setValuesHidden(!valuesHidden)}
                style={styles.iconButton}
              >
                <FontAwesome5
                  name={valuesHidden ? "eye-slash" : "eye"}
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDrawer(true)}
                style={styles.iconButton}
              >
                <FontAwesome5 name="bars" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
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
                <FontAwesome5
                  name="credit-card"
                  size={32}
                  color={theme.colors.textDim}
                />
                <Text style={styles.emptyText}>Nenhuma conta cadastrada</Text>
              </View>
            ) : (
              accounts.map((account) => (
                <AccountItem
                  key={account.id}
                  account={account}
                  onEdit={() => handleEditAccount(account)}
                  onDelete={() => handleDeleteAccount(account.id)}
                  formatValue={formatValue}
                />
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
          </View>
          <View style={styles.summaryGrid}>
            {/* Receitas */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <FontAwesome5
                  name="arrow-down"
                  size={16}
                  color={theme.colors.success}
                />
              </View>
              <Text style={styles.summaryLabel}>Receitas</Text>
              <Text
                style={[styles.summaryValue, { color: theme.colors.success }]}
              >
                {formatValue(summary.income)}
              </Text>
            </Card>

            {/* Despesas */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <FontAwesome5
                  name="arrow-up"
                  size={16}
                  color={theme.colors.danger}
                />
              </View>
              <Text style={styles.summaryLabel}>Despesas</Text>
              <Text
                style={[styles.summaryValue, { color: theme.colors.danger }]}
              >
                {formatValue(summary.expense)}
              </Text>
            </Card>

            {/* Saldo */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <FontAwesome5
                  name="wallet"
                  size={16}
                  color={theme.colors.info}
                />
              </View>
              <Text style={styles.summaryLabel}>Saldo</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.info }]}>
                {formatValue(summary.balance)}
              </Text>
            </Card>

            {/* Percentagem */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <FontAwesome5
                  name="percent"
                  size={16}
                  color={theme.colors.warning}
                />
              </View>
              <Text style={styles.summaryLabel}>Percentagem</Text>
              <Text
                style={[styles.summaryValue, { color: theme.colors.warning }]}
              >
                {valuesHidden ? "• •%" : `${summary.savingsRate.toFixed(0)}%`}
              </Text>
              {summary.savingsRate === 0 &&
                summary.income > 0 &&
                !valuesHidden && (
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
            <Calendar
              transactions={transactions}
              recurringBills={recurringBills}
            />
          </Card>
        </View>

        {/* Transações Recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transações Recentes</Text>
            <TouchableOpacity>
              <FontAwesome5
                name="sync-alt"
                size={16}
                color={theme.colors.textDim}
              />
            </TouchableOpacity>
          </View>
          <Card style={styles.card}>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedPeriod === "today" && styles.tabActive,
                ]}
                onPress={() => setSelectedPeriod("today")}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedPeriod === "today" && styles.tabTextActive,
                  ]}
                >
                  Hoje
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedPeriod === "week" && styles.tabActive,
                ]}
                onPress={() => setSelectedPeriod("week")}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedPeriod === "week" && styles.tabTextActive,
                  ]}
                >
                  Semana
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedPeriod === "month" && styles.tabActive,
                ]}
                onPress={() => setSelectedPeriod("month")}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedPeriod === "month" && styles.tabTextActive,
                  ]}
                >
                  Mês
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedPeriod === "upcoming" && styles.tabActive,
                ]}
                onPress={() => setSelectedPeriod("upcoming")}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedPeriod === "upcoming" && styles.tabTextActive,
                  ]}
                >
                  Próximos
                </Text>
              </TouchableOpacity>
            </View>
            {filteredTransactions.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome5
                  name="exchange-alt"
                  size={32}
                  color={theme.colors.textDim}
                />
                <Text style={styles.emptyText}>
                  Nenhuma transação encontrada
                </Text>
              </View>
            ) : (
              filteredTransactions.map((transaction) => {
                const icon =
                  transaction.type === "income"
                    ? "arrow-down"
                    : transaction.type === "expense"
                      ? "arrow-up"
                      : "exchange-alt";
                const color =
                  transaction.type === "income"
                    ? theme.colors.success
                    : transaction.type === "expense"
                      ? theme.colors.danger
                      : theme.colors.info;

                return (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View
                      style={[
                        styles.transactionIcon,
                        { backgroundColor: `${color}20` },
                      ]}
                    >
                      <FontAwesome5 name={icon} size={16} color={color} />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionName}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionCategory}>
                        {transaction.category} •{" "}
                        {new Date(transaction.date).toLocaleDateString("pt-BR")}
                      </Text>
                    </View>
                    <Text style={[styles.transactionAmount, { color }]}>
                      {transaction.type === "expense" ? "-" : "+"}
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
                const progress =
                  (piggy.currentAmount / piggy.targetAmount) * 100;
                return (
                  <View key={piggy.id} style={styles.piggyItem}>
                    <View style={styles.piggyHeader}>
                      <View style={styles.piggyIcon}>
                        <FontAwesome5
                          name="piggy-bank"
                          size={18}
                          color={piggy.color}
                        />
                      </View>
                      <View style={styles.piggyInfo}>
                        <Text style={styles.piggyName}>{piggy.name}</Text>
                        <Text style={styles.piggyProgress}>
                          {formatValue(piggy.currentAmount)} /{" "}
                          {formatValue(piggy.targetAmount)}
                        </Text>
                      </View>
                      <View style={styles.piggyActions}>
                        <Text style={styles.piggyPercentage}>
                          {progress.toFixed(0)}%
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedPiggyBank(piggy);
                            setShowPiggyBankEditModal(true);
                          }}
                          style={styles.editButton}
                        >
                          <FontAwesome5
                            name="edit"
                            size={14}
                            color={theme.colors.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: piggy.color,
                          },
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
      <TransactionsModal
        visible={showTransactionsModal}
        onClose={() => setShowTransactionsModal(false)}
      />
      ;{/* FAB - Floating Action Button */}
      <FAB
        visible={!showDrawer}
        onPressMain={() => setShowFABMenu(!showFABMenu)}
        showMenu={showFABMenu}
        onPressIncome={() => handleOpenTransaction("income")}
        onPressExpense={() => handleOpenTransaction("expense")}
      />
      {/* Drawer Menu */}
      <Drawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        onNavigate={(screen) => {
          setShowDrawer(false);
          switch (screen) {
            case "transactions":
              setShowTransactionsModal(true);
              break;
            case "categories":
              setShowCategoriesModal(true);
              break;
            case "recurring":
              setShowRecurringBillsModal(true);
              break;
            case "creditCards":
              setShowCreditCardsModal(true);
              break;
            case "piggyBanks":
              setShowPiggyBankModal(true);
              break;
            case "backup":
              setShowBackupModal(true);
              break;
          }
        }}
      />
      {/* Modals */}
      <Modal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title="Nova Conta"
      >
        <AccountForm
          onSave={() => setShowAccountModal(false)}
          onCancel={() => setShowAccountModal(false)}
        />
      </Modal>
      <Modal
        visible={showAccountEditModal}
        onClose={() => setShowAccountEditModal(false)}
        title="Editar Conta"
      >
        {selectedAccount && (
          <AccountEditForm
            account={selectedAccount}
            onSave={() => {
              setShowAccountEditModal(false);
              setSelectedAccount(null);
            }}
            onCancel={() => {
              setShowAccountEditModal(false);
              setSelectedAccount(null);
            }}
          />
        )}
      </Modal>
      {/* Modal de Transação - NOVO */}
      <TransactionForm
        visible={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        type={transactionType}
        onSave={handleSaveTransaction}
      />
      <Modal
        visible={showPiggyBankModal}
        onClose={() => setShowPiggyBankModal(false)}
        title="Novo Cofrinho"
      >
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
      <Modal
        visible={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        title="Categorias"
      >
        <CategoryManager onClose={() => setShowCategoriesModal(false)} />
      </Modal>
      <Modal
        visible={showRecurringBillsModal}
        onClose={() => setShowRecurringBillsModal(false)}
        title="Contas Recorrentes"
      >
        <RecurringBillsManager
          onClose={() => setShowRecurringBillsModal(false)}
        />
      </Modal>
      <Modal
        visible={showCreditCardsModal}
        onClose={() => setShowCreditCardsModal(false)}
        title="Cartões de Crédito"
      >
        <CreditCardManager onClose={() => setShowCreditCardsModal(false)} />
      </Modal>
      <Modal
        visible={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        title="Backup e Restauração"
      >
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
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 20,
    marginTop: 40,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoText: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    padding: 10,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: theme.colors.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: theme.colors.textDim,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: "47%",
    padding: 16,
    backgroundColor: theme.colors.darkLight,
  },
  summaryIconContainer: {
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: theme.colors.textDim,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontFamily: "Inter-Bold",
  },
  warningIcon: {
    marginTop: 4,
  },
  card: {
    padding: 0,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: theme.colors.textDim,
  },
  addButton: {
    margin: 20,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontFamily: "Inter-Medium",
    color: theme.colors.text,
  },
  transactionCategory: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: theme.colors.textDim,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  piggyItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  piggyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  piggyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.darkLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  piggyInfo: {
    flex: 1,
  },
  piggyName: {
    fontSize: 15,
    fontFamily: "Inter-Medium",
    color: theme.colors.text,
  },
  piggyProgress: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: theme.colors.textDim,
    marginTop: 2,
  },
  piggyPercentage: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: theme.colors.text,
    marginRight: 8,
  },
  piggyActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    padding: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.darkLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
    color: theme.colors.textDim,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
});
