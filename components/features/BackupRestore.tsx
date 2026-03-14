// components/features/BackupRestore.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Toast } from '../ui/Toast';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { FontAwesome5 } from '@expo/vector-icons';
import { createDefaultCategories } from '../../constants/defaultCategories';

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
    setValuesHidden
  } = useData();

  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(false);
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

  // ==================== EXPORTAR ====================
  const handleExport = () => {
    try {
      setLoading(true);
      
      const backupData = {
        accounts,
        transactions,
        piggyBanks,
        creditCards,
        recurringBills,
        categories,
        exportDate: new Date().toLocaleString('pt-BR')
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      
      if (Platform.OS === 'web') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-financas-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        setSuccessMessage('Backup salvo na pasta de Downloads!');
        setShowSuccessModal(true);
      } else {
        // Para mobile, podemos abrir um modal com opção de compartilhar
        setSuccessMessage('Backup gerado! Copie o texto abaixo:');
        setShowSuccessModal(true);
      }
      
    } catch (error) {
      showToast('Não foi possível fazer o backup', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==================== IMPORTAR ====================
  const handleImport = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const data = JSON.parse(event.target.result);
            
            if (data.accounts) setAccounts(data.accounts);
            if (data.transactions) setTransactions(data.transactions);
            if (data.piggyBanks) setPiggyBanks(data.piggyBanks);
            if (data.creditCards) setCreditCards(data.creditCards);
            if (data.recurringBills) setRecurringBills(data.recurringBills);
            if (data.categories) setCategories(data.categories);
            
            setSuccessMessage('Dados restaurados com sucesso!');
            setShowSuccessModal(true);
            onClose();
          } catch {
            showToast('Arquivo inválido', 'error');
          }
        };
        reader.readAsText(file);
      };
      
      input.click();
    } else {
      showToast('Use a versão web para restaurar backups', 'info');
    }
  };

  // ==================== APAGAR TUDO ====================
  const handleClearAll = () => {
    setShowConfirmClear(true);
  };

  const confirmClearAll = () => {
    setAccounts(DEFAULT_ACCOUNTS);
    setCategories(createDefaultCategories());
    setTransactions([]);
    setPiggyBanks([]);
    setCreditCards([]);
    setRecurringBills([]);
    setValuesHidden(false);
    
    setShowConfirmClear(false);
    setSuccessMessage('Todos os dados foram resetados!');
    setShowSuccessModal(true);
    onClose();
  };

  // Calcular estatísticas
  const userAccounts = accounts.filter(a => 
    a.id !== 'default-cash-1' && a.id !== 'default-bank-1'
  );
  const userCategories = categories.filter(c => !c.id.startsWith('default-'));

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <FontAwesome5 name="database" size={50} color={theme.colors.primary} />
          <Text style={styles.title}>Backup dos Dados</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📊 Total: {accounts.length} contas • {transactions.length} transações • {categories.length} categorias
          </Text>
          <Text style={styles.infoSubtext}>
            Contas padrão: 2 • Suas contas: {userAccounts.length}{'\n'}
            Categorias padrão: 15 • Suas categorias: {userCategories.length}
          </Text>
        </View>

        <View style={styles.buttons}>
          <Button
            title="📥 FAZER BACKUP"
            onPress={handleExport}
            loading={loading}
            style={styles.button}
          />

          <Button
            title="📤 RESTAURAR BACKUP"
            onPress={handleImport}
            variant="outline"
            loading={loading}
            style={styles.button}
          />

          <View style={styles.divider} />

          <Button
            title="🗑️ APAGAR TUDO"
            onPress={handleClearAll}
            variant="danger"
            style={styles.button}
          />
        </View>

        <Text style={styles.note}>
          • O backup salva todas as suas contas, categorias e movimentações{'\n'}
          • Para restaurar no celular, use a versão web{'\n'}
          • "Apagar Tudo" mantém contas e categorias padrão
        </Text>
      </ScrollView>

      {/* Modal de Confirmação */}
      <ConfirmModal
        visible={showConfirmClear}
        title="Apagar Todos os Dados?"
        message="Tem certeza que deseja apagar todos os seus dados?\n\n✅ Contas e categorias padrão serão mantidas\n❌ Todas as suas transações serão perdidas\n❌ Cofrinhos, cartões e contas recorrentes serão apagados"
        type="danger"
        confirmText="Apagar Tudo"
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
    marginBottom: 30,
    alignItems: 'center',
  },
  infoText: {
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  infoSubtext: {
    color: theme.colors.textDim,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  buttons: {
    gap: 15,
    marginBottom: 30,
  },
  button: {
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 15,
  },
  note: {
    color: theme.colors.textDim,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});