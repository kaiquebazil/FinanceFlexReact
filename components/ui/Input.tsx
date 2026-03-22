import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, ...props }: InputProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: colors.surfaceDark, 
            color: colors.text,
            borderColor: colors.border 
          },
          error && styles.inputError
        ]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  input: {
    borderRadius: theme.borderRadius.input,
    padding: theme.spacing.md,
    fontSize: 16,
    borderWidth: 1,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
});
