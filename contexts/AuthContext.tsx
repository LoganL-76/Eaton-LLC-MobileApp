import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, TOKEN_KEYS } from '../services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise< {error: string | null} >;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Decodes the JWT payload to extract user_id without a library.
// atob is available in Hermes (Expo 54+).
function parseJwtPayload(token: string): { user_id?: number } | null {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // On app launch, check if valid tokens exist in SecureStore
    useEffect(() => {
        const checkTokens = async () => {
            try {
                const token = await SecureStore.getItemAsync(TOKEN_KEYS.access);
                setIsAuthenticated(!!token); // If token exists, user is authenticated
            } catch {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkTokens();
    }, []);

    const login = async (username: string, password: string): Promise<{ error: string | null }> => {
    try {
        const response = await api.post('/login/', { username, password });
        const { access, refresh } = response.data;

        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

        await SecureStore.setItemAsync(TOKEN_KEYS.access, access);
        await SecureStore.setItemAsync(TOKEN_KEYS.refresh, refresh);

        const payload = parseJwtPayload(access);
        if (payload?.user_id) {
            const driversResponse = await api.get('/drivers/');
            const raw = driversResponse.data;
            const drivers: { user: number | string }[] = Array.isArray(raw) ? raw : (raw.results ?? []);
            const isDriver = drivers.some((d) => Number(d.user) === Number(payload.user_id));

            if (!isDriver) {
                await SecureStore.deleteItemAsync(TOKEN_KEYS.access);
                await SecureStore.deleteItemAsync(TOKEN_KEYS.refresh);
                delete api.defaults.headers.common['Authorization'];
                return { error: 'Access denied. This app is for drivers only.' };
            }
        }

        setIsAuthenticated(true);
        return { error: null };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return { error: 'Invalid username or password' };
            }
            if (!error.response) {
                return { error: 'Network error. Please try again.' };
            }
        }
        return { error: 'An unexpected error occurred. Please try again.' };
    }
};

    const logout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEYS.access);
        await SecureStore.deleteItemAsync(TOKEN_KEYS.refresh);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}