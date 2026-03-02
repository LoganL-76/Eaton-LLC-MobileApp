import { Stack } from "expo-router";
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../lib/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="job/[id]" options={{ title: 'Job Details', headerShown: true }} />
      </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
