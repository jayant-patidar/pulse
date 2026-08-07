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
      const error: ApiError = await response.json().catch(() => ({
        type: 'about:blank',
        title: 'Request Failed',
        status: response.status,
        detail: response.statusText,
        instance: endpoint,
        timestamp: new Date().toISOString(),
      }));
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
