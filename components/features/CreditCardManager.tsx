import React, { useState } from 'react';
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

interface CreditCardManagerProps {
  onClose: () => void;
}

export function CreditCardManager({ onClose }: CreditCardManagerProps) {
  const { creditCards, setCreditCards, addCreditCard, deleteCreditCard } = useData();
  const { toast, showToast, hideToast } = useToast();
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
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
    color: '#7c4dff'
  });

  // Estado para nova compra
  const [newPurchase, setNewPurchase] = useState({
    description: '',
    amount: '',
    installments: '1',
    category: 'Compras'
  });

  const handleAddCard = () => {
    if (!newCard.name || !newCard.limit || !newCard.closingDay || !newCard.dueDay) {
      setErrorMessage('Preencha todos os campos');
      setShowErrorModal(true);
      return;
    }

    addCreditCard({
      name: newCard.name,
      limit: parseFloat(newCard.limit),
      used: 0,
      closingDay: parseInt(newCard.closingDay),
      dueDay: parseInt(newCard.dueDay),
      color: newCard.color
    });

    setNewCard({ name: '', limit: '', closingDay: '', dueDay: '', color: '#7c4dff' });
    setShowAddModal(false);
  };

  const handleAddPurchase = () => {
    if (!selectedCard) return;
    if (!newPurchase.description || !newPurchase.amount) {
      setErrorMessage('Preencha descrição e valor');
      setShowErrorModal(true);
      return;
    }

    const amount = parseFloat(newPurchase.amount.replace(',', '.'));
    const installments = parseInt(newPurchase.installments);

    // Atualizar valor usado do cartão
    const updatedCards = creditCards.map(card => 
      card.id === selectedCard.id 
        ? { ...card, used: card.used + amount }
        : card
    );
    setCreditCards(updatedCards);

    showToast('Compra adicionada com sucesso!', 'success');
    setNewPurchase({ description: '', amount: '', installments: '1', category: 'Compras' });
    setShowPurchaseModal(false);
  };

  const calculateAvailable = (card: any) => {
    return card.limit - (card.used || 0);
  };

  const calculatePercentage = (card: any) => {
    return ((card.used || 0) / card.limit) * 100;
  };

  const formatDate = (day: number) => {
    return day.toString().padStart(2, '0');
  };

  return (
    <View style={styles.container}>
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
                {/* Cabeçalho do Cartão */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <FontAwesome5 name="credit-card" size={20} color={card.color || theme.colors.primary} />
                    <Text style={styles.cardName}>{card.name}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => deleteCreditCard(card.id)}
                    style={styles.deleteButton}
                  >
                    <FontAwesome5 name="trash" size={16} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>

                {/* Limite Total */}
                <Text style={styles.limitText}>
                  Limite total {formatCurrency(card.limit, 'BRL')}
                </Text>

                {/* Barras de Progresso */}
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

                {/* Usado e Disponível */}
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

                {/* Datas */}
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

                {/* Botões de Ação */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setSelectedCard(card);
                      setShowDetails(true);
                    }}
                  >
                    <FontAwesome5 name="search" size={14} color={theme.colors.primary} />
                    <Text style={styles.actionButtonText}>Detalhes</Text>
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

        {/* Botão Adicionar Cartão */}
        <Button
          title="Adicionar Cartão"
          icon="plus"
          onPress={() => setShowAddModal(true)}
          style={styles.addButton}
        />
      </ScrollView>

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
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
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
                        <Text style={styles.selectedCardName}>{selectedCard.name}</Text>
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

      {/* Modal Detalhes */}
      <Modal
        visible={showDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setShowDetails(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detalhes do Cartão</Text>
                  <TouchableOpacity onPress={() => setShowDetails(false)}>
                    <FontAwesome5 name="times" size={20} color={theme.colors.textDim} />
                  </TouchableOpacity>
                </View>

                {selectedCard && (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.detailsCard}>
                      <View style={styles.detailsHeader}>
                        <FontAwesome5 name="credit-card" size={30} color={selectedCard.color} />
                        <Text style={styles.detailsCardName}>{selectedCard.name}</Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Limite Total:</Text>
                        <Text style={styles.detailValue}>
                          {formatCurrency(selectedCard.limit, 'BRL')}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Valor Utilizado:</Text>
                        <Text style={[styles.detailValue, { color: theme.colors.danger }]}>
                          {formatCurrency(selectedCard.used || 0, 'BRL')}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Disponível:</Text>
                        <Text style={[styles.detailValue, { color: theme.colors.success }]}>
                          {formatCurrency(calculateAvailable(selectedCard), 'BRL')}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Fechamento:</Text>
                        <Text style={styles.detailValue}>
                          Dia {formatDate(selectedCard.closingDay)}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Vencimento:</Text>
                        <Text style={styles.detailValue}>
                          Dia {formatDate(selectedCard.dueDay)}
                        </Text>
                      </View>
                    </View>

                    <Button
                      title="Voltar"
                      onPress={() => setShowDetails(false)}
                      style={styles.backButton}
                    />
                  </ScrollView>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    padding: 20,
  },
  keyboardView: {
    flex: 1,
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
  },
  cardName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
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
  },
  selectedCardName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  installmentInfo: {
    backgroundColor: theme.colors.darkLight,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  installmentText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary,
  },
  detailsCard: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  detailsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsCardName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: 15,
    color: theme.colors.textDim,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  backButton: {
    marginTop: 10,
  },
});
