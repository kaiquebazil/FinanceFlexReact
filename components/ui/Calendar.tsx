import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Transaction, RecurringBill } from '../../types';

interface CalendarProps {
  transactions: Transaction[];
  recurringBills: RecurringBill[];
}

export function Calendar({ transactions, recurringBills }: CalendarProps) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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
    return transactions.some(t => {
      const tDate = new Date(t.date);
      return tDate.getDate() === day.getDate() && 
             tDate.getMonth() === day.getMonth() && 
             tDate.getFullYear() === day.getFullYear();
    });
  };

  const isToday = (day: Date | null) => {
    if (!day) return false;
    const today = new Date();
    return day.getDate() === today.getDate() && 
           day.getMonth() === today.getMonth() && 
           day.getFullYear() === today.getFullYear();
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
          <FontAwesome5 name="chevron-left" size={16} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: colors.text }]}>{monthNames[currentMonth]} {currentYear}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <FontAwesome5 name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.weekDays}>
        {dayNames.map(day => (
          <Text key={day} style={[styles.weekDay, { color: colors.textDim }]}>{day}</Text>
        ))}
      </View>
      <View style={styles.days}>
        {getDaysInMonth().map((day, index) => (
          <View key={index} style={styles.dayCell}>
            {day && (
              <View style={[styles.day, isToday(day) && styles.today, hasTransactionOnDay(day) && styles.hasTransaction]}>
                <Text style={[
                  styles.dayText,
                  { color: colors.text },
                  isToday(day) && styles.todayText,
                ]}>
                  {day.getDate()}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  monthText: { fontSize: 16, fontFamily: 'Inter-SemiBold' },
  navButton: { padding: 8 },
  weekDays: { flexDirection: 'row', marginBottom: 10 },
  weekDay: { flex: 1, textAlign: 'center', fontSize: 12, fontFamily: 'Inter-Medium' },
  days: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, padding: 2 },
  day: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  dayText: { fontSize: 14, fontFamily: 'Inter-Regular' },
  today: { backgroundColor: theme.colors.primary },
  todayText: { color: '#fff', fontFamily: 'Inter-Bold' },
  hasTransaction: { borderWidth: 2, borderColor: theme.colors.success },
});
