'use client';

import { User, Mail, Briefcase, MapPin, HardDrive, Key, Link2, Copy, LogOut } from 'lucide-react';
import { useAuth } from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const router = useRouter();
  const setToken = useAuth(s => s.setToken);

  const logout = () => {
    setToken(null);
    router.push('/login');
  };

  return (
    <div className="animate-fade-in mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Account</p>
          <h1 className="text-display mt-1 text-ink">User Profile</h1>
        </div>
        <button onClick={logout} className="btn btn-secondary text-danger hover:border-danger hover:bg-danger-light">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: User Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="card overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-brand to-accent" />
            <div className="px-6 pb-6 pt-0">
              <div className="relative -mt-10 mb-4 inline-block">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-surface bg-brand text-2xl font-bold text-white shadow-sm">
                  JD
                </div>
                <div className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-surface bg-success" />
              </div>
              <h2 className="text-heading font-bold text-ink">John Doe</h2>
              <p className="text-sm text-brand font-medium">Enterprise Admin</p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-ink-secondary">
                  <Mail size={16} className="text-muted" /> john.doe@company.com
                </div>
                <div className="flex items-center gap-3 text-sm text-ink-secondary">
                  <Briefcase size={16} className="text-muted" /> Brand Protection Team
                </div>
                <div className="flex items-center gap-3 text-sm text-ink-secondary">
                  <MapPin size={16} className="text-muted" /> San Francisco, CA
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="mb-4 text-heading-sm font-semibold text-ink">Storage & Subscription</h3>
            <div className="mb-6 rounded-xl border bg-surface-alt p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold text-ink">Enterprise Plan</p>
                <span className="badge badge-brand">Active</span>
              </div>
              <p className="text-sm text-muted">Billed annually. Next billing date: Jan 1, 2025.</p>
            </div>
            
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-ink"><HardDrive size={16} className="text-muted"/> Storage Usage</span>
                <span className="font-semibold">45 GB / 100 GB</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-alt">
                <div className="h-full bg-brand" style={{ width: '45%' }} />
              </div>
              <p className="mt-2 text-xs text-muted">You have used 45% of your available storage.</p>
            </div>
          </div>

          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-heading-sm font-semibold text-ink">API Keys</h3>
              <button className="btn btn-secondary btn-sm">Generate New Key</button>
            </div>
            <p className="mb-4 text-sm text-muted">Use these keys to authenticate API requests from your own services.</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="font-semibold text-ink">Production Server</p>
                  <p className="mt-1 flex items-center gap-2 text-xs font-mono text-muted">
                    <Key size={12} /> pk_live_8f7d9...2b4c
                  </p>
                </div>
                <button className="rounded p-2 text-muted hover:bg-surface-alt hover:text-ink" title="Copy to clipboard">
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
