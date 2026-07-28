'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Download, Calendar, Activity, ShieldAlert, FileText, ChevronDown } from 'lucide-react';

type S = {
  ranking: Array<{
    id: string;
    title: string;
    _count: { reports: number };
  }>;
};

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['summary'],
    queryFn: () => api<S>('/analytics/summary'),
  });

  const rows = data?.ranking.map((x) => ({
    name: x.title,
    uses: x._count.reports,
  })) ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Performance</p>
          <h1 className="text-display mt-1 text-ink">Analytics</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary bg-surface">
            <Calendar size={16} /> Last 30 Days <ChevronDown size={14} />
          </button>
          <button className="btn btn-primary">
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Detection Rate</p>
              <p className="text-xl font-bold text-ink">99.2%</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">High Risk Violations</p>
              <p className="text-xl font-bold text-ink">12</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Takedowns Filed</p>
              <p className="text-xl font-bold text-ink">89</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performing Content */}
        <section className="card flex flex-col">
          <div className="border-b px-6 py-4">
            <h2 className="text-heading-sm">Most Detected Assets</h2>
          </div>
          <div className="h-[350px] p-6">
            {isLoading ? (
              <div className="flex h-full items-end justify-around gap-2 pb-6 pt-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton w-12" style={{ height: `${Math.random() * 60 + 20}%` }} />
                ))}
              </div>
            ) : rows.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--line))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted))', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted))', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--surface-alt))' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--line))', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="uses" fill="hsl(var(--brand))" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                No data available to display chart.
              </div>
            )}
          </div>
        </section>

        {/* Risk Analysis (Placeholder) */}
        <section className="card flex flex-col">
          <div className="border-b px-6 py-4">
            <h2 className="text-heading-sm">Platform Distribution</h2>
          </div>
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-[16px] border-surface-alt">
              {/* Fake donut segments */}
              <div className="absolute inset-[-16px] rounded-full border-[16px] border-brand" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 50%)' }} />
              <div className="absolute inset-[-16px] rounded-full border-[16px] border-accent" style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 0, 50% 0)' }} />
              <div className="absolute inset-[-16px] rounded-full border-[16px] border-warning" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0)' }} />
              <div className="text-center">
                <p className="text-2xl font-bold text-ink">342</p>
                <p className="text-[10px] uppercase tracking-wider text-muted">Total Uses</p>
              </div>
            </div>
          </div>
          <div className="border-t px-6 py-4">
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-brand" /><span className="text-sm text-muted">Social Media</span></div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-accent" /><span className="text-sm text-muted">Blogs</span></div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-warning" /><span className="text-sm text-muted">E-commerce</span></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
