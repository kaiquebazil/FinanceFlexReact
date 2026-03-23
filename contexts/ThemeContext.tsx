import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../constants/theme';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  themeType: ThemeType;
  toggleTheme: () => void;
  colors: typeof theme.colors.light | typeof theme.colors.dark;
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

  // Retorna as cores do tema dark (originais) ou light
  const getColors = () => {
    if (themeType === 'dark') {
      return {
        background: theme.colors.darker,
        surface: theme.colors.darkLight,
        surfaceDark: theme.colors.dark,
        text: theme.colors.text,
        textDim: theme.colors.textDim,
        textSecondary: theme.colors.textSecondary,
        textMuted: theme.colors.textMuted,
        border: theme.colors.border,
      };
    }
    return theme.colors.light;
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
