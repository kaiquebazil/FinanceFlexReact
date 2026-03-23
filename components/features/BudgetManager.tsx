// components/features/BudgetManager.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../hooks/useData';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Budget, Category } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface BudgetManagerProps {
  onClose: () => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function BudgetManager({ onClose }: BudgetManagerProps) {
  const { colors, isDark } = useTheme();
  const {
    budgets,
    categories,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetProgress,
    valuesHidden,
  } = useData();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Formulário de criação/edição
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');

  // Apenas categorias de despesa
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories],
  );

  // Orçamentos do mês/ano selecionado
  const monthlyBudgets = useMemo(
    () => budgets.filter((b) => b.month === selectedMonth && b.year === selectedYear),
    [budgets, selectedMonth, selectedYear],
  );

  // IDs de categorias já com orçamento no mês selecionado (exceto o que está sendo editado)
  const usedCategoryIds = useMemo(
    () =>
      monthlyBudgets
        .filter((b) => b.id !== editingBudget?.id)
        .map((b) => b.categoryId),
    [monthlyBudgets, editingBudget],
  );

  const availableCategories = useMemo(
    () => expenseCategories.filter((c) => !usedCategoryIds.includes(c.id)),
    [expenseCategories, usedCategoryIds],
  );

  const resetForm = () => {
    setSelectedCategoryId('');
    setLimitAmount('');
    setEditingBudget(null);
    setShowForm(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setSelectedCategoryId(budget.categoryId);
    setLimitAmount(budget.limitAmount.toString());
    setShowForm(true);
  };

  const handleSave = () => {
    if (!selectedCategoryId) {
      Alert.alert('Atenção', 'Selecione uma categoria.');
      return;
    }
    const amount = parseFloat(limitAmount.replace(',', '.'));
    if (!amount || amount <= 0) {
      Alert.alert('Atenção', 'Informe um limite válido maior que zero.');
      return;
    }

    const category = categories.find((c) => c.id === selectedCategoryId);
    if (!category) return;

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        categoryId: category.id,
        categoryName: category.name,
        categoryIcon: category.icon,
        limitAmount: amount,
      });
    } else {
      addBudget({
        categoryId: category.id,
        categoryName: category.name,
        categoryIcon: category.icon,
        limitAmount: amount,
        month: selectedMonth,
        year: selectedYear,
      });
    }
    resetForm();
  };

  const handleDelete = (budget: Budget) => {
    Alert.alert(
      'Excluir Orçamento',
      `Deseja excluir o orçamento de "${budget.categoryName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteBudget(budget.id),
        },
      ],
    );
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const formatValue = (value: number) => {
    if (valuesHidden) return '• • • • •';
    return formatCurrency(value, 'BRL');
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return colors.danger;
    if (percentage >= 80) return colors.warning;
    return colors.success;
  };

  const getAlertBadge = (percentage: number) => {
    if (percentage >= 100) return { label: 'Excedido', color: colors.danger };
    if (percentage >= 80) return { label: 'Atenção', color: colors.warning };
    return null;
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Seletor de mês */}
      <View style={[styles.monthSelector, { backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, borderRadius: 12 }]}>
        <TouchableOpacity onPress={handlePrevMonth} style={[styles.monthArrow, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
          <FontAwesome5 name="chevron-left" size={16} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: colors.text }]}>
          {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={[styles.monthArrow, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
          <FontAwesome5 name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Formulário de criação/edição */}
      {showForm ? (
        <Card style={styles.formCard}>
          <Text style={[styles.formTitle, { color: colors.text }]}>
            {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
          </Text>

          {/* Seleção de categoria */}
          <Text style={[styles.fieldLabel, { color: colors.textDim }]}>Categoria de Despesa</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {(editingBudget
              ? expenseCategories.filter(
                  (c) => c.id === editingBudget.categoryId || !usedCategoryIds.includes(c.id),
                )
              : availableCategories
            ).map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategoryId === cat.id ? colors.primary : (isDark ? colors.dark : colors.surfaceDark),
                    borderColor: selectedCategoryId === cat.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
              >
                <FontAwesome5
                  name={cat.icon}
                  size={14}
                  color={selectedCategoryId === cat.id ? '#fff' : colors.textDim}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: selectedCategoryId === cat.id ? '#fff' : colors.textDim },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Limite */}
          <Text style={[styles.fieldLabel, { color: colors.textDim }]}>Limite Mensal (R$)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? colors.dark : colors.surfaceDark,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={limitAmount}
            onChangeText={setLimitAmount}
            placeholder="0,00"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />

          <View style={styles.formButtons}>
            <Button title="Cancelar" onPress={resetForm} variant="outline" style={styles.formBtn} />
            <Button title="Salvar" onPress={handleSave} style={styles.formBtn} />
          </View>
        </Card>
      ) : (
        <Button
          title="+ Novo Orçamento"
          onPress={handleOpenCreate}
          variant="outline"
          style={styles.addButton}
        />
      )}

      {/* Lista de orçamentos */}
      {monthlyBudgets.length === 0 && !showForm ? (
        <View style={styles.emptyState}>
          <FontAwesome5 name="chart-pie" size={40} color={colors.textDim} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum orçamento definido</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textDim }]}>
            Defina limites de gastos por categoria para controlar suas despesas mensais.
          </Text>
        </View>
      ) : (
        <View style={styles.budgetList}>
          {monthlyBudgets.map((budget) => {
            const { spent, percentage, remaining } = getBudgetProgress(budget);
            const progressColor = getProgressColor(percentage);
            const alert = getAlertBadge(percentage);
            const cappedPct = Math.min(percentage, 100);

            return (
              <Card key={budget.id} style={styles.budgetCard}>
                {/* Cabeçalho do card */}
                <View style={styles.budgetHeader}>
                  <View style={[styles.budgetIconContainer, { backgroundColor: isDark ? colors.dark : colors.surfaceDark }]}>
                    <FontAwesome5
                      name={budget.categoryIcon}
                      size={18}
                      color={progressColor}
                    />
                  </View>
                  <View style={styles.budgetInfo}>
                    <View style={styles.budgetTitleRow}>
                      <Text style={[styles.budgetCategoryName, { color: colors.text }]}>{budget.categoryName}</Text>
                      {alert && (
                        <View style={[styles.alertBadge, { backgroundColor: alert.color + '25' }]}>
                          <Text style={[styles.alertBadgeText, { color: alert.color }]}>
                            {alert.label}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.budgetAmounts, { color: colors.textDim }]}>
                      {formatValue(spent)} de {formatValue(budget.limitAmount)}
                    </Text>
                  </View>
                  <View style={styles.budgetActions}>
                    <TouchableOpacity
                      onPress={() => handleOpenEdit(budget)}
                      style={styles.actionBtn}
                    >
                      <FontAwesome5 name="edit" size={14} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(budget)}
                      style={styles.actionBtn}
                    >
                      <FontAwesome5 name="trash-alt" size={14} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Barra de progresso */}
                <View style={[styles.progressBarBg, { backgroundColor: isDark ? colors.dark : colors.surfaceDark }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${cappedPct}%` as any,
                        backgroundColor: progressColor,
                      },
                    ]}
                  />
                </View>

                {/* Rodapé: percentual e saldo restante */}
                <View style={styles.budgetFooter}>
                  <Text style={[styles.percentageText, { color: progressColor }]}>
                    {percentage.toFixed(0)}% utilizado
                  </Text>
                  <Text
                    style={[
                      styles.remainingText,
                      { color: remaining >= 0 ? colors.textDim : colors.danger },
                    ]}
                  >
                    {remaining >= 0
                      ? `Restam ${formatValue(remaining)}`
                      : `Excedido em ${formatValue(Math.abs(remaining))}`}
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 12,
    gap: 16,
  },
  monthArrow: {
    padding: 8,
    borderRadius: 20,
  },
  monthLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    minWidth: 160,
    textAlign: 'center',
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
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  input: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
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
  budgetList: {
    gap: 12,
  },
  budgetCard: {
    padding: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  budgetCategoryName: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  alertBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },
  budgetAmounts: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  budgetActions: {
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
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  remainingText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});
