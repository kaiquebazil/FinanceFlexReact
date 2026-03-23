// components/forms/TransactionForm.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
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

const YEARS = Array.from({ length: 11 }, (_, i) => (2020 + i).toString());
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
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
  const [selectedType, setSelectedType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedToAccount, setSelectedToAccount] = useState<any>(null);

  // Estados de data
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate().toString());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear().toString());

  // Estados para modais de seleção
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showToAccountModal, setShowToAccountModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  // Estados de erro
  const [errors, setErrors] = useState<any>({});

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

  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible, initialType]);

  const filteredCategories = selectedType !== "transfer"
    ? categories.filter((c) => c.type === selectedType)
    : [];

  const handleAmountChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    if (cleanText === "") {
      setAmount("");
      return;
    }
    const numberValue = parseFloat(cleanText) / 100;
    setAmount(numberValue.toFixed(2).replace(".", ","));
  };

  const getFormattedDate = () => {
    return `${selectedDay.padStart(2, "0")}/${(selectedMonth + 1).toString().padStart(2, "0")}/${selectedYear}`;
  };

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

  useEffect(() => {
    const daysInMonth = getDaysInMonth(selectedMonth, parseInt(selectedYear));
    if (parseInt(selectedDay) > daysInMonth) {
      setSelectedDay(daysInMonth.toString());
    }
  }, [selectedMonth, selectedYear]);

  const handleSave = (stayOpen = false) => {
    const newErrors: any = {};
    const amountValue = parseFloat(amount?.replace(",", ".") || "0");
    
    if (!amount || amountValue <= 0) {
      newErrors.amount = "Valor deve ser maior que zero";
    }

    if (selectedType !== "transfer") {
      if (!selectedCategory) newErrors.category = "Selecione uma categoria";
      if (!selectedAccount) newErrors.account = "Selecione uma conta";
      if (selectedType === "expense" && selectedAccount && selectedAccount.balance < amountValue) {
        newErrors.account = `Saldo insuficiente!`;
      }
    } else {
      if (!selectedAccount) newErrors.account = "Selecione a conta de origem";
      if (!selectedToAccount) newErrors.toAccount = "Selecione a conta de destino";
      else if (selectedAccount && selectedToAccount && selectedAccount.id === selectedToAccount.id) {
        newErrors.toAccount = "As contas devem ser diferentes";
      }
      if (selectedAccount && selectedAccount.balance < amountValue) {
        newErrors.account = `Saldo insuficiente!`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedDate = new Date(parseInt(selectedYear), selectedMonth, parseInt(selectedDay), 12, 0, 0);
    const transaction: any = {
      type: selectedType,
      amount: amountValue,
      description: description.trim() || (selectedType === "income" ? "Receita" : selectedType === "expense" ? "Despesa" : "Transferência"),
      date: selectedDate.toISOString(),
    };

    if (selectedType === "transfer") {
      transaction.fromAccountId = selectedAccount.id;
      transaction.toAccountId = selectedToAccount.id;
      transaction.accountId = selectedAccount.id;
      transaction.category = "Transferência";
    } else {
      transaction.category = selectedCategory.name;
      transaction.categoryId = selectedCategory.id;
      transaction.accountId = selectedAccount.id;
    }

    onSave(transaction, stayOpen);
    if (stayOpen) resetForm();
  };

  return (
    <>
      <Modal
        visible={visible}
        onClose={onClose}
        title={selectedType === "income" ? "Nova Receita" : selectedType === "expense" ? "Nova Despesa" : "Nova Transferência"}
      >
        <View style={styles.container}>
          {/* Seletor de Tipo */}
          <View style={styles.typeContainer}>
            {(["income", "expense", "transfer"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  { backgroundColor: isDark ? colors.surfaceDark : '#f0f0f0', borderColor: colors.border },
                  selectedType === type && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setSelectedType(type)}
              >
                <FontAwesome5 
                  name={type === "income" ? "arrow-down" : type === "expense" ? "arrow-up" : "exchange-alt"} 
                  size={14} 
                  color={selectedType === type ? "#fff" : (type === "income" ? colors.success : type === "expense" ? colors.danger : colors.info)} 
                />
                <Text style={[styles.typeButtonText, { color: selectedType === type ? "#fff" : colors.text }]}>
                  {type === "income" ? "Receita" : type === "expense" ? "Despesa" : "Transf."}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Campo Valor */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textDim }]}>Valor</Text>
            <View style={[styles.amountContainer, { backgroundColor: isDark ? colors.surfaceDark : '#f8f8f8', borderColor: errors.amount ? colors.danger : colors.border }]}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>R$</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                placeholder="0,00"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
          </View>

          {/* Descrição */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textDim }]}>Descrição</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.surfaceDark : '#f8f8f8', color: colors.text, borderColor: colors.border }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Aluguel, Salário..."
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Categoria (se não for transferência) */}
          {selectedType !== "transfer" && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textDim }]}>Categoria</Text>
              <TouchableOpacity
                style={[styles.selectButton, { backgroundColor: isDark ? colors.surfaceDark : '#f8f8f8', borderColor: errors.category ? colors.danger : colors.border }]}
                onPress={() => setShowCategoryModal(true)}
              >
                <View style={styles.selectButtonContent}>
                  <FontAwesome5 name={selectedCategory?.icon || "tag"} size={16} color={colors.primary} />
                  <Text style={[styles.selectButtonText, { color: selectedCategory ? colors.text : colors.textMuted }]}>
                    {selectedCategory ? selectedCategory.name : "Selecionar Categoria"}
                  </Text>
                </View>
                <FontAwesome5 name="chevron-down" size={14} color={colors.textDim} />
              </TouchableOpacity>
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>
          )}

          {/* Conta / Conta de Origem */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textDim }]}>
              {selectedType === "transfer" ? "Conta de Origem" : "Conta"}
            </Text>
            <TouchableOpacity
              style={[styles.selectButton, { backgroundColor: isDark ? colors.surfaceDark : '#f8f8f8', borderColor: errors.account ? colors.danger : colors.border }]}
              onPress={() => setShowAccountModal(true)}
            >
              <View style={styles.selectButtonContent}>
                <FontAwesome5 name="university" size={16} color={colors.primary} />
                <View>
                  <Text style={[styles.selectButtonText, { color: selectedAccount ? colors.text : colors.textMuted }]}>
                    {selectedAccount ? selectedAccount.name : "Selecionar Conta"}
                  </Text>
                  {selectedAccount && (
                    <Text style={[styles.selectBalance, { color: colors.textDim }]}>
                      Saldo: {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                    </Text>
                  )}
                </View>
              </View>
              <FontAwesome5 name="chevron-down" size={14} color={colors.textDim} />
            </TouchableOpacity>
            {errors.account && <Text style={styles.errorText}>{errors.account}</Text>}
          </View>

          {/* Conta de Destino (apenas transferência) */}
          {selectedType === "transfer" && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textDim }]}>Conta de Destino</Text>
              <TouchableOpacity
                style={[styles.selectButton, { backgroundColor: isDark ? colors.surfaceDark : '#f8f8f8', borderColor: errors.toAccount ? colors.danger : colors.border }]}
                onPress={() => setShowToAccountModal(true)}
              >
                <View style={styles.selectButtonContent}>
                  <FontAwesome5 name="university" size={16} color={colors.primary} />
                  <View>
                    <Text style={[styles.selectButtonText, { color: selectedToAccount ? colors.text : colors.textMuted }]}>
                      {selectedToAccount ? selectedToAccount.name : "Selecionar Conta"}
                    </Text>
                    {selectedToAccount && (
                      <Text style={[styles.selectBalance, { color: colors.textDim }]}>
                        Saldo: {formatCurrency(selectedToAccount.balance, selectedToAccount.currency)}
                      </Text>
                    )}
                  </View>
                </View>
                <FontAwesome5 name="chevron-down" size={14} color={colors.textDim} />
              </TouchableOpacity>
              {errors.toAccount && <Text style={styles.errorText}>{errors.toAccount}</Text>}
            </View>
          )}

          {/* Data */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textDim }]}>Data</Text>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: isDark ? colors.surfaceDark : '#f8f8f8', borderColor: colors.border }]}
              onPress={() => setShowDateModal(true)}
            >
              <FontAwesome5 name="calendar-alt" size={16} color={colors.primary} />
              <Text style={[styles.dateText, { color: colors.text }]}>{getFormattedDate()}</Text>
              <FontAwesome5 name="chevron-down" size={14} color={colors.textDim} />
            </TouchableOpacity>
          </View>

          {/* Rodapé com Botões */}
          <View style={styles.footer}>
            <Button
              title="Cancelar"
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Salvar"
              onPress={() => handleSave(false)}
              style={styles.saveButton}
            />
          </View>
        </View>
      </Modal>

      {/* Modais de Seleção (Internos) */}
      {/* Estes modais agora são simplificados e usam o Modal.tsx da UI */}
      
      {/* Modal de Categoria */}
      <Modal visible={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Selecionar Categoria">
        {filteredCategories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textDim }]}>Nenhuma categoria encontrada.</Text>
          </View>
        ) : (
          filteredCategories.map(item => (
            <TouchableOpacity key={item.id} style={[styles.selectItem, { borderBottomColor: colors.border }]} onPress={() => { setSelectedCategory(item); setShowCategoryModal(false); setErrors({ ...errors, category: null }); }}>
              <FontAwesome5 name={item.icon || "tag"} size={16} color={colors.primary} />
              <Text style={[styles.selectItemText, { color: colors.text }]}>{item.name}</Text>
            </TouchableOpacity>
          ))
        )}
      </Modal>

      {/* Modal de Conta (Origem) */}
      <Modal visible={showAccountModal} onClose={() => setShowAccountModal(false)} title="Selecionar Conta">
        {accounts.map(item => (
          <TouchableOpacity key={item.id} style={[styles.selectItem, { borderBottomColor: colors.border }]} onPress={() => { setSelectedAccount(item); setShowAccountModal(false); setErrors({ ...errors, account: null }); }}>
            <FontAwesome5 name={item.type === "Dinheiro" ? "money-bill-wave" : "university"} size={16} color={colors.primary} />
            <View style={styles.accountInfo}>
              <Text style={[styles.selectItemText, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.accountBalance, { color: colors.textDim }]}>{formatCurrency(item.balance, item.currency)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Modal>

      {/* Modal de Conta (Destino) */}
      <Modal visible={showToAccountModal} onClose={() => setShowToAccountModal(false)} title="Conta de Destino">
        {accounts.map(item => (
          <TouchableOpacity key={item.id} style={[styles.selectItem, { borderBottomColor: colors.border }]} onPress={() => { setSelectedToAccount(item); setShowToAccountModal(false); setErrors({ ...errors, toAccount: null }); }}>
            <FontAwesome5 name={item.type === "Dinheiro" ? "money-bill-wave" : "university"} size={16} color={colors.primary} />
            <View style={styles.accountInfo}>
              <Text style={[styles.selectItemText, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.accountBalance, { color: colors.textDim }]}>{formatCurrency(item.balance, item.currency)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Modal>

      {/* Modal de Data */}
      <Modal visible={showDateModal} onClose={() => setShowDateModal(false)} title="Selecionar Data">
        <View style={{ paddingBottom: 20 }}>
          <Text style={[styles.label, { marginBottom: 15 }]}>Dia</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {DAYS.map(day => (
              <TouchableOpacity key={day} style={[styles.dateOption, selectedDay === day && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setSelectedDay(day)}>
                <Text style={[styles.dateOptionText, selectedDay === day && { color: "#fff" }]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.label, { marginBottom: 15 }]}>Mês</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {MONTHS.map((month, index) => (
              <TouchableOpacity key={month} style={[styles.dateOption, selectedMonth === index && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setSelectedMonth(index)}>
                <Text style={[styles.dateOptionText, selectedMonth === index && { color: "#fff" }]}>{month}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.label, { marginBottom: 15 }]}>Ano</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {YEARS.map(year => (
              <TouchableOpacity key={year} style={[styles.dateOption, selectedYear === year && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setSelectedYear(year)}>
                <Text style={[styles.dateOptionText, selectedYear === year && { color: "#fff" }]}>{year}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Button title="Confirmar Data" onPress={() => setShowDateModal(false)} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  typeButtonText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
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
    paddingVertical: 12,
    paddingRight: 15,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    fontFamily: "Inter-Regular",
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 11,
    marginTop: 4,
    fontFamily: "Inter-Medium",
  },
  selectButton: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
  },
  selectButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  selectButtonText: {
    fontSize: 15,
    fontFamily: "Inter-Medium",
  },
  selectBalance: {
    fontSize: 11,
    marginTop: 2,
  },
  dateButton: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter-Medium",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    paddingBottom: 10,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  selectItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  selectItemText: {
    fontSize: 15,
    fontFamily: "Inter-Medium",
    flex: 1,
  },
  accountInfo: {
    flex: 1,
  },
  accountBalance: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
  },
  dateOption: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateOptionText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
});
