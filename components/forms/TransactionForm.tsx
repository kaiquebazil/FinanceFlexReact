import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
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
    (cat) => cat.type === selectedType || selectedType === "transfer",
  );

  // Validar formulário
  const validateForm = () => {
    const newErrors: any = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Valor inválido";
    }

    if (!selectedCategory) {
      newErrors.category = "Categoria é obrigatória";
    }

    if (!selectedAccount) {
      newErrors.account = "Conta é obrigatória";
    }

    if (selectedType === "transfer" && !selectedToAccount) {
      newErrors.toAccount = "Conta de destino é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Salvar transação
  const handleSave = (stayOpen = false) => {
    if (!validateForm()) return;

    const transactionData = {
      type: selectedType,
      amount: parseFloat(amount),
      description,
      category: selectedCategory,
      account: selectedAccount,
      toAccount: selectedToAccount,
      date: new Date(
        parseInt(selectedYear),
        selectedMonth,
        parseInt(selectedDay),
      ),
    };

    onSave(transactionData, stayOpen);

    if (!stayOpen) {
      resetForm();
      onClose();
    } else {
      setAmount("");
      setDescription("");
      setSelectedCategory(null);
      setSelectedAccount(null);
      setSelectedToAccount(null);
      setErrors({});
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: isDark
                ? "rgba(0,0,0,0.7)"
                : "rgba(0,0,0,0.4)",
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={[
                styles.formContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <View
                style={[
                  styles.header,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.title, { color: colors.text }]}>
                  Nova Transação
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <FontAwesome5
                    name="times"
                    size={20}
                    color={colors.textDim}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Tipo de Transação */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Tipo
                  </Text>
                  <View style={styles.typeButtons}>
                    {(
                      [
                        "income",
                        "expense",
                        "transfer",
                      ] as TransactionType[]
                    ).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeButton,
                          {
                            backgroundColor:
                              selectedType === type
                                ? colors.primary
                                : `${colors.primary}10`,
                            borderColor:
                              selectedType === type
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() => {
                          setSelectedType(type);
                          setSelectedCategory(null);
                        }}
                      >
                        <FontAwesome5
                          name={
                            type === "income"
                              ? "arrow-down"
                              : type === "expense"
                                ? "arrow-up"
                                : "exchange-alt"
                          }
                          size={14}
                          color={
                            selectedType === type
                              ? "#fff"
                              : colors.primary
                          }
                        />
                        <Text
                          style={[
                            styles.typeButtonText,
                            {
                              color:
                                selectedType === type
                                  ? "#fff"
                                  : colors.primary,
                            },
                          ]}
                        >
                          {type === "income"
                            ? "Receita"
                            : type === "expense"
                              ? "Despesa"
                              : "Transferência"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Valor */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Valor
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: errors.amount
                          ? colors.danger
                          : colors.border,
                        backgroundColor: isDark
                          ? colors.surfaceDark
                          : "#f8f8f8",
                      },
                    ]}
                  >
                    <Text style={[styles.currencyPrefix, { color: colors.textDim }]}>
                      R$
                    </Text>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="0,00"
                      placeholderTextColor={colors.textDim}
                      keyboardType="decimal-pad"
                      value={amount}
                      onChangeText={setAmount}
                    />
                  </View>
                  {errors.amount && (
                    <Text style={[styles.errorText, { color: colors.danger }]}>
                      {errors.amount}
                    </Text>
                  )}
                </View>

                {/* Categoria - Botões em Grade */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Categoria
                  </Text>
                  {errors.category && (
                    <Text style={[styles.errorText, { color: colors.danger }]}>
                      {errors.category}
                    </Text>
                  )}
                  <View style={styles.buttonGrid}>
                    {filteredCategories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryButton,
                          {
                            backgroundColor:
                              selectedCategory?.id === cat.id
                                ? cat.color
                                : `${cat.color}15`,
                            borderColor:
                              selectedCategory?.id === cat.id
                                ? cat.color
                                : `${cat.color}30`,
                          },
                        ]}
                        onPress={() => setSelectedCategory(cat)}
                      >
                        <FontAwesome5
                          name={cat.icon}
                          size={18}
                          color={
                            selectedCategory?.id === cat.id
                              ? "#fff"
                              : cat.color
                          }
                        />
                        <Text
                          style={[
                            styles.categoryButtonText,
                            {
                              color:
                                selectedCategory?.id === cat.id
                                  ? "#fff"
                                  : colors.text,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Conta - Botões em Grade */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {selectedType === "transfer"
                      ? "Conta de Origem"
                      : "Conta"}
                  </Text>
                  {errors.account && (
                    <Text style={[styles.errorText, { color: colors.danger }]}>
                      {errors.account}
                    </Text>
                  )}
                  <View style={styles.buttonGrid}>
                    {accounts.map((acc) => (
                      <TouchableOpacity
                        key={acc.id}
                        style={[
                          styles.accountButton,
                          {
                            backgroundColor:
                              selectedAccount?.id === acc.id
                                ? colors.primary
                                : `${colors.primary}15`,
                            borderColor:
                              selectedAccount?.id === acc.id
                                ? colors.primary
                                : `${colors.primary}30`,
                          },
                        ]}
                        onPress={() => setSelectedAccount(acc)}
                      >
                        <FontAwesome5
                          name="wallet"
                          size={16}
                          color={
                            selectedAccount?.id === acc.id
                              ? "#fff"
                              : colors.primary
                          }
                        />
                        <Text
                          style={[
                            styles.accountButtonLabel,
                            {
                              color:
                                selectedAccount?.id === acc.id
                                  ? "#fff"
                                  : colors.text,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {acc.name}
                        </Text>
                        <Text
                          style={[
                            styles.accountButtonValue,
                            {
                              color:
                                selectedAccount?.id === acc.id
                                  ? "rgba(255,255,255,0.8)"
                                  : colors.textDim,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {formatCurrency(acc.balance, "BRL")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Conta de Destino (Transfer) - Botões em Grade */}
                {selectedType === "transfer" && (
                  <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      Conta de Destino
                    </Text>
                    {errors.toAccount && (
                      <Text style={[styles.errorText, { color: colors.danger }]}>
                        {errors.toAccount}
                      </Text>
                    )}
                    <View style={styles.buttonGrid}>
                      {accounts
                        .filter((a) => a.id !== selectedAccount?.id)
                        .map((acc) => (
                          <TouchableOpacity
                            key={acc.id}
                            style={[
                              styles.accountButton,
                              {
                                backgroundColor:
                                  selectedToAccount?.id === acc.id
                                    ? colors.primary
                                    : `${colors.primary}15`,
                                borderColor:
                                  selectedToAccount?.id === acc.id
                                    ? colors.primary
                                    : `${colors.primary}30`,
                              },
                            ]}
                            onPress={() => setSelectedToAccount(acc)}
                          >
                            <FontAwesome5
                              name="wallet"
                              size={16}
                              color={
                                selectedToAccount?.id === acc.id
                                  ? "#fff"
                                  : colors.primary
                              }
                            />
                            <Text
                              style={[
                                styles.accountButtonLabel,
                                {
                                  color:
                                    selectedToAccount?.id === acc.id
                                      ? "#fff"
                                      : colors.text,
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {acc.name}
                            </Text>
                            <Text
                              style={[
                                styles.accountButtonValue,
                                {
                                  color:
                                    selectedToAccount?.id === acc.id
                                      ? "rgba(255,255,255,0.8)"
                                      : colors.textDim,
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {formatCurrency(acc.balance, "BRL")}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  </View>
                )}

                {/* Data - Botões em Grade */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Data
                  </Text>

                  {/* Ano */}
                  <Text
                    style={[
                      styles.dateSubLabel,
                      { color: colors.textDim },
                    ]}
                  >
                    Ano
                  </Text>
                  <View style={styles.dateGrid}>
                    {YEARS.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.dateButton,
                          {
                            backgroundColor:
                              selectedYear === year
                                ? colors.primary
                                : `${colors.primary}10`,
                            borderColor:
                              selectedYear === year
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() => setSelectedYear(year)}
                      >
                        <Text
                          style={[
                            styles.dateButtonText,
                            {
                              color:
                                selectedYear === year
                                  ? "#fff"
                                  : colors.text,
                            },
                          ]}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Mês */}
                  <Text
                    style={[
                      styles.dateSubLabel,
                      { color: colors.textDim, marginTop: 16 },
                    ]}
                  >
                    Mês
                  </Text>
                  <View style={styles.dateGrid}>
                    {MONTHS.map((month, index) => (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.dateButton,
                          {
                            backgroundColor:
                              selectedMonth === index
                                ? colors.primary
                                : `${colors.primary}10`,
                            borderColor:
                              selectedMonth === index
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() => setSelectedMonth(index)}
                      >
                        <Text
                          style={[
                            styles.dateButtonText,
                            {
                              color:
                                selectedMonth === index
                                  ? "#fff"
                                  : colors.text,
                            },
                          ]}
                        >
                          {month.substring(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Dia */}
                  <Text
                    style={[
                      styles.dateSubLabel,
                      { color: colors.textDim, marginTop: 16 },
                    ]}
                  >
                    Dia
                  </Text>
                  <View style={styles.dayGrid}>
                    {DAYS.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dayButton,
                          {
                            backgroundColor:
                              selectedDay === day
                                ? colors.primary
                                : `${colors.primary}10`,
                            borderColor:
                              selectedDay === day
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() => setSelectedDay(day)}
                      >
                        <Text
                          style={[
                            styles.dayButtonText,
                            {
                              color:
                                selectedDay === day
                                  ? "#fff"
                                  : colors.text,
                            },
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Descrição */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Descrição (Opcional)
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: isDark
                          ? colors.surfaceDark
                          : "#f8f8f8",
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Adicione uma descrição"
                      placeholderTextColor={colors.textDim}
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>

                {/* Botões */}
                <View style={styles.buttons}>
                  <Button
                    title="Cancelar"
                    onPress={onClose}
                    variant="outline"
                    style={styles.button}
                  />
                  <Button
                    title="Salvar"
                    onPress={() => handleSave(false)}
                    style={styles.button}
                  />
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  formContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    borderTopWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.fonts.semibold,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  typeButtonText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  currencyPrefix: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
  },
  errorText: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    marginTop: 4,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    width: "48%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  categoryButtonText: {
    fontSize: 11,
    fontFamily: theme.fonts.medium,
    textAlign: "center",
  },
  accountButton: {
    width: "48%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  accountButtonLabel: {
    fontSize: 11,
    fontFamily: theme.fonts.medium,
    textAlign: "center",
  },
  accountButtonValue: {
    fontSize: 9,
    fontFamily: theme.fonts.regular,
    textAlign: "center",
  },
  dateSubLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    marginBottom: 8,
    marginTop: 12,
  },
  dateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dateButton: {
    width: "22%",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dateButtonText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  dayButton: {
    width: "13%",
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayButtonText: {
    fontSize: 11,
    fontFamily: theme.fonts.semibold,
  },
});
