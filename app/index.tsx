// app/index.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { BackupRestore } from "../components/features/BackupRestore";
import { FirebaseSync } from "../components/features/FirebaseSync";
import { BudgetManager } from "../components/features/BudgetManager";
import { CategoryManager } from "../components/features/CategoryManager";
import { CreditCardManager } from "../components/features/CreditCardManager";
import { RecurringBillsManager } from "../components/features/RecurringBillsManager";
import { TransactionsModal } from "../components/features/TransactionsModal";
import { CalendarModal } from "../components/features/CalendarModal";
import { PiggyBankProjection } from "../components/features/PiggyBankProjection";
import { AccountEditForm } from "../components/forms/AccountEditForm";
import { AccountForm } from "../components/forms/AccountForm";
import { PiggyBankEditForm } from "../components/forms/PiggyBankEditForm";
import { PiggyBankForm } from "../components/forms/PiggyBankForm";
import { PiggyBankActionForm } from "../components/forms/PiggyBankActionForm";
import { TransactionForm } from "../components/forms/TransactionForm";
import { AccountItem } from "../components/ui/AccountItem";
import { Button } from "../components/ui/Button";
import { Calendar } from "../components/ui/Calendar";
import { Card } from "../components/ui/Card";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Drawer } from "../components/ui/Drawer";
import { FAB } from "../components/ui/FAB";
import { Modal } from "../components/ui/Modal";
import { Toast } from "../components/ui/Toast";
import { ResponsiveContainer } from "../components/ui/ResponsiveContainer";
import { theme } from "../constants/theme";
import { useData } from "../hooks/useData";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../utils/currency";

// Tipos para os callbacks
type ToastType = "success" | "error" | "info" | "warning";
type ConfirmType = "info" | "success" | "warning" | "danger";

interface ConfirmOptions {
  title: string;
  message: string;
  type?: ConfirmType;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmCallbackOptions {
  title: string;
  message: string;
  type?: ConfirmType;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function HomeScreen() {
  const {
    accounts,
    transactions,
    piggyBanks,
    categories,
    creditCards,
    recurringBills,
    budgets,
    addTransaction,
    deleteAccount,
    getTotalBalance,
    getMonthlySummary,
    getBudgetProgress,
    getMonthlyBudgets,
    valuesHidden,
    setValuesHidden,
    setUICallbacks,
    depositToPiggyBank,
    withdrawFromPiggyBank,
    deletePiggyBank,
  } = useData();

  // Estados para modais
  const [showDrawer, setShowDrawer] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAccountEditModal, setShowAccountEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  // Estados para transação
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionInitialType, setTransactionInitialType] = useState<
    "income" | "expense" | "transfer"
  >("income");

  // Estados para cofrinho
  const [showPiggyBankModal, setShowPiggyBankModal] = useState(false);
  const [showPiggyBankEditModal, setShowPiggyBankEditModal] = useState(false);
  const [selectedPiggyBank, setSelectedPiggyBank] = useState<any>(null);
  const [showPiggyBankActionModal, setShowPiggyBankActionModal] = useState(false);
  const [piggyBankActionType, setPiggyBankActionType] = useState<"deposit" | "withdraw">("deposit");

  // Estados para outros modais
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showRecurringBillsModal, setShowRecurringBillsModal] = useState(false);
  const [showCreditCardsModal, setShowCreditCardsModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showBudgetsModal, setShowBudgetsModal] = useState(false);

  // Auth e status de sincronização
  const { user, syncStatus } = useAuth();

