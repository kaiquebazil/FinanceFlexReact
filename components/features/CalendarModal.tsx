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

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || 'Conta desconhecida';
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
        return theme.colors.success;
      case 'expense':
        return theme.colors.danger;
      case 'transfer':
        return theme.colors.info;
      default:
        return theme.colors.textDim;
    }
  };

  const filteredTransactions = getTransactionsForSelectedDate();
  const selectedDateString = selectedDate
    ? selectedDate.toLocaleDateString('pt-BR', {
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={styles.title}>Calendário de Transações</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5
                name="times"
                size={20}
                color={theme.colors.textDim}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
          >
            {/* Seção do Calendário */}
            <View style={styles.calendarSection}>
              {/* Navegação de Mês */}
              <View style={styles.monthNavigation}>
                <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
                  <FontAwesome5
                    name="chevron-left"
                    size={16}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
                <Text style={styles.monthText}>
                  {monthNames[currentMonth]} {currentYear}
                </Text>
                <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
                  <FontAwesome5
                    name="chevron-right"
                    size={16}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Dias da Semana */}
              <View style={styles.weekDays}>
                {dayNames.map((day) => (
                  <Text key={day} style={styles.weekDay}>
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
              <Text style={styles.transactionsSectionTitle}>
                Transações do dia
              </Text>
              {selectedDate && (
                <Text style={styles.selectedDateText}>{selectedDateString}</Text>
              )}

              {filteredTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <FontAwesome5
                    name="calendar-times"
                    size={32}
                    color={theme.colors.textDim}
                  />
                  <Text style={styles.emptyText}>
                    Nenhuma transação neste dia
                  </Text>
                </View>
              ) : (
                <View style={styles.transactionsList}>
                  {filteredTransactions.map((transaction) => {
                    const icon = getIconForType(transaction.type);
                    const color = getColorForType(transaction.type);

                    return (
                      <View
                        key={transaction.id}
                        style={styles.transactionItem}
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
                          <Text style={styles.transactionName}>
                            {transaction.description ||
                              (transaction.type === 'income'
                                ? 'Receita'
                                : transaction.type === 'expense'
                                  ? 'Despesa'
                                  : 'Transferência')}
                          </Text>
                          <Text style={styles.transactionDetails}>
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
    backgroundColor: theme.colors.dark,
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
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  calendarSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
    color: theme.colors.text,
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
    color: theme.colors.textDim,
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
    color: theme.colors.text,
  },
  today: {
    backgroundColor: theme.colors.primary,
  },
  selected: {
    backgroundColor: theme.colors.secondary,
  },
  selectedDayText: {
    color: theme.colors.dark,
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
    color: theme.colors.text,
    marginBottom: 4,
  },
  selectedDateText: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textDim,
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
    color: theme.colors.textDim,
  },
  transactionsList: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
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
    color: theme.colors.text,
  },
  transactionDetails: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textDim,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontFamily: theme.fonts.semibold,
  },
});
