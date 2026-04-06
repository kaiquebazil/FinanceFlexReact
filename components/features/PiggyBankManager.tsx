// components/features/PiggyBankManager.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../hooks/useData';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PiggyBankProjection } from './PiggyBankProjection';
import type { PiggyBank } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface PiggyBankManagerProps {
  visible: boolean;
  onClose: () => void;
}

const COLORS = [
  '#7c4dff', // primary
  '#00c853', // success
  '#00b0ff', // info
  '#ffab00', // warning
  '#ff3d00', // danger
  '#e91e63', // pink
  '#9c27b0', // purple
  '#3f51b5', // indigo
  '#009688', // teal
  '#ff5722', // deep orange
];

export function PiggyBankManager({ visible, onClose }: PiggyBankManagerProps) {
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const {
    piggyBanks,
    accounts,
    addPiggyBank,
    updatePiggyBank,
    deletePiggyBank,
    depositToPiggyBank,
    withdrawFromPiggyBank,
    valuesHidden,
  } = useData();

  // Estados do formulário principal (criação/edição)
  const [showForm, setShowForm] = useState(false);
  const [editingPiggyBank, setEditingPiggyBank] = useState<PiggyBank | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    selectedColor: COLORS[0],
    selectedAccountId: '',
    targetDate: '',
    monthlyContribution: '',
  });

  // Estados do modal de ação (depósito/retirada)
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionPiggyBank, setActionPiggyBank] = useState<PiggyBank | null>(null);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [actionAmount, setActionAmount] = useState('');
  const [actionAccountId, setActionAccountId] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      selectedColor: COLORS[0],
      selectedAccountId: '',
      targetDate: '',
      monthlyContribution: '',
    });
    setEditingPiggyBank(null);
    setShowForm(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (piggyBank: PiggyBank) => {
    setEditingPiggyBank(piggyBank);
    setFormData({
      name: piggyBank.name,
      targetAmount: piggyBank.targetAmount.toString(),
      currentAmount: piggyBank.currentAmount.toString(),
      selectedColor: piggyBank.color,
      selectedAccountId: piggyBank.accountId || '',
      targetDate: piggyBank.targetDate || '',
      monthlyContribution: piggyBank.monthlyContribution?.toString() || '',
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert(t.attention, t.enterPiggyBankName);
      return;
    }
    const targetAmount = parseFloat(formData.targetAmount.replace(',', '.'));
    if (!targetAmount || targetAmount <= 0) {
      Alert.alert(t.attention, t.enterValidTarget);
      return;
    }

    const currentAmount = parseFloat(formData.currentAmount.replace(',', '.')) || 0;
    const monthlyContribution = formData.monthlyContribution
      ? parseFloat(formData.monthlyContribution.replace(',', '.'))
      : undefined;

    if (editingPiggyBank) {
      updatePiggyBank(editingPiggyBank.id, {
        name: formData.name.trim(),
        targetAmount,
        currentAmount,
        color: formData.selectedColor,
        accountId: formData.selectedAccountId || undefined,
        targetDate: formData.targetDate.trim() || undefined,
        monthlyContribution,
      });
    } else {
      addPiggyBank({
        name: formData.name.trim(),
        targetAmount,
        currentAmount,
        color: formData.selectedColor,
        accountId: formData.selectedAccountId || undefined,
        targetDate: formData.targetDate.trim() || undefined,
        monthlyContribution,
      });
    }
    resetForm();
  };

  const handleDelete = (piggyBank: PiggyBank) => {
    Alert.alert(
      t.delete,
      `${t.deletePiggyBankConfirm} "${piggyBank.name}"?\n\n${t.deletePiggyBankWarning}`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => deletePiggyBank(piggyBank.id),
        },
      ]
    );
  };

  const openActionModal = (piggyBank: PiggyBank, type: 'deposit' | 'withdraw') => {
    setActionPiggyBank(piggyBank);
    setActionType(type);
    setActionAmount('');
    setActionAccountId(accounts.length > 0 ? accounts[0].id : '');
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setActionPiggyBank(null);
    setActionAmount('');
  };

  const handleAction = () => {
    if (!actionPiggyBank || !actionAccountId) return;

    const amount = parseFloat(actionAmount.replace(',', '.'));
    if (!amount || amount <= 0) {
      Alert.alert(t.attention, t.enterValidAmount);
      return;
    }

    if (actionType === 'deposit') {
      depositToPiggyBank(actionPiggyBank.id, actionAccountId, amount);
    } else {
      withdrawFromPiggyBank(actionPiggyBank.id, actionAccountId, amount);
    }
    closeActionModal();
  };

  const formatValue = (value: number) => {
    if (valuesHidden) return '• • • • •';
    return formatCurrency(value, 'BRL');
  };

  const getProgressPercentage = (current: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min((current / target) * 100, 100);
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
            <Text style={[styles.title, { color: colors.text }]}>{t.piggyBanks}</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.textDim} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Formulário de criação/edição */}
            {showForm ? (
              <Card style={styles.formCard}>
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  {editingPiggyBank ? t.editPiggyBank : t.newPiggyBank}
                </Text>

                {/* Nome */}
                <Text style={[styles.fieldLabel, { color: colors.textDim }]}>{t.piggyBankName}</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? colors.dark : colors.surfaceDark,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder={t.piggyBankPlaceholder}
                  placeholderTextColor={colors.textMuted}
                />

                {/* Meta */}
                <Text style={[styles.fieldLabel, { color: colors.textDim }]}>{t.targetAmount} (R$)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? colors.dark : colors.surfaceDark,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={formData.targetAmount}
                  onChangeText={(text) => setFormData({ ...formData, targetAmount: text })}
                  placeholder={language === 'pt-BR' ? '0,00' : '0.00'}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />

                {/* Valor Atual */}
                <Text style={[styles.fieldLabel, { color: colors.textDim }]}>{t.currentAmount} (R$)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? colors.dark : colors.surfaceDark,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={formData.currentAmount}
                  onChangeText={(text) => setFormData({ ...formData, currentAmount: text })}
                  placeholder={language === 'pt-BR' ? '0,00' : '0.00'}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  editable={!editingPiggyBank}
                />

                {/* Contribuição Mensal */}
                <Text style={[styles.fieldLabel, { color: colors.textDim }]}>
                  {t.monthlyContribution} (R$) — {t.monthlyContributionHint}
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
                  value={formData.monthlyContribution}
                  onChangeText={(text) => setFormData({ ...formData, monthlyContribution: text })}
                  placeholder={t.monthlyContributionExample}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />

                {/* Data Alvo */}
                <Text style={[styles.fieldLabel, { color: colors.textDim }]}>{t.targetDateLabel} — {t.monthlyContributionHint}</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? colors.dark : colors.surfaceDark,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={formData.targetDate}
                  onChangeText={(text) => setFormData({ ...formData, targetDate: text })}
                  placeholder={t.targetDatePlaceholder}
                  placeholderTextColor={colors.textMuted}
                />

                {/* Seleção de Cor */}
                <Text style={[styles.fieldLabel, { color: colors.textDim }]}>{t.color}</Text>
                <View style={styles.colorContainer}>
                  {COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        formData.selectedColor === color && styles.colorOptionSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, selectedColor: color })}
                    >
                      {formData.selectedColor === color && (
                        <FontAwesome5 name="check" size={14} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Seleção de Conta */}
                {accounts.length > 0 && (
                  <>
                    <Text style={[styles.fieldLabel, { color: colors.textDim }]}>
                      {t.linkAccountOptional}
                    </Text>
                    <View style={styles.accountContainer}>
                      <TouchableOpacity
                        style={[
                          styles.accountChip,
                          {
                            backgroundColor: !formData.selectedAccountId
                              ? colors.primary
                              : isDark
                              ? colors.dark
                              : colors.surfaceDark,
                            borderColor: !formData.selectedAccountId ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setFormData({ ...formData, selectedAccountId: '' })}
                      >
                        <Text
                          style={[
                            styles.accountChipText,
                            {
                              color: !formData.selectedAccountId ? '#fff' : colors.textDim,
                            },
                          ]}
                        >
                          {t.none}
                        </Text>
                      </TouchableOpacity>
                      {accounts.map((account) => (
                        <TouchableOpacity
                          key={account.id}
                          style={[
                            styles.accountChip,
                            {
                              backgroundColor:
                                formData.selectedAccountId === account.id
                                  ? colors.primary
                                  : isDark
                                  ? colors.dark
                                  : colors.surfaceDark,
                              borderColor:
                                formData.selectedAccountId === account.id
                                  ? colors.primary
                                  : colors.border,
                            },
                          ]}
                          onPress={() =>
                            setFormData({ ...formData, selectedAccountId: account.id })
                          }
                        >
                          <Text
                            style={[
                              styles.accountChipText,
                              {
                                color:
                                  formData.selectedAccountId === account.id
                                    ? '#fff'
                                    : colors.textDim,
                              },
                            ]}
                          >
                            {account.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <View style={styles.formButtons}>
                  <Button title={t.cancel} onPress={resetForm} variant="outline" style={styles.formBtn} />
                  <Button title={t.save} onPress={handleSave} style={styles.formBtn} />
                </View>
              </Card>
            ) : (
              <Button
                title={t.newPiggyBankButton}
                onPress={handleOpenCreate}
                variant="outline"
                style={styles.addButton}
              />
            )}

            {/* Lista de cofrinhos */}
            {piggyBanks.length === 0 && !showForm ? (
              <View style={styles.emptyState}>
                <FontAwesome5 name="piggy-bank" size={40} color={colors.textDim} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.noPiggyBanks}</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textDim }]}>
                  {t.piggyBanksDescription}
                </Text>
              </View>
            ) : (
              <View style={styles.piggyBankList}>
                {piggyBanks.map((piggy) => {
                  const progress = getProgressPercentage(piggy.currentAmount, piggy.targetAmount);

                  return (
                    <Card key={piggy.id} style={styles.piggyBankCard}>
                      {/* Cabeçalho */}
                      <View style={styles.piggyBankHeader}>
                        <View
                          style={[
                            styles.piggyBankIconContainer,
                            { backgroundColor: `${piggy.color}20` },
                          ]}
                        >
                          <FontAwesome5 name="piggy-bank" size={20} color={piggy.color} />
                        </View>
                        <View style={styles.piggyBankInfo}>
                          <Text style={[styles.piggyBankName, { color: colors.text }]}>
                            {piggy.name}
                          </Text>
                          <Text style={[styles.piggyBankAmounts, { color: colors.textDim }]}>
                            {formatValue(piggy.currentAmount)} {t.from} {formatValue(piggy.targetAmount)}
                          </Text>
                        </View>
                        <View style={styles.piggyBankActions}>
                          <TouchableOpacity
                            onPress={() => openActionModal(piggy, 'deposit')}
                            style={styles.actionBtn}
                          >
                            <FontAwesome5 name="plus-circle" size={18} color={colors.success} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => openActionModal(piggy, 'withdraw')}
                            style={styles.actionBtn}
                          >
                            <FontAwesome5 name="minus-circle" size={18} color={colors.warning} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleOpenEdit(piggy)}
                            style={styles.actionBtn}
                          >
                            <FontAwesome5 name="edit" size={16} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDelete(piggy)}
                            style={styles.actionBtn}
                          >
                            <FontAwesome5 name="trash-alt" size={16} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Barra de progresso */}
                      <View
                        style={[
                          styles.progressBarBg,
                          { backgroundColor: isDark ? colors.dark : colors.surfaceDark },
                        ]}
                      >
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${progress}%` as any,
                              backgroundColor: piggy.color,
                            },
                          ]}
                        />
                      </View>

                      {/* Rodapé */}
                      <View style={styles.piggyBankFooter}>
                        <Text style={[styles.progressText, { color: piggy.color }]}>
                          {progress.toFixed(0)}% {t.percentageComplete}
                        </Text>
                      </View>

                      {/* Projeção */}
                      {(piggy.monthlyContribution || piggy.targetDate) && (
                        <View style={[styles.projectionContainer, { borderTopColor: colors.border }]}>
                          <PiggyBankProjection piggyBank={piggy} valuesHidden={valuesHidden} />
                        </View>
                      )}
                    </Card>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Botão Fechar */}
          <Button title={t.close} onPress={onClose} style={styles.closeButton} />
        </View>
      </View>

      {/* Modal de Depósito/Retirada (interno) */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="slide"
        onRequestClose={closeActionModal}
        statusBarTranslucent
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {/* Cabeçalho */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>
                {actionType === 'deposit' ? t.depositAction : t.withdrawAction}
              </Text>
              <TouchableOpacity onPress={closeActionModal}>
                <FontAwesome5 name="times" size={20} color={colors.textDim} />
              </TouchableOpacity>
            </View>

            {actionPiggyBank && (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Info do cofrinho */}
                <View style={[styles.actionInfoCard, { backgroundColor: isDark ? colors.dark : colors.surfaceDark }]}>
                  <FontAwesome5 name="piggy-bank" size={24} color={actionPiggyBank.color} />
                  <View style={styles.actionInfoText}>
                    <Text style={[styles.actionInfoName, { color: colors.text }]}>
                      {actionPiggyBank.name}
                    </Text>
                    <Text style={[styles.actionInfoBalance, { color: colors.textDim }]}>
                      {t.piggyBankBalance}: {formatValue(actionPiggyBank.currentAmount)}
                    </Text>
                  </View>
                </View>

                {/* Seleção de conta */}
                <Text style={[styles.fieldLabel, { color: colors.textDim }]}>{t.account}</Text>
                <View style={styles.accountContainer}>
                  {accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.accountChip,
                        {
                          backgroundColor:
                            actionAccountId === account.id
                              ? colors.primary
                              : isDark
                              ? colors.dark
                              : colors.surfaceDark,
                          borderColor: actionAccountId === account.id ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setActionAccountId(account.id)}
                    >
                      <Text
                        style={[
                          styles.accountChipText,
                          {
                            color: actionAccountId === account.id ? '#fff' : colors.textDim,
                          },
                        ]}
                      >
                        {account.name} ({formatValue(account.balance)})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Valor */}
                <Text style={[styles.fieldLabel, { color: colors.textDim }]}>{t.amountLabel} (R$)</Text>
                <TextInput
                  style={[
                    styles.largeInput,
                    {
                      backgroundColor: isDark ? colors.dark : colors.surfaceDark,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={actionAmount}
                  onChangeText={setActionAmount}
                  placeholder={language === 'pt-BR' ? '0,00' : '0.00'}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  autoFocus
                />

                <View style={styles.formButtons}>
                  <Button
                    title={t.cancel}
                    onPress={closeActionModal}
                    variant="outline"
                    style={styles.formBtn}
                  />
                  <Button
                    title={actionType === 'deposit' ? t.depositAction : t.withdrawAction}
                    onPress={handleAction}
                    style={styles.formBtn}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  accountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  accountChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  accountChipText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
  piggyBankList: {
    gap: 12,
  },
  piggyBankCard: {
    padding: 16,
  },
  piggyBankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  piggyBankIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  piggyBankInfo: {
    flex: 1,
  },
  piggyBankName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  piggyBankAmounts: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  piggyBankActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 8,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  piggyBankFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  projectionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  closeButton: {
    marginTop: 10,
  },
  // Modal de ação
  actionInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  actionInfoText: {
    marginLeft: 12,
  },
  actionInfoName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  actionInfoBalance: {
    fontSize: 13,
    marginTop: 2,
  },
  largeInput: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.input,
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
});
