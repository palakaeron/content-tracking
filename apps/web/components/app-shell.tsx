import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import {
  LayoutDashboard, Library, Upload, BarChart3, FileText,
  Bell, Activity, Settings, HelpCircle, Search, SunMoon,
  User, ChevronLeft, Shield, Menu, X,
} from 'lucide-react';

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/content', label: 'Content Library', icon: Library },
  { href: '/upload', label: 'Upload Center', icon: Upload },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/reports', label: 'Usage Reports', icon: FileText },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/activity', label: 'Activity', icon: Activity },
];

const bottomNav = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help & Support', icon: HelpCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: alertsData } = useQuery<{ length: number }>({ 
    queryKey: ['alerts'],
    queryFn: () => api<{ length: number }>('/alerts'),
    select: (data) => ({ length: Array.isArray(data) ? (data as unknown[]).length : 0 }),
  });
  const activeAlertCount: number = (alertsData as unknown as unknown[])?.length ?? 0;

  // Close mobile sidebar and search on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-6 ${collapsed ? 'justify-center px-3' : ''}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand">
          <Shield size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-base font-bold text-ink">Sentinel</h1>
            <p className="text-[11px] text-muted">Content Tracker</p>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        <p className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted ${collapsed ? 'sr-only' : ''}`}>
          Main
        </p>
        {mainNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`focus-ring group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
              ${collapsed ? 'justify-center' : ''}
              ${isActive(href)
                ? 'bg-brand text-white shadow-sm'
                : 'text-ink-secondary hover:bg-surface-alt hover:text-ink'
              }`}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className={isActive(href) ? '' : 'text-muted group-hover:text-ink'} />
            {!collapsed && label}
            {!collapsed && href === '/alerts' && activeAlertCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                {activeAlertCount > 99 ? '99+' : activeAlertCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t px-3 py-4">
        <div className="space-y-1">
          {bottomNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`focus-ring group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                ${collapsed ? 'justify-center' : ''}
                ${isActive(href)
                  ? 'bg-brand/10 text-brand'
                  : 'text-ink-secondary hover:bg-surface-alt hover:text-ink'
                }`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className={isActive(href) ? 'text-brand' : 'text-muted group-hover:text-ink'} />
              {!collapsed && label}
            </Link>
          ))}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="hidden border-t px-3 py-3 md:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs text-muted transition-colors hover:bg-surface-alt hover:text-ink"
        >
          <ChevronLeft size={16} className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r bg-surface transition-all duration-300 md:block
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] border-r bg-surface animate-slide-in-right">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xl animate-scale-in rounded-2xl border bg-surface p-2 shadow-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-2">
              <Search size={18} className="text-muted" />
              <input
                autoFocus
                type="text"
                placeholder="Search content, reports, alerts..."
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
              <kbd className="rounded-md border bg-surface-alt px-2 py-0.5 text-[11px] text-muted">ESC</kbd>
            </div>
            <div className="border-t px-4 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Quick Actions</p>
              <div className="space-y-1">
                {[
                  { label: 'Upload Content', icon: Upload, shortcut: '⌘U' },
                  { label: 'View Analytics', icon: BarChart3, shortcut: '⌘A' },
                  { label: 'Check Alerts', icon: Bell, shortcut: '⌘L' },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-secondary transition-colors hover:bg-surface-alt hover:text-ink"
                  >
                    <item.icon size={16} className="text-muted" />
                    {item.label}
                    <kbd className="ml-auto rounded border bg-surface-alt px-1.5 py-0.5 text-[10px] text-muted">{item.shortcut}</kbd>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`transition-all duration-300 ${collapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'}`}>
        {/* Top Navigation */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-surface/80 px-4 backdrop-blur-md md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="focus-ring rounded-lg p-2 text-muted hover:bg-surface-alt md:hidden"
              aria-label="Open mobile navigation menu"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="focus-ring flex items-center gap-2 rounded-xl border bg-surface-alt/50 px-4 py-2 text-sm text-muted transition-colors hover:border-brand/30 hover:bg-surface-alt"
            >
              <Search size={15} />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="ml-4 hidden rounded-md border bg-surface px-1.5 py-0.5 text-[10px] sm:inline">⌘K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="focus-ring relative rounded-lg p-2 text-muted transition-colors hover:bg-surface-alt hover:text-ink"
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
            </Link>
            <button
              aria-label="Toggle color theme"
              className="focus-ring rounded-lg p-2 text-muted transition-colors hover:bg-surface-alt hover:text-ink"
              onClick={() => document.documentElement.classList.toggle('dark')}
            >
              <SunMoon size={18} />
            </button>
            <Link
              href="/profile"
              className="focus-ring ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white transition-opacity hover:opacity-90"
            >
              JD
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="mx-auto max-w-[1400px] p-4 pb-24 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t bg-surface/90 p-1 backdrop-blur-md md:hidden">
        {mainNav.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 rounded-lg p-2 text-[10px] ${isActive(href) ? 'text-brand' : 'text-muted'}`}
          >
            <Icon size={20} />
            {label.split(' ')[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
