'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api, useAuth } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';

export default function Signup() {
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
            const response = await api<{ accessToken: string }>('/auth/signup', {
              method: 'POST',
              body: JSON.stringify({
                name: data.get('name'),
                email: data.get('email'),
                password: data.get('password'),
              }),
            });

            setToken(response.accessToken);
            router.push('/dashboard');
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Unable to create account');
          }
        }}
      >
        <p className="text-sm text-muted">Sentinel</p>
        <h1 className="mb-6 text-2xl font-semibold">Protect your work</h1>

        {[
          ['name', 'Name', 'text'],
          ['email', 'Email', 'email'],
          ['password', 'Password (12+ characters)', 'password'],
        ].map(([name, label, type]) => (
          <label key={name} className="mt-3 block text-sm">
            {label}
            <input
              required
              minLength={name === 'password' ? 12 : undefined}
              name={name}
              type={type}
              className="mt-1 w-full rounded-lg border bg-transparent p-2"
            />
          </label>
        ))}

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <Button className="mt-5 w-full">Create account</Button>
        <Link className="mt-4 block text-center text-sm text-brand" href="/login">
          Already have an account?
        </Link>
      </form>
    </main>
  );
}
