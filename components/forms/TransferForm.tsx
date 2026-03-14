// components/forms/TransferForm.tsx
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
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Button } from "../ui/Button";
import { theme } from "../../constants/theme";
import { useData } from "../../hooks/useData";
import { formatCurrency } from "../../utils/currency";

interface TransferFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
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

export function TransferForm({ visible, onClose, onSave }: TransferFormProps) {
  const { accounts } = useData();

  // Estados do formulário
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [fromAccount, setFromAccount] = useState<any>(null);
  const [toAccount, setToAccount] = useState<any>(null);

  // Estados de data
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate().toString());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(
    today.getFullYear().toString(),
  );

  // Estados para modais de seleção
  const [showFromAccountModal, setShowFromAccountModal] = useState(false);
  const [showToAccountModal, setShowToAccountModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  // Estados de erro
  const [errors, setErrors] = useState<any>({});

  // Resetar formulário quando o modal abrir
  useEffect(() => {
    if (visible) {
      const now = new Date();
      setSelectedDay(now.getDate().toString());
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear().toString());
      setAmount("");
      setDescription("");
      setFromAccount(null);
      setToAccount(null);
      setErrors({});
    }
  }, [visible]);

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

    // Validar conta de origem
    if (!fromAccount) {
      newErrors.fromAccount = "Selecione a conta de origem";
    }

    // Validar conta de destino
    if (!toAccount) {
      newErrors.toAccount = "Selecione a conta de destino";
    } else if (fromAccount && toAccount && fromAccount.id === toAccount.id) {
      newErrors.toAccount = "As contas devem ser diferentes";
    }

    // Validar saldo
    if (fromAccount && fromAccount.balance < amountValue) {
      newErrors.fromAccount = `Saldo insuficiente! Saldo: ${formatCurrency(fromAccount.balance, fromAccount.currency)}`;
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

    // Criar objeto da transferência
    const transfer = {
      type: "transfer",
      amount: amountValue,
      description: description.trim() || "Transferência",
      fromAccountId: fromAccount.id,
      fromAccountName: fromAccount.name,
      toAccountId: toAccount.id,
      toAccountName: toAccount.name,
      date: selectedDate.toISOString(),
    };

    onSave(transfer);
  };

  // Cancelar
  const handleCancel = () => {
    onClose();
  };

  // Renderizar item de conta
  const renderAccountItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.selectItem}
      onPress={() => {
        if (showFromAccountModal) {
          setFromAccount(item);
          setShowFromAccountModal(false);
          setErrors({ ...errors, fromAccount: null });
        } else {
          setToAccount(item);
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
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <FontAwesome5
                name="exchange-alt"
                size={20}
                color={theme.colors.info}
              />
              <Text style={styles.title}>Nova Transferência</Text>
            </View>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <FontAwesome5
                name="times"
                size={20}
                color={theme.colors.textDim}
              />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
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
              <Text style={styles.label}>Descrição (opcional)</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Ex: Pagamento, presente, etc"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            {/* Conta de Origem */}
            <View style={styles.field}>
              <Text style={styles.label}>Conta de Origem</Text>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  errors.fromAccount && styles.inputError,
                ]}
                onPress={() => setShowFromAccountModal(true)}
              >
                {fromAccount ? (
                  <View style={styles.selectButtonContent}>
                    <FontAwesome5
                      name={
                        fromAccount.type === "Dinheiro"
                          ? "money-bill-wave"
                          : "university"
                      }
                      size={16}
                      color={theme.colors.primary}
                    />
                    <View>
                      <Text style={styles.selectButtonText}>
                        {fromAccount.name}
                      </Text>
                      <Text style={styles.selectBalance}>
                        {formatCurrency(
                          fromAccount.balance,
                          fromAccount.currency,
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
              {errors.fromAccount && (
                <Text style={styles.errorText}>{errors.fromAccount}</Text>
              )}
            </View>

            {/* Conta de Destino */}
            <View style={styles.field}>
              <Text style={styles.label}>Conta de Destino</Text>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  errors.toAccount && styles.inputError,
                ]}
                onPress={() => setShowToAccountModal(true)}
              >
                {toAccount ? (
                  <View style={styles.selectButtonContent}>
                    <FontAwesome5
                      name={
                        toAccount.type === "Dinheiro"
                          ? "money-bill-wave"
                          : "university"
                      }
                      size={16}
                      color={theme.colors.primary}
                    />
                    <View>
                      <Text style={styles.selectButtonText}>
                        {toAccount.name}
                      </Text>
                      <Text style={styles.selectBalance}>
                        {formatCurrency(toAccount.balance, toAccount.currency)}
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
                title="Transferir"
                onPress={handleSave}
                style={styles.saveButton}
              />
            </View>
          </ScrollView>

          {/* Modal de Seleção de Conta (Origem) */}
          <Modal
            visible={showFromAccountModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowFromAccountModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.selectionModal}>
                <View style={styles.selectionHeader}>
                  <Text style={styles.selectionTitle}>
                    Selecione a conta de origem
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowFromAccountModal(false)}
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
                    data={accounts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAccountItem}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>
            </View>
          </Modal>

          {/* Modal de Seleção de Conta (Destino) */}
          <Modal
            visible={showToAccountModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowToAccountModal(false)}
          >
            <View style={styles.modalOverlay}>
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
                    data={accounts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAccountItem}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>
            </View>
          </Modal>

          {/* Modal de Seleção de Data */}
          <Modal
            visible={showDateModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDateModal(false)}
          >
            <View style={styles.modalOverlay}>
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
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: theme.colors.text,
  },
  closeButton: {
    padding: 5,
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
