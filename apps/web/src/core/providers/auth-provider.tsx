'use client';

import type { AuthTokens } from '@pulse/types';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api-client';

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
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const data = await api.get<AuthUser>('/root/auth/me');
      setUser(data);
    } catch (err) {
      setUser(null);
    }
  }, []);

  // Hydrate auth state from HttpOnly cookies via /me endpoint
  useEffect(() => {
    fetchUser().finally(() => {
      setIsLoading(false);
    });
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<AuthTokens | { requiresOrgSelection: true; organizations: unknown[] } | { requiresPasswordChange: true; setupToken: string }>(
      '/root/auth/login',
      { email, password },
    );

    if ('requiresPasswordChange' in result && result.requiresPasswordChange) {
      // Store setupToken in sessionStorage temporarily and redirect to setup
      sessionStorage.setItem('setupToken', result.setupToken);
      router.push('/setup');
      return;
    }

    if ('requiresOrgSelection' in result) {
      throw new Error('Multi-org selection not yet implemented');
    }

    await fetchUser();
    router.push('/dashboard');
  }, [router, fetchUser]);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    industry: string;
  }) => {
    await api.post<AuthTokens>('/root/auth/register', data);
    
    await fetchUser();
    router.push('/dashboard');
  }, [router, fetchUser]);

  const logout = useCallback(async () => {
    await api.post('/root/auth/logout', {});
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, refetchUser: fetchUser }}
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
