// app/_layout.tsx
import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { DataProvider } from '../contexts/DataContext';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { useData } from '../hooks/useData';
import { theme } from '../constants/theme';
import type { CloudData } from '../services/syncService';

SplashScreen.preventAutoHideAsync();

// Componente intermediário que conecta AuthProvider ao DataContext
function AppWithSync({ children }: { children: React.ReactNode }) {
  const { applyRemoteData } = useData();

  // Callback estável para o AuthProvider
  const handleRemoteData = useCallback((data: CloudData) => {
    applyRemoteData(data);
  }, [applyRemoteData]);

  return (
    <AuthProvider onRemoteDataReceived={handleRemoteData}>
      {children}
    </AuthProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <LanguageProvider>
      <DataProvider>
        <AppWithSync>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.colors.darker },
              headerTintColor: theme.colors.text,
              contentStyle: { backgroundColor: theme.colors.darker },
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
        </AppWithSync>
      </DataProvider>
    </LanguageProvider>
  );
}
