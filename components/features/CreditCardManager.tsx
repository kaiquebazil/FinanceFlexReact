import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { formatCurrency } from '../../utils/currency';

interface CreditCardManagerProps {
  onClose: () => void;
}

export function CreditCardManager({ onClose }: CreditCardManagerProps) {
  const { creditCards, deleteCreditCard } = useData();

  return (
    <ScrollView style={styles.container}>
      {creditCards.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome5 name="credit-card" size={48} color={theme.colors.textDim} />
          <Text style={styles.emptyText}>Nenhum cartão cadastrado</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {creditCards.map((card) => (
            <View key={card.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="credit-card" size={20} color={theme.colors.primary} />
                <Text style={styles.cardName}>{card.name}</Text>
              </View>
              <Text style={styles.cardLimit}>Limite: {formatCurrency(card.limit, 'BRL')}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardDate}>Vencimento: Dia {card.dueDay}</Text>
                <TouchableOpacity onPress={() => deleteCreditCard(card.id)} style={styles.deleteButton}>
                  <FontAwesome5 name="trash" size={14} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 16, fontSize: 14, fontFamily: 'Inter-Regular', color: theme.colors.textDim },
  list: { gap: 12 },
  card: { padding: 16, backgroundColor: theme.colors.darkLight, borderRadius: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  cardName: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: theme.colors.text },
  cardLimit: { fontSize: 14, fontFamily: 'Inter-Regular', color: theme.colors.textDim, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: 13, fontFamily: 'Inter-Regular', color: theme.colors.textDim },
  deleteButton: { padding: 8 },
});
