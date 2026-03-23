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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
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

  // Renderizar item de categoria
  const renderCategoryItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.selectItem, { borderBottomColor: colors.border }]}
      onPress={() => {
        setSelectedCategory(item);
        setShowCategoryModal(false);
      }}
    >
      <View style={styles.selectItemLeft}>
        <View
          style={[
            styles.selectItemIcon,
            { backgroundColor: `${item.color}20` },
          ]}
        >
          <FontAwesome5 name={item.icon} size={16} color={item.color} />
        </View>
        <Text style={[styles.selectItemText, { color: colors.text }]}>
          {item.name}
        </Text>
      </View>
      {selectedCategory?.id === item.id && (
        <FontAwesome5 name="check" size={16} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  // Renderizar item de conta
  const renderAccountItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.selectItem, { borderBottomColor: colors.border }]}
      onPress={() => {
        if (showAccountModal) {
          setSelectedAccount(item);
          setShowAccountModal(false);
        } else {
          setSelectedToAccount(item);
          setShowToAccountModal(false);
        }
      }}
    >
      <View style={styles.selectItemLeft}>
        <View
          style={[
            styles.selectItemIcon,
            { backgroundColor: `${colors.primary}20` },
          ]}
        >
          <FontAwesome5 name="wallet" size={16} color={colors.primary} />
        </View>
        <View style={styles.accountInfo}>
          <Text style={[styles.selectItemText, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.accountBalance, { color: colors.textDim }]}>
            {formatCurrency(item.balance, "BRL")}
          </Text>
        </View>
      </View>
      {(selectedAccount?.id === item.id || selectedToAccount?.id === item.id) && (
        <FontAwesome5 name="check" size={16} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
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

                  {/* Categoria */}
                  <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      Categoria
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.selectButton,
                        {
                          borderColor: errors.category
                            ? colors.danger
                            : colors.border,
                          backgroundColor: isDark
                            ? colors.surfaceDark
                            : "#f8f8f8",
                        },
                      ]}
                      onPress={() => setShowCategoryModal(true)}
                    >
                      {selectedCategory ? (
                        <View style={styles.selectButtonContent}>
                          <View
                            style={[
                              styles.selectButtonIcon,
                              {
                                backgroundColor: `${selectedCategory.color}20`,
                              },
                            ]}
                          >
                            <FontAwesome5
                              name={selectedCategory.icon}
                              size={14}
                              color={selectedCategory.color}
                            />
                          </View>
                          <Text
                            style={[
                              styles.selectButtonText,
                              { color: colors.text },
                            ]}
                          >
                            {selectedCategory.name}
                          </Text>
                        </View>
                      ) : (
                        <Text
                          style={[
                            styles.selectButtonPlaceholder,
                            { color: colors.textDim },
                          ]}
                        >
                          Selecione uma categoria
                        </Text>
                      )}
                      <FontAwesome5
                        name="chevron-down"
                        size={14}
                        color={colors.textDim}
                      />
                    </TouchableOpacity>
                    {errors.category && (
                      <Text style={[styles.errorText, { color: colors.danger }]}>
                        {errors.category}
                      </Text>
                    )}
                  </View>

                  {/* Conta */}
                  <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      {selectedType === "transfer"
                        ? "Conta de Origem"
                        : "Conta"}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.selectButton,
                        {
                          borderColor: errors.account
                            ? colors.danger
                            : colors.border,
                          backgroundColor: isDark
                            ? colors.surfaceDark
                            : "#f8f8f8",
                        },
                      ]}
                      onPress={() => setShowAccountModal(true)}
                    >
                      {selectedAccount ? (
                        <View style={styles.selectButtonContent}>
                          <View
                            style={[
                              styles.selectButtonIcon,
                              {
                                backgroundColor: `${colors.primary}20`,
                              },
                            ]}
                          >
                            <FontAwesome5
                              name="wallet"
                              size={14}
                              color={colors.primary}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.selectButtonText,
                                { color: colors.text },
                              ]}
                            >
                              {selectedAccount.name}
                            </Text>
                            <Text
                              style={[
                                styles.selectButtonSubtext,
                                { color: colors.textDim },
                              ]}
                            >
                              {formatCurrency(selectedAccount.balance, "BRL")}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <Text
                          style={[
                            styles.selectButtonPlaceholder,
                            { color: colors.textDim },
                          ]}
                        >
                          Selecione uma conta
                        </Text>
                      )}
                      <FontAwesome5
                        name="chevron-down"
                        size={14}
                        color={colors.textDim}
                      />
                    </TouchableOpacity>
                    {errors.account && (
                      <Text style={[styles.errorText, { color: colors.danger }]}>
                        {errors.account}
                      </Text>
                    )}
                  </View>

                  {/* Conta de Destino (Transfer) */}
                  {selectedType === "transfer" && (
                    <View style={styles.section}>
                      <Text style={[styles.label, { color: colors.text }]}>
                        Conta de Destino
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.selectButton,
                          {
                            borderColor: errors.toAccount
                              ? colors.danger
                              : colors.border,
                            backgroundColor: isDark
                              ? colors.surfaceDark
                              : "#f8f8f8",
                          },
                        ]}
                        onPress={() => setShowToAccountModal(true)}
                      >
                        {selectedToAccount ? (
                          <View style={styles.selectButtonContent}>
                            <View
                              style={[
                                styles.selectButtonIcon,
                                {
                                  backgroundColor: `${colors.primary}20`,
                                },
                              ]}
                            >
                              <FontAwesome5
                                name="wallet"
                                size={14}
                                color={colors.primary}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.selectButtonText,
                                  { color: colors.text },
                                ]}
                              >
                                {selectedToAccount.name}
                              </Text>
                              <Text
                                style={[
                                  styles.selectButtonSubtext,
                                  { color: colors.textDim },
                                ]}
                              >
                                {formatCurrency(selectedToAccount.balance, "BRL")}
                              </Text>
                            </View>
                          </View>
                        ) : (
                          <Text
                            style={[
                              styles.selectButtonPlaceholder,
                              { color: colors.textDim },
                            ]}
                          >
                            Selecione a conta de destino
                          </Text>
                        )}
                        <FontAwesome5
                          name="chevron-down"
                          size={14}
                          color={colors.textDim}
                        />
                      </TouchableOpacity>
                      {errors.toAccount && (
                        <Text
                          style={[styles.errorText, { color: colors.danger }]}
                        >
                          {errors.toAccount}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Data */}
                  <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      Data
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.selectButton,
                        { backgroundColor: isDark ? colors.surfaceDark : "#f8f8f8", borderColor: colors.border },
                      ]}
                      onPress={() => setShowDateModal(true)}
                    >
                      <Text style={[styles.selectButtonText, { color: colors.text }]}>
                        {selectedDay}/{String(selectedMonth + 1).padStart(2, "0")}/{selectedYear}
                      </Text>
                      <FontAwesome5
                        name="calendar"
                        size={14}
                        color={colors.textDim}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Descrição */}
                  <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      Descrição (Opcional)
                    </Text>
                    <View
                      style={[
                        styles.inputContainer,
                        { backgroundColor: isDark ? colors.surfaceDark : "#f8f8f8", borderColor: colors.border },
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

      {/* Modal de Seleção de Categoria */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
          <View
            style={[
              styles.bottomSheetOverlay,
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
                  styles.selectionModal,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View
                  style={[
                    styles.selectionHeader,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <Text
                    style={[styles.selectionTitle, { color: colors.text }]}
                  >
                    Selecione uma categoria
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCategoryModal(false)}
                  >
                    <FontAwesome5
                      name="times"
                      size={20}
                      color={colors.textDim}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.selectionContent}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredCategories.length === 0 ? (
                    <View style={styles.emptyState}>
                      <FontAwesome5
                        name="tags"
                        size={40}
                        color={colors.textDim}
                      />
                      <Text
                        style={[
                          styles.emptyText,
                          { color: colors.textDim },
                        ]}
                      >
                        Nenhuma categoria encontrada
                      </Text>
                    </View>
                  ) : (
                    filteredCategories.map((item) =>
                      renderCategoryItem({ item }),
                    )
                  )}
                </ScrollView>
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
          <View
            style={[
              styles.bottomSheetOverlay,
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
                  styles.selectionModal,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View
                  style={[
                    styles.selectionHeader,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <Text
                    style={[styles.selectionTitle, { color: colors.text }]}
                  >
                    {selectedType === "transfer"
                      ? "Selecione a conta de origem"
                      : "Selecione uma conta"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowAccountModal(false)}
                  >
                    <FontAwesome5
                      name="times"
                      size={20}
                      color={colors.textDim}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.selectionContent}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {accounts.length === 0 ? (
                    <View style={styles.emptyState}>
                      <FontAwesome5
                        name="wallet"
                        size={40}
                        color={colors.textDim}
                      />
                      <Text
                        style={[
                          styles.emptyText,
                          { color: colors.textDim },
                        ]}
                      >
                        Nenhuma conta encontrada
                      </Text>
                    </View>
                  ) : (
                    accounts.map((item) => renderAccountItem({ item }))
                  )}
                </ScrollView>
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
          <View
            style={[
              styles.bottomSheetOverlay,
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
                  styles.selectionModal,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View
                  style={[
                    styles.selectionHeader,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <Text
                    style={[styles.selectionTitle, { color: colors.text }]}
                  >
                    Selecione a conta de destino
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowToAccountModal(false)}
                  >
                    <FontAwesome5
                      name="times"
                      size={20}
                      color={colors.textDim}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.selectionContent}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {accounts.filter((a) => a.id !== selectedAccount?.id)
                    .length === 0 ? (
                    <View style={styles.emptyState}>
                      <FontAwesome5
                        name="wallet"
                        size={40}
                        color={colors.textDim}
                      />
                      <Text
                        style={[
                          styles.emptyText,
                          { color: colors.textDim },
                        ]}
                      >
                        Nenhuma conta encontrada
                      </Text>
                    </View>
                  ) : (
                    accounts
                      .filter((a) => a.id !== selectedAccount?.id)
                      .map((item) => renderAccountItem({ item }))
                  )}
                </ScrollView>
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
          <View
            style={[
              styles.bottomSheetOverlay,
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
                  styles.dateModal,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View
                  style={[
                    styles.selectionHeader,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <Text
                    style={[styles.selectionTitle, { color: colors.text }]}
                  >
                    Selecione a data
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDateModal(false)}
                  >
                    <FontAwesome5
                      name="times"
                      size={20}
                      color={colors.textDim}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.dateContent}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Ano */}
                  <Text
                    style={[styles.dateLabel, { color: colors.text }]}
                  >
                    Ano
                  </Text>
                  <View style={styles.dateGrid}>
                    {YEARS.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.dateItem,
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
                            styles.dateItemText,
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
                      styles.dateLabel,
                      { color: colors.text, marginTop: 20 },
                    ]}
                  >
                    Mês
                  </Text>
                  <View style={styles.dateGrid}>
                    {MONTHS.map((month, index) => (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.dateItem,
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
                            styles.dateItemText,
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
                      styles.dateLabel,
                      { color: colors.text, marginTop: 20 },
                    ]}
                  >
                    Dia
                  </Text>
                  <View style={styles.dateGrid}>
                    {DAYS.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dateItem,
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
                            styles.dateItemText,
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
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    marginBottom: 8,
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
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  selectButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  selectButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
  },
  selectButtonSubtext: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    marginTop: 2,
  },
  selectButtonPlaceholder: {
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
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  selectionModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    borderTopWidth: 1,
  },
  selectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  selectionTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
  },
  selectionContent: {
    flex: 1,
  },
  selectItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  selectItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  selectItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  selectItemText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
  },
  accountInfo: {
    flex: 1,
  },
  accountBalance: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    marginTop: 12,
  },
  dateModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    borderTopWidth: 1,
  },
  dateContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    marginBottom: 8,
  },
  dateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dateItem: {
    width: "23%",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dateItemText: {
    fontSize: 12,
    fontFamily: theme.fonts.semibold,
  },
});
