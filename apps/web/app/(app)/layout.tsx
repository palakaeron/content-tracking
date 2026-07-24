'use client';import {useEffect} from 'react';import {useRouter} from 'next/navigation';import {useAuth} from '../../lib/api';import {AppShell} from '../../components/app-shell';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuth((state) => state.token);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
