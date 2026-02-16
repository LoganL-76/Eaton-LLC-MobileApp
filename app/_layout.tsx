import { Stack } from "expo-router";
import { ThemeProvider } from '../lib/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
    </ThemeProvider>
  );
}
