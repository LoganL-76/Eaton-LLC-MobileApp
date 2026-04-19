import { ClockProvider } from "@/contexts/ClockContext";
import { asyncStoragePersister, queryClient } from "@/lib/queryClient";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import NetInfo from '@react-native-community/netinfo';
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Stack, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { getQueue, removeAction } from "../lib/offlineQueue";
import { replayQueuedStatusUpdates } from '../lib/statusUpdateSync';
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
  const { isAuthenticated, isLoading } = useAuth();
  const notificationListener = useRef<ReturnType<typeof Notifications.addNotificationReceivedListener> | null>(null);
  const responseListener = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null>(null);
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      const registerForPushNotifications = async () => {
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') return;
          if (!projectId) throw new Error('Missing EAS projectId');
          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          await api.post('/devices/', {
            token: tokenData.data,
            platform: Platform.OS === 'ios' ? 'ios' : 'android',
          });
        } catch {
          // Push notifications are non-critical — fail silently
        }
      };
      registerForPushNotifications();

      notificationListener.current = Notifications.addNotificationReceivedListener(() => {
        // Notification received while foregrounded — setNotificationHandler handles display
      });
      responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
        router.push('/(tabs)/myjobs');
      });
    }
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated, isLoading, projectId]);

  return null;
}

export default function RootLayout() {
  const isSyncing = useRef(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const connected = state.isConnected ?? false;
      setIsOffline(!connected);

      if (!connected || isSyncing.current) return;
      const queue = await getQueue();
      if (queue.length === 0) return;

      isSyncing.current = true;
      try {
        await replayQueuedStatusUpdates(queue, {
          patchStatus: (assignmentId, payload) =>
            api.patch(`/job-driver-assignments/${assignmentId}/status/`, payload),
          removeAction,
          onConflict: async (action) => {
            Alert.alert(
              'Sync Conflict',
              `Could not sync update for Job #${action.assignmentId}. It may have been modified by dispatch.`
            );
          },
          onTransientFailure: (_action, _error) => {
            // Will retry automatically on next reconnect
          },
          invalidateQueries: async () => {
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ['jobs'] }),
              queryClient.invalidateQueries({ queryKey: ['job'] }),
            ]);
          },
        });
      } finally {
        isSyncing.current = false;
      }
    });
    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister, maxAge: 1000 * 60 * 60 * 24, buster: 'v1' }}
        >
          <ActionSheetProvider>
            <AuthProvider>
              <ClockProvider>
              <AppInitializer />
                {isOffline && (
                  <View style={styles.offlineBanner}>
                    <Text style={styles.offlineBannerText}>
                      No connection — showing cached data
                    </Text>
                  </View>
                )}
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="job/[id]" options={{ title: 'Job Details', headerShown: true }} />
                  <Stack.Screen name="more/profiledetails" options={{ title: 'My Profile', headerShown: true }} />
                  <Stack.Screen name="more/schedule" options={{ title: 'My Schedule', headerShown: true }} />
                </Stack>
              </ClockProvider>
            </AuthProvider>
          </ActionSheetProvider>
        </PersistQueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: '#b91c1c',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  offlineBannerText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
