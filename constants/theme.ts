// constants/theme.ts
import { useColorScheme } from 'react-native';

export const palette = {
  primary: '#7c4dff',
  primaryLight: '#b47cff',
  primaryDark: '#3f1dcb',
  secondary: '#00e5ff',
  success: '#00c853',
  danger: '#ff3d00',
  warning: '#ffab00',
  info: '#00b0ff',
};

export const darkTheme = {
  colors: {
    ...palette,
    background: '#121212',
    surface: '#1e1e1e',
    surfaceDark: '#0a0a0a',
    text: '#ffffff',
    textDim: '#b3b3b3',
    textSecondary: '#b0b0b0',
    textMuted: '#808080',
    border: '#333333',
    card: '#1e1e1e',
    input: '#2a2a2a',
    // Compatibilidade com código antigo
    dark: '#121212',
    darker: '#0a0a0a',
    darkLight: '#1e1e1e',
  },
};

export const lightTheme = {
  colors: {
    ...palette,
    background: '#f5f5f5',
    surface: '#ffffff',
    surfaceDark: '#eeeeee',
    text: '#121212',
    textDim: '#444444',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#dddddd',
    card: '#ffffff',
    input: '#f0f0f0',
    // Compatibilidade com código antigo
    dark: '#f5f5f5',
    darker: '#eeeeee',
    darkLight: '#ffffff',
  },
};

// Mantendo o objeto 'theme' original para compatibilidade imediata, 
// mas agora ele pode ser dinâmico se usado via hook.
export const theme = darkTheme; // Default para dark para não quebrar nada agora

export const sharedStyles = {
  fonts: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    card: 12,
    input: 6,
    button: 8,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const activeTheme = isDark ? darkTheme : lightTheme;
  
  return {
    ...sharedStyles,
    ...activeTheme,
    isDark,
  };
}
