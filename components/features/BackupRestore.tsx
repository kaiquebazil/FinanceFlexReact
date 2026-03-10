import React from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Button } from '../ui/Button';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { storage, KEYS } from '../../services/storage';

interface BackupRestoreProps {
  onClose: () => void;
}

export function BackupRestore({ onClose }: BackupRestoreProps) {
  const { accounts, transactions, piggyBanks, creditCards, recurringBills, categories, loadData, setAccounts, setTransactions, setPiggyBanks, setCreditCards, setRecurringBills, setCategories } = useData();

  const handleExport = async () => {
    try {
      const data = {
        accounts,
        transactions,
        piggyBanks,
        creditCards,
        recurringBills,
        categories,
        exportDate: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(data, null, 2);
      
      if (Platform.OS === 'web') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance_flex_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      Alert.alert('Sucesso', 'Backup exportado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao exportar backup');
    }
  };

  const handleImport = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e: any) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = async (event: any) => {
              try {
                const data = JSON.parse(event.target.result);
                
                if (data.accounts) setAccounts(data.accounts);
                if (data.transactions) setTransactions(data.transactions);
                if (data.piggyBanks) setPiggyBanks(data.piggyBanks);
                if (data.creditCards) setCreditCards(data.creditCards);
                if (data.recurringBills) setRecurringBills(data.recurringBills);
                if (data.categories) setCategories(data.categories);
                
                Alert.alert('Sucesso', 'Dados importados com sucesso!');
                onClose();
              } catch (error) {
                Alert.alert('Erro', 'Arquivo inválido');
              }
            };
            reader.readAsText(file);
          }
        };
        input.click();
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao importar backup');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Exporte seus dados para um arquivo JSON ou importe um backup anterior.
      </Text>
      <Button title="Exportar Dados" icon="download" onPress={handleExport} style={styles.button} />
      <Button title="Importar Dados" icon="upload" onPress={handleImport} variant="outline" style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  description: { fontSize: 14, fontFamily: 'Inter-Regular', color: theme.colors.textDim, marginBottom: 24, lineHeight: 20 },
  button: { marginBottom: 16 },
  warning: { fontSize: 12, fontFamily: 'Inter-Regular', color: theme.colors.warning, textAlign: 'center' },
});
