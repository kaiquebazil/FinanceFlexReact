import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Toast } from '../ui/Toast';
import { useToast } from '../../hooks/useToast';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { formatCurrency } from '../../utils/currency';

interface CreditCardManagerV2Props {
  onClose: () => void;
}

type TabType = 'cards' | 'invoices' | 'history';

export function CreditCardManagerV2({ onClose }: CreditCardManagerV2Props) {
  const { creditCards, setCreditCards, addCreditCard, deleteCreditCard, creditCardTransactions, addCreditCardTransaction, invoices } = useData();
  const { toast, showToast, hideToast } = useToast();
  
  // Estados gerais
  const [activeTab, setActiveTab] = useState<TabType>('cards');
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estado para novo cartão
  const [newCard, setNewCard] = useState({
    name: '',
    limit: '',
    closingDay: '',
    dueDay: '',
    lastDigits: '',
    brand: 'visa',
    color: '#7c4dff'
  });

  // Estado para nova compra
  const [newPurchase, setNewPurchase] = useState({
    description: '',
    amount: '',
    installments: '1',
    category: 'Compras'
  });

  // Validações
  const validateCardFields = (): boolean => {
    if (!newCard.name || !newCard.limit || !newCard.closingDay || !newCard.dueDay) {
      setErrorMessage('Preencha todos os campos obrigatórios');
      setShowErrorModal(true);
      return false;
    }

    const closingDay = parseInt(newCard.closingDay);
    const dueDay = parseInt(newCard.dueDay);

    if (closingDay < 1 || closingDay > 31) {
      setErrorMessage('Dia de fechamento deve estar entre 1 e 31');
      setShowErrorModal(true);
      return false;
    }

    if (dueDay < 1 || dueDay > 31) {
      setErrorMessage('Dia de vencimento deve estar entre 1 e 31');
      setShowErrorModal(true);
      return false;
    }

    return true;
  };

  const validatePurchaseFields = (): boolean => {
    if (!selectedCard) {
      setErrorMessage('Nenhum cartão selecionado');
      setShowErrorModal(true);
      return false;
    }

    if (!newPurchase.description || !newPurchase.amount) {
      setErrorMessage('Preencha descrição e valor');
      setShowErrorModal(true);
      return false;
    }

    const amount = parseFloat(newPurchase.amount.replace(',', '.'));
    const installments = parseInt(newPurchase.installments);

    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Valor deve ser maior que zero');
      setShowErrorModal(true);
      return false;
    }

    if (installments < 1 || installments > 12) {
      setErrorMessage('Número de parcelas deve estar entre 1 e 12');
      setShowErrorModal(true);
      return false;
    }

    const available = selectedCard.limit - (selectedCard.used || 0);
    if (amount > available) {
      setErrorMessage(`Limite insuficiente. Disponível: ${formatCurrency(available, 'BRL')}`);
      setShowErrorModal(true);
      return false;
    }

    return true;
  };

  // Handlers
  const handleAddCard = () => {
    if (!validateCardFields()) return;

    addCreditCard({
      name: newCard.name,
      limit: parseFloat(newCard.limit),
      used: 0,
      closingDay: parseInt(newCard.closingDay),
      dueDay: parseInt(newCard.dueDay),
      lastDigits: newCard.lastDigits,
      brand: newCard.brand,
      color: newCard.color,
      status: 'active'
    });

    setNewCard({ name: '', limit: '', closingDay: '', dueDay: '', lastDigits: '', brand: 'visa', color: '#7c4dff' });
    setShowAddModal(false);
    showToast('Cartão adicionado com sucesso!', 'success');
  };

  const handleAddPurchase = () => {
    if (!validatePurchaseFields()) return;

    const amount = parseFloat(newPurchase.amount.replace(',', '.'));
    const installments = parseInt(newPurchase.installments);
    const installmentAmount = amount / installments;

    addCreditCardTransaction({
      creditCardId: selectedCard.id,
      description: newPurchase.description,
      amount: amount,
      category: newPurchase.category,
      date: new Date().toISOString(),
      installments: installments,
      currentInstallment: 1,
      installmentAmount: installmentAmount
    });

    setNewPurchase({ description: '', amount: '', installments: '1', category: 'Compras' });
    setShowPurchaseModal(false);
    showToast('Compra adicionada com sucesso!', 'success');
  };

  // Cálculos
  const calculateAvailable = (card: any) => {
    return card.limit - (card.used || 0);
  };

  const calculatePercentage = (card: any) => {
    return ((card.used || 0) / card.limit) * 100;
  };

  const formatDate = (day: number) => {
    return day.toString().padStart(2, '0');
  };

  // Filtros
  const getCardTransactions = (cardId: string) => {
    return creditCardTransactions.filter(t => t.creditCardId === cardId);
  };

  const getCardInvoices = (cardId: string) => {
    return invoices.filter(inv => inv.creditCardId === cardId);
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return theme.colors.success;
      case 'overdue':
        return theme.colors.danger;
      case 'open':
        return theme.colors.warning;
      default:
        return theme.colors.textDim;
    }
  };

  const getInvoiceStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paga';
      case 'overdue':
        return 'Vencida';
      case 'open':
        return 'Aberta';
      case 'future':
        return 'Futura';
      default:
        return status;
    }
  };

  // Importar useMemo se não estiver importado
  // (já está importado no início do arquivo)

  // Renderização por aba
  const renderCardsTab = () => (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {creditCards.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="credit-card" size={50} color={theme.colors.textDim} />
            <Text style={styles.emptyText}>Nenhum cartão cadastrado</Text>
          </View>
        ) : (
          creditCards.map((card) => {
            const available = calculateAvailable(card);
            const percentage = calculatePercentage(card);
            const isOverLimit = available < 0;

            return (
              <View key={card.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <FontAwesome5 name="credit-card" size={20} color={card.color || theme.colors.primary} />
                    <View style={styles.cardTitleContent}>
                      <Text style={styles.cardName}>{card.name}</Text>
                      {card.lastDigits && (
                        <Text style={styles.cardSubtitle}>•••• {card.lastDigits}</Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => deleteCreditCard(card.id)}
                    style={styles.deleteButton}
                  >
                    <FontAwesome5 name="trash" size={16} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.limitText}>
                  Limite total {formatCurrency(card.limit, 'BRL')}
                </Text>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: isOverLimit ? theme.colors.danger : theme.colors.success 
                        }
                      ]} 
                    />
                  </View>
                </View>

                <View style={styles.usageContainer}>
                  <View style={styles.usageItem}>
                    <Text style={styles.usageLabel}>Usado:</Text>
                    <Text style={[styles.usageValue, { color: theme.colors.danger }]}>
                      {formatCurrency(card.used || 0, 'BRL')}
                    </Text>
                  </View>
                  <View style={styles.usageItem}>
                    <Text style={styles.usageLabel}>Disponível:</Text>
                    <Text style={[styles.usageValue, { color: available > 0 ? theme.colors.success : theme.colors.danger }]}>
                      {formatCurrency(available, 'BRL')}
                    </Text>
                  </View>
                </View>

                <View style={styles.datesContainer}>
                  <View style={styles.dateItem}>
                    <FontAwesome5 name="calendar-times" size={12} color={theme.colors.textDim} />
                    <Text style={styles.dateText}>
                      Fecha dia {formatDate(card.closingDay)}
                    </Text>
                  </View>
                  <View style={styles.dateItem}>
                    <FontAwesome5 name="calendar-check" size={12} color={theme.colors.textDim} />
                    <Text style={styles.dateText}>
                      Vence dia {formatDate(card.dueDay)}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setSelectedCard(card);
                      setActiveTab('history');
                    }}
                  >
                    <FontAwesome5 name="history" size={14} color={theme.colors.primary} />
                    <Text style={styles.actionButtonText}>Histórico</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.purchaseButton]}
                    onPress={() => {
                      setSelectedCard(card);
                      setShowPurchaseModal(true);
                    }}
                  >
                    <FontAwesome5 name="shopping-cart" size={14} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Compra</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <Button
          title="Adicionar Cartão"
          icon="plus"
          onPress={() => setShowAddModal(true)}
          style={styles.addButton}
        />
      </ScrollView>
    </View>
  );

  const renderInvoicesTab = () => {
    const allInvoices = selectedCard ? getCardInvoices(selectedCard.id) : invoices;
    
    return (
      <View style={styles.tabContent}>
        {selectedCard && (
          <View style={styles.selectedCardBanner}>
            <FontAwesome5 name="credit-card" size={16} color={selectedCard.color} />
            <Text style={styles.selectedCardBannerText}>{selectedCard.name}</Text>
            <TouchableOpacity onPress={() => setSelectedCard(null)}>
              <FontAwesome5 name="times" size={16} color={theme.colors.textDim} />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          {allInvoices.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome5 name="file-invoice-dollar" size={50} color={theme.colors.textDim} />
              <Text style={styles.emptyText}>Nenhuma fatura disponível</Text>
            </View>
          ) : (
            allInvoices.map((invoice) => (
              <View key={invoice.id} style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                  <View>
                    <Text style={styles.invoiceMonth}>
                      {new Date(invoice.dueDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </Text>
                    <Text style={styles.invoiceAmount}>
                      {formatCurrency(invoice.totalAmount, 'BRL')}
                    </Text>
                  </View>
                  <View style={[styles.invoiceStatus, { backgroundColor: getInvoiceStatusColor(invoice.status) + '20' }]}>
                    <Text style={[styles.invoiceStatusText, { color: getInvoiceStatusColor(invoice.status) }]}>
                      {getInvoiceStatusLabel(invoice.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.invoiceDueDate}>
                  Vence em {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                </Text>
                <Text style={styles.invoiceTransactionCount}>
                  {invoice.transactions.length} transação(ões)
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  const renderHistoryTab = () => {
    const transactions = selectedCard ? getCardTransactions(selectedCard.id) : creditCardTransactions;
    
    // Agrupar transações por data
    const groupedByDate = useMemo(() => {
      const groups: { [key: string]: any[] } = {};
      
      // Ordenar transações por data (mais recentes primeiro)
      const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      sortedTransactions.forEach((transaction) => {
        const dateStr = new Date(transaction.date).toLocaleDateString('pt-BR');
        if (!groups[dateStr]) {
          groups[dateStr] = [];
        }
        groups[dateStr].push(transaction);
      });
      
      return groups;
    }, [transactions]);
    
    // Calcular saldo do dia (soma de todas as transações do dia)
    const calculateDayBalance = (dayTransactions: any[]) => {
      return dayTransactions.reduce((sum, transaction) => {
        // Assumindo que transações de cartão são débitos (negativas)
        return sum - transaction.amount;
      }, 0);
    };
    
    const groupedDates = Object.keys(groupedByDate);
    
    return (
      <View style={styles.tabContent}>
        {selectedCard && (
          <View style={styles.selectedCardBanner}>
            <FontAwesome5 name="credit-card" size={16} color={selectedCard.color} />
            <Text style={styles.selectedCardBannerText}>{selectedCard.name}</Text>
            <TouchableOpacity onPress={() => setSelectedCard(null)}>
              <FontAwesome5 name="times" size={16} color={theme.colors.textDim} />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome5 name="shopping-bag" size={50} color={theme.colors.textDim} />
              <Text style={styles.emptyText}>Nenhuma transação registrada</Text>
            </View>
          ) : (
            groupedDates.map((dateStr) => {
              const dayTransactions = groupedByDate[dateStr];
              const dayBalance = calculateDayBalance(dayTransactions);
              
              return (
                <View key={dateStr}>
                  {/* Cabeçalho do dia com saldo */}
                  <View style={styles.dayHeaderContainer}>
                    <Text style={styles.dayDate}>{dateStr}</Text>
                    <Text style={styles.dayBalance}>
                      Saldo do dia {formatCurrency(Math.abs(dayBalance), 'BRL')}
                    </Text>
                  </View>
                  
                  {/* Transações do dia */}
                  {dayTransactions.map((transaction) => (
                    <View key={transaction.id} style={styles.transactionCard}>
                      <View style={styles.transactionHeader}>
                        <View>
                          <Text style={styles.transactionDescription}>
                            {transaction.description}
                          </Text>
                          <Text style={styles.transactionCategory}>
                            {transaction.category}
                          </Text>
                        </View>
                        <Text style={styles.transactionAmount}>
                          {formatCurrency(transaction.amount, 'BRL')}
                        </Text>
                      </View>
                      <View style={styles.transactionFooter}>
                        <Text style={styles.transactionTime}>
                          {new Date(transaction.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Text style={styles.transactionInstallments}>
                          {transaction.currentInstallment}/{transaction.installments}x
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Abas */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cards' && styles.activeTab]}
          onPress={() => setActiveTab('cards')}
        >
          <FontAwesome5 name="credit-card" size={16} color={activeTab === 'cards' ? theme.colors.primary : theme.colors.textDim} />
          <Text style={[styles.tabText, activeTab === 'cards' && styles.activeTabText]}>
            Cartões
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'invoices' && styles.activeTab]}
          onPress={() => setActiveTab('invoices')}
        >
          <FontAwesome5 name="file-invoice-dollar" size={16} color={activeTab === 'invoices' ? theme.colors.primary : theme.colors.textDim} />
          <Text style={[styles.tabText, activeTab === 'invoices' && styles.activeTabText]}>
            Faturas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <FontAwesome5 name="history" size={16} color={activeTab === 'history' ? theme.colors.primary : theme.colors.textDim} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Histórico
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo das Abas */}
      {activeTab === 'cards' && renderCardsTab()}
      {activeTab === 'invoices' && renderInvoicesTab()}
      {activeTab === 'history' && renderHistoryTab()}

      {/* Modal Adicionar Cartão */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Novo Cartão</Text>
                    <TouchableOpacity onPress={() => setShowAddModal(false)}>
                      <FontAwesome5 name="times" size={20} color={theme.colors.textDim} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="none"
                    showsVerticalScrollIndicator={false}
                  >
                    <Input
                      label="Nome do Cartão"
                      value={newCard.name}
                      onChangeText={(text) => setNewCard({ ...newCard, name: text })}
                      placeholder="Ex: Nubank, PicPay"
                    />

                    <Input
                      label="Limite (R$)"
                      value={newCard.limit}
                      onChangeText={(text) => setNewCard({ ...newCard, limit: text })}
                      placeholder="5000"
                      keyboardType="numeric"
                    />

                    <Input
                      label="Últimos 4 dígitos"
                      value={newCard.lastDigits}
                      onChangeText={(text) => setNewCard({ ...newCard, lastDigits: text })}
                      placeholder="1234"
                      keyboardType="numeric"
                      maxLength={4}
                    />

                    <Input
                      label="Dia do Fechamento"
                      value={newCard.closingDay}
                      onChangeText={(text) => setNewCard({ ...newCard, closingDay: text })}
                      placeholder="10"
                      keyboardType="numeric"
                    />

                    <Input
                      label="Dia do Vencimento"
                      value={newCard.dueDay}
                      onChangeText={(text) => setNewCard({ ...newCard, dueDay: text })}
                      placeholder="15"
                      keyboardType="numeric"
                    />

                    <View style={styles.modalButtons}>
                      <Button
                        title="Cancelar"
                        onPress={() => setShowAddModal(false)}
                        variant="outline"
                        style={styles.modalButton}
                      />
                      <Button
                        title="Salvar"
                        onPress={handleAddCard}
                        style={styles.modalButton}
                      />
                    </View>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Adicionar Compra */}
      <Modal
        visible={showPurchaseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPurchaseModal(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Nova Compra</Text>
                    <TouchableOpacity onPress={() => setShowPurchaseModal(false)}>
                      <FontAwesome5 name="times" size={20} color={theme.colors.textDim} />
                    </TouchableOpacity>
                  </View>

                  {selectedCard && (
                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      keyboardDismissMode="none"
                      showsVerticalScrollIndicator={false}
                    >
                      <View style={styles.selectedCardInfo}>
                        <FontAwesome5 name="credit-card" size={16} color={selectedCard.color} />
                        <View style={styles.selectedCardInfoContent}>
                          <Text style={styles.selectedCardName}>{selectedCard.name}</Text>
                          <Text style={styles.selectedCardAvailable}>
                            Disponível: {formatCurrency(calculateAvailable(selectedCard), 'BRL')}
                          </Text>
                        </View>
                      </View>

                      <Input
                        label="Descrição"
                        value={newPurchase.description}
                        onChangeText={(text) => setNewPurchase({ ...newPurchase, description: text })}
                        placeholder="Ex: TV, Notebook"
                      />

                      <Input
                        label="Valor (R$)"
                        value={newPurchase.amount}
                        onChangeText={(text) => setNewPurchase({ ...newPurchase, amount: text })}
                        placeholder="1500"
                        keyboardType="numeric"
                      />

                      <Input
                        label="Número de Parcelas"
                        value={newPurchase.installments}
                        onChangeText={(text) => setNewPurchase({ ...newPurchase, installments: text })}
                        placeholder="12"
                        keyboardType="numeric"
                      />

                      {newPurchase.amount && newPurchase.installments && (
                        <View style={styles.installmentInfo}>
                          <Text style={styles.installmentText}>
                            {parseInt(newPurchase.installments)}x de {formatCurrency(
                              parseFloat(newPurchase.amount.replace(',', '.')) / parseInt(newPurchase.installments),
                              'BRL'
                            )}
                          </Text>
                        </View>
                      )}

                      <View style={styles.modalButtons}>
                        <Button
                          title="Cancelar"
                          onPress={() => setShowPurchaseModal(false)}
                          variant="outline"
                          style={styles.modalButton}
                        />
                        <Button
                          title="Adicionar"
                          onPress={handleAddPurchase}
                          style={styles.modalButton}
                        />
                      </View>
                    </ScrollView>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de Erro */}
      <ConfirmModal
        visible={showErrorModal}
        title="Atenção"
        message={errorMessage}
        type="warning"
        confirmText="OK"
        cancelText=""
        onConfirm={() => setShowErrorModal(false)}
        onCancel={() => setShowErrorModal(false)}
      />

      {/* Toast para feedback */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.dark,
    padding: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: theme.colors.primary + '20',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textDim,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  tabContent: {
    flex: 1,
  },
  selectedCardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.darkLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedCardBannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textDim,
    marginTop: 15,
  },
  card: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardTitleContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.textDim,
    marginTop: 2,
  },
  deleteButton: {
    padding: 5,
  },
  limitText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textDim,
    marginBottom: 10,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.dark,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  usageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  usageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  usageLabel: {
    fontSize: 13,
    color: theme.colors.textDim,
  },
  usageValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textDim,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  purchaseButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  addButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  invoiceCard: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invoiceMonth: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textDim,
    textTransform: 'capitalize',
  },
  invoiceAmount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginTop: 4,
  },
  invoiceStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  invoiceStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  invoiceDueDate: {
    fontSize: 12,
    color: theme.colors.textDim,
    marginBottom: 4,
  },
  invoiceTransactionCount: {
    fontSize: 12,
    color: theme.colors.textDim,
  },
  transactionCard: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  transactionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  transactionCategory: {
    fontSize: 12,
    color: theme.colors.textDim,
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.colors.danger,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.textDim,
  },
  transactionTime: {
    fontSize: 12,
    color: theme.colors.textDim,
  },
  transactionInstallments: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
  dayHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dayDate: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textDim,
  },
  dayBalance: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  keyboardView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  modalButton: {
    flex: 1,
  },
  selectedCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.darkLight,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedCardInfoContent: {
    flex: 1,
  },
  selectedCardName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  selectedCardAvailable: {
    fontSize: 12,
    color: theme.colors.success,
    marginTop: 4,
  },
  installmentInfo: {
    backgroundColor: theme.colors.darkLight,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  installmentText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
});
