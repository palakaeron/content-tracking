'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse rounded-full bg-brand/20 blur-xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-brand shadow-lg">
          <ShieldAlert size={48} className="text-white" />
        </div>
      </div>
      
      <h1 className="mb-2 text-6xl font-bold tracking-tight text-ink">404</h1>
      <h2 className="mb-6 text-2xl font-semibold text-ink-secondary">Page not found</h2>
      
      <p className="mb-8 max-w-md text-muted">
        The page you are looking for doesn&apos;t exist or has been moved.
        Please check the URL or navigate back to the dashboard.
      </p>
      
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/dashboard" className="btn btn-primary">
          <Home size={16} /> Back to Dashboard
        </Link>
        <button className="btn btn-secondary" onClick={() => window.history.back()}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </div>
  );
}
