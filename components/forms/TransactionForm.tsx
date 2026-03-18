// components/forms/TransactionForm.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Button } from "../ui/Button";
import { theme } from "../../constants/theme";
import { useData } from "../../hooks/useData";
import { formatCurrency } from "../../utils/currency";

type TransactionType = "income" | "expense" | "transfer";

interface TransactionFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialType?: TransactionType;
}

// Gerar array de anos (2020 até 2030)
const YEARS = Array.from({ length: 11 }, (_, i) => (2020 + i).toString());
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

export function TransactionForm({
  visible,
  onClose,
  onSave,
  initialType = "income",
}: TransactionFormProps) {
  const { accounts, categories } = useData();

  // Estados do formulário
  const [selectedType, setSelectedType] =
    useState<TransactionType>(initialType);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedToAccount, setSelectedToAccount] = useState<any>(null);

  // Estados de data
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate().toString());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(
    today.getFullYear().toString(),
  );

  // Estados para modais de seleção
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showToAccountModal, setShowToAccountModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  // Estados de erro
  const [errors, setErrors] = useState<any>({});

  // Resetar formulário quando o modal abrir, respeitando o initialType
  useEffect(() => {
    if (visible) {
      const now = new Date();
      setSelectedDay(now.getDate().toString());
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear().toString());
      setAmount("");
      setDescription("");
      setSelectedCategory(null);
      setSelectedAccount(null);
      setSelectedToAccount(null);
      setSelectedType(initialType);
      setErrors({});
    }
  }, [visible, initialType]);

  // Filtrar categorias por tipo (apenas se não for transferência)
  const filteredCategories =
    selectedType !== "transfer"
      ? categories.filter((c) => c.type === selectedType)
      : [];

  // Formatar valor enquanto digita
  const handleAmountChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, "");

    if (cleanText === "") {
      setAmount("");
      return;
    }

    const numberValue = parseFloat(cleanText) / 100;
    setAmount(numberValue.toFixed(2).replace(".", ","));
  };

  // Formatar data para exibição
  const getFormattedDate = () => {
    return `${selectedDay.padStart(2, "0")}/${(selectedMonth + 1).toString().padStart(2, "0")}/${selectedYear}`;
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
  useEffect(() => {
    const daysInMonth = getDaysInMonth(selectedMonth, parseInt(selectedYear));
    if (parseInt(selectedDay) > daysInMonth) {
      setSelectedDay(daysInMonth.toString());
    }
  }, [selectedMonth, selectedYear]);

  // Validar e salvar
  const handleSave = () => {
    const newErrors: any = {};

    // Validar valor
    const amountValue = parseFloat(amount?.replace(",", ".") || "0");
    if (!amount || amountValue <= 0) {
      newErrors.amount = "Valor deve ser maior que zero";
    }

    if (selectedType !== "transfer") {
      if (!selectedCategory) {
        newErrors.category = "Selecione uma categoria";
      }

      if (!selectedAccount) {
        newErrors.account = "Selecione uma conta";
      }

      if (
        selectedType === "expense" &&
        selectedAccount &&
        selectedAccount.balance < amountValue
      ) {
        newErrors.account = `Saldo insuficiente! Saldo: ${formatCurrency(selectedAccount.balance, selectedAccount.currency)}`;
      }
    } else {
      if (!selectedAccount) {
        newErrors.account = "Selecione a conta de origem";
      }

      if (!selectedToAccount) {
        newErrors.toAccount = "Selecione a conta de destino";
      } else if (
        selectedAccount &&
        selectedToAccount &&
        selectedAccount.id === selectedToAccount.id
      ) {
        newErrors.toAccount = "As contas devem ser diferentes";
      }

      if (selectedAccount && selectedAccount.balance < amountValue) {
        newErrors.account = `Saldo insuficiente! Saldo: ${formatCurrency(selectedAccount.balance, selectedAccount.currency)}`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Criar data no formato ISO
    const selectedDate = new Date(
      parseInt(selectedYear),
      selectedMonth,
      parseInt(selectedDay),
      12,
      0,
      0,
    );

    // Criar objeto da transação
    const transaction: any = {
      type: selectedType,
      amount: amountValue,
      description:
        description.trim() ||
        (selectedType === "income"
          ? "Receita"
          : selectedType === "expense"
            ? "Despesa"
            : "Transferência"),
      date: selectedDate.toISOString(),
    };

    if (selectedType === "transfer") {
      transaction.fromAccountId = selectedAccount.id;
      transaction.fromAccountName = selectedAccount.name;
      transaction.toAccountId = selectedToAccount.id;
      transaction.toAccountName = selectedToAccount.name;
      transaction.accountId = selectedAccount.id;
      transaction.category = "Transferência";
    } else {
      transaction.category = selectedCategory.name;
      transaction.categoryId = selectedCategory.id;
      transaction.accountId = selectedAccount.id;
      transaction.accountName = selectedAccount.name;
    }

    onSave(transaction);
  };

  // Cancelar
  const handleCancel = () => {
    Keyboard.dismiss();
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
      <FontAwesome5
        name={item.icon || "tag"}
        size={16}
        color={theme.colors.primary}
      />
      <Text style={styles.selectItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Renderizar item de conta
  const renderAccountItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.selectItem}
      onPress={() => {
        if (showAccountModal) {
          setSelectedAccount(item);
          setShowAccountModal(false);
          setErrors({ ...errors, account: null });
        } else {
          setSelectedToAccount(item);
          setShowToAccountModal(false);
          setErrors({ ...errors, toAccount: null });
        }
      }}
    >
      <FontAwesome5
        name={item.type === "Dinheiro" ? "money-bill-wave" : "university"}
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
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                {/* Cabeçalho */}
                <View style={styles.header}>
                  <Text style={styles.title}>
                    {selectedType === "income" && "Nova Receita"}
                    {selectedType === "expense" && "Nova Despesa"}
                    {selectedType === "transfer" && "Nova Transferência"}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={styles.closeButton}
                  >
                    <FontAwesome5
                      name="times"
                      size={20}
                      color={theme.colors.textDim}
                    />
                  </TouchableOpacity>
                </View>

                {/* Seletor de Tipo - 3 BOTÕES LADO A LADO */}
                <View style={styles.typeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      selectedType === "income" && styles.typeButtonActive,
                    ]}
                    onPress={() => setSelectedType("income")}
                  >
                    <FontAwesome5
                      name="arrow-down"
                      size={20}
                      color={
                        selectedType === "income" ? "#fff" : theme.colors.success
                      }
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        selectedType === "income" && styles.typeButtonTextActive,
                      ]}
                    >
                      Receita
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      selectedType === "expense" && styles.typeButtonActive,
                    ]}
                    onPress={() => setSelectedType("expense")}
                  >
                    <FontAwesome5
                      name="arrow-up"
                      size={20}
                      color={
                        selectedType === "expense" ? "#fff" : theme.colors.danger
                      }
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        selectedType === "expense" && styles.typeButtonTextActive,
                      ]}
                    >
                      Despesa
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      selectedType === "transfer" && styles.typeButtonActive,
                    ]}
                    onPress={() => setSelectedType("transfer")}
                  >
                    <FontAwesome5
                      name="exchange-alt"
                      size={20}
                      color={
                        selectedType === "transfer" ? "#fff" : theme.colors.info
                      }
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        selectedType === "transfer" && styles.typeButtonTextActive,
                      ]}
                    >
                      Transferir
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="none"
                >
                  {/* Valor */}
                  <View style={styles.field}>
                    <Text style={styles.label}>Valor</Text>
                    <View style={styles.amountContainer}>
                      <Text style={styles.currencySymbol}>R$</Text>
                      <TextInput
                        style={[
                          styles.amountInput,
                          errors.amount && styles.inputError,
                        ]}
                        value={amount}
                        onChangeText={handleAmountChange}
                        placeholder="0,00"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        autoFocus
                      />
                    </View>
                    {errors.amount && (
                      <Text style={styles.errorText}>{errors.amount}</Text>
                    )}
                  </View>

                  {/* Descrição */}
                  <View style={styles.field}>
                    <Text style={styles.label}>Descrição</Text>
                    <TextInput
                      style={styles.input}
                      value={description}
                      onChangeText={setDescription}
                      placeholder={
                        selectedType === "transfer"
                          ? "Descrição da transferência"
                          : "Descrição da transação"
                      }
                      placeholderTextColor={theme.colors.textMuted}
                    />
                  </View>

                  {selectedType !== "transfer" ? (
                    <>
                      {/* Categoria (para receitas/despesas) */}
                      <View style={styles.field}>
                        <Text style={styles.label}>Categoria</Text>
                        <TouchableOpacity
                          style={[
                            styles.selectButton,
                            errors.category && styles.inputError,
                          ]}
                          onPress={() => setShowCategoryModal(true)}
                        >
                          {selectedCategory ? (
                            <View style={styles.selectButtonContent}>
                              <FontAwesome5
                                name={selectedCategory.icon || "tag"}
                                size={16}
                                color={theme.colors.primary}
                              />
                              <Text style={styles.selectButtonText}>
                                {selectedCategory.name}
                              </Text>
                            </View>
                          ) : (
                            <Text style={styles.placeholderText}>
                              Selecione a categoria
                            </Text>
                          )}
                          <FontAwesome5
                            name="chevron-down"
                            size={14}
                            color={theme.colors.textDim}
                          />
                        </TouchableOpacity>
                        {errors.category && (
                          <Text style={styles.errorText}>{errors.category}</Text>
                        )}
                      </View>

                      {/* Conta (para receitas/despesas) */}
                      <View style={styles.field}>
                        <Text style={styles.label}>Conta</Text>
                        <TouchableOpacity
                          style={[
                            styles.selectButton,
                            errors.account && styles.inputError,
                          ]}
                          onPress={() => setShowAccountModal(true)}
                        >
                          {selectedAccount ? (
                            <View style={styles.selectButtonContent}>
                              <FontAwesome5
                                name={
                                  selectedAccount.type === "Dinheiro"
                                    ? "money-bill-wave"
                                    : "university"
                                }
                                size={16}
                                color={theme.colors.primary}
                              />
                              <View>
                                <Text style={styles.selectButtonText}>
                                  {selectedAccount.name}
                                </Text>
                                <Text style={styles.selectBalance}>
                                  {formatCurrency(
                                    selectedAccount.balance,
                                    selectedAccount.currency,
                                  )}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <Text style={styles.placeholderText}>
                              Selecione a conta
                            </Text>
                          )}
                          <FontAwesome5
                            name="chevron-down"
                            size={14}
                            color={theme.colors.textDim}
                          />
                        </TouchableOpacity>
                        {errors.account && (
                          <Text style={styles.errorText}>{errors.account}</Text>
                        )}
                      </View>
                    </>
                  ) : (
                    <>
                      {/* Conta de Origem (para transferência) */}
                      <View style={styles.field}>
                        <Text style={styles.label}>Conta de Origem</Text>
                        <TouchableOpacity
                          style={[
                            styles.selectButton,
                            errors.account && styles.inputError,
                          ]}
                          onPress={() => setShowAccountModal(true)}
                        >
                          {selectedAccount ? (
                            <View style={styles.selectButtonContent}>
                              <FontAwesome5
                                name={
                                  selectedAccount.type === "Dinheiro"
                                    ? "money-bill-wave"
                                    : "university"
                                }
                                size={16}
                                color={theme.colors.primary}
                              />
                              <View>
                                <Text style={styles.selectButtonText}>
                                  {selectedAccount.name}
                                </Text>
                                <Text style={styles.selectBalance}>
                                  {formatCurrency(
                                    selectedAccount.balance,
                                    selectedAccount.currency,
                                  )}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <Text style={styles.placeholderText}>
                              Selecione a conta de origem
                            </Text>
                          )}
                          <FontAwesome5
                            name="chevron-down"
                            size={14}
                            color={theme.colors.textDim}
                          />
                        </TouchableOpacity>
                        {errors.account && (
                          <Text style={styles.errorText}>{errors.account}</Text>
                        )}
                      </View>

                      {/* Conta de Destino (para transferência) */}
                      <View style={styles.field}>
                        <Text style={styles.label}>Conta de Destino</Text>
                        <TouchableOpacity
                          style={[
                            styles.selectButton,
                            errors.toAccount && styles.inputError,
                          ]}
                          onPress={() => setShowToAccountModal(true)}
                        >
                          {selectedToAccount ? (
                            <View style={styles.selectButtonContent}>
                              <FontAwesome5
                                name={
                                  selectedToAccount.type === "Dinheiro"
                                    ? "money-bill-wave"
                                    : "university"
                                }
                                size={16}
                                color={theme.colors.primary}
                              />
                              <View>
                                <Text style={styles.selectButtonText}>
                                  {selectedToAccount.name}
                                </Text>
                                <Text style={styles.selectBalance}>
                                  {formatCurrency(
                                    selectedToAccount.balance,
                                    selectedToAccount.currency,
                                  )}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <Text style={styles.placeholderText}>
                              Selecione a conta de destino
                            </Text>
                          )}
                          <FontAwesome5
                            name="chevron-down"
                            size={14}
                            color={theme.colors.textDim}
                          />
                        </TouchableOpacity>
                        {errors.toAccount && (
                          <Text style={styles.errorText}>{errors.toAccount}</Text>
                        )}
                      </View>
                    </>
                  )}

                  {/* Data */}
                  <View style={styles.field}>
                    <Text style={styles.label}>Data</Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDateModal(true)}
                    >
                      <FontAwesome5
                        name="calendar-alt"
                        size={16}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.dateText}>{getFormattedDate()}</Text>
                      <FontAwesome5
                        name="chevron-down"
                        size={14}
                        color={theme.colors.textDim}
                      />
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
                      title="Salvar"
                      onPress={handleSave}
                      style={styles.saveButton}
                    />
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Modal de Seleção de Categoria */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
          <View style={styles.bottomSheetOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.selectionModal}>
                <View style={styles.selectionHeader}>
                  <Text style={styles.selectionTitle}>
                    Selecione uma categoria
                  </Text>
                  <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                    <FontAwesome5
                      name="times"
                      size={20}
                      color={theme.colors.textDim}
                    />
                  </TouchableOpacity>
                </View>

                {filteredCategories.length === 0 ? (
                  <View style={styles.emptyState}>
                    <FontAwesome5
                      name="tags"
                      size={40}
                      color={theme.colors.textDim}
                    />
                    <Text style={styles.emptyText}>
                      Nenhuma categoria encontrada
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={filteredCategories}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCategoryItem}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de Seleção de Conta (Origem) */}
      <Modal
        visible={showAccountModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccountModal(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setShowAccountModal(false)}>
          <View style={styles.bottomSheetOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.selectionModal}>
                <View style={styles.selectionHeader}>
                  <Text style={styles.selectionTitle}>
                    {selectedType === "transfer"
                      ? "Selecione a conta de origem"
                      : "Selecione uma conta"}
                  </Text>
                  <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                    <FontAwesome5
                      name="times"
                      size={20}
                      color={theme.colors.textDim}
                    />
                  </TouchableOpacity>
                </View>

                {accounts.length === 0 ? (
                  <View style={styles.emptyState}>
                    <FontAwesome5
                      name="wallet"
                      size={40}
                      color={theme.colors.textDim}
                    />
                    <Text style={styles.emptyText}>
                      Nenhuma conta encontrada
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={accounts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAccountItem}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de Seleção de Conta de Destino */}
      <Modal
        visible={showToAccountModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowToAccountModal(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setShowToAccountModal(false)}>
          <View style={styles.bottomSheetOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.selectionModal}>
                <View style={styles.selectionHeader}>
                  <Text style={styles.selectionTitle}>
                    Selecione a conta de destino
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowToAccountModal(false)}
                  >
                    <FontAwesome5
                      name="times"
                      size={20}
                      color={theme.colors.textDim}
                    />
                  </TouchableOpacity>
                </View>

                {accounts.length === 0 ? (
                  <View style={styles.emptyState}>
                    <FontAwesome5
                      name="wallet"
                      size={40}
                      color={theme.colors.textDim}
                    />
                    <Text style={styles.emptyText}>
                      Nenhuma conta encontrada
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={accounts.filter((a) => a.id !== selectedAccount?.id)}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAccountItem}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de Seleção de Data */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setShowDateModal(false)}>
          <View style={styles.bottomSheetOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.dateModal}>
                <View style={styles.selectionHeader}>
                  <Text style={styles.selectionTitle}>Selecione a Data</Text>
                  <TouchableOpacity onPress={() => setShowDateModal(false)}>
                    <FontAwesome5
                      name="times"
                      size={20}
                      color={theme.colors.textDim}
                    />
                  </TouchableOpacity>
                </View>

                {/* Seletor de Ano */}
                <View style={styles.dateSection}>
                  <Text style={styles.dateSectionLabel}>Ano</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.dateScroll}
                    keyboardShouldPersistTaps="handled"
                  >
                    {YEARS.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.dateOption,
                          selectedYear === year && styles.dateOptionSelected,
                        ]}
                        onPress={() => setSelectedYear(year)}
                      >
                        <Text
                          style={[
                            styles.dateOptionText,
                            selectedYear === year &&
                              styles.dateOptionTextSelected,
                          ]}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Seletor de Mês */}
                <View style={styles.dateSection}>
                  <Text style={styles.dateSectionLabel}>Mês</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.dateScroll}
                    keyboardShouldPersistTaps="handled"
                  >
                    {MONTHS.map((month, index) => (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.dateOption,
                          selectedMonth === index && styles.dateOptionSelected,
                        ]}
                        onPress={() => setSelectedMonth(index)}
                      >
                        <Text
                          style={[
                            styles.dateOptionText,
                            selectedMonth === index &&
                              styles.dateOptionTextSelected,
                          ]}
                        >
                          {month.substring(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Seletor de Dia */}
                <View style={styles.dateSection}>
                  <Text style={styles.dateSectionLabel}>Dia</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.dateScroll}
                    keyboardShouldPersistTaps="handled"
                  >
                    {DAYS.map((day) => {
                      const daysInMonth = getDaysInMonth(
                        selectedMonth,
                        parseInt(selectedYear),
                      );
                      if (parseInt(day) > daysInMonth) return null;
                      return (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.dateOption,
                            selectedDay === day && styles.dateOptionSelected,
                          ]}
                          onPress={() => handleDaySelect(day)}
                        >
                          <Text
                            style={[
                              styles.dateOptionText,
                              selectedDay === day &&
                                styles.dateOptionTextSelected,
                            ]}
                          >
                            {day.padStart(2, "0")}
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.dark,
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: theme.colors.text,
  },
  closeButton: {
    padding: 5,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.darkLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: theme.colors.text,
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: theme.colors.textDim,
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.darkLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  currencySymbol: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: theme.colors.text,
    paddingHorizontal: 15,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: "Inter-Bold",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectButtonContent: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
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
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  selectionModal: {
    backgroundColor: theme.colors.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  dateModal: {
    backgroundColor: theme.colors.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  selectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: theme.colors.text,
  },
  selectItem: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
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
    fontFamily: "Inter-Medium",
    color: theme.colors.textDim,
    marginBottom: 10,
  },
  dateScroll: {
    flexDirection: "row",
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
    fontFamily: "Inter-Medium",
  },
  dateOptionTextSelected: {
    color: "#fff",
  },
  confirmButton: {
    marginTop: 20,
  },
});
