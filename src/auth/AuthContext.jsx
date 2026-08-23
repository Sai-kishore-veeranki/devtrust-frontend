import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';
const TOKEN_KEY = 'devtrust_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  async function login(username, password) {
    const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setToken(res.data.token);
  }

  async function register(username, password) {
    const res = await axios.post(`${API_BASE}/auth/register`, { username, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setToken(res.data.token);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
