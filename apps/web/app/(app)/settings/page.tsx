'use client';

import { useState } from 'react';
import { User, Bell, Shield, Key, CreditCard, MonitorSmartphone, Zap } from 'lucide-react';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security & 2FA', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'sessions', label: 'Active Sessions', icon: MonitorSmartphone },
  { id: 'integrations', label: 'Integrations', icon: Zap },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">Account</p>
        <h1 className="text-display mt-1 text-ink">Settings</h1>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Left Nav */}
        <aside className="w-full shrink-0 md:w-64">
          <nav className="flex flex-col gap-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === s.id
                    ? 'bg-brand/10 text-brand'
                    : 'text-ink-secondary hover:bg-surface-alt hover:text-ink'
                }`}
              >
                <s.icon size={18} />
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="border-b px-6 py-5">
                <h2 className="text-heading-sm">Profile Information</h2>
                <p className="mt-1 text-sm text-muted">Update your account details and public profile.</p>
              </div>
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">
                    JD
                  </div>
                  <div>
                    <button className="btn btn-secondary btn-sm mb-2">Change Avatar</button>
                    <p className="text-xs text-muted">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink">First Name</span>
                    <input type="text" className="input" defaultValue="John" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink">Last Name</span>
                    <input type="text" className="input" defaultValue="Doe" />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-sm font-medium text-ink">Email Address</span>
                    <input type="email" className="input bg-surface-alt text-muted" defaultValue="john.doe@company.com" disabled />
                    <p className="mt-1.5 text-xs text-muted">Contact support to change your email address.</p>
                  </label>
                </div>
              </div>
              <div className="flex justify-end border-t bg-surface-alt/50 px-6 py-4 rounded-b-2xl">
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <div className="border-b px-6 py-5">
                <h2 className="text-heading-sm">Two-Factor Authentication</h2>
                <p className="mt-1 text-sm text-muted">Add an extra layer of security to your account.</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between rounded-xl border p-4">
                  <div>
                    <p className="font-semibold text-ink">Authenticator App</p>
                    <p className="mt-1 text-sm text-muted">Use an app like Google Authenticator to generate codes.</p>
                  </div>
                  <button className="btn btn-secondary">Enable</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <div className="border-b px-6 py-5">
                <h2 className="text-heading-sm">Notification Preferences</h2>
                <p className="mt-1 text-sm text-muted">Choose what updates you want to receive.</p>
              </div>
              <div className="divide-y p-0">
                {[
                  { title: 'High Risk Detections', desc: 'Email me when a 90%+ confidence match is found.' },
                  { title: 'Weekly Digest', desc: 'A weekly summary of your content performance.' },
                  { title: 'Takedown Updates', desc: 'Status changes on your DMCA takedown requests.' }
                ].map((n, i) => (
                  <div key={i} className="flex items-center justify-between p-6">
                    <div>
                      <p className="font-semibold text-ink">{n.title}</p>
                      <p className="mt-1 text-sm text-muted">{n.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" defaultChecked={i !== 1} />
                      <div className="peer h-6 w-11 rounded-full bg-surface-alt after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-line after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/30"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add a catch-all for other tabs */}
          {['api', 'billing', 'sessions', 'integrations'].includes(activeTab) && (
            <div className="card p-12 text-center text-muted">
              <p className="font-semibold text-ink">{sections.find(s => s.id === activeTab)?.label} Settings</p>
              <p className="mt-2 text-sm">This section is currently under development.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
