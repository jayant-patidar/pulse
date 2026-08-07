// ============================================================
// API Client — Centralized HTTP client for the Pulse API
// ============================================================
// All API calls go through this client. It handles:
//   - Base URL configuration
//   - JWT token attachment
//   - Token refresh on 401
//   - Consistent error handling
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  timestamp: string;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

class ApiClient {
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Ensures HttpOnly cookies are sent
    });

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = fetch(`${API_BASE}/root/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }).then(res => res.ok).catch(() => false);
        }

        const success = await refreshPromise;
        if (success) {
          isRefreshing = false;
          refreshPromise = null;
          // Retry original request
          return this.request<T>(endpoint, options);
        } else {
          isRefreshing = false;
          refreshPromise = null;
          if (
            typeof window !== 'undefined' &&
            !['/login', '/register'].includes(window.location.pathname)
          ) {
            window.location.href = '/login';
          }
          throw new Error('Session expired');
        }
      }

      const error: ApiError = await response.json().catch(() => ({
        type: 'about:blank',
        title: 'Request Failed',
        status: response.status,
        detail: response.statusText,
        instance: endpoint,
        timestamp: new Date().toISOString(),
      }));

      if (typeof window !== 'undefined') {
        const { toast } = await import('sonner');
        toast.error(error.title || 'Error', { description: error.detail || 'An unexpected error occurred' });
      }

      throw error;
    }

    const json = await response.json();
    // Unwrap the response envelope { data, meta } if present
    return (json?.data !== undefined ? json.data : json) as T;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async del<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
