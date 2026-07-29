'use client';

import { Mail, LogOut, User, CalendarDays, ShieldCheck } from 'lucide-react';
import { useAuth, getInitials } from '../../../lib/api';
import { useCurrentUser } from '../../../lib/useCurrentUser';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const router = useRouter();
  const clear = useAuth((s) => s.clear);
  const { user, isLoading } = useCurrentUser();

  const logout = () => {
    clear();
    router.push('/login');
  };

  const initials = getInitials(user?.name);
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="animate-fade-in mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Account</p>
          <h1 className="text-display mt-1 text-ink">User Profile</h1>
        </div>
        <button
          onClick={logout}
          className="btn btn-secondary text-danger hover:border-danger hover:bg-danger-light"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {isLoading ? (
        <div className="card p-8 space-y-4">
          <div className="skeleton h-20 w-20 rounded-2xl" />
          <div className="skeleton h-6 w-48" />
          <div className="skeleton h-4 w-64" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-brand to-accent" />

          {/* Avatar + info */}
          <div className="px-8 pb-8 pt-0">
            <div className="relative -mt-12 mb-5 inline-block">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-surface bg-brand text-3xl font-bold text-white shadow-md">
                {initials}
              </div>
              <div className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-surface bg-success" />
            </div>

            <h2 className="text-2xl font-bold text-ink">{user?.name ?? '—'}</h2>
            <p className="mt-0.5 text-sm font-medium text-brand capitalize">
              {user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'User'}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border bg-surface-alt p-4">
                <Mail size={18} className="text-muted shrink-0" />
                <div>
                  <p className="text-xs text-muted font-medium">Email</p>
                  <p className="text-sm font-semibold text-ink">{user?.email ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border bg-surface-alt p-4">
                <User size={18} className="text-muted shrink-0" />
                <div>
                  <p className="text-xs text-muted font-medium">Full Name</p>
                  <p className="text-sm font-semibold text-ink">{user?.name ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border bg-surface-alt p-4">
                <ShieldCheck size={18} className="text-muted shrink-0" />
                <div>
                  <p className="text-xs text-muted font-medium">Account Role</p>
                  <p className="text-sm font-semibold text-ink capitalize">
                    {user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'User'}
                  </p>
                </div>
              </div>

              {joinedDate && (
                <div className="flex items-center gap-3 rounded-xl border bg-surface-alt p-4">
                  <CalendarDays size={18} className="text-muted shrink-0" />
                  <div>
                    <p className="text-xs text-muted font-medium">Member Since</p>
                    <p className="text-sm font-semibold text-ink">{joinedDate}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
