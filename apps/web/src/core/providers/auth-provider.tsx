'use client';

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api-client';
import type { AuthTokens } from '@pulse/types';

interface AuthUser {
  userId: string;
  orgId: string;
  role: string;
  name?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    industry: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate auth state from HttpOnly cookies via /me endpoint
  useEffect(() => {
    api
      .get<AuthUser>('/root/auth/me')
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<AuthTokens | { requiresOrgSelection: true; organizations: unknown[] }>(
      '/root/auth/login',
      { email, password },
    );

    if ('requiresOrgSelection' in result) {
      throw new Error('Multi-org selection not yet implemented');
    }

    // After login sets the cookie, fetch the user profile
    const userData = await api.get<AuthUser>('/root/auth/me');
    setUser(userData);
    router.push('/dashboard');
  }, [router]);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    industry: string;
  }) => {
    await api.post<AuthTokens>('/root/auth/register', data);
    
    // After register sets the cookie, fetch the user profile
    const userData = await api.get<AuthUser>('/root/auth/me');
    setUser(userData);
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(async () => {
    await api.post('/root/auth/logout', {});
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
