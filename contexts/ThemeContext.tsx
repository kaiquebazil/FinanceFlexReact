import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, lightThemeColors } from '../constants/theme';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  themeType: ThemeType;
  toggleTheme: () => void;
  colors: any;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>('dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('user-theme');
      if (savedTheme) {
        setThemeType(savedTheme as ThemeType);
      }
      setIsLoading(false);
    }
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = themeType === 'light' ? 'dark' : 'light';
    setThemeType(newTheme);
    await AsyncStorage.setItem('user-theme', newTheme);
  };

  // Retorna as cores do tema selecionado
  const getColors = () => {
    if (themeType === 'light') {
      // Tema claro — cores completas com surface e surfaceDark bem definidos
      return {
        background: lightThemeColors.background,
        surface: lightThemeColors.surface,
        surfaceDark: lightThemeColors.surfaceDark,
        text: lightThemeColors.text,
        textDim: lightThemeColors.textDim,
        textSecondary: lightThemeColors.textSecondary,
        textMuted: lightThemeColors.textMuted,
        border: lightThemeColors.border,
        primary: lightThemeColors.primary,
        primaryLight: lightThemeColors.primaryLight,
        primaryDark: lightThemeColors.primaryDark,
        secondary: lightThemeColors.secondary,
        success: lightThemeColors.success,
        danger: lightThemeColors.danger,
        warning: lightThemeColors.warning,
        info: lightThemeColors.info,
        dark: lightThemeColors.dark,
        darker: lightThemeColors.darker,
        darkLight: lightThemeColors.darkLight,
      };
    }
    
    // Tema escuro (padrão)
    return {
      background: theme.colors.darker,
      surface: theme.colors.darkLight,
      surfaceDark: theme.colors.dark,
      text: theme.colors.text,
      textDim: theme.colors.textDim,
      textSecondary: theme.colors.textSecondary,
      textMuted: theme.colors.textMuted,
      border: theme.colors.border,
      primary: theme.colors.primary,
      primaryLight: theme.colors.primaryLight,
      primaryDark: theme.colors.primaryDark,
      secondary: theme.colors.secondary,
      success: theme.colors.success,
      danger: theme.colors.danger,
      warning: theme.colors.warning,
      info: theme.colors.info,
      dark: theme.colors.dark,
      darker: theme.colors.darker,
      darkLight: theme.colors.darkLight,
    };
  };

  const colors = getColors();
  const isDark = themeType === 'dark';

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ themeType, toggleTheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
