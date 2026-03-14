// components/ui/Card.tsx
import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle; // IMPORTANTE: é ViewStyle, não any
}

export const Card = ({ children, style }: CardProps) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
});