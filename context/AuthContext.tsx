import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

// Keys used to save tokens on the device
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

type AuthContextType = {
  accessToken: string | null;
  isLoggedIn: boolean;
  saveTokens: (access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // When app opens, check if tokens are already saved
  useEffect(() => {
    const loadTokens = async () => {
      const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      if (token) {
        setAccessToken(token);
        setIsLoggedIn(true);
      }
    };
    loadTokens();
  }, []);

  // Save tokens after login
  const saveTokens = async (access: string, refresh: string) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
    setAccessToken(access);
    setIsLoggedIn(true);
  };

  // Clear tokens on logout
  const logout = async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ accessToken, isLoggedIn, saveTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth in any screen
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
