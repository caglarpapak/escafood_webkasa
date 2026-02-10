import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppUser } from '../models/user';
import { apiPost } from '../utils/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const TOKEN_KEY = 'esca-webkasa-token';

// 401 Unauthorized - token süresi doldu veya geçersiz
export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;  // Sayfa yüklenirken token doğrulanıyor
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  // Sayfa yüklendiğinde token varsa doğrula (refresh'te session koruma)
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          setStoredToken(null);
          return null;
        }
        return res.json();
      })
      .then((userData) => {
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            ad: userData.name,
            aktifMi: true,
          });
        }
      })
      .catch(() => {
        setStoredToken(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 401 event dinle - herhangi bir API çağrısında token geçersizse global logout
  useEffect(() => {
    const handleUnauthorized = () => {
      setStoredToken(null);
      setUser(null);
    };
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiPost<{ token: string; user: { id: string; name: string; email: string } }>(
      '/api/auth/login',
      { email, password }
    );
    setStoredToken(response.token);
    setUser({
      id: response.user.id,
      email: response.user.email,
      ad: response.user.name,
      aktifMi: true,
    });
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

