'use client';

import { create } from 'zustand';
import type { ApiFailure, ApiSuccess } from '@cut/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type AuthState = {
  token: string | null;
  setToken: (token: string | null) => void;
  clear: () => void;
};

const readStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

export const useAuth = create<AuthState>((set) => ({
  token: readStoredToken(),
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('access_token', token);
      else localStorage.removeItem('access_token');
    }
    set({ token });
  },
  clear: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('access_token');
    set({ token: null });
  },
}));

function getCsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;\s*)csrf=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      const json = (await response.json()) as ApiSuccess<{ accessToken: string }> | ApiFailure;
      if (!response.ok || !json.success) {
        useAuth.getState().clear();
        return null;
      }
      useAuth.getState().setToken(json.data.accessToken);
      return json.data.accessToken;
    } catch {
      useAuth.getState().clear();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  const token = useAuth.getState().token;

  if (token) headers.set('Authorization', `Bearer ${token}`);

  const method = (init.method ?? 'GET').toUpperCase();
  const csrf = getCsrfToken();
  if (csrf && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    headers.set('X-CSRF-Token', csrf);
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && retryOnUnauthorized && !path.startsWith('/auth/')) {
    const nextToken = await refreshAccessToken();
    if (nextToken) return request<T>(path, init, false);
  }

  const json = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message, response.status);
  }

  return json.data;
}

export function api<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, init ?? {});
}

export function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  return request<T>(path, { method: 'POST', body: formData });
}

export function mediaUrl(storageKey: string | null | undefined): string | null {
  if (!storageKey) return null;
  if (storageKey.startsWith('http://') || storageKey.startsWith('https://')) return storageKey;
  if (storageKey.startsWith('cloudinary://')) {
    return `https://res.cloudinary.com/demo/image/upload/${storageKey.replace('cloudinary://', '')}`;
  }
  const base = API_URL.replace(/\/api\/v1$/, '');
  return `${base}/media/${encodeURIComponent(storageKey.replace(/^local:\/\//, ''))}`;
}
