import { asyncStoragePersister, queryClient } from "@/lib/queryClient";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import NetInfo from '@react-native-community/netinfo';
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { getQueue, removeAction } from "../lib/offlineQueue";
import { ThemeProvider } from '../lib/ThemeContext';
import { replayQueuedStatusUpdates } from '../lib/statusUpdateSync';
import { api } from '../services/api';

// RootLayout is the top-level component that wraps the entire app. 
// It sets up global providers for theming, authentication, and React Query caching. 
// It also listens for network connectivity changes to trigger syncing of any queued offline actions when the device goes back online.
export default function RootLayout() {
  // useRef instead of useState because we don't want a re-render when this changes.
  // It just tracks whether we're already mid-sync so we don't run two syncs at once
  // if the connectivity stat flickers on and off quickly.
  const isSyncing = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      // only attmept a sync when we have a confirmed connection
      // and sync isn't already running
      if (!state.isConnected || isSyncing.current) return;
    
      const queue = await getQueue();

      // nothing queued - no work
      if (queue.length === 0) return;

      isSyncing.current = true;

      try {
        await replayQueuedStatusUpdates(queue, {
          patchStatus: (assignmentId, payload) => api.patch(
            `/job-driver-assignments/${assignmentId}/status/`,
            payload
          ),
          removeAction,
          onConflict: async (action) => {
            // Server explicitly rejected this action - conflict.
            // In either case, server state wins. Alert driver and move on.
            Alert.alert(
              'Sync Conflict',
              `This job was updated by dispatch while you were offline. Your queued update was rejected. Please review Job #${action.assignmentId} for the latest status.`
            );
          },
          onTransientFailure: (action, error) => {
            // Network error or server outage - keep the action queued and stop.
            console.warn(`Failed to sync action ${action.id}:`, (error as any)?.message ?? error);
          },
          invalidateQueries: async () => {
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ['jobs'] }),
              queryClient.invalidateQueries({ queryKey: ['job'] }),
            ]);
          },
        });
      } finally {
        // always release the lock, even if something threw unexpectedly
        isSyncing.current = false;
      }
    });

    // clean up the NetInfo listener when the rooty layout unmounts (should be only when the app closes)
    return unsubscribe;
  }, []); 

  return (
    <ThemeProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ 
          persister: asyncStoragePersister,
          maxAge: 1000 * 60 * 60 * 24, // 1 day
          buster: 'v1', // Change this to invalidate old cache
        }}
      >
        <ActionSheetProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="job/[id]" options={{ title: 'Job Details', headerShown: true }} />
              <Stack.Screen name="more/profiledetails" options={{ title: 'My Profile', headerShown: true }} />
              <Stack.Screen name="more/schedule" options={{ title: 'My Schedule', headerShown: true }} />
            </Stack>
          </AuthProvider>
        </ActionSheetProvider>
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
}
