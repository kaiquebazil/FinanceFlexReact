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
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import { BackupRestore } from "../components/features/BackupRestore";
import { CategoryManager } from "../components/features/CategoryManager";
import { TransferForm } from "../components/forms/TransferForm";
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
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Drawer } from "../components/ui/Drawer";
import { FAB } from "../components/ui/FAB";
import { Modal } from "../components/ui/Modal";
import { Toast } from "../components/ui/Toast";
import { theme } from "../constants/theme";
import { useData } from "../hooks/useData";
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
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const {
    accounts,
    transactions,
    piggyBanks,
    categories,
    creditCards,
    recurringBills,
    addTransaction,
    deleteAccount,
    getTotalBalance,
    getMonthlySummary,
    valuesHidden,
    setValuesHidden,
    setUICallbacks,
  } = useData();

  // Estados para modais
  const [showDrawer, setShowDrawer] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAccountEditModal, setShowAccountEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Estados para transação
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const [showPiggyBankModal, setShowPiggyBankModal] = useState(false);
  const [showPiggyBankEditModal, setShowPiggyBankEditModal] = useState(false);
  const [selectedPiggyBank, setSelectedPiggyBank] = useState<any>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showRecurringBillsModal, setShowRecurringBillsModal] = useState(false);
  const [showCreditCardsModal, setShowCreditCardsModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

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

  const handleOpenTransfer = () => {
    setShowTransferModal(true);
    setShowFABMenu(false);
  };

  const handleSaveTransfer = (data: any) => {
    const newTransaction = {
      id: Date.now().toString(),
      type: "transfer" as const,
      amount: data.amount,
      description: data.description,
      category: "Transferência",
      accountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      date: data.date,
      createdAt: new Date().toISOString(),
    };

    addTransaction(newTransaction);
    showToast(
      `Transferência de ${formatCurrency(data.amount, "BRL")} realizada com sucesso!`,
      "success",
    );
    setShowTransferModal(false);
  };

  // ==================== HANDLES DE TRANSAÇÃO ====================
  const handleOpenTransaction = () => {
    setShowTransactionModal(true);
    setShowFABMenu(false);
  };

  const handleSaveTransaction = (data: any) => {
    const newTransaction = {
      id: Date.now().toString(),
      type: data.type,
      amount: data.amount,
      description: data.description,
      category: data.category,
      accountId: data.accountId,
      date: data.date,
      createdAt: new Date().toISOString(),
    };

    addTransaction(newTransaction);
    showToast(
      `${data.type === "income" ? "Receita" : "Despesa"} adicionada com sucesso!`,
      "success",
    );
    setShowTransactionModal(false);
  };

  // ==================== HANDLES DE CONTA ====================
  const handleEditAccount = (account: any) => {
    setSelectedAccount(account);
    setShowAccountEditModal(true);
  };

  const handleDeleteAccount = (accountId: string) => {
    deleteAccount(accountId);
  };

  // ==================== HANDLES DE COFRINHO ====================
  const handleEditPiggyBank = (piggy: any) => {
    setSelectedPiggyBank(piggy);
    setShowPiggyBankEditModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.darker}
      />

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

      {/* Conteúdo Principal */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          isWeb && styles.webContentContainer,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Grid para Web */}
        {isWeb ? (
          <View style={styles.webGrid}>
            {/* COLUNA ESQUERDA */}
            <View style={styles.webColumn}>
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
                      <Text style={styles.emptyText}>
                        Nenhuma conta cadastrada
                      </Text>
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
                      style={[
                        styles.summaryValue,
                        { color: theme.colors.success },
                      ]}
                    >
                      {formatValue(summary.income)}
                    </Text>
                  </Card>

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
                      style={[
                        styles.summaryValue,
                        { color: theme.colors.danger },
                      ]}
                    >
                      {formatValue(summary.expense)}
                    </Text>
                  </Card>

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
                      style={[
                        styles.summaryValue,
                        { color: theme.colors.info },
                      ]}
                    >
                      {formatValue(summary.balance)}
                    </Text>
                  </Card>

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
                      style={[
                        styles.summaryValue,
                        { color: theme.colors.warning },
                      ]}
                    >
                      {valuesHidden
                        ? "• •%"
                        : `${summary.savingsRate.toFixed(0)}%`}
                    </Text>
                  </Card>
                </View>
              </View>

              {/* Cofrinhos */}
              {piggyBanks.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Cofrinhos</Text>
                    <TouchableOpacity
                      onPress={() => setShowPiggyBankModal(true)}
                    >
                      <FontAwesome5
                        name="plus-circle"
                        size={20}
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
                                onPress={() => handleEditPiggyBank(piggy)}
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
            </View>

            {/* COLUNA DIREITA */}
            <View style={styles.webColumn}>
              {/* Cartões de Crédito */}
              {creditCards.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Cartões de Crédito</Text>
                    <TouchableOpacity
                      onPress={() => setShowCreditCardsModal(true)}
                    >
                      <FontAwesome5
                        name="plus-circle"
                        size={20}
                        color={theme.colors.primary}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardsGrid}>
                    {creditCards.slice(0, 2).map((card) => {
                      const used = card.used || 0;
                      const available = card.limit - used;
                      const usedPercentage = (used / card.limit) * 100;

                      return (
                        <Card
                          key={card.id}
                          style={{
                            marginBottom: 12,
                            padding: 16,
                            width: isWeb ? "48%" : "100%",
                          }}
                        >
                          <View style={styles.cardHeader}>
                            <FontAwesome5
                              name="credit-card"
                              size={20}
                              color={card.color || theme.colors.primary}
                            />
                            <Text style={styles.cardName}>{card.name}</Text>
                          </View>
                          <Text style={styles.cardLimit}>
                            Limite total {formatCurrency(card.limit, "BRL")}
                          </Text>

                          <View style={styles.progressContainer}>
                            <View style={styles.progressBarContainer}>
                              <View
                                style={[
                                  styles.progressBar,
                                  {
                                    width: `${Math.min(usedPercentage, 100)}%`,
                                    backgroundColor:
                                      usedPercentage > 80
                                        ? theme.colors.danger
                                        : theme.colors.success,
                                  },
                                ]}
                              />
                            </View>
                          </View>

                          <View style={styles.usageContainer}>
                            <Text style={styles.usageLabel}>
                              Usado:{" "}
                              <Text
                                style={[
                                  styles.usageValue,
                                  { color: theme.colors.danger },
                                ]}
                              >
                                {formatCurrency(used, "BRL")}
                              </Text>
                            </Text>
                            <Text style={styles.usageLabel}>
                              Disponível:{" "}
                              <Text
                                style={[
                                  styles.usageValue,
                                  { color: theme.colors.success },
                                ]}
                              >
                                {formatCurrency(available, "BRL")}
                              </Text>
                            </Text>
                          </View>
                        </Card>
                      );
                    })}
                  </View>

                  {creditCards.length > 2 && (
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => setShowCreditCardsModal(true)}
                    >
                      <Text style={styles.viewAllText}>
                        Ver todos ({creditCards.length})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Calendário de Pagamentos */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Calendário de Pagamentos
                </Text>
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
                  <TouchableOpacity
                    onPress={() => setShowTransactionsModal(true)}
                  >
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
                        <View
                          key={transaction.id}
                          style={styles.transactionItem}
                        >
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
                                  : "Despesa")}
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
            </View>
          </View>
        ) : (
          /* Versão Mobile (layout original em lista) */
          <>
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
                    <Text style={styles.emptyText}>
                      Nenhuma conta cadastrada
                    </Text>
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
                    style={[
                      styles.summaryValue,
                      { color: theme.colors.success },
                    ]}
                  >
                    {formatValue(summary.income)}
                  </Text>
                </Card>

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
                    style={[
                      styles.summaryValue,
                      { color: theme.colors.danger },
                    ]}
                  >
                    {formatValue(summary.expense)}
                  </Text>
                </Card>

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
                    style={[
                      styles.summaryValue,
                      { color: theme.colors.warning },
                    ]}
                  >
                    {valuesHidden
                      ? "• •%"
                      : `${summary.savingsRate.toFixed(0)}%`}
                  </Text>
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
                <TouchableOpacity
                  onPress={() => setShowTransactionsModal(true)}
                >
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
                                : "Despesa")}
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

            {/* Cofrinhos */}
            {piggyBanks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Cofrinhos</Text>
                  <TouchableOpacity onPress={() => setShowPiggyBankModal(true)}>
                    <FontAwesome5
                      name="plus-circle"
                      size={20}
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
                              onPress={() => handleEditPiggyBank(piggy)}
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
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modais */}
      <TransactionsModal
        visible={showTransactionsModal}
        onClose={() => setShowTransactionsModal(false)}
      />

      <FAB
        visible={!showDrawer}
        onPressMain={() => setShowFABMenu(!showFABMenu)}
        showMenu={showFABMenu}
        onPressIncome={handleOpenTransaction}
        onPressExpense={handleOpenTransaction}
        onPressTransfer={handleOpenTransfer}
      />

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

      <TransferForm
        visible={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSave={handleSaveTransfer}
      />

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

      <TransactionForm
        visible={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSave={handleSaveTransaction}
      />

      <Modal
        visible={showPiggyBankModal}
        onClose={() => setShowPiggyBankModal(false)}
        title="Cofrinhos"
      >
        <ScrollView>
          {piggyBanks.map((piggy) => (
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
                    {formatValue(piggy.targetAmount)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleEditPiggyBank(piggy)}>
                  <FontAwesome5
                    name="edit"
                    size={16}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <Button
            title="Novo Cofrinho"
            icon="plus"
            onPress={() => {
              setShowPiggyBankModal(false);
              showToast("Funcionalidade em desenvolvimento", "info");
            }}
            style={styles.modalAddButton}
          />
        </ScrollView>
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
              showToast("Cofrinho atualizado com sucesso!", "success");
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
          if (confirmConfig.onCancel) confirmConfig.onCancel();
          setShowConfirmModal(false);
        }}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 20,
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
  modalAddButton: {
    marginTop: 20,
  },

  // ========== ESTILOS PARA WEB ==========
  webContentContainer: {
    maxWidth: 1400,
    alignSelf: "center",
    width: "100%",
  },
  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: -10,
  },
  webColumn: {
    width: "50%",
    paddingHorizontal: 10,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardItem: {
    marginBottom: 12,
    padding: 16,
    width: "100%",
  },
  webCardItem: {
    width: "48%",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  cardName: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: theme.colors.text,
  },
  cardLimit: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: theme.colors.textDim,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  usageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  usageLabel: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: theme.colors.textDim,
  },
  usageValue: {
    fontFamily: "Inter-SemiBold",
  },
});