  // Estados para modais de confirmação e toast
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmOptions>({
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({
    visible: false,
    message: "",
    type: "info",
  });

  // Estados do FAB
  const [showFABMenu, setShowFABMenu] = useState(false);

  // Estados de filtro
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month" | "upcoming"
  >("today");

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

  // Funções auxiliares para UI
  const showConfirm = (options: ConfirmOptions) => {
    setConfirmConfig({
      title: options.title,
      message: options.message,
      type: options.type || "info",
      onConfirm: options.onConfirm,
      onCancel: options.onCancel || (() => setShowConfirmModal(false)),
    });
    setShowConfirmModal(true);
  };

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ visible: true, message, type });
  };

  // Configurar callbacks da UI
  useEffect(() => {
    setUICallbacks({
      showConfirm: (options: ConfirmCallbackOptions) => {
        setConfirmConfig({
          title: options.title,
          message: options.message,
          type: options.type || "info",
          onConfirm: options.onConfirm,
        });
        setShowConfirmModal(true);
      },
      showToast: (message: string, type?: ToastType) => {
        setToast({ visible: true, message, type: type || "info" });
      },
    });
  }, []);

  // Resumo mensal
  const summary = getMonthlySummary();
  const totalBalance = getTotalBalance();

  // Funções para abrir modais de transação
  const handleOpenIncome = () => {
    setTransactionInitialType("income");
    setShowTransactionModal(true);
    setShowFABMenu(false);
  };

  const handleOpenExpense = () => {
    setTransactionInitialType("expense");
    setShowTransactionModal(true);
    setShowFABMenu(false);
  };

  const handleOpenTransfer = () => {
    setTransactionInitialType("transfer");
    setShowTransactionModal(true);
    setShowFABMenu(false);
  };

  // Função para salvar transação (unificada)
  const handleSaveTransaction = (data: any, stayOpen?: boolean) => {
    const newTransaction = {
      id: Date.now().toString(),
      type: data.type,
      amount: data.amount,
      description: data.description,
      category: data.category,
      accountId: data.type === "transfer" ? data.fromAccountId : data.accountId,
      toAccountId: data.type === "transfer" ? data.toAccountId : undefined,
      date: data.date,
      createdAt: new Date().toISOString(),
    };

    addTransaction(newTransaction);

    showToast(
      data.type === "income"
        ? "Receita adicionada com sucesso!"
        : data.type === "expense"
          ? "Despesa adicionada com sucesso!"
          : `Transferência de ${formatCurrency(data.amount, "BRL")} realizada com sucesso!`,
      "success",
    );

    if (!stayOpen) {
      setShowTransactionModal(false);
    }
  };

  // Funções para lidar com contas
  const handleEditAccount = (account: any) => {
    setSelectedAccount(account);
    setShowAccountEditModal(true);
  };

  const handleDeleteAccount = (accountId: string) => {
    deleteAccount(accountId);
  };

  // Funções para lidar com cofrinhos
  const handleEditPiggyBank = (piggy: any) => {
    setSelectedPiggyBank(piggy);
    setShowPiggyBankEditModal(true);
  };

  const handleDepositPiggyBank = (piggy: any) => {
    setSelectedPiggyBank(piggy);
    setPiggyBankActionType("deposit");
    setShowPiggyBankActionModal(true);
  };

  const handleWithdrawPiggyBank = (piggy: any) => {
    setSelectedPiggyBank(piggy);
    setPiggyBankActionType("withdraw");
    setShowPiggyBankActionModal(true);
  };

  const handleDeletePiggyBank = (piggy: any) => {
    showConfirm({
      title: "Excluir Cofrinho",
      message: `Tem certeza que deseja excluir o cofrinho "${piggy.name}"? O saldo atual não será devolvido automaticamente às contas.`,
      type: "danger",
      onConfirm: () => {
        deletePiggyBank(piggy.id);
        setShowConfirmModal(false);
      },
    });
  };

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.darker}
      />

      {/* Container Responsivo - APENAS ISSO FOI ADICIONADO */}
      <ResponsiveContainer>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={Platform.OS === "web"}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        >
          {/* Header */}
          <LinearGradient
            colors={["rgba(124, 77, 255, 0.15)", "transparent"]}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/images/icon.png")}
                  style={{ width: 32, height: 32, resizeMode: "contain" }}
                />
                <Text style={styles.logoText}>FinanceFlex</Text>
              </View>
              <View style={styles.headerActions}>
                {/* Indicador de sincronização em tempo real */}

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
                  <FontAwesome5
                    name="bars"
                    size={20}
                    color={theme.colors.text}
                  />
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
                  <>
                    {accounts.slice(0, 3).map((account) => (
                      <AccountItem
                        key={account.id}
                        account={account}
                        onEdit={() => handleEditAccount(account)}
                        onDelete={() => handleDeleteAccount(account.id)}
                        formatValue={formatValue}
                      />
                    ))}
                    {accounts.length > 3 && (
                      <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={() => setShowAccountModal(true)}
                      >
                        <Text style={styles.viewAllText}>
                          Ver todas ({accounts.length})
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
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
                <Text
                  style={[styles.summaryValue, { color: theme.colors.info }]}
                >
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
              </Card>
            </View>
          </View>

          {/* Calendário de Pagamentos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, styles.calendarTitle]}>
                Contas do Mês
              </Text>
              <TouchableOpacity onPress={() => setShowCalendarModal(true)}>
                <FontAwesome5
                  name="calendar-alt"
                  size={16}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
            <Calendar
              transactions={transactions}
              recurringBills={recurringBills}
            />
          </View>

          {/* Resumo de Orçamentos */}
          {(() => {
            const now = new Date();
            const monthBudgets = getMonthlyBudgets(now.getMonth() + 1, now.getFullYear());
            if (monthBudgets.length === 0) return null;
            return (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Orçamentos do Mês</Text>
                  <TouchableOpacity onPress={() => setShowBudgetsModal(true)}>
                    <FontAwesome5 name="chart-pie" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
                <Card style={styles.card}>
                  {monthBudgets.slice(0, 4).map((budget) => {
                    const { spent, percentage } = getBudgetProgress(budget);
                    const cappedPct = Math.min(percentage, 100);
                    const barColor =
                      percentage >= 100
                        ? theme.colors.danger
                        : percentage >= 80
                        ? theme.colors.warning
                        : theme.colors.success;
                    return (
                      <View key={budget.id} style={{ marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <FontAwesome5 name={budget.categoryIcon} size={12} color={barColor} />
                            <Text style={{ color: theme.colors.text, fontSize: 13, fontFamily: 'Inter-Medium' }}>
                              {budget.categoryName}
                            </Text>
                            {percentage >= 100 && (
                              <View style={{ backgroundColor: theme.colors.danger + '25', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 }}>
                                <Text style={{ color: theme.colors.danger, fontSize: 10, fontFamily: 'Inter-SemiBold' }}>Excedido</Text>
                              </View>
                            )}
                            {percentage >= 80 && percentage < 100 && (
                              <View style={{ backgroundColor: theme.colors.warning + '25', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 }}>
                                <Text style={{ color: theme.colors.warning, fontSize: 10, fontFamily: 'Inter-SemiBold' }}>Atenção</Text>
                              </View>
                            )}
                          </View>
                          <Text style={{ color: theme.colors.textDim, fontSize: 11, fontFamily: 'Inter-Regular' }}>
                            {valuesHidden ? '• • •' : `${percentage.toFixed(0)}%`}
                          </Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: theme.colors.dark, borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                          <View style={{ height: '100%', width: `${cappedPct}%` as any, backgroundColor: barColor, borderRadius: 3 }} />
                        </View>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 8, fontFamily: 'Inter-Regular' }}>
                          {valuesHidden ? '• • •' : `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spent)} de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.limitAmount)}`}
                        </Text>
                      </View>
                    );
                  })}
                  {monthBudgets.length > 4 && (
                    <TouchableOpacity style={styles.viewAllButton} onPress={() => setShowBudgetsModal(true)}>
                      <Text style={styles.viewAllText}>Ver todos ({monthBudgets.length})</Text>
                    </TouchableOpacity>
                  )}
                </Card>
              </View>
            );
          })()}

          {/* Cofrinhos */}
          {piggyBanks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Cofrinhos</Text>
                <TouchableOpacity onPress={() => setShowPiggyBankModal(true)}>
                  <FontAwesome5
                    name="plus"
                    size={16}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>
              <Card style={styles.card}>
                {piggyBanks.slice(0, 3).map((piggy) => {
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
                            onPress={() => handleDepositPiggyBank(piggy)}
                            style={styles.actionButton}
                          >
                            <FontAwesome5
                              name="plus-circle"
                              size={16}
                              color={theme.colors.success}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleWithdrawPiggyBank(piggy)}
                            style={styles.actionButton}
                          >
                            <FontAwesome5
                              name="minus-circle"
                              size={16}
                              color={theme.colors.warning}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleEditPiggyBank(piggy)}
                            style={styles.actionButton}
                          >
                            <FontAwesome5
                              name="edit"
                              size={14}
                              color={theme.colors.primary}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeletePiggyBank(piggy)}
                            style={styles.actionButton}
                          >
                            <FontAwesome5
                              name="trash-alt"
                              size={14}
                              color={theme.colors.danger}
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
                      {(piggy.monthlyContribution || piggy.targetDate) && (
                        <PiggyBankProjection
                          piggyBank={piggy}
                          valuesHidden={valuesHidden}
                        />
                      )}
                    </View>
                  );
                })}

                {piggyBanks.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => setShowPiggyBankModal(true)}
                  >
                    <Text style={styles.viewAllText}>
                      Ver todos ({piggyBanks.length})
                    </Text>
                  </TouchableOpacity>
                )}
              </Card>
            </View>
          )}

          {/* Transações Recentes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transações Recentes</Text>
              <TouchableOpacity onPress={() => setShowTransactionsModal(true)}>
                <FontAwesome5
                  name="external-link-alt"
                  size={16}
                  color={theme.colors.primary}
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
                    Futuras
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
                filteredTransactions.slice(0, 5).map((transaction) => {
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
                          {transaction.description ||
                            (transaction.type === "income"
                              ? "Receita"
                              : transaction.type === "expense"
                                ? "Despesa"
                                : "Transferência")}
                        </Text>
                        <Text style={styles.transactionCategory}>
                          {transaction.category} •{" "}
                          {new Date(transaction.date).toLocaleDateString(
                            "pt-BR",
                          )}
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
              {filteredTransactions.length > 5 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => setShowTransactionsModal(true)}
                >
                  <Text style={styles.viewAllText}>Ver todas</Text>
                  <FontAwesome5
                    name="arrow-right"
                    size={12}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              )}
            </Card>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </ResponsiveContainer>

      {/* FAB - Floating Action Button */}
      <FAB
        visible={!showDrawer}
        onPressMain={() => setShowFABMenu(!showFABMenu)}
        showMenu={showFABMenu}
        onPressIncome={handleOpenIncome}
        onPressExpense={handleOpenExpense}
        onPressTransfer={handleOpenTransfer}
      />

      {/* Modais */}
      <TransactionsModal
        visible={showTransactionsModal}
        onClose={() => setShowTransactionsModal(false)}
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
            case "budgets":
              setShowBudgetsModal(true);
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
            case "sync":
              setShowSyncModal(true);
              break;
          }
        }}
      />

      {/* Modal de Conta */}
      <Modal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title="Contas"
      >
        <ScrollView>
          {accounts.map((account) => (
            <AccountItem
              key={account.id}
              account={account}
              onEdit={() => handleEditAccount(account)}
              onDelete={() => handleDeleteAccount(account.id)}
              formatValue={formatValue}
            />
          ))}
          <AccountForm
            onSave={() => setShowAccountModal(false)}
            onCancel={() => setShowAccountModal(false)}
          />
        </ScrollView>
      </Modal>

      {/* Modal de Editar Conta */}
      <Modal
        visible={showAccountEditModal}
        onClose={() => {
          setShowAccountEditModal(false);
          setSelectedAccount(null);
        }}
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

      {/* Modal de Transação Unificado */}
      <TransactionForm
        visible={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSave={handleSaveTransaction}
        initialType={transactionInitialType}
      />

      {/* Modal de Cofrinho */}
      <Modal
        visible={showPiggyBankModal}
        onClose={() => setShowPiggyBankModal(false)}
        title="Cofrinhos"
      >
        <ScrollView>
          {piggyBanks.map((piggy) => {
            const progress = (piggy.currentAmount / piggy.targetAmount) * 100;
            return (
              <View key={piggy.id} style={styles.modalPiggyItem}>
                <View style={styles.modalPiggyHeader}>
                  <View
                    style={[
                      styles.modalPiggyIcon,
                      { backgroundColor: piggy.color + "20" },
                    ]}
                  >
                    <FontAwesome5
                      name="piggy-bank"
                      size={20}
                      color={piggy.color}
                    />
                  </View>
                  <View style={styles.modalPiggyInfo}>
                    <Text style={styles.modalPiggyName}>{piggy.name}</Text>
                    <Text style={styles.modalPiggyProgress}>
                      {formatValue(piggy.currentAmount)} /{" "}
                      {formatValue(piggy.targetAmount)} (
                      {progress.toFixed(0)}%)
                    </Text>
                  </View>
                  <View style={styles.piggyActions}>
                    <TouchableOpacity
                      onPress={() => handleDepositPiggyBank(piggy)}
                      style={styles.actionButton}
                    >
                      <FontAwesome5
                        name="plus-circle"
                        size={18}
                        color={theme.colors.success}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleWithdrawPiggyBank(piggy)}
                      style={styles.actionButton}
                    >
                      <FontAwesome5
                        name="minus-circle"
                        size={18}
                        color={theme.colors.warning}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleEditPiggyBank(piggy)}
                      style={styles.actionButton}
                    >
                      <FontAwesome5
                        name="edit"
                        size={16}
                        color={theme.colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeletePiggyBank(piggy)}
                      style={styles.actionButton}
                    >
                      <FontAwesome5
                        name="trash-alt"
                        size={16}
                        color={theme.colors.danger}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {(piggy.monthlyContribution || piggy.targetDate) && (
                  <PiggyBankProjection
                    piggyBank={piggy}
                    valuesHidden={valuesHidden}
                  />
                )}
              </View>
            );
          })}

          <PiggyBankForm
            onSave={(stayOpen) => {
              if (!stayOpen) {
                setShowPiggyBankModal(false);
              }
              showToast("Cofrinho criado com sucesso!", "success");
            }}
            onCancel={() => setShowPiggyBankModal(false)}
          />
        </ScrollView>
      </Modal>

      {/* Modal de Editar Cofrinho */}
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
              showToast("Cofrinho atualizado com sucesso!", "success");
            }}
            onCancel={() => {
              setShowPiggyBankEditModal(false);
              setSelectedPiggyBank(null);
            }}
          />
        )}
      </Modal>

      {/* Modal de Ação no Cofrinho (Depósito/Retirada) */}
      <Modal
        visible={showPiggyBankActionModal}
        onClose={() => {
          setShowPiggyBankActionModal(false);
          setSelectedPiggyBank(null);
        }}
        title={piggyBankActionType === "deposit" ? "Depositar" : "Retirar"}
      >
        {selectedPiggyBank && (
          <PiggyBankActionForm
            piggyBank={selectedPiggyBank}
            type={piggyBankActionType}
            onSave={() => {
              setShowPiggyBankActionModal(false);
              setSelectedPiggyBank(null);
            }}
            onCancel={() => {
              setShowPiggyBankActionModal(false);
              setSelectedPiggyBank(null);
            }}
          />
        )}
      </Modal>

      {/* Modal de Categorias */}
      <Modal
        visible={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        title="Categorias"
      >
        <CategoryManager onClose={() => setShowCategoriesModal(false)} />
      </Modal>

      {/* Modal de Contas Recorrentes */}
      <Modal
        visible={showRecurringBillsModal}
        onClose={() => setShowRecurringBillsModal(false)}
        title="Contas Recorrentes"
      >
        <RecurringBillsManager
          onClose={() => setShowRecurringBillsModal(false)}
        />
      </Modal>

      {/* Modal de Cartões de Crédito */}
      <Modal
        visible={showCreditCardsModal}
        onClose={() => setShowCreditCardsModal(false)}
        title="Cartões de Crédito"
      >
        <CreditCardManager onClose={() => setShowCreditCardsModal(false)} />
      </Modal>

      {/* Modal de Orçamentos */}
      <Modal
        visible={showBudgetsModal}
        onClose={() => setShowBudgetsModal(false)}
        title="Orçamentos"
      >
        <BudgetManager onClose={() => setShowBudgetsModal(false)} />
      </Modal>

      {/* Modal de Backup e Restauração */}
      <Modal
        visible={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        title="Backup e Restauração"
      >
        <BackupRestore onClose={() => setShowBackupModal(false)} />
      </Modal>

      {/* Modal de Sincronização em Tempo Real */}
      <Modal
        visible={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        title="Sincronização"
      >
        <FirebaseSync onClose={() => setShowSyncModal(false)} />
      </Modal>

      {/* Modal de Calendário Interativo */}
      <CalendarModal
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        transactions={transactions}
        recurringBills={recurringBills}
        accounts={accounts}
      />

      {/* Modal de Confirmação Global */}
      <ConfirmModal
        visible={showConfirmModal}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={() => {
          confirmConfig.onConfirm();
          setShowConfirmModal(false);
        }}
        onCancel={() => {
          if (confirmConfig.onCancel) {
            confirmConfig.onCancel();
          }
          setShowConfirmModal(false);
        }}
      />

      {/* Toast de Notificação */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
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
    paddingTop: Platform.OS === "ios" ? 10 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
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
  },
  calendarTitle: {
    marginBottom: 10,
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
  card: {
    padding: 0,
    overflow: "hidden",
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
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: theme.colors.primary,
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
  actionButton: {
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
  modalPiggyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalPiggyHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalPiggyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalPiggyInfo: {
    flex: 1,
  },
  modalPiggyName: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: theme.colors.text,
    marginBottom: 4,
  },
  modalPiggyProgress: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    color: theme.colors.textDim,
  },
});
