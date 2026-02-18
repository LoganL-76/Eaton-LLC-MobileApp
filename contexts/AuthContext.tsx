import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, TOKEN_KEYS } from '../services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise< {error: string | null} >;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

    const login = async (email: string, password: string): Promise<{ error: string | null }> => {
        try { 
            const response = await api.post('/auth/token/', { email, password });
            const { access, refresh } = response.data;

            await SecureStore.setItemAsync(TOKEN_KEYS.access, access);
            await SecureStore.setItemAsync(TOKEN_KEYS.refresh, refresh);

            setIsAuthenticated(true);
            return { error: null };

        } catch (error: any) {
            //Django returns 401 for bad credentials
            if (error.response?.status === 401) {
                return { error: 'Invalid email or password' };
            }
            //Network error (backend not running, no internet, etc)
            if (!error.response) {
                return { error: 'Network error. Please try again.' };
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