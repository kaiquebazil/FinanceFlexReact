// components/features/BackupRestore.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Toast } from '../ui/Toast';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { FontAwesome5 } from '@expo/vector-icons';
import { createDefaultCategories } from '../../constants/defaultCategories';
import { createDefaultRecurringBills } from '../../constants/defaultRecurringBills';

interface BackupRestoreProps {
  onClose: () => void;
}

export function BackupRestore({ onClose }: BackupRestoreProps) {
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
    setSuccessMessage('✅ Todos os dados foram resetados para o padrão!');
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
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <FontAwesome5 name="redo" size={50} color={theme.colors.primary} />
          <Text style={styles.title}>Resetar Dados</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📊 Status Atual:{'\n'}
            • {accounts.length} contas • {transactions.length} transações{'\n'}
            • {categories.length} categorias • {recurringBills.length} contas recorrentes
          </Text>
          <Text style={styles.infoSubtext}>
            Contas padrão: 2 | Suas contas: {userAccounts.length}{'\n'}
            Categorias padrão: 15 | Suas categorias: {userCategories.length}
          </Text>
        </View>

        <View style={styles.warningBox}>
          <FontAwesome5 name="exclamation-triangle" size={24} color="#FF9800" />
          <Text style={styles.warningText}>
            Ao resetar, todos os seus dados serão apagados e substituídos pelas configurações padrão. Esta ação não pode ser desfeita!
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

        <Text style={styles.note}>
          ✅ Contas e categorias padrão serão mantidas{'\n'}
          ❌ Todas as suas transações serão perdidas{'\n'}
          ❌ Cofrinhos, cartões e contas recorrentes serão apagados
        </Text>
      </ScrollView>

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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginTop: 10,
  },
  infoBox: {
    backgroundColor: theme.colors.darkLight,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    color: theme.colors.text,
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoSubtext: {
    color: theme.colors.textDim,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  warningBox: {
    backgroundColor: 'rgba(255, 152, 0, 0.12)',
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
    color: theme.colors.text,
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
    color: theme.colors.textDim,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});
