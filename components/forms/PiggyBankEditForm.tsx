import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useData } from '../../hooks/useData';
import { useLanguage } from '../../contexts/LanguageContext';
import type { PiggyBank } from '../../types';

interface PiggyBankEditFormProps {
  piggyBank: PiggyBank;
  onSave: () => void;
  onCancel: () => void;
}

export function PiggyBankEditForm({ piggyBank, onSave, onCancel }: PiggyBankEditFormProps) {
  const { updatePiggyBank, accounts } = useData();
  const { t, language } = useLanguage();
  const [name, setName] = useState(piggyBank.name);
  const [targetAmount, setTargetAmount] = useState(piggyBank.targetAmount.toString());
  const [currentAmount, setCurrentAmount] = useState(piggyBank.currentAmount.toString());
  const [monthlyContribution, setMonthlyContribution] = useState(
    piggyBank.monthlyContribution?.toString() ?? '',
  );
  const [targetDate, setTargetDate] = useState(piggyBank.targetDate ?? '');
  const [selectedAccountId, setSelectedAccountId] = useState(piggyBank.accountId ?? '');

  const handleSave = () => {
    updatePiggyBank(piggyBank.id, {
      name: name.trim() || piggyBank.name,
      targetAmount: parseFloat(targetAmount) || piggyBank.targetAmount,
      currentAmount: parseFloat(currentAmount) || 0,
      monthlyContribution: monthlyContribution ? parseFloat(monthlyContribution) : undefined,
      targetDate: targetDate.trim() || undefined,
      accountId: selectedAccountId || undefined,
    });
    onSave();
  };

  return (
    <View style={styles.container}>
      <Input
        label={t.piggyBankName}
        value={name}
        onChangeText={setName}
        placeholder={t.piggyBankPlaceholder}
      />

      <Input
        label={`${t.targetAmount} (${language === 'pt-BR' ? 'R$' : '$'})`}
        value={targetAmount}
        onChangeText={setTargetAmount}
        placeholder={language === 'pt-BR' ? "0,00" : "0.00"}
        keyboardType="numeric"
      />

      <Input
        label={`${t.currentAmount} (${language === 'pt-BR' ? 'R$' : '$'})`}
        value={currentAmount}
        onChangeText={setCurrentAmount}
        placeholder={language === 'pt-BR' ? "0,00" : "0.00"}
        keyboardType="numeric"
      />

      <Input
        label={`${t.monthlyContribution} (${language === 'pt-BR' ? 'R$' : '$'}) — ${t.monthlyContributionHint}`}
        value={monthlyContribution}
        onChangeText={setMonthlyContribution}
        placeholder={language === 'pt-BR' ? "Ex: 200,00" : "Ex: 200.00"}
        keyboardType="numeric"
      />

      <Input
        label={`${t.targetDate} (${language === 'pt-BR' ? 'DD/MM/AAAA' : 'MM/DD/YYYY'}) — ${t.targetDateHint}`}
        value={targetDate}
        onChangeText={setTargetDate}
        placeholder={t.targetDatePlaceholder}
      />

      {accounts.length > 0 && (
        <>
          <Text style={styles.label}>{`${t.linkAccount} (${t.targetDateHint})`}</Text>
          <View style={styles.accountList}>
            <TouchableOpacity
              style={[styles.accountOption, !selectedAccountId && styles.accountOptionSelected]}
              onPress={() => setSelectedAccountId('')}
            >
              <Text style={[styles.accountText, !selectedAccountId && styles.accountTextSelected]}>
                {t.none}
              </Text>
            </TouchableOpacity>
            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountOption,
                  selectedAccountId === account.id && styles.accountOptionSelected,
                ]}
                onPress={() => setSelectedAccountId(account.id)}
              >
                <Text
                  style={[
                    styles.accountText,
                    selectedAccountId === account.id && styles.accountTextSelected,
                  ]}
                >
                  {account.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View style={styles.buttons}>
        <Button title={t.cancel} onPress={onCancel} variant="outline" style={styles.button} />
        <Button title={t.save} onPress={handleSave} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  accountList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  accountOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  accountOptionSelected: {
    backgroundColor: '#7c4dff',
    borderColor: '#7c4dff',
  },
  accountText: {
    color: '#b3b3b3',
    fontSize: 12,
  },
  accountTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  button: { flex: 1 },
});
