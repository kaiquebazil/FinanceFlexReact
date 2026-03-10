import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency } from '../../utils/currency';
import type { CreditCard, CreditCardTransaction, Invoice } from '../../types';

interface CreditCardTransactionsProps {
  creditCard: CreditCard;
  onClose: () => void;
}

export function CreditCardTransactions({ creditCard, onClose }: CreditCardTransactionsProps) {
  const { 
    creditCardTransactions, 
    addCreditCardTransaction,
    invoices 
  } = useData();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Filtrar transações do cartão
  const cardTransactions = creditCardTransactions.filter(t => t.creditCardId === creditCard.id);

  // Agrupar por fatura
  const transactionsByInvoice = useMemo(() => {
    const grouped: { [key: string]: CreditCardTransaction[] } = {};
    
    cardTransactions.forEach((transaction: CreditCardTransaction) => {
      const date = new Date(transaction.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const closingDay = creditCard.closingDay;
      
      // Determinar em qual fatura a compra entra
      let invoiceMonth = month;
      let invoiceYear = year;
      
      if (date.getDate() > closingDay) {
        invoiceMonth = month === 12 ? 1 : month + 1;
        invoiceYear = month === 12 ? year + 1 : year;
      }
      
      const key = `${invoiceYear}-${invoiceMonth.toString().padStart(2, '0')}`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(transaction);
    });
    
    return grouped;
  }, [cardTransactions, creditCard.closingDay]);

  // Calcular totais por fatura
  const invoiceTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    
    Object.entries(transactionsByInvoice).forEach(([key, transactions]) => {
      totals[key] = transactions.reduce((sum, t) => sum + (t.installmentAmount * t.installments), 0);
    });
    
    return totals;
  }, [transactionsByInvoice]);

  if (showAddForm) {
    return (
      <AddTransactionForm
        creditCard={creditCard}
        onSave={() => setShowAddForm(false)}
        onCancel={() => setShowAddForm(false)}
      />
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho do Cartão */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <FontAwesome5 name="arrow-left" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{creditCard.name}</Text>
            <Text style={styles.headerDigits}>•••• {creditCard.lastDigits}</Text>
          </View>
          
          <View style={styles.headerLimit}>
            <Text style={styles.headerLimitLabel}>Disponível</Text>
            <Text style={styles.headerLimitValue}>
              {formatCurrency(creditCard.availableLimit, 'BRL')}
            </Text>
          </View>
        </View>
      </Card>

      {/* Botão Nova Compra */}
      <Button
        title="Nova Compra"
        icon="plus"
        onPress={() => setShowAddForm(true)}
        style={styles.addButton}
      />

      {/* Faturas */}
      {Object.entries(transactionsByInvoice)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([key, transactions]) => {
          const [year, month] = key.split('-');
          const monthName = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                             'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][parseInt(month) - 1];
          
          const dueDate = new Date(parseInt(year), parseInt(month) - 1, creditCard.dueDay);
          const isOverdue = dueDate < new Date() && !invoices.some((i: Invoice) => i.creditCardId === creditCard.id && i.month === parseInt(month) && i.year === parseInt(year) && i.status === 'paid');
          
          return (
            <Card key={key} style={styles.invoiceCard}>
              <TouchableOpacity
                onPress={() => {
                  const invoice = invoices.find((i: Invoice) => 
                    i.creditCardId === creditCard.id && 
                    i.month === parseInt(month) && 
                    i.year === parseInt(year)
                  );
                  if (invoice) {
                    setSelectedInvoice(invoice);
                  }
                }}
              >
                <View style={styles.invoiceHeader}>
                  <View>
                    <Text style={styles.invoiceMonth}>{monthName} {year}</Text>
                    <Text style={styles.invoiceDueDate}>
                      Vence {dueDate.toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  
                  <View style={styles.invoiceAmounts}>
                    <Text style={styles.invoiceTotal}>
                      {formatCurrency(invoiceTotals[key], 'BRL')}
                    </Text>
                    {isOverdue && (
                      <View style={styles.overdueBadge}>
                        <Text style={styles.overdueText}>Vencida</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.transactionsList}>
                  {transactions.map((transaction: CreditCardTransaction) => (
                    <View key={transaction.id} style={styles.transactionItem}>
                      <View style={styles.transactionIcon}>
                        <FontAwesome5 name="shopping-cart" size={12} color={theme.colors.primary} />
                      </View>
                      
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionDescription}>
                          {transaction.description}
                        </Text>
                        <Text style={styles.transactionDetails}>
                          {transaction.installments > 1 
                            ? `${transaction.currentInstallment}/${transaction.installments} · `
                            : ''}
                          {transaction.category}
                        </Text>
                      </View>
                      
                      <Text style={styles.transactionAmount}>
                        {formatCurrency(transaction.installmentAmount, 'BRL')}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            </Card>
          );
        })}

      {cardTransactions.length === 0 && (
        <Card style={styles.emptyCard}>
          <FontAwesome5 name="receipt" size={48} color={theme.colors.textDim} />
          <Text style={styles.emptyTitle}>Nenhuma compra</Text>
          <Text style={styles.emptyText}>
            Adicione suas primeiras compras para começar a acompanhar suas faturas.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

// Componente interno para adicionar transação
function AddTransactionForm({ creditCard, onSave, onCancel }: any) {
  const { addCreditCardTransaction } = useData();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState('1');
  const [category, setCategory] = useState('Compras');
  const [errors, setErrors] = useState<any>({});

  const handleSave = () => {
    const newErrors: any = {};
    const amountNum = parseFloat(amount?.replace(',', '.') ?? '0');
    
    if (!description.trim()) newErrors.description = 'Descrição obrigatória';
    if (!amount || isNaN(amountNum) || amountNum <= 0) newErrors.amount = 'Valor inválido';
    
    const installmentsNum = parseInt(installments);
    if (!installments || isNaN(installmentsNum) || installmentsNum < 1) {
      newErrors.installments = 'Número de parcelas inválido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const installmentAmount = amountNum / installmentsNum;

    // Criar uma transação para cada parcela
    for (let i = 1; i <= installmentsNum; i++) {
      addCreditCardTransaction({
        creditCardId: creditCard.id,
        description,
        amount: amountNum,
        category,
        date: new Date().toISOString(),
        installments: installmentsNum,
        currentInstallment: i,
        installmentAmount,
      });
    }

    onSave();
  };

  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>Nova Compra</Text>
      
      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Ex: Amazon, Supermercado"
        error={errors.description}
      />
      
      <Input
        label="Valor Total (R$)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="0,00"
        error={errors.amount}
      />
      
      <Input
        label="Número de Parcelas"
        value={installments}
        onChangeText={setInstallments}
        keyboardType="numeric"
        placeholder="1"
        error={errors.installments}
      />
      
      {parseInt(installments) > 1 && (
        <View style={styles.installmentInfo}>
          <Text style={styles.installmentText}>
            {parseInt(installments)}x de {formatCurrency(parseFloat(amount?.replace(',', '.') ?? '0') / parseInt(installments), 'BRL')}
          </Text>
        </View>
      )}
      
      <Input
        label="Categoria"
        value={category}
        onChangeText={setCategory}
        placeholder="Categoria da compra"
      />
      
      <View style={styles.formButtons}>
        <Button title="Cancelar" onPress={onCancel} variant="outline" style={styles.formButton} />
        <Button title="Salvar" onPress={handleSave} style={styles.formButton} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  headerDigits: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
  },
  headerLimit: {
    alignItems: 'flex-end',
  },
  headerLimitLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
  },
  headerLimitValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.success,
  },
  addButton: {
    marginBottom: 20,
  },
  invoiceCard: {
    marginBottom: 16,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  invoiceMonth: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  invoiceDueDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    marginTop: 2,
  },
  invoiceAmounts: {
    alignItems: 'flex-end',
  },
  invoiceTotal: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  overdueBadge: {
    backgroundColor: theme.colors.danger + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  overdueText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: theme.colors.danger,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  transactionDetails: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  installmentInfo: {
    backgroundColor: theme.colors.primary + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  installmentText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  formButton: {
    flex: 1,
  },
});