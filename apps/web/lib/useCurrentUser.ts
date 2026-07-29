'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, useAuth, type CurrentUser } from './api';

/**
 * Returns the current authenticated user.
 * - Prefers the user object already in the Zustand store (set on login/signup).
 * - Falls back to fetching GET /auth/me when a token exists but the store has no user
 *   (e.g. after a hard page reload where only the token was persisted).
 */
export function useCurrentUser() {
  const token = useAuth((s) => s.token);
  const storeUser = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);

  const { data, isLoading } = useQuery<CurrentUser>({
    queryKey: ['current-user'],
    queryFn: () => api<CurrentUser>('/auth/me'),
    // Only run the fetch when we have a token but no cached user info
    enabled: !!token && !storeUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Sync the fetched user into the store so every component sees it
  useEffect(() => {
    if (data && !storeUser) {
      setUser(data);
    }
  }, [data, storeUser, setUser]);

  return {
    user: storeUser ?? data ?? null,
    isLoading: !storeUser && isLoading,
  };
}
