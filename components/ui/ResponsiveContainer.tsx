// components/ui/ResponsiveContainer.tsx
import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface ResponsiveContainerProps {
  children: React.ReactNode;
}

export function ResponsiveContainer({ children }: ResponsiveContainerProps) {
  const { colors } = useTheme();
  
  if (Platform.OS === 'web' && width > 768) {
    return (
      <View style={[styles.webContainer, { backgroundColor: colors.surfaceDark }]}>
        <View style={styles.webContentWrapper}>
          {children}
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'auto' as any,
  },
  webContentWrapper: {
    width: Math.min(1200, width * 0.95),
    maxWidth: 1200,
    minHeight: '100%',
  },
});
