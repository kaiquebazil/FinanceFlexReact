import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NOTIFICATION_KEY = 'daily-notification-scheduled';

export const useNotifications = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return;
      }

      const isScheduled = await AsyncStorage.getItem(NOTIFICATION_KEY);
      
      if (!isScheduled) {
        await scheduleDailyNotification();
        await AsyncStorage.setItem(NOTIFICATION_KEY, 'true');
      }
    };

    setupNotifications();
  }, []);

  const scheduleDailyNotification = async () => {
    if (Platform.OS === 'web') return;

    // Cancela notificações anteriores para evitar duplicatas
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Agenda para as 20:00 todos os dias
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "FinanceFlex 💰",
        body: "Já atualizou suas finanças hoje? Não perca o controle dos seus gastos!",
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      } as Notifications.DailyTriggerInput,
    });
  };

  return { scheduleDailyNotification };
};
