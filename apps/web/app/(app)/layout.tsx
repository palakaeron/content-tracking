'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/api';
import { AppShell } from '../../components/app-shell';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuth((s) => s._hydrated);
  const hydrate = useAuth((s) => s._hydrate);
  const token = useAuth((s) => s.token);

  // Hydrate the store from localStorage on first mount
  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrated, hydrate]);

  // Only redirect once we have confirmed there is no token (after hydration)
  useEffect(() => {
    if (hydrated && !token) {
      router.replace('/login');
    }
  }, [hydrated, token, router]);

  // While hydration is pending, render nothing to avoid a flash of the login redirect
  if (!hydrated) {
    return null;
  }

  if (!token) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
