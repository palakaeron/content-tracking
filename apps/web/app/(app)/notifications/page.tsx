'use client';

import { Bell, CheckCircle2, AlertCircle, FileText, Settings, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function Notifications() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD'>('ALL');

  const notifications = [
    { id: 1, type: 'ALERT', title: 'High risk match detected', message: 'A 99% match for your video was found on an unauthorized streaming site.', time: '10 min ago', unread: true, icon: ShieldAlert, color: 'text-danger', bg: 'bg-danger/10' },
    { id: 2, type: 'SYSTEM', title: 'Upload completed', message: 'Batch upload "Q3_Assets.zip" was successfully processed and scanned.', time: '2 hours ago', unread: true, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { id: 3, type: 'REPORT', title: 'Weekly summary ready', message: 'Your content was detected 47 times this week. View the full report.', time: '1 day ago', unread: false, icon: FileText, color: 'text-brand', bg: 'bg-brand/10' },
    { id: 4, type: 'SYSTEM', title: 'Plan upgraded', message: 'Your account has been successfully upgraded to the Enterprise Plan.', time: '2 days ago', unread: false, icon: Bell, color: 'text-muted', bg: 'bg-surface-alt' },
  ];

  const filtered = notifications.filter(n => activeTab === 'ALL' || n.unread);

  return (
    <div className="animate-fade-in mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Inbox</p>
          <h1 className="text-display mt-1 text-ink">Notifications</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary">
            <CheckCircle2 size={16} /> Mark all as read
          </button>
          <button className="btn btn-secondary px-3">
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex gap-4 border-b px-6 pt-4">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${activeTab === 'ALL' ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`}
          >
            All Notifications
          </button>
          <button 
            onClick={() => setActiveTab('UNREAD')}
            className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${activeTab === 'UNREAD' ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`}
          >
            Unread
          </button>
        </div>

        <div className="divide-y divide-line">
          {filtered.length > 0 ? (
            filtered.map((n) => (
              <div key={n.id} className={`flex gap-4 p-6 transition-colors hover:bg-surface-alt/30 ${n.unread ? 'bg-brand/5' : ''}`}>
                <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${n.bg}`}>
                  <n.icon size={20} className={n.color} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className={`font-semibold ${n.unread ? 'text-ink' : 'text-ink-secondary'}`}>{n.title}</h3>
                    <span className="whitespace-nowrap text-xs text-muted">{n.time}</span>
                  </div>
                  <p className={`mt-1 text-sm ${n.unread ? 'text-ink-secondary' : 'text-muted'}`}>{n.message}</p>
                </div>
                {n.unread && (
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-brand" />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Bell size={32} className="mx-auto mb-4 text-muted opacity-50" />
              <h3 className="font-semibold text-ink">No notifications</h3>
              <p className="mt-1 text-sm text-muted">You're all caught up! Check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
