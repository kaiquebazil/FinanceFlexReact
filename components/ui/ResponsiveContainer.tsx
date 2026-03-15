// components/ui/ResponsiveContainer.tsx
import React from 'react';
import { View, StyleSheet, Dimensions, Platform, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

interface ResponsiveContainerProps {
  children: React.ReactNode;
}

export function ResponsiveContainer({ children }: ResponsiveContainerProps) {
  if (Platform.OS === 'web' && width > 768) {
    return (
      <View style={styles.webContainer}>
        <ScrollView 
          style={styles.webScrollView}
          contentContainerStyle={styles.webContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.webContentWrapper}>
            {children}
          </View>
        </ScrollView>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
  },
  webScrollView: {
    flex: 1,
    width: '100%',
  },
  webContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  webContentWrapper: {
    width: Math.min(1200, width * 0.95), // Aumentei para 1200px para aproveitar telas grandes
    maxWidth: 1200,
  },
});