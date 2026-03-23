import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Button } from "../ui/Button";
import { theme } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";
import { useData } from "../../hooks/useData";
import { formatCurrency } from "../../utils/currency";

type TransactionType = "income" | "expense" | "transfer";

interface TransactionFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any, stayOpen?: boolean) => void;
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
  const { colors, isDark } = useTheme();
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
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showToAccountModal, setShowToAccountModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  // Estados de erro
  const [errors, setErrors] = useState<any>({});

  // Função para resetar o formulário
  const resetForm = () => {
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
  };

  // Efeito para resetar quando fechar
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  // Filtrar categorias por tipo
  const filteredCategories = categories.filter(
    (cat) => cat.type === selectedType,
  );

  // Função para formatar valor
  const handleAmountChange = (value: string) => {
    const formatted = value.replace(/[^0-9,]/g, "");
    setAmount(formatted);
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors: any = {};
    const amountValue = parseFloat(amount.replace(",", "."));

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

    onSave(transaction, false);
    if (!visible) {
      resetForm();
    }
  };

  // Cancelar
  const handleCancel = () => {
    Keyboard.dismiss();
    onClose();
  };

  // Renderizar item de conta
  const renderAccountItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.selectItem, { borderBottomColor: colors.border }]}
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
        name="wallet"
        size={16}
        color={colors.primary}
      />
      <View style={styles.accountInfo}>
        <Text style={[styles.selectItemText, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.accountBalance, { color: colors.textDim }]}>
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
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }]}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.title, { color: colors.text }]}>
                    Nova Transação
                  </Text>
                  <TouchableOpacity onPress={handleCancel}>
                    <FontAwesome5
                      name="times"
                      size={20}
                      color={colors.textDim}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  {/* Seletor de Tipo - 3 BOTÕES LADO A LADO */}
                  <View style={styles.typeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        { backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, borderColor: colors.border },
                        selectedType === "income" && [styles.typeButtonActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                      ]}
                      onPress={() => {
                        setSelectedType("income");
                        setSelectedCategory(null);
                      }}
                    >
                      <FontAwesome5
                        name="arrow-down"
                        size={18}
                        color={
                          selectedType === "income" ? "#fff" : colors.success
                        }
                      />
                      <Text
                        style={[
                          styles.typeButtonText,
                          { color: colors.text },
                          selectedType === "income" && styles.typeButtonTextActive,
                        ]}
                      >
                        Receita
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        { backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, borderColor: colors.border },
                        selectedType === "expense" && [styles.typeButtonActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                      ]}
                      onPress={() => {
                        setSelectedType("expense");
                        setSelectedCategory(null);
                      }}
                    >
                      <FontAwesome5
                        name="arrow-up"
                        size={18}
                        color={
                          selectedType === "expense" ? "#fff" : colors.danger
                        }
                      />
                      <Text
                        style={[
                          styles.typeButtonText,
                          { color: colors.text },
                          selectedType === "expense" && styles.typeButtonTextActive,
                        ]}
                      >
                        Despesa
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        { backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, borderColor: colors.border },
                        selectedType === "transfer" && [styles.typeButtonActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                      ]}
                      onPress={() => {
                        setSelectedType("transfer");
                        setSelectedCategory(null);
                      }}
                    >
                      <FontAwesome5
                        name="exchange-alt"
                        size={18}
                        color={
                          selectedType === "transfer" ? "#fff" : colors.info
                        }
                      />
                      <Text
                        style={[
                          styles.typeButtonText,
                          { color: colors.text },
                          selectedType === "transfer" && styles.typeButtonTextActive,
                        ]}
                      >
                        Troca
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Valor */}
                  <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.textDim }]}>Valor</Text>
                    <View style={[styles.amountContainer, { backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, borderColor: errors.amount ? colors.danger : colors.border }]}>
                      <Text style={[styles.currencySymbol, { color: colors.text }]}>R$</Text>
                      <TextInput
                        style={[styles.amountInput, { color: colors.text }]}
                        value={amount}
                        onChangeText={handleAmountChange}
                        keyboardType="numeric"
                        placeholder="0,00"
                        placeholderTextColor={colors.textMuted}
                        autoFocus
                      />
                    </View>
                    {errors.amount && (
                      <Text style={[styles.errorText, { color: colors.danger }]}>{errors.amount}</Text>
                    )}
                  </View>

                  {/* Descrição */}
                  <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.textDim }]}>Descrição (opcional)</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { 
                          backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, 
                          color: colors.text, 
                          borderColor: colors.border 
                        },
                      ]}
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Ex: Aluguel, Salário..."
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>

                  {/* Data */}
                  <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.textDim }]}>Data</Text>
                    <TouchableOpacity
                      style={[
                        styles.dateButton,
                        { 
                          backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, 
                          borderColor: colors.border 
                        },
                      ]}
                      onPress={() => setShowDateModal(true)}
                    >
                      <FontAwesome5
                        name="calendar-alt"
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={[styles.dateText, { color: colors.text }]}>
                        {selectedDay}/{selectedMonth + 1}/{selectedYear}
                      </Text>
                      <FontAwesome5
                        name="chevron-down"
                        size={12}
                        color={colors.textDim}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Conta / Conta Origem */}
                  <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.textDim }]}>
                      {selectedType === "transfer" ? "De onde sai?" : "Conta"}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.selectButton,
                        { 
                          backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, 
                          borderColor: errors.account ? colors.danger : colors.border 
                        },
                      ]}
                      onPress={() => setShowAccountModal(true)}
                    >
                      <View style={styles.selectButtonContent}>
                        <FontAwesome5
                          name="wallet"
                          size={16}
                          color={colors.primary}
                        />
                        <View>
                          <Text
                            style={[
                              styles.selectButtonText,
                              { color: selectedAccount ? colors.text : colors.textMuted },
                            ]}
                          >
                            {selectedAccount
                              ? selectedAccount.name
                              : "Selecione uma conta"}
                          </Text>
                          {selectedAccount && (
                            <Text style={[styles.accountBalance, { color: colors.textDim }]}>
                              Saldo: {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                            </Text>
                          )}
                        </View>
                      </View>
                      <FontAwesome5
                        name="chevron-down"
                        size={12}
                        color={colors.textDim}
                      />
                    </TouchableOpacity>
                    {errors.account && (
                      <Text style={[styles.errorText, { color: colors.danger }]}>{errors.account}</Text>
                    )}
                  </View>

                  {/* Conta Destino (Apenas Transferência) */}
                  {selectedType === "transfer" && (
                    <View style={styles.field}>
                      <Text style={[styles.label, { color: colors.textDim }]}>Para onde vai?</Text>
                      <TouchableOpacity
                        style={[
                          styles.selectButton,
                          { 
                            backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, 
                            borderColor: errors.toAccount ? colors.danger : colors.border 
                          },
                        ]}
                        onPress={() => setShowToAccountModal(true)}
                      >
                        <View style={styles.selectButtonContent}>
                          <FontAwesome5
                            name="wallet"
                            size={16}
                            color={colors.secondary}
                          />
                          <View>
                            <Text
                              style={[
                                styles.selectButtonText,
                                { color: selectedToAccount ? colors.text : colors.textMuted },
                              ]}
                            >
                              {selectedToAccount
                                ? selectedToAccount.name
                                : "Selecione a conta de destino"}
                            </Text>
                            {selectedToAccount && (
                              <Text style={[styles.accountBalance, { color: colors.textDim }]}>
                                Saldo: {formatCurrency(selectedToAccount.balance, selectedToAccount.currency)}
                              </Text>
                            )}
                          </View>
                        </View>
                        <FontAwesome5
                          name="chevron-down"
                          size={12}
                          color={colors.textDim}
                        />
                      </TouchableOpacity>
                      {errors.toAccount && (
                        <Text style={[styles.errorText, { color: colors.danger }]}>{errors.toAccount}</Text>
                      )}
                    </View>
                  )}

                  {/* Categorias (Exceto Transferência) */}
                  {selectedType !== "transfer" && (
                    <View style={styles.field}>
                      <Text style={[styles.label, { color: colors.textDim }]}>Categoria</Text>
                      <View style={styles.categoryGrid}>
                        {filteredCategories.map((cat) => (
                          <TouchableOpacity
                            key={cat.id}
                            style={[
                              styles.categoryButton,
                              {
                                backgroundColor: selectedCategory?.id === cat.id ? cat.color : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                                borderColor: selectedCategory?.id === cat.id ? cat.color : (isDark ? `${cat.color}40` : `${cat.color}60`),
                              },
                              selectedCategory?.id === cat.id && styles.categoryButtonActive
                            ]}
                            onPress={() => {
                              setSelectedCategory(cat);
                              setErrors({ ...errors, category: null });
                            }}
                          >
                            <FontAwesome5
                              name={cat.icon || "tag"}
                              size={14}
                              color={
                                selectedCategory?.id === cat.id
                                  ? "#fff"
                                  : cat.color
                              }
                            />
                            <Text
                              style={[
                                styles.categoryButtonText,
                                { color: selectedCategory?.id === cat.id ? "#fff" : colors.text },
                                selectedCategory?.id === cat.id && styles.categoryButtonTextActive,
                              ]}
                            >
                              {cat.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {errors.category && (
                        <Text style={[styles.errorText, { color: colors.danger }]}>{errors.category}</Text>
                      )}
                    </View>
                  )}

                  {/* Botões de Ação */}
                  <View style={styles.footer}>
                    <Button
                      title="Cancelar"
                      variant="secondary"
                      onPress={handleCancel}
                      style={styles.cancelButton}
                    />
                    <Button
                      title="Salvar"
                      onPress={validateForm}
                      style={styles.saveButton}
                    />
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Modal de Seleção de Conta */}
      <Modal
        visible={showAccountModal || showToAccountModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAccountModal(false);
          setShowToAccountModal(false);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setShowAccountModal(false);
            setShowToAccountModal(false);
          }}
        >
          <View style={styles.bottomSheetOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.selectionModal, { backgroundColor: colors.surface }]}>
                <View style={[styles.selectionHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.selectionTitle, { color: colors.text }]}>
                    {showAccountModal
                      ? selectedType === "transfer"
                        ? "Conta de Origem"
                        : "Selecionar Conta"
                      : "Conta de Destino"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowAccountModal(false);
                      setShowToAccountModal(false);
                    }}
                  >
                    <FontAwesome5
                      name="times"
                      size={20}
                      color={colors.textDim}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {accounts.length === 0 ? (
                    <View style={styles.emptyState}>
                      <FontAwesome5
                        name="wallet"
                        size={40}
                        color={colors.textDim}
                      />
                      <Text style={[styles.emptyText, { color: colors.textDim }]}>
                        Nenhuma conta cadastrada
                      </Text>
                    </View>
                  ) : (
                    accounts.map((account) => (
                      <React.Fragment key={account.id}>
                        {renderAccountItem({ item: account })}
                      </React.Fragment>
                    ))
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de Data Simples */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDateModal(false)}>
          <View style={styles.bottomSheetOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.dateModal, { backgroundColor: colors.surface }]}>
                <View style={[styles.selectionHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.selectionTitle, { color: colors.text }]}>Selecionar Data</Text>
                  <TouchableOpacity onPress={() => setShowDateModal(false)}>
                    <FontAwesome5
                      name="check"
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Ano */}
                  <View style={styles.dateSection}>
                    <Text style={[styles.dateSectionLabel, { color: colors.textDim }]}>Ano</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                      {YEARS.map((year) => (
                        <TouchableOpacity
                          key={year}
                          style={[
                            styles.dateOption,
                            { backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, borderColor: colors.border },
                            selectedYear === year && [styles.dateOptionSelected, { backgroundColor: colors.primary, borderColor: colors.primary }],
                          ]}
                          onPress={() => setSelectedYear(year)}
                        >
                          <Text
                            style={[
                              styles.dateOptionText,
                              { color: colors.text },
                              selectedYear === year && styles.dateOptionTextSelected,
                            ]}
                          >
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Mês */}
                  <View style={styles.dateSection}>
                    <Text style={[styles.dateSectionLabel, { color: colors.textDim }]}>Mês</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                      {MONTHS.map((month, index) => (
                        <TouchableOpacity
                          key={month}
                          style={[
                            styles.dateOption,
                            { backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, borderColor: colors.border },
                            selectedMonth === index && [styles.dateOptionSelected, { backgroundColor: colors.primary, borderColor: colors.primary }],
                          ]}
                          onPress={() => setSelectedMonth(index)}
                        >
                          <Text
                            style={[
                              styles.dateOptionText,
                              { color: colors.text },
                              selectedMonth === index && styles.dateOptionTextSelected,
                            ]}
                          >
                            {month.substring(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Dia */}
                  <View style={styles.dateSection}>
                    <Text style={[styles.dateSectionLabel, { color: colors.textDim }]}>Dia</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                      {DAYS.map((day) => (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.dateOption,
                            { backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, borderColor: colors.border },
                            selectedDay === day && [styles.dateOptionSelected, { backgroundColor: colors.primary, borderColor: colors.primary }],
                          ]}
                          onPress={() => setSelectedDay(day)}
                        >
                          <Text
                            style={[
                              styles.dateOptionText,
                              { color: colors.text },
                              selectedDay === day && styles.dateOptionTextSelected,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={{ height: 20 }} />
                </ScrollView>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
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
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  typeButtonActive: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  typeButtonText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  typeButtonTextActive: {
    color: "#fff",
    fontFamily: "Inter-SemiBold",
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
  },
  currencySymbol: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    paddingHorizontal: 15,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: "Inter-Bold",
    paddingVertical: 15,
    paddingRight: 15,
  },
  input: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    fontFamily: "Inter-Regular",
    fontSize: 14,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  selectButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  selectButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  accountBalance: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    width: "31%",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  categoryButtonActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryButtonText: {
    fontSize: 11,
    fontFamily: "Inter-Medium",
    textAlign: "center",
  },
  categoryButtonTextActive: {
    fontFamily: "Inter-SemiBold",
  },
  dateButton: {
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  cancelButton: {
    flex: 1,
    minWidth: '28%',
  },
  saveButton: {
    flex: 1,
    minWidth: '30%',
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  selectionModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "70%",
  },
  dateModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  },
  selectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
  },
  selectItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  selectItemText: {
    fontSize: 16,
    flex: 1,
  },
  accountInfo: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
  },
  dateSection: {
    marginBottom: 20,
  },
  dateSectionLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginBottom: 10,
  },
  dateScroll: {
    flexDirection: "row",
  },
  dateOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  dateOptionSelected: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  dateOptionText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  dateOptionTextSelected: {
    color: "#fff",
    fontFamily: "Inter-SemiBold",
  },
});
