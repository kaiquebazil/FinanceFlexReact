// components/features/PiggyBankProjection.tsx
/**
 * Exibe a projeção de tempo para atingir a meta de um cofrinho,
 * considerando a contribuição mensal planejada e/ou a data-alvo.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import type { PiggyBank } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface PiggyBankProjectionProps {
  piggyBank: PiggyBank;
  valuesHidden?: boolean;
}

function parseTargetDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  // Aceita DD/MM/AAAA ou ISO
  const parts = raw.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month - 1, day);
    }
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export function PiggyBankProjection({ piggyBank, valuesHidden }: PiggyBankProjectionProps) {
  const { t, language } = useLanguage();
  const { targetAmount, currentAmount, monthlyContribution, targetDate } = piggyBank;
  const remaining = Math.max(targetAmount - currentAmount, 0);
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  const fv = (v: number) => (valuesHidden ? '• • • • •' : formatCurrency(v, 'BRL'));

  // Projeção por contribuição mensal
  let monthsNeeded: number | null = null;
  let projectedDate: Date | null = null;
  if (monthlyContribution && monthlyContribution > 0 && remaining > 0) {
    monthsNeeded = Math.ceil(remaining / monthlyContribution);
    projectedDate = new Date();
    projectedDate.setMonth(projectedDate.getMonth() + monthsNeeded);
  } else if (monthlyContribution && monthlyContribution > 0 && remaining <= 0) {
    monthsNeeded = 0;
  }

  // Projeção por data-alvo
  const targetDateObj = parseTargetDate(targetDate);
  let monthsUntilTarget: number | null = null;
  let requiredMonthly: number | null = null;
  if (targetDateObj) {
    const now = new Date();
    const diffMs = targetDateObj.getTime() - now.getTime();
    monthsUntilTarget = Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30.44)), 0);
    if (monthsUntilTarget > 0 && remaining > 0) {
      requiredMonthly = remaining / monthsUntilTarget;
    } else if (remaining <= 0) {
      requiredMonthly = 0;
    }
  }

  // Nada para exibir
  if (!monthlyContribution && !targetDateObj) return null;

  const formatMonths = (m: number) => {
    if (m === 0) return t.goalReached;
    if (m === 1) return `1 ${t.perMonth}`;
    if (m < 12) return `${m} ${t.monthsPlural}`;
    const years = Math.floor(m / 12);
    const months = m % 12;
    if (months === 0) return `${years} ${years === 1 ? t.yearSingular : t.yearsPlural}`;
    return `${years} ${years === 1 ? t.yearSingular : t.yearsPlural} ${language === 'pt-BR' ? 'e' : 'and'} ${months} ${months === 1 ? t.perMonth : t.monthsPlural}`;
  };

  const formatDateLocalized = (d: Date) =>
    d.toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', { month: 'long', year: 'numeric' });

  const isOnTrack =
    monthsNeeded !== null &&
    targetDateObj !== null &&
    projectedDate !== null &&
    projectedDate <= targetDateObj;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome5 name="chart-line" size={13} color={theme.colors.primary} />
        <Text style={styles.headerText}>{t.projection}</Text>
      </View>

      {/* Projeção por contribuição mensal */}
      {monthlyContribution && monthlyContribution > 0 && (
        <View style={styles.row}>
          <FontAwesome5 name="calendar-check" size={12} color={theme.colors.textDim} />
          <Text style={styles.rowText}>
            {t.withContribution.replace('{amount}', fv(monthlyContribution))}{' '}
            <Text style={styles.highlight}>
              {monthsNeeded !== null ? formatMonths(monthsNeeded) : '—'}
            </Text>
            {projectedDate && monthsNeeded !== null && monthsNeeded > 0 && (
              <Text style={styles.rowTextDim}> ({formatDateLocalized(projectedDate)})</Text>
            )}
          </Text>
        </View>
      )}

      {/* Projeção por data-alvo */}
      {targetDateObj && (
        <View style={styles.row}>
          <FontAwesome5 name="flag-checkered" size={12} color={theme.colors.textDim} />
          <Text style={styles.rowText}>
            {t.goalOnDate.replace('{date}', formatDateLocalized(targetDateObj))}{' '}
            {requiredMonthly !== null ? (
              <Text style={styles.highlight}>
                {requiredMonthly === 0
                  ? t.goalReached
                  : `${fv(requiredMonthly)}${t.perMonthRequired}`}
              </Text>
            ) : (
              <Text style={styles.rowTextDim}>{t.deadlinePassed}</Text>
            )}
          </Text>
        </View>
      )}

      {/* Indicador de alinhamento */}
      {monthlyContribution && monthlyContribution > 0 && targetDateObj && projectedDate && (
        <View style={[styles.statusBadge, { backgroundColor: isOnTrack ? '#1b5e2025' : '#b71c1c25' }]}>
          <FontAwesome5
            name={isOnTrack ? 'check-circle' : 'exclamation-circle'}
            size={12}
            color={isOnTrack ? theme.colors.success : theme.colors.danger}
          />
          <Text style={[styles.statusText, { color: isOnTrack ? theme.colors.success : theme.colors.danger }]}>
            {isOnTrack ? t.onTrack : t.contributionInsufficient}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    padding: 10,
    backgroundColor: 'rgba(124, 77, 255, 0.07)',
    borderRadius: 8,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  headerText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  rowText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    flex: 1,
    flexWrap: 'wrap',
  },
  rowTextDim: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textMuted,
  },
  highlight: {
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 2,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },
});
