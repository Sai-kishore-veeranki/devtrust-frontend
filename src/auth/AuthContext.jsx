import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_BASE ='http://localhost:8080/api';
const TOKEN_KEY = 'devtrust_token';
const REFRESH_KEY = 'devtrust_refresh';

// Create an axios instance with defaults
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while checking initial auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshTimeoutRef = useRef(null);

  // Decode JWT without verifying (verification is backend's job)
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

  // Schedule token refresh before expiry
  const scheduleRefresh = useCallback((tkn) => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    const payload = decodeToken(tkn);
    if (!payload?.exp) return;
    
    const expiresIn = payload.exp * 1000 - Date.now();
    const refreshTime = expiresIn - 60000; // Refresh 1 min before expiry
    
    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshAccessToken();
      }, refreshTime);
    }
  }, [decodeToken]);

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
      logout();
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
      const { token: newToken, refreshToken: newRefresh } = res.data;
      localStorage.setItem(TOKEN_KEY, newToken);
      if (newRefresh) localStorage.setItem(REFRESH_KEY, newRefresh);
      setToken(newToken);
      setUser(decodeToken(newToken));
      setIsAuthenticated(true);
      scheduleRefresh(newToken);
    } catch {
      logout();
    }
  }, [decodeToken, scheduleRefresh]);

  // Axios interceptor: attach auth header
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
          try {
            await refreshAccessToken();
            const tkn = localStorage.getItem(TOKEN_KEY);
            original.headers.Authorization = `Bearer ${tkn}`;
            return api(original);
          } catch {
            return Promise.reject(err);
          }
        }
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, [refreshAccessToken]);

  // Initialize: check stored token on mount
  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        const payload = decodeToken(stored);
        if (payload && payload.exp * 1000 > Date.now()) {
          setUser(payload);
          setIsAuthenticated(true);
          scheduleRefresh(stored);
        } else {
          // Token expired, try refresh
          await refreshAccessToken().catch(() => {});
        }
      }
      setIsLoading(false);
    };
    init();

    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [decodeToken, refreshAccessToken, scheduleRefresh]);

  const login = useCallback(async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token: tkn, refreshToken } = res.data;
    localStorage.setItem(TOKEN_KEY, tkn);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    setToken(tkn);
    setUser(decodeToken(tkn));
    setIsAuthenticated(true);
    scheduleRefresh(tkn);
    return res.data;
  }, [decodeToken, scheduleRefresh]);

  const register = useCallback(async (username, password) => {
    const res = await api.post('/auth/register', { username, password });
    const { token: tkn, refreshToken } = res.data;
    localStorage.setItem(TOKEN_KEY, tkn);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    setToken(tkn);
    setUser(decodeToken(tkn));
    setIsAuthenticated(true);
    scheduleRefresh(tkn);
    return res.data;
  }, [decodeToken, scheduleRefresh]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    // Optional: notify backend
    api.post('/auth/logout').catch(() => {});
  }, []);

  const value = {
    token,
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    api, // Expose configured axios instance
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

// Named export for the api instance if needed outside React
export { api };