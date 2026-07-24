'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api, useAuth } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';

export default function Login() {
  const [error, setError] = useState('');
  const router = useRouter();
  const setToken = useAuth((state) => state.setToken);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm items-center p-5">
      <form
        className="card w-full p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);

          try {
            const response = await api<{ accessToken: string }>('/auth/login', {
              method: 'POST',
              body: JSON.stringify({
                email: data.get('email'),
                password: data.get('password'),
              }),
            });

            setToken(response.accessToken);
            router.push('/dashboard');
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Unable to sign in');
          }
        }}
      >
        <p className="text-sm text-muted">Sentinel</p>
        <h1 className="mb-6 text-2xl font-semibold">Sign in to your workspace</h1>

        <label className="block text-sm">
          Email
          <input required name="email" type="email" className="mt-1 w-full rounded-lg border bg-transparent p-2" />
        </label>

        <label className="mt-4 block text-sm">
          Password
          <input required name="password" type="password" className="mt-1 w-full rounded-lg border bg-transparent p-2" />
        </label>

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <Button className="mt-5 w-full">Sign in</Button>

        <div className="mt-4 flex justify-between text-sm">
          <Link className="text-brand" href="/signup">
            Create account
          </Link>
          <Link className="text-brand" href="/forgot-password">
            Forgot password?
          </Link>
        </div>
      </form>
    </main>
  );
}
