import { ClockProvider } from "@/contexts/ClockContext";
import { asyncStoragePersister, queryClient } from "@/lib/queryClient";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import NetInfo from "@react-native-community/netinfo";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Stack, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, LogBox, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import "../lib/locationTracking";
import { getQueue, removeAction } from "../lib/offlineQueue";
import { replayQueuedStatusUpdates } from "../lib/statusUpdateSync";
import { ThemeProvider } from "../lib/ThemeContext";
import { api } from "../services/api";

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log("🔥 NOTIFICATION RECEIVED:", notification);

    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

function AppInitializer() {
  const { isAuthenticated, isLoading } = useAuth();
  const notificationListener = useRef<ReturnType<typeof Notifications.addNotificationReceivedListener> | null>(null);
  const responseListener = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null>(null);
  const lastHandledResponseId = useRef<string | null>(null);
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  const getJobIdFromNotificationResponse = (response: Notifications.NotificationResponse | null): string | null => {
    if (!response) return null;

    const data = response.notification.request.content.data as Record<string, unknown>;

    const rawJobId =
      data?.jobId ??
      data?.job_id ??
      data?.id ??
      (typeof data?.job === "object" && data.job !== null ? (data.job as Record<string, unknown>).id : undefined);

    if (rawJobId === undefined || rawJobId === null) return null;
    return String(rawJobId);
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse | null) => {
    if (!response) return;

    const responseId = response.notification.request.identifier;
    if (lastHandledResponseId.current === responseId) return;
    lastHandledResponseId.current = responseId;

    const jobId = getJobIdFromNotificationResponse(response);
    if (jobId) {
      router.push({ pathname: "/job/[id]", params: { id: jobId } });
      return;
    }

    router.push("/(tabs)/myjobs");
  };

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      const registerForPushNotifications = async () => {
        try {
          // Android: Set up notification channel for heads-up display
          if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
              name: "default",
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: "#FF231F7C",
              enableVibrate: true,
            });
          }

          const { status } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowSound: true,
              allowBadge: false,
            },
          });
          if (status !== "granted") return;

          if (!projectId) throw new Error("Missing EAS projectId");

          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          console.log("🔥 PHONE TOKEN:", tokenData.data);

          await api.post("/devices/", {
            token: tokenData.data,
            platform: Platform.OS === "ios" ? "ios" : "android",
          });
        } catch {
          // Push notifications are non-critical — fail silently
        }
      };

      registerForPushNotifications();

      // Handles app launch from a notification tap when the app was killed.
      Notifications.getLastNotificationResponseAsync().then((response) => {
        handleNotificationResponse(response);
      });

      notificationListener.current = Notifications.addNotificationReceivedListener(() => {
        // Foreground notification received
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotificationResponse(response);
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
    LogBox.ignoreLogs([
      "Unable to activate keep awake",
      "Uncaught (in promise",
    ]);
  }, []);

  useEffect(() => {
    if (!__DEV__) return;

    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const message = args
        .map((arg) => (typeof arg === "string" ? arg : arg?.message ?? ""))
        .join(" ");

      if (message.includes("Unable to activate keep awake")) {
        return;
      }

      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  useEffect(() => {
    const globalObj = globalThis as any;
    if (typeof globalObj?.addEventListener !== "function") return;

    const onUnhandledRejection = (event: any) => {
      const message =
        event?.reason?.message ??
        (typeof event?.reason === "string" ? event.reason : "");

      if (typeof message === "string" && message.includes("Unable to activate keep awake")) {
        event?.preventDefault?.();
      }
    };

    globalObj.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      globalObj.removeEventListener?.("unhandledrejection", onUnhandledRejection);
    };
  }, []);

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
              "Sync Conflict",
              `Could not sync update for Job #${action.assignmentId}. It may have been modified by dispatch.`
            );
          },
          onTransientFailure: (_action, _error) => {
            // Will retry automatically on next reconnect
          },
          invalidateQueries: async () => {
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ["jobs"] }),
              queryClient.invalidateQueries({ queryKey: ["job"] }),
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
          persistOptions={{ persister: asyncStoragePersister, maxAge: 1000 * 60 * 60 * 24, buster: "v1" }}
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
                  <Stack.Screen name="job/[id]" options={{ title: "Job Details", headerShown: true }} />
                  <Stack.Screen name="more/profiledetails" options={{ title: "My Profile", headerShown: true }} />
                  <Stack.Screen name="more/permissions" options={{ title: "Permissions", headerShown: true }} />
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
    backgroundColor: "#b91c1c",
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  offlineBannerText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
});