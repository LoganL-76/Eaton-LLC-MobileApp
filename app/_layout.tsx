import { asyncStoragePersister, queryClient } from "@/lib/queryClient";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../lib/ThemeContext';


export default function RootLayout() {
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
