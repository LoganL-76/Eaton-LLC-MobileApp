import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

//Keys used to store tokens in SecureStore
export const TOKEN_KEYS = {
    access: 'auth_access_token',
    refresh: 'auth_refresh_token',
};

// Create an Axios instance with the base URL
export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

//REQUEST INTERCEPTOR
// runs after every API response - if the response is 401, it tries to refresh the access token using the refresh token. If that fails, it logs out the user.
api.interceptors.response.use(
    (response) => response, // If the response is successful, just return it

    async (error) => {
        const originalRequest = error.config;

        // If the error is a 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // flag to prevent infinite loops

            try {
                // Get the refresh token from secure storage
                const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.refresh);
                if (!refreshToken) throw new Error('No refresh token');

                // Try to get a new access token
                const response = await axios.post(`${BASE_URL}/token/refresh/`, { refresh: refreshToken });

                const newAccessToken = response.data.access;
                await SecureStore.setItemAsync(TOKEN_KEYS.access, newAccessToken); // Store the new access token

                // Retry the original request with the new access token
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh token is invalid or expires - force logout
                await SecureStore.deleteItemAsync(TOKEN_KEYS.access);
                await SecureStore.deleteItemAsync(TOKEN_KEYS.refresh);
                router.replace('/(auth)/login'); 
                return Promise.reject(refreshError);
            }
        }
    
        return Promise.reject(error); // For other errors, just reject
    }   
);