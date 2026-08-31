import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';
const TOKEN_KEY = 'devtrust_token';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(null);

  const decodeToken = useCallback((tkn) => {
    if (!tkn) return null;
    try {
      const base64 = tkn.split('.')[1];
      const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, []);

  // Check setup status
  const checkSetup = useCallback(async () => {
    try {
      const res = await api.get('/auth/setup-status');
      setNeedsSetup(res.data.needsSetup);
      return res.data.needsSetup;
    } catch {
      setNeedsSetup(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        const payload = decodeToken(stored);
        if (payload && payload.exp * 1000 > Date.now()) {
          setUser(payload);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      }
      await checkSetup();
      setIsLoading(false);
    };
    init();
  }, [decodeToken, checkSetup]);

  // Axios interceptor
  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use((config) => {
      const tkn = localStorage.getItem(TOKEN_KEY);
      if (tkn) config.headers.Authorization = `Bearer ${tkn}`;
      return config;
    });

    const resInterceptor = api.interceptors.response.use(
      (res) => res,
      async (err) => {
        const original = err.config;
        if (err.response?.status === 401 && !original._retry) {
          original._retry = true;
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token: tkn } = res.data;
    localStorage.setItem(TOKEN_KEY, tkn);
    setToken(tkn);
    setUser(decodeToken(tkn));
    setIsAuthenticated(true);
    return res.data;
  }, [decodeToken]);

  const register = useCallback(async (username, password) => {
    const res = await api.post('/auth/register', { username, password });
    const { token: tkn } = res.data;
    localStorage.setItem(TOKEN_KEY, tkn);
    setToken(tkn);
    setUser(decodeToken(tkn));
    setIsAuthenticated(true);
    setNeedsSetup(false);
    return res.data;
  }, [decodeToken]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    api.post('/auth/logout').catch(() => {});
  }, []);

  const value = {
    token,
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'admin',
    needsSetup,
    checkSetup,
    login,
    register,
    logout,
    api,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}

export { api };