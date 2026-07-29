'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, useAuth, type CurrentUser } from './api';

/**
 * Returns the current authenticated user.
 *
 * Flow:
 * 1. On first client render, calls `_hydrate()` to load token/user from localStorage.
 *    This is deferred to after mount so the initial SSR render is always null→null
 *    (no hydration mismatch).
 * 2. Once hydrated, if a token exists but no user object is cached, fetches GET /auth/me.
 * 3. Syncs the fetched user back into the store.
 */
export function useCurrentUser() {
  const hydrated = useAuth((s) => s._hydrated);
  const hydrate = useAuth((s) => s._hydrate);
  const token = useAuth((s) => s.token);
  const storeUser = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);

  // Run once after mount to read localStorage into the store
  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrated, hydrate]);

  const { data, isLoading } = useQuery<CurrentUser>({
    queryKey: ['current-user'],
    queryFn: () => api<CurrentUser>('/auth/me'),
    // Only fetch once the store has been hydrated, we have a token, but no cached user
    enabled: hydrated && !!token && !storeUser,
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
    // Show loading only while actively fetching; not during the brief hydration tick
    isLoading: hydrated && !storeUser && isLoading,
  };
}
