import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearSession,
  getAccessToken,
  getStoredUser,
  saveTokens,
  saveUser,
} from '../security/secureCredentials';
import { googleLoginRequest, loginRequest, registerRequest } from '../services/api';
import type { AuthUser } from '../types/user';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        const stored = await getStoredUser();
        if (!cancelled && token && stored) {
          setUser(stored);
        }
      } catch {
        // Ignore bootstrap storage failures (e.g. web / SecureStore unavailable).
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistSession = useCallback(async (accessToken: string, refreshToken: string, next: AuthUser) => {
    await saveTokens(accessToken, refreshToken);
    await saveUser(next);
    setUser(next);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginRequest(email.trim(), password);
      await persistSession(res.accessToken, res.refreshToken, res.user);
    },
    [persistSession],
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const res = await registerRequest(email.trim(), password, name?.trim());
      await persistSession(res.accessToken, res.refreshToken, res.user);
    },
    [persistSession],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const res = await googleLoginRequest(idToken);
      await persistSession(res.accessToken, res.refreshToken, res.user);
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [user, isLoading, login, register, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
