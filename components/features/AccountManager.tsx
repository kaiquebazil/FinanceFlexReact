// components/features/AccountManager.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../hooks/useData';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Account, AccountType, Currency } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface AccountManagerProps {
  visible: boolean;
  onClose: () => void;
}

const accountTypes: AccountType[] = ['Dinheiro', 'Banco', 'Crédito', 'Investimento', 'Digital', 'Outro'];
const currencies: Currency[] = ['BRL', 'USD', 'EUR', 'GBP', 'JPY'];

export function AccountManager({ visible, onClose }: AccountManagerProps) {
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const { accounts, addAccount, updateAccount, deleteAccount, valuesHidden } = useData();

  // Formulário de criação/edição
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('Banco');
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [balance, setBalance] = useState('');

  const resetForm = () => {
    setName('');
    setType('Banco');
    setCurrency('BRL');
    setBalance('');
    setEditingAccount(null);
    setShowForm(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (account: Account) => {
    setEditingAccount(account);
    setName(account.name);
    setType(account.type);
    setCurrency(account.currency);
    setBalance(account.balance.toString());
    setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t.attention, t.requiredField);
      return;
    }

    const balanceNum = parseFloat(balance.replace(',', '.')) || 0;

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: name.trim(),
        type,
        currency,
        balance: balanceNum,
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        currency,
        balance: balanceNum,
      });
    }
    resetForm();
  };

  const handleDelete = (account: Account) => {
    Alert.alert(
      t.deleteAccount,
      `${t.confirmDeleteAccount} "${account.name}"?`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => deleteAccount(account.id),
        },
      ],
    );
  };

  const formatValue = (value: number) => {
    if (valuesHidden) return '• • • • •';
    return formatCurrency(value, currency);
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'Dinheiro':
        return 'money-bill-wave';
      case 'Banco':
        return 'university';
      case 'Crédito':
        return 'credit-card';
      case 'Investimento':
        return 'chart-line';
      case 'Digital':
        return 'mobile-alt';
      default:
        return 'wallet';
    }
  };

  const getAccountColor = (type: AccountType) => {
    switch (type) {
      case 'Dinheiro':
        return theme.colors.success;
      case 'Banco':
        return theme.colors.info;
      case 'Crédito':
        return theme.colors.warning;
      case 'Investimento':
        return theme.colors.accent;
      case 'Digital':
        return theme.colors.primary;
      default:
        return colors.textDim;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Cabeçalho */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t.accounts}</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.textDim} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Formulário de criação/edição */}
            {showForm ? (
              <Card style={styles.formCard}>
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  {editingAccount ? t.editAccount : t.addAccount}
                </Text>

                {/* Nome da conta */}
                <Text style={[styles.fieldLabel, { color: colors.textDim }]}>{t.accountName}</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? colors.dark : colors.surfaceDark,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t.accountNamePlaceholder}
                  placeholderTextColor={colors.textMuted}
                />

                {/* Tipo de conta */}
                <Text style={[styles.fieldLabel, { color: colors.textDim }]}>{t.accountType}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.typeScroll}
                >
                  {accountTypes.map((tType) => (
                    <TouchableOpacity
                      key={tType}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor: type === tType ? colors.primary : (isDark ? colors.dark : colors.surfaceDark),
                          borderColor: type === tType ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setType(tType)}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          { color: type === tType ? '#fff' : colors.textDim },
                        ]}
                      >
                        {tType}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Moeda */}
                <Text style={[styles.fieldLabel, { color: colors.textDim }]}>{t.currency}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.currencyScroll}
                >
                  {currencies.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.currencyChip,
                        {
                          backgroundColor: currency === c ? colors.primary : (isDark ? colors.dark : colors.surfaceDark),
                          borderColor: currency === c ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setCurrency(c)}
                    >
                      <Text
                        style={[
                          styles.currencyChipText,
                          { color: currency === c ? '#fff' : colors.textDim },
                        ]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Saldo */}
                <Text style={[styles.fieldLabel, { color: colors.textDim }]}>
                  {editingAccount ? t.currentBalance : t.initialBalance} ({language === 'pt-BR' ? 'R$' : '$'})
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? colors.dark : colors.surfaceDark,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={balance}
                  onChangeText={setBalance}
                  placeholder={language === 'pt-BR' ? '0,00' : '0.00'}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />

                <View style={styles.formButtons}>
                  <Button title={t.cancel} onPress={resetForm} variant="outline" style={styles.formBtn} />
                  <Button title={t.save} onPress={handleSave} style={styles.formBtn} />
                </View>
              </Card>
            ) : (
              <Button
                title={t.addAccount}
                onPress={handleOpenCreate}
                variant="outline"
                style={styles.addButton}
              />
            )}

            {/* Lista de contas */}
            {accounts.length === 0 && !showForm ? (
              <View style={styles.emptyState}>
                <FontAwesome5 name="wallet" size={40} color={colors.textDim} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.noAccounts}</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textDim }]}>
                  {t.addAccountDescription}
                </Text>
              </View>
            ) : (
              <View style={styles.accountList}>
                {accounts.map((account) => {
                  const accountColor = getAccountColor(account.type);
                  const icon = getAccountIcon(account.type);

                  return (
                    <Card key={account.id} style={styles.accountCard}>
                      <View style={styles.accountHeader}>
                        <View style={[styles.accountIconContainer, { backgroundColor: isDark ? colors.dark : colors.surfaceDark }]}>
                          <FontAwesome5
                            name={icon}
                            size={18}
                            color={accountColor}
                          />
                        </View>
                        <View style={styles.accountInfo}>
                          <Text style={[styles.accountName, { color: colors.text }]}>
                            {account.name}
                          </Text>
                          <Text style={[styles.accountType, { color: colors.textDim }]}>
                            {account.type} • {account.currency}
                          </Text>
                        </View>
                        <Text style={[styles.accountBalance, { color: accountColor }]}>
                          {formatValue(account.balance)}
                        </Text>
                      </View>

                      <View style={styles.accountActions}>
                        <TouchableOpacity
                          onPress={() => handleOpenEdit(account)}
                          style={styles.actionBtn}
                        >
                          <FontAwesome5 name="edit" size={14} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDelete(account)}
                          style={styles.actionBtn}
                        >
                          <FontAwesome5 name="trash-alt" size={14} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </Card>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Botão Fechar */}
          <Button
            title={t.close}
            onPress={onClose}
            style={styles.closeButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    marginBottom: 16,
  },
  formCard: {
    marginBottom: 16,
    padding: 16,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  typeScroll: {
    marginBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  typeChipText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  currencyScroll: {
    marginBottom: 16,
  },
  currencyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  currencyChipText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formBtn: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  accountList: {
    gap: 12,
  },
  accountCard: {
    padding: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  accountType: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  accountActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  actionBtn: {
    padding: 8,
  },
  closeButton: {
    marginTop: 10,
  },
});
