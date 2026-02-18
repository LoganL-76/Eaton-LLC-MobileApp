// Base URL for the Django backend
const API_URL = 'http://localhost:8000/api';

// Login - POST /api/login/
export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Login failed');
  }

  return data; // { access: '...', refresh: '...' }
};

// Refresh token - POST /api/token/refresh/
export const refreshToken = async (refresh: string) => {
  const response = await fetch(`${API_URL}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Token refresh failed');
  }

  return data; // { access: '...', refresh: '...' }
};
