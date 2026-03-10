import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/currency';
import type { Invoice, CreditCardTransaction } from '../../types';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onClose: () => void;
}

export function InvoiceDetails({ invoice, onClose }: InvoiceDetailsProps) {
  const { creditCardTransactions, creditCards, payInvoice } = useData();

  const creditCard = creditCards.find(c => c.id === invoice.creditCardId);
  const transactions = creditCardTransactions.filter((t: CreditCardTransaction) => invoice.transactions.includes(t.id));

  // Agrupar por categoria
  const categories = useMemo(() => {
    const cats: { [key: string]: number } = {};
    transactions.forEach((t: CreditCardTransaction) => {
      cats[t.category] = (cats[t.category] || 0) + (t.installmentAmount * t.installments);
    });
    return cats;
  }, [transactions]);

  // Calcular próximo vencimento
  const nextDueDate = new Date(invoice.dueDate);
  const daysUntilDue = Math.ceil((nextDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho */}
      <TouchableOpacity onPress={onClose} style={styles.backButton}>
        <FontAwesome5 name="arrow-left" size={20} color={theme.colors.text} />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      {/* Status da Fatura */}
      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { 
              backgroundColor: 
                invoice.status === 'paid' ? theme.colors.success :
                invoice.status === 'overdue' ? theme.colors.danger :
                invoice.status === 'open' ? theme.colors.warning :
                theme.colors.info
            }]} />
            <Text style={styles.statusText}>
              {invoice.status === 'paid' ? 'Paga' :
               invoice.status === 'overdue' ? 'Vencida' :
               invoice.status === 'open' ? 'Em aberto' :
               'Futura'}
            </Text>
          </View>
          
          {invoice.status === 'paid' && invoice.paidAt && (
            <Text style={styles.paidDate}>
              Paga em {new Date(invoice.paidAt).toLocaleDateString('pt-BR')}
            </Text>
          )}
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Valor Total</Text>
          <Text style={[
            styles.amountValue,
            invoice.status === 'paid' && { color: theme.colors.success }
          ]}>
            {formatCurrency(invoice.totalAmount, 'BRL')}
          </Text>
        </View>

        {invoice.status !== 'paid' && (
          <View style={styles.dueInfo}>
            <FontAwesome5 
              name={daysUntilDue < 0 ? 'exclamation-circle' : 'clock'} 
              size={16} 
              color={daysUntilDue < 0 ? theme.colors.danger : theme.colors.warning} 
            />
            <Text style={[
              styles.dueText,
              { color: daysUntilDue < 0 ? theme.colors.danger : theme.colors.warning }
            ]}>
              {daysUntilDue < 0 
                ? `Vencida há ${Math.abs(daysUntilDue)} dias` 
                : daysUntilDue === 0 
                  ? 'Vence hoje' 
                  : `Vence em ${daysUntilDue} dias`}
            </Text>
          </View>
        )}

        {invoice.status === 'open' && creditCard && (
          <Button
            title="Pagar Fatura"
            icon="check-circle"
            onPress={() => {
              // Implementar pagamento
              // payInvoice(invoice.id, accountId, invoice.totalAmount);
            }}
            style={styles.payButton}
          />
        )}
      </Card>

      {/* Resumo por Categoria */}
      <Card style={styles.categoriesCard}>
        <Text style={styles.cardTitle}>Gastos por Categoria</Text>
        {Object.entries(categories).map(([category, amount]) => (
          <View key={category} style={styles.categoryRow}>
            <Text style={styles.categoryName}>{category}</Text>
            <Text style={styles.categoryAmount}>{formatCurrency(amount, 'BRL')}</Text>
          </View>
        ))}
      </Card>

      {/* Lista de Transações */}
      <Card style={styles.transactionsCard}>
        <Text style={styles.cardTitle}>Detalhamento</Text>
        {transactions.map((transaction: CreditCardTransaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionMain}>
              <Text style={styles.transactionDesc}>{transaction.description}</Text>
              <Text style={styles.transactionAmount}>
                {formatCurrency(transaction.installmentAmount, 'BRL')}
              </Text>
            </View>
            
            <View style={styles.transactionDetails}>
              {transaction.installments > 1 && (
                <Text style={styles.transactionInstallment}>
                  {transaction.currentInstallment}/{transaction.installments}
                </Text>
              )}
              <Text style={styles.transactionCategory}>{transaction.category}</Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.date).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  statusCard: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.darkLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  paidDate: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  dueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dueText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  payButton: {
    marginTop: 8,
  },
  categoriesCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text,
  },
  categoryAmount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  transactionsCard: {
    marginBottom: 20,
  },
  transactionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  transactionMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  transactionAmount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  transactionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionInstallment: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  transactionCategory: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
  },
  transactionDate: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
  },
});