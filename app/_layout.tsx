import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import * as Notifications from 'expo-notifications';
import { Stack, router } from "expo-router";
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThemeProvider } from '../lib/ThemeContext';
import { api } from '../services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function AppInitializer() {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      const registerForPushNotifications = async () => {
        try {
          const { status } = await Notifications.requestPermissionsAsync();

          if (status !== 'granted') {
            console.log('Permission not granted');
            return;
          }

          const tokenData = await Notifications.getExpoPushTokenAsync();
          const token = tokenData.data;

          await api.post('/devices/', {
            token: token,
            platform: Platform.OS === 'ios' ? 'ios' : 'android',
          });

          console.log('Push token registered with backend');
        } catch (error) {
          console.log('Error getting push token:', error);
        }
      };

      registerForPushNotifications();

      // Foreground notification listener
      notificationListener.current =
        Notifications.addNotificationReceivedListener(notification => {
          console.log('Foreground notification received:', notification);
        });

      // Tap listener (navigate to My Jobs)
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener(response => {
          const data = response.notification.request.content.data;

          console.log('Notification tapped:', data);

          router.push('/(tabs)/myjobs');
        });
    }

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
        notificationListener.current = null;
      }

      if (responseListener.current) {
        responseListener.current.remove();
        responseListener.current = null;
      }
    };
  }, [isAuthenticated, isLoading]);

  return null;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ActionSheetProvider>
        <AuthProvider>
          <AppInitializer />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="job/[id]" options={{ title: 'Job Details', headerShown: true }} />
            <Stack.Screen name="more/profiledetails" options={{ title: 'My Profile', headerShown: true }} />
            <Stack.Screen name="more/schedule" options={{ title: 'My Schedule', headerShown: true }} />
          </Stack>
        </AuthProvider>
      </ActionSheetProvider>
    </ThemeProvider>
  );
}
