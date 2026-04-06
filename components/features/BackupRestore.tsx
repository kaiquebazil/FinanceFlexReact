// components/features/BackupRestore.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Toast } from '../ui/Toast';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { FontAwesome5 } from '@expo/vector-icons';
import { createDefaultCategories } from '../../constants/defaultCategories';
import { createDefaultRecurringBills } from '../../constants/defaultRecurringBills';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface BackupRestoreProps {
  visible: boolean;
  onClose: () => void;
}

export function BackupRestore({ visible, onClose }: BackupRestoreProps) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const {
    accounts,
    transactions,
    piggyBanks,
    creditCards,
    recurringBills,
    categories,
    setAccounts,
    setTransactions,
    setPiggyBanks,
    setCreditCards,
    setRecurringBills,
    setCategories,
    setValuesHidden,
  } = useData();

  const { toast, showToast, hideToast } = useToast();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Contas pré-salvas
  const DEFAULT_ACCOUNTS = [
    {
      id: 'default-cash-1',
      name: 'Dinheiro',
      type: 'Dinheiro' as const,
      currency: 'BRL' as const,
      balance: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-bank-1',
      name: 'Banco Digital',
      type: 'Banco' as const,
      currency: 'BRL' as const,
      balance: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  // ==================== APAGAR TUDO ====================
  const handleClearAll = () => {
    setShowConfirmClear(true);
  };

  const confirmClearAll = () => {
    setAccounts(DEFAULT_ACCOUNTS);
    setCategories(createDefaultCategories());
    setRecurringBills(createDefaultRecurringBills());
    setTransactions([]);
    setPiggyBanks([]);
    setCreditCards([]);
    setValuesHidden(false);

    setShowConfirmClear(false);
    setSuccessMessage(t.dataReset);
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      onClose();
    }, 2000);
  };

  // Calcular estatísticas
  const userAccounts = accounts.filter(
    (a) => a.id !== 'default-cash-1' && a.id !== 'default-bank-1'
  );
  const userCategories = categories.filter((c) => !c.id.startsWith('default-'));

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
            <Text style={[styles.title, { color: colors.text }]}>{t.backupRestoreTitle}</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.textDim} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.headerSection}>
              <FontAwesome5 name="redo" size={50} color={colors.primary} />
              <Text style={[styles.mainTitle, { color: colors.text }]}>Resetar Dados</Text>
            </View>

            <View style={[styles.infoBox, { backgroundColor: isDark ? colors.darkLight : colors.surfaceDark }]}>
              <Text style={[styles.infoText, { color: colors.text }]}>
                📊 {t.monthlySummary}:{'\n'}
                • {t.accounts}: {accounts.length} • {t.transactions}: {transactions.length}{'\n'}
                • {t.categories}: {categories.length} • {t.recurringBills}: {recurringBills.length}
              </Text>
              <Text style={[styles.infoSubtext, { color: colors.textDim }]}>
                {t.defaultAccountsInfo.replace('{defaultCount}', '2').replace('{userCount}', String(userAccounts.length))}{'\n'}
                {t.defaultCategoriesInfo.replace('{defaultCount}', '15').replace('{userCount}', String(userCategories.length))}
              </Text>
            </View>

            <View style={[styles.warningBox, { backgroundColor: isDark ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.12)' }]}>
              <FontAwesome5 name="exclamation-triangle" size={24} color="#FF9800" />
              <Text style={[styles.warningText, { color: colors.text }]}>
                {t.resetWarning}
              </Text>
            </View>

            <View style={styles.buttons}>
              <Button
                title="🗑️ RESETAR TUDO"
                onPress={handleClearAll}
                variant="danger"
                style={styles.button}
              />
            </View>

            <Text style={[styles.note, { color: colors.textDim }]}>
              ✅ Contas e categorias padrão serão mantidas{'\n'}
              ❌ Todas as suas transações serão perdidas{'\n'}
              ❌ Cofrinhos, cartões e contas recorrentes serão apagados
            </Text>

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

      {/* Modal de Confirmação */}
      <ConfirmModal
        visible={showConfirmClear}
        title="⚠️ Resetar Todos os Dados?"
        message="Tem certeza que deseja resetar todos os dados? Esta ação é irreversível!"
        type="danger"
        confirmText="Sim, Resetar Tudo"
        onConfirm={confirmClearAll}
        onCancel={() => setShowConfirmClear(false)}
      />

      {/* Modal de Sucesso */}
      <ConfirmModal
        visible={showSuccessModal}
        title="✅ Sucesso!"
        message={successMessage}
        type="success"
        confirmText="OK"
        cancelText=""
        onConfirm={() => setShowSuccessModal(false)}
        onCancel={() => setShowSuccessModal(false)}
      />

      {/* Toast para feedback rápido */}
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  mainTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    marginTop: 10,
  },
  infoBox: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  warningBox: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  buttons: {
    gap: 15,
    marginBottom: 30,
  },
  button: {
    marginBottom: 5,
  },
  note: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  closeButton: {
    marginTop: 10,
  },
});
