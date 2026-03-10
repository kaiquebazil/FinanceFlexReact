import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/currency';
import { CreditCardForm } from '../forms/CreditCardForm';
import { CreditCardTransactions } from '../../components/features/CreditCardTransactions';
import { InvoiceDetails } from '../../components/features/InvoiceDetails';
import type { CreditCard, Invoice } from '../../types';

interface CreditCardDashboardProps {
  onClose: () => void;
}

export function CreditCardDashboard({ onClose }: CreditCardDashboardProps) {
  const { creditCards, invoices } = useData();
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showInvoice, setShowInvoice] = useState<Invoice | null>(null);

  // Calcular totais
  const totalLimit = creditCards.reduce((sum, card) => sum + card.limit, 0);
  const totalAvailable = creditCards.reduce((sum, card) => sum + card.availableLimit, 0);
  const totalUsed = totalLimit - totalAvailable;

  // Calcular próximo vencimento
  const nextDueDate = useMemo(() => {
    const today = new Date();
    
    const nextInvoices = invoices
      .filter((inv: Invoice) => inv.status === 'open' || inv.status === 'future')
      .sort((a: Invoice, b: Invoice) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    return nextInvoices[0] || null;
  }, [invoices]);

  if (showAddForm) {
    return (
      <CreditCardForm
        onSave={() => setShowAddForm(false)}
        onCancel={() => setShowAddForm(false)}
      />
    );
  }

  if (showInvoice && showInvoice) {
    return (
      <InvoiceDetails
        invoice={showInvoice}
        onClose={() => setShowInvoice(null)}
      />
    );
  }

  if (showTransactions && selectedCard) {
    return (
      <CreditCardTransactions
        creditCard={selectedCard}
        onClose={() => {
          setShowTransactions(false);
          setSelectedCard(null);
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Resumo Geral */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo Geral</Text>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Limite Total</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalLimit, 'BRL')}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Disponível</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
              {formatCurrency(totalAvailable, 'BRL')}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${(totalUsed / totalLimit) * 100}%`,
                  backgroundColor: totalUsed > totalLimit * 0.8 
                    ? theme.colors.danger 
                    : totalUsed > totalLimit * 0.5 
                      ? theme.colors.warning 
                      : theme.colors.success
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {((totalUsed / totalLimit) * 100).toFixed(1)}% utilizado
          </Text>
        </View>

        {nextDueDate && (
          <View style={styles.nextDueCard}>
            <FontAwesome5 name="clock" size={16} color={theme.colors.warning} />
            <Text style={styles.nextDueText}>
              Próxima fatura: {formatCurrency(nextDueDate.totalAmount, 'BRL')} - Vence em {new Date(nextDueDate.dueDate).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        )}
      </Card>

      {/* Lista de Cartões */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Meus Cartões</Text>
          <TouchableOpacity onPress={() => setShowAddForm(true)}>
            <FontAwesome5 name="plus-circle" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {creditCards.length === 0 ? (
          <Card style={styles.emptyCard}>
            <FontAwesome5 name="credit-card" size={32} color={theme.colors.textDim} />
            <Text style={styles.emptyText}>Nenhum cartão cadastrado</Text>
            <Button
              title="Adicionar Cartão"
              onPress={() => setShowAddForm(true)}
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          creditCards.map(card => (
            <TouchableOpacity
              key={card.id}
              onPress={() => {
                setSelectedCard(card);
                setShowTransactions(true);
              }}
            >
              <Card style={styles.cardItem}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardBrand}>
                    <FontAwesome5 
                      name={card.brand === 'visa' ? 'cc-visa' : 
                           card.brand === 'mastercard' ? 'cc-mastercard' : 
                           card.brand === 'amex' ? 'cc-amex' : 
                           card.brand === 'elo' ? 'credit-card' : 'credit-card'} 
                      size={24} 
                      color={card.color || theme.colors.primary} 
                    />
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName}>{card.name}</Text>
                      <Text style={styles.cardDigits}>•••• {card.lastDigits}</Text>
                    </View>
                  </View>
                  <View style={[styles.cardStatus, { backgroundColor: card.status === 'active' ? theme.colors.success + '20' : theme.colors.danger + '20' }]}>
                    <Text style={[styles.cardStatusText, { color: card.status === 'active' ? theme.colors.success : theme.colors.danger }]}>
                      {card.status === 'active' ? 'Ativo' : 'Bloqueado'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardLimitRow}>
                  <Text style={styles.cardLimitLabel}>Limite total:</Text>
                  <Text style={styles.cardLimitValue}>{formatCurrency(card.limit, 'BRL')}</Text>
                </View>

                <View style={styles.cardLimitRow}>
                  <Text style={styles.cardLimitLabel}>Disponível:</Text>
                  <Text style={[styles.cardLimitValue, { color: theme.colors.success }]}>
                    {formatCurrency(card.availableLimit, 'BRL')}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardDueDate}>
                    Fecha dia {card.closingDay} • Vence dia {card.dueDay}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.darkLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    textAlign: 'right',
  },
  nextDueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.darkLight,
    padding: 12,
    borderRadius: 8,
  },
  nextDueText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
  },
  emptyButton: {
    width: '80%',
  },
  cardItem: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardInfo: {
    gap: 2,
  },
  cardName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  cardDigits: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
  },
  cardStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  cardLimitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLimitLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
  },
  cardLimitValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  cardFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cardDueDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    textAlign: 'right',
  },
});