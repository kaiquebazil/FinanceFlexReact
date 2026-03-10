import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { Button } from '../ui/Button';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { FontAwesome5 } from '@expo/vector-icons';

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
    setCategories
  } = useData();

  const [loading, setLoading] = useState(false);

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
        Alert.alert('✅ Sucesso', 'Backup salvo na pasta de Downloads!');
      } else {
        Alert.alert(
          '📱 Backup Gerado',
          'Copie o texto abaixo e salve em um arquivo .txt:\n\n' + 
          jsonString.substring(0, 200) + '...',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      Alert.alert('❌ Erro', 'Não foi possível fazer o backup');
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
            
            Alert.alert('✅ Sucesso', 'Dados restaurados com sucesso!');
            onClose();
          } catch {
            Alert.alert('❌ Erro', 'Arquivo inválido');
          }
        };
        reader.readAsText(file);
      };
      
      input.click();
    } else {
      Alert.alert(
        '📱 Importar Backup',
        'Para restaurar seus dados, use a versão web do app.',
        [{ text: 'OK' }]
      );
    }
  };

  // ==================== APAGAR TUDO ====================
  const handleClearAll = () => {
    Alert.alert(
      '⚠️ Atenção!',
      'Tem certeza que quer apagar TODOS os dados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar Tudo',
          style: 'destructive',
          onPress: () => {
            setAccounts([]);
            setTransactions([]);
            setPiggyBanks([]);
            setCreditCards([]);
            setRecurringBills([]);
            setCategories([]);
            Alert.alert('✅ Sucesso', 'Todos os dados foram apagados');
            onClose();
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <FontAwesome5 name="database" size={50} color={theme.colors.primary} />
        <Text style={styles.title}>Backup dos Dados</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          📊 Total: {accounts.length} contas • {transactions.length} transações
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
        • O backup salva todas as suas contas e movimentações{'\n'}
        • Para restaurar no celular, use a versão web
      </Text>
    </ScrollView>
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