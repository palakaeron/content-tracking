'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import Link from 'next/link';
import { Upload, Activity, ShieldAlert, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';

type S = {
  totalContent: number;
  totalUses: number;
  activeAlerts: number;
  averageConfidence: number;
  activity: Array<{
    id: string;
    severity: string;
    createdAt: string;
    report: { content: { title: string } };
  }>;
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['summary'],
    queryFn: () => api<S>('/analytics/summary'),
  });

  const cards = [
    { label: 'Total Assets', value: data?.totalContent, trend: '+12%', isPositive: true, icon: Upload },
    { label: 'Detected Uses', value: data?.totalUses, trend: '+5%', isPositive: true, icon: Activity },
    { label: 'Active Alerts', value: data?.activeAlerts, trend: '-2%', isPositive: false, icon: ShieldAlert },
    { label: 'Avg Confidence', value: data ? `${Math.round(data.averageConfidence * 100)}%` : undefined, trend: '+1%', isPositive: true, icon: Activity },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Overview</p>
          <h1 className="text-display mt-1 text-ink">Dashboard</h1>
        </div>
        <Link className="btn btn-primary" href="/content">
          <Upload size={16} /> Add Content
        </Link>
      </div>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <div className="card card-hover flex flex-col p-5" key={i}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{c.label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt">
                <c.icon size={16} className="text-ink-secondary" />
              </div>
            </div>
            <div className="mt-auto flex items-end justify-between">
              <p className="text-kpi">{isLoading ? <span className="skeleton h-8 w-16" /> : c.value ?? 0}</p>
              {!isLoading && (
                <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${c.isPositive ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                  {c.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {c.trend}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chart Area */}
        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-heading-sm">Detection Trends</h2>
            <button className="focus-ring rounded-lg p-1 text-muted hover:bg-surface-alt hover:text-ink">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <div className="p-6">
            <div className="flex h-64 items-end gap-1">
              {/* Dummy bars for visual effect */}
              {Array.from({ length: 30 }).map((_, i) => {
                const height = Math.floor(Math.random() * 60) + 20;
                return (
                  <div key={i} className="group relative flex-1">
                    <div
                      className="absolute bottom-0 w-full rounded-t bg-brand/20 transition-all group-hover:bg-brand"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Activity Feed */}
        <section className="card flex flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-heading-sm">Recent Activity</h2>
            <Link className="text-sm font-semibold text-brand hover:underline" href="/alerts">
              View all
            </Link>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {isLoading ? (
              <div className="space-y-4 p-4">
                {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 w-full" />)}
              </div>
            ) : data?.activity.length ? (
              <ul className="divide-y divide-line">
                {data.activity.map((a) => (
                  <li className="flex items-start gap-3 p-4 transition-colors hover:bg-surface-alt/50" key={a.id}>
                    <div className={`mt-0.5 flex h-2 w-2 shrink-0 rounded-full ${a.severity === 'HIGH' ? 'bg-danger' : a.severity === 'MEDIUM' ? 'bg-warning' : 'bg-success'}`} />
                    <div>
                      <p className="text-sm font-medium text-ink">{a.report.content.title}</p>
                      <p className="mt-1 text-caption text-muted">{new Date(a.createdAt).toLocaleString()} · {a.severity.toLowerCase()} risk</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt">
                  <Activity size={24} className="text-muted" />
                </div>
                <p className="text-sm font-medium text-ink">No activity yet</p>
                <p className="mt-1 text-caption text-muted">Scan an item in your library to see detections here.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
