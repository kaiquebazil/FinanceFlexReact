// components/features/CalendarModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Transaction, RecurringBill } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: Transaction[];
  recurringBills: RecurringBill[];
  accounts: any[];
}

export function CalendarModal({
  visible,
  onClose,
  transactions,
  recurringBills,
  accounts,
}: CalendarModalProps) {
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const getDaysInMonth = () => {
    const date = new Date(currentYear, currentMonth, 1);
    const days = [];
    const firstDay = date.getDay();

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    while (date.getMonth() === currentMonth) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    return days;
  };

  const hasTransactionOnDay = (day: Date | null) => {
    if (!day) return false;
    return transactions.some((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getDate() === day.getDate() &&
        tDate.getMonth() === day.getMonth() &&
        tDate.getFullYear() === day.getFullYear()
      );
    });
  };

  const isToday = (day: Date | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: Date | null) => {
    if (!day || !selectedDate) return false;
    return (
      day.getDate() === selectedDate.getDate() &&
      day.getMonth() === selectedDate.getMonth() &&
      day.getFullYear() === selectedDate.getFullYear()
    );
  };

  const getTransactionsForSelectedDate = () => {
    if (!selectedDate) return [];

    return transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getDate() === selectedDate.getDate() &&
          tDate.getMonth() === selectedDate.getMonth() &&
          tDate.getFullYear() === selectedDate.getFullYear()
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = t.months;
  const dayNames = t.dayNames;

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || t.unknownAccount;
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'income':
        return 'arrow-down';
      case 'expense':
        return 'arrow-up';
      case 'transfer':
        return 'exchange-alt';
      default:
        return 'circle';
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'income':
        return colors.success;
      case 'expense':
        return colors.danger;
      case 'transfer':
        return colors.info;
      default:
        return colors.textDim;
    }
  };

  const filteredTransactions = getTransactionsForSelectedDate();
  const selectedDateString = selectedDate
    ? selectedDate.toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Cabeçalho */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t.calendarTitle}</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5
                name="times"
                size={20}
                color={colors.textDim}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
          >
            {/* Seção do Calendário */}
            <View style={[styles.calendarSection, { borderBottomColor: colors.border }]}>
              {/* Navegação de Mês */}
              <View style={styles.monthNavigation}>
                <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
                  <FontAwesome5
                    name="chevron-left"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <Text style={[styles.monthText, { color: colors.text }]}>
                  {monthNames[currentMonth]} {currentYear}
                </Text>
                <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
                  <FontAwesome5
                    name="chevron-right"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Dias da Semana */}
              <View style={styles.weekDays}>
                {dayNames.map((day) => (
                  <Text key={day} style={[styles.weekDay, { color: colors.textDim }]}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Dias do Mês */}
              <View style={styles.days}>
                {getDaysInMonth().map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dayCell}
                    onPress={() => day && setSelectedDate(day)}
                    disabled={!day}
                  >
                    {day && (
                      <View
                        style={[
                          styles.day,
                          isToday(day) && styles.today,
                          isSelected(day) && styles.selected,
                          hasTransactionOnDay(day) &&
                            !isSelected(day) &&
                            styles.hasTransaction,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            { color: colors.text },
                            (isToday(day) || isSelected(day)) &&
                              styles.selectedDayText,
                          ]}
                        >
                          {day.getDate()}
                        </Text>
                        {hasTransactionOnDay(day) && (
                          <View style={styles.transactionIndicator} />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Seção de Transações */}
            <View style={styles.transactionsSection}>
              <Text style={[styles.transactionsSectionTitle, { color: colors.text }]}>
                {t.transactionsOfDay}
              </Text>
              {selectedDate && (
                <Text style={[styles.selectedDateText, { color: colors.textDim }]}>{selectedDateString}</Text>
              )}

              {filteredTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <FontAwesome5
                    name="calendar-times"
                    size={32}
                    color={colors.textDim}
                  />
                  <Text style={[styles.emptyText, { color: colors.textDim }]}>
                    {t.noTransactionsOnDay}
                  </Text>
                </View>
              ) : (
                <View style={[styles.transactionsList, { backgroundColor: colors.surfaceDark }]}>
                  {filteredTransactions.map((transaction) => {
                    const icon = getIconForType(transaction.type);
                    const color = getColorForType(transaction.type);

                    return (
                      <View
                        key={transaction.id}
                        style={[styles.transactionItem, { borderBottomColor: colors.border }]}
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
                          <Text style={[styles.transactionName, { color: colors.text }]}>
                            {transaction.description ||
                              (transaction.type === 'income'
                                ? t.incomeType
                                : transaction.type === 'expense'
                                  ? t.expenseType
                                  : t.transferType)}
                          </Text>
                          <Text style={[styles.transactionDetails, { color: colors.textDim }]}>
                            {transaction.category} •{' '}
                            {getAccountName(transaction.accountId)}
                          </Text>
                        </View>
                        <Text style={[styles.transactionAmount, { color }]}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount, 'BRL')}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.fonts.semibold,
  },
  calendarSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    paddingVertical: 8,
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  dayText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
  },
  today: {
    backgroundColor: theme.colors.primary,
  },
  selected: {
    backgroundColor: theme.colors.secondary,
  },
  selectedDayText: {
    color: '#121212',
    fontFamily: theme.fonts.bold,
  },
  hasTransaction: {
    borderWidth: 2,
    borderColor: theme.colors.success,
  },
  transactionIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.success,
  },
  transactionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  transactionsSectionTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.semibold,
    marginBottom: 4,
  },
  selectedDateText: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
  },
  transactionsList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontFamily: theme.fonts.medium,
  },
  transactionDetails: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontFamily: theme.fonts.semibold,
  },
});
