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

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

type AuthState = {
  token: string | null;
  user: CurrentUser | null;
  _hydrated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: CurrentUser | null) => void;
  clear: () => void;
  _hydrate: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  // Always start as null so server and client render identically (no hydration mismatch).
  // The real values are read from localStorage in _hydrate(), called once on the client after mount.
  token: null,
  user: null,
  _hydrated: false,
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('access_token', token);
      else localStorage.removeItem('access_token');
    }
    set({ token });
  },
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) localStorage.setItem('current_user', JSON.stringify(user));
      else localStorage.removeItem('current_user');
    }
    set({ user });
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
    }
    set({ token: null, user: null });
  },
  _hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access_token');
    let user: CurrentUser | null = null;
    try {
      const raw = localStorage.getItem('current_user');
      user = raw ? (JSON.parse(raw) as CurrentUser) : null;
    } catch {
      user = null;
    }
    set({ token, user, _hydrated: true });
  },
}));

/** Returns initials (e.g. "JD") from a full name */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
