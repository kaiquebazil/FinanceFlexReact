import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const Card = ({ children, style }: CardProps) => {
  const { colors } = useTheme();
  
  return (
    <View 
      style={[
        styles.card, 
        { 
          backgroundColor: colors.surface,
          ...theme.shadows.small 
        }, 
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
  },
});
