import { asyncStoragePersister, queryClient } from "@/lib/queryClient";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import NetInfo from '@react-native-community/netinfo';
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { clearQueue, getQueue } from "../lib/offlineQueue";
import { ThemeProvider } from '../lib/ThemeContext';
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
        for (const action of queue) {
          if (action.type === 'status_update') {
            try { 
              await api.patch(
                `/job-driver-assignments/${action.assignmentId}/status/`,
                { status: action.status }
              );
            } catch (err: any) {
              const status = err.response?.status;

              if (status === 400 || status === 409) {
                // Server explicity rejected this action - conflict
                // 400: the status transition is invalid (e.g. trying to go backwards)
                // 409: the assingment was already modified by someone else (e.g. dispatcher)
                // In either case, server state wins. Alert driver and move on.
                Alert.alert(
                  'Sync Conflict',
                  `A status update made while offline was rejected. Please check Job #${action.assignmentId} to confirm the current status.`
                );
              } else { 
                // network error or server outage - just a failure no conflict
                // leave the action in the queue and retry on the next reconnect
                console.warn(`Failed to sync action ${action.id}:`, err.message);
              }
            }
          }
        }
        
        // All actions processsed - clear the queue and refresh UI
        await clearQueue();
        queryClient.invalidateQueries({ queryKey: ['jobs'] }); 
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
