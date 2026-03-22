import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../constants/theme';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  themeType: ThemeType;
  toggleTheme: () => void;
  colors: typeof theme.colors.dark;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>(systemColorScheme || 'dark');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('user-theme');
      if (savedTheme) {
        setThemeType(savedTheme as ThemeType);
      }
    }
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = themeType === 'light' ? 'dark' : 'light';
    setThemeType(newTheme);
    await AsyncStorage.setItem('user-theme', newTheme);
  };

  const colors = themeType === 'dark' ? theme.colors.dark : theme.colors.light;
  const isDark = themeType === 'dark';

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
