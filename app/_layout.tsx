import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { DataProvider } from '../contexts/DataContext';
import { theme } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

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
    <DataProvider>
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
    </DataProvider>
  );
}
