// app/_layout.tsx
import { Stack } from 'expo-router';
import { DataProvider } from '../contexts/DataContext';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { theme } from '../constants/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
    'Inter-Medium': require('@expo-google-fonts/inter/Inter_500Medium.ttf'),
    'Inter-SemiBold': require('@expo-google-fonts/inter/Inter_600SemiBold.ttf'),
    'Inter-Bold': require('@expo-google-fonts/inter/Inter_700Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
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