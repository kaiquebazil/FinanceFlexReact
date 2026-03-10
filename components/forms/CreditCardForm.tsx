import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';

interface CreditCardFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function CreditCardForm({ onSave, onCancel, initialData }: CreditCardFormProps) {
  const { addCreditCard } = useData();
  
  const [name, setName] = useState(initialData?.name || '');
  const [limit, setLimit] = useState(initialData?.limit?.toString() || '');
  const [availableLimit, setAvailableLimit] = useState(initialData?.availableLimit?.toString() || '');
  const [dueDay, setDueDay] = useState(initialData?.dueDay?.toString() || '');
  const [closingDay, setClosingDay] = useState(initialData?.closingDay?.toString() || '');
  const [lastDigits, setLastDigits] = useState(initialData?.lastDigits || '');
  const [brand, setBrand] = useState(initialData?.brand || 'visa');
  const [color, setColor] = useState(initialData?.color || '#7c4dff');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const brands = [
    { id: 'visa', name: 'Visa', icon: 'cc-visa' },
    { id: 'mastercard', name: 'Mastercard', icon: 'cc-mastercard' },
    { id: 'amex', name: 'American Express', icon: 'cc-amex' },
    { id: 'elo', name: 'Elo', icon: 'credit-card' },
    { id: 'hipercard', name: 'Hipercard', icon: 'credit-card' },
    { id: 'other', name: 'Outro', icon: 'credit-card' },
  ];

  const colors = [
    '#7c4dff', // Roxo
    '#00c853', // Verde
    '#ff3d00', // Vermelho
    '#00b0ff', // Azul
    '#ffab00', // Amarelo
    '#aa00ff', // Roxo escuro
    '#f50057', // Rosa
    '#1de9b6', // Verde água
  ];

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!name.trim()) newErrors.name = 'Nome do cartão é obrigatório';
    
    const limitNum = parseFloat(limit?.replace(',', '.') ?? '0');
    if (!limit || isNaN(limitNum) || limitNum <= 0) {
      newErrors.limit = 'Limite inválido';
    }
    
    if (!availableLimit) {
      setAvailableLimit(limit);
    }
    
    const dueDayNum = parseInt(dueDay);
    if (!dueDay || isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 31) {
      newErrors.dueDay = 'Dia de vencimento inválido (1-31)';
    }
    
    const closingDayNum = parseInt(closingDay);
    if (!closingDay || isNaN(closingDayNum) || closingDayNum < 1 || closingDayNum > 31) {
      newErrors.closingDay = 'Dia de fechamento inválido (1-31)';
    }
    
    if (lastDigits && (lastDigits.length < 4 || lastDigits.length > 4)) {
      newErrors.lastDigits = 'Últimos 4 dígitos apenas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addCreditCard({
      name: name.trim(),
      limit: limitNum,
      availableLimit: parseFloat(availableLimit) || limitNum,
      dueDay: dueDayNum,
      closingDay: closingDayNum,
      brand: brand as any,
      lastDigits: lastDigits || '****',
      color,
      status: 'active',
    });

    onSave();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>
        {initialData ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
      </Text>

      <Input
        label="Nome do Cartão"
        value={name}
        onChangeText={setName}
        placeholder="Ex: Nubank, Itaú, C6"
        error={errors.name}
      />

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Input
            label="Limite (R$)"
            value={limit}
            onChangeText={setLimit}
            keyboardType="numeric"
            placeholder="0.000,00"
            error={errors.limit}
          />
        </View>
        
        <View style={styles.halfInput}>
          <Input
            label="Disponível (R$)"
            value={availableLimit}
            onChangeText={setAvailableLimit}
            keyboardType="numeric"
            placeholder="Mesmo do limite"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Input
            label="Dia Vencimento"
            value={dueDay}
            onChangeText={setDueDay}
            keyboardType="numeric"
            placeholder="15"
            maxLength={2}
            error={errors.dueDay}
          />
        </View>
        
        <View style={styles.halfInput}>
          <Input
            label="Dia Fechamento"
            value={closingDay}
            onChangeText={setClosingDay}
            keyboardType="numeric"
            placeholder="10"
            maxLength={2}
            error={errors.closingDay}
          />
        </View>
      </View>

      <Input
        label="Últimos 4 dígitos"
        value={lastDigits}
        onChangeText={setLastDigits}
        keyboardType="numeric"
        placeholder="1234"
        maxLength={4}
        error={errors.lastDigits}
      />

      <Text style={styles.label}>Bandeira</Text>
      <View style={styles.brandsContainer}>
        {brands.map(b => (
          <TouchableOpacity
            key={b.id}
            style={[
              styles.brandItem,
              brand === b.id && styles.brandItemActive
            ]}
            onPress={() => setBrand(b.id)}
          >
            <FontAwesome5 
              name={b.icon} 
              size={20} 
              color={brand === b.id ? '#fff' : theme.colors.textDim} 
            />
            <Text style={[
              styles.brandText,
              brand === b.id && styles.brandTextActive
            ]}>
              {b.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Cor do Cartão</Text>
      <View style={styles.colorsContainer}>
        {colors.map(c => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorItem,
              { backgroundColor: c },
              color === c && styles.colorItemActive
            ]}
            onPress={() => setColor(c)}
          >
            {color === c && (
              <FontAwesome5 name="check" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttons}>
        <Button title="Cancelar" onPress={onCancel} variant="outline" style={styles.button} />
        <Button title="Salvar" onPress={handleSave} style={styles.button} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 8,
  },
  brandsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  brandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.darkLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  brandItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  brandText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: theme.colors.textDim,
  },
  brandTextActive: {
    color: '#fff',
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorItemActive: {
    borderColor: '#fff',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  button: {
    flex: 1,
  },
});