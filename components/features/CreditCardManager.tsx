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
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface CreditCardManagerProps {
  visible: boolean;
  onClose: () => void;
}

export function CreditCardManager({ visible, onClose }: CreditCardManagerProps) {
  const { creditCards, setCreditCards, addCreditCard, deleteCreditCard } = useData();
  const { toast, showToast, hideToast } = useToast();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
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
      setErrorMessage(t.fillAllFields);
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
      setErrorMessage(t.fillDescriptionValue);
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

    showToast(t.purchaseAdded, 'success');
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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Cabeçalho */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t.creditCards}</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.textDim} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {creditCards.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome5 name="credit-card" size={50} color={colors.textDim} />
                <Text style={[styles.emptyText, { color: colors.textDim }]}>{t.noCreditCards}</Text>
              </View>
            ) : (
              creditCards.map((card) => {
                const available = calculateAvailable(card);
                const percentage = calculatePercentage(card);
                const isOverLimit = available < 0;

                return (
                  <View key={card.id} style={[styles.card, { backgroundColor: isDark ? colors.darkLight : colors.surfaceDark, borderColor: colors.border }]}>
                    {/* Cabeçalho do Cartão */}
                    <View style={styles.cardHeader}>
                      <View style={styles.cardTitleContainer}>
                        <FontAwesome5 name="credit-card" size={20} color={card.color || colors.primary} />
                        <Text style={[styles.cardName, { color: colors.text }]}>{card.name}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => deleteCreditCard(card.id)}
                        style={styles.deleteButton}
                      >
                        <FontAwesome5 name="trash" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>

                    {/* Limite Total */}
                    <Text style={[styles.limitText, { color: colors.textDim }]}>
                      {t.creditCardTotalLimit} {formatCurrency(card.limit, 'BRL')}
                    </Text>

                    {/* Barras de Progresso */}
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBar, { backgroundColor: isDark ? colors.dark : colors.surfaceDark }]}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: isOverLimit ? colors.danger : colors.success
                            }
                          ]}
                        />
                      </View>
                    </View>

                    {/* Usado e Disponível */}
                    <View style={styles.usageContainer}>
                      <View style={styles.usageItem}>
                        <Text style={[styles.usageLabel, { color: colors.textDim }]}>{t.creditCardUsed}:</Text>
                        <Text style={[styles.usageValue, { color: colors.danger }]}>
                          {formatCurrency(card.used || 0, 'BRL')}
                        </Text>
                      </View>
                      <View style={styles.usageItem}>
                        <Text style={[styles.usageLabel, { color: colors.textDim }]}>{t.creditCardAvailable}:</Text>
                        <Text style={[styles.usageValue, { color: available > 0 ? colors.success : colors.danger }]}>
                          {formatCurrency(available, 'BRL')}
                        </Text>
                      </View>
                    </View>

                    {/* Datas */}
                    <View style={[styles.datesContainer, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                      <View style={styles.dateItem}>
                        <FontAwesome5 name="calendar-times" size={12} color={colors.textDim} />
                        <Text style={[styles.dateText, { color: colors.textDim }]}>
                          {t.creditCardClosingDay} {formatDate(card.closingDay)}
                        </Text>
                      </View>
                      <View style={styles.dateItem}>
                        <FontAwesome5 name="calendar-check" size={12} color={colors.textDim} />
                        <Text style={[styles.dateText, { color: colors.textDim }]}>
                          {t.creditCardDueDay} {formatDate(card.dueDay)}
                        </Text>
                      </View>
                    </View>

                    {/* Botões de Ação */}
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, { borderColor: colors.primary }]}
                        onPress={() => {
                          setSelectedCard(card);
                          setShowDetails(true);
                        }}
                      >
                        <FontAwesome5 name="search" size={14} color={colors.primary} />
                        <Text style={[styles.actionButtonText, { color: colors.primary }]}>{t.creditCardDetails}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.purchaseButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                        onPress={() => {
                          setSelectedCard(card);
                          setShowPurchaseModal(true);
                        }}
                      >
                        <FontAwesome5 name="shopping-cart" size={14} color="#fff" />
                        <Text style={[styles.actionButtonText, { color: '#fff' }]}>{t.creditCardPurchase}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}

            {/* Botão Adicionar Cartão */}
            <Button
              title={t.addCreditCard}
              icon="plus"
              onPress={() => setShowAddModal(true)}
              style={styles.addButton}
            />

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Botão Fechar */}
          <Button
            title={t.close}
            onPress={onClose}
            style={styles.closeButton}
          />
        </View>
      </View>

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
            <View style={[styles.innerModalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)' }]}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={[styles.innerModalContent, { backgroundColor: colors.surface }]}>
                  <View style={[styles.innerModalHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.innerModalTitle, { color: colors.text }]}>{t.creditCardNewCard}</Text>
                    <TouchableOpacity onPress={() => setShowAddModal(false)}>
                      <FontAwesome5 name="times" size={20} color={colors.textDim} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="none"
                    showsVerticalScrollIndicator={false}
                  >
                    <Input
                      label={t.creditCardCardName}
                      value={newCard.name}
                      onChangeText={(text) => setNewCard({ ...newCard, name: text })}
                      placeholder="Ex: Nubank, PicPay"
                    />

                    <Input
                      label={t.creditCardLimitLabel}
                      value={newCard.limit}
                      onChangeText={(text) => setNewCard({ ...newCard, limit: text })}
                      placeholder="5000"
                      keyboardType="numeric"
                    />

                    <Input
                      label={t.creditCardClosingLabel}
                      value={newCard.closingDay}
                      onChangeText={(text) => setNewCard({ ...newCard, closingDay: text })}
                      placeholder="10"
                      keyboardType="numeric"
                    />

                    <Input
                      label={t.creditCardDueLabel}
                      value={newCard.dueDay}
                      onChangeText={(text) => setNewCard({ ...newCard, dueDay: text })}
                      placeholder="15"
                      keyboardType="numeric"
                    />

                    <View style={styles.modalButtons}>
                      <Button
                        title={t.cancel}
                        onPress={() => setShowAddModal(false)}
                        variant="outline"
                        style={styles.modalButton}
                      />
                      <Button
                        title={t.save}
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
            <View style={[styles.innerModalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)' }]}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={[styles.innerModalContent, { backgroundColor: colors.surface }]}>
                  <View style={[styles.innerModalHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.innerModalTitle, { color: colors.text }]}>{t.creditCardNewPurchase}</Text>
                    <TouchableOpacity onPress={() => setShowPurchaseModal(false)}>
                      <FontAwesome5 name="times" size={20} color={colors.textDim} />
                    </TouchableOpacity>
                  </View>

                  {selectedCard && (
                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      keyboardDismissMode="none"
                      showsVerticalScrollIndicator={false}
                    >
                      <View style={[styles.selectedCardInfo, { backgroundColor: isDark ? colors.darkLight : colors.surfaceDark }]}>
                        <FontAwesome5 name="credit-card" size={16} color={selectedCard.color} />
                        <Text style={[styles.selectedCardName, { color: colors.text }]}>{selectedCard.name}</Text>
                      </View>

                      <Input
                        label={t.creditCardDescriptionLabel}
                        value={newPurchase.description}
                        onChangeText={(text) => setNewPurchase({ ...newPurchase, description: text })}
                        placeholder="Ex: TV, Notebook"
                      />

                      <Input
                        label={t.creditCardValueLabel}
                        value={newPurchase.amount}
                        onChangeText={(text) => setNewPurchase({ ...newPurchase, amount: text })}
                        placeholder="1500"
                        keyboardType="numeric"
                      />

                      <Input
                        label={t.creditCardInstallmentsLabel}
                        value={newPurchase.installments}
                        onChangeText={(text) => setNewPurchase({ ...newPurchase, installments: text })}
                        placeholder="12"
                        keyboardType="numeric"
                      />

                      {newPurchase.amount && newPurchase.installments && (
                        <View style={[styles.installmentInfo, { backgroundColor: isDark ? colors.darkLight : colors.surfaceDark }]}>
                          <Text style={[styles.installmentText, { color: colors.primary }]}>
                            {parseInt(newPurchase.installments)}x de {formatCurrency(
                              parseFloat(newPurchase.amount.replace(',', '.')) / parseInt(newPurchase.installments),
                              'BRL'
                            )}
                          </Text>
                        </View>
                      )}

                      <View style={styles.modalButtons}>
                        <Button
                          title={t.cancel}
                          onPress={() => setShowPurchaseModal(false)}
                          variant="outline"
                          style={styles.modalButton}
                        />
                        <Button
                          title={t.add}
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
          <View style={[styles.innerModalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)' }]}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.innerModalContent, { backgroundColor: colors.surface }]}>
                <View style={[styles.innerModalHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.innerModalTitle, { color: colors.text }]}>{t.creditCardCardDetails}</Text>
                  <TouchableOpacity onPress={() => setShowDetails(false)}>
                    <FontAwesome5 name="times" size={20} color={colors.textDim} />
                  </TouchableOpacity>
                </View>

                {selectedCard && (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={[styles.detailsCard, { backgroundColor: isDark ? colors.darkLight : colors.surfaceDark }]}>
                      <View style={styles.detailsHeader}>
                        <FontAwesome5 name="credit-card" size={30} color={selectedCard.color} />
                        <Text style={[styles.detailsCardName, { color: colors.text }]}>{selectedCard.name}</Text>
                      </View>

                      <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.detailLabel, { color: colors.textDim }]}>{t.creditCardTotalLimitLabel}</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>
                          {formatCurrency(selectedCard.limit, 'BRL')}
                        </Text>
                      </View>

                      <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.detailLabel, { color: colors.textDim }]}>{t.creditCardUsedLabel}</Text>
                        <Text style={[styles.detailValue, { color: colors.danger }]}>
                          {formatCurrency(selectedCard.used || 0, 'BRL')}
                        </Text>
                      </View>

                      <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.detailLabel, { color: colors.textDim }]}>{t.creditCardAvailableLabel}</Text>
                        <Text style={[styles.detailValue, { color: colors.success }]}>
                          {formatCurrency(calculateAvailable(selectedCard), 'BRL')}
                        </Text>
                      </View>

                      <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.detailLabel, { color: colors.textDim }]}>{t.creditCardClosingLabel2}</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>
                          {t.day} {formatDate(selectedCard.closingDay)}
                        </Text>
                      </View>

                      <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.detailLabel, { color: colors.textDim }]}>{t.creditCardDueLabel2}</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>
                          {t.day} {formatDate(selectedCard.dueDay)}
                        </Text>
                      </View>
                    </View>

                    <Button
                      title={t.creditCardBack}
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
        title={t.attention}
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
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
    marginTop: 15,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
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
  },
  deleteButton: {
    padding: 5,
  },
  limitText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 10,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
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
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 12,
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
  },
  purchaseButton: {
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  addButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 10,
  },
  innerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  innerModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  innerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  innerModalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
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
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  selectedCardName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  installmentInfo: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  installmentText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  detailsCard: {
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
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 15,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  backButton: {
    marginTop: 10,
  },
});
