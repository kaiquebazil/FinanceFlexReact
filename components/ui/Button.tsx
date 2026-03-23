import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, ViewStyle } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
}

export const Button = ({ title, onPress, variant = 'primary', disabled, loading, icon, style }: ButtonProps) => {
  const { colors } = useTheme();
  const isOutline = variant === 'outline';
  const backgroundColor = isOutline
    ? 'transparent'
    : variant === 'primary'
    ? colors.primary
    : variant === 'secondary'
    ? colors.secondary
    : colors.danger;

  const textColor = isOutline ? colors.primary : '#fff';
  const borderStyle = isOutline ? { borderWidth: 1, borderColor: colors.primary } : {};

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }, borderStyle, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon && <FontAwesome5 name={icon} size={16} color={textColor} style={styles.icon} />}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
