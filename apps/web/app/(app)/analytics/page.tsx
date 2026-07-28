'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, Activity, ShieldAlert, FileText, ChevronDown } from 'lucide-react';

type Summary = {
  ranking: Array<{ id: string; title: string; _count: { reports: number } }>;
  detectionRate: number;
  highRiskViolations: number;
  takedownsFiled: number;
  totalUses: number;
  platformDistribution: Array<{ platform: string; count: number }>;
};

const CHART_COLORS = ['hsl(var(--brand))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--success))'];

export default function Analytics() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['summary'],
    queryFn: () => api<Summary>('/analytics/summary'),
  });

  const rows =
    data?.ranking.map((item) => ({
      name: item.title.length > 18 ? `${item.title.slice(0, 18)}…` : item.title,
      uses: item._count.reports,
    })) ?? [];

  if (isError) {
    return (
      <div className="card border-danger/30 bg-danger-light p-6 text-center">
        <p className="font-semibold text-danger">{error instanceof Error ? error.message : 'Failed to load analytics'}</p>
        <button className="btn btn-primary mt-4" onClick={() => refetch()} type="button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Performance</p>
          <h1 className="text-display mt-1 text-ink">Analytics</h1>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="btn btn-secondary bg-surface">
            <Calendar size={16} /> Last 30 Days <ChevronDown size={14} />
          </button>
          <button type="button" className="btn btn-primary">
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Detection Rate</p>
              <p className="text-xl font-bold text-ink">
                {isLoading ? <span className="skeleton inline-block h-7 w-16" /> : `${data?.detectionRate ?? 0}%`}
              </p>
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
              <p className="text-xl font-bold text-ink">
                {isLoading ? <span className="skeleton inline-block h-7 w-10" /> : (data?.highRiskViolations ?? 0)}
              </p>
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
              <p className="text-xl font-bold text-ink">
                {isLoading ? <span className="skeleton inline-block h-7 w-10" /> : (data?.takedownsFiled ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card flex flex-col">
          <div className="border-b px-6 py-4">
            <h2 className="text-heading-sm">Most Detected Assets</h2>
          </div>
          <div className="h-[350px] p-6">
            {isLoading ? (
              <div className="flex h-full items-end justify-around gap-2 pb-6 pt-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="skeleton w-12" style={{ height: `${30 + item * 10}%` }} />
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

        <section className="card flex flex-col">
          <div className="border-b px-6 py-4">
            <h2 className="text-heading-sm">Platform Distribution</h2>
          </div>
          <div className="flex flex-1 items-center justify-center p-6">
            {isLoading ? (
              <div className="skeleton h-48 w-48 rounded-full" />
            ) : data?.platformDistribution.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.platformDistribution}
                    dataKey="count"
                    nameKey="platform"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {data.platformDistribution.map((entry, index) => (
                      <Cell key={entry.platform} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted">No platform data yet.</p>
            )}
          </div>
          <div className="border-t px-6 py-4">
            <div className="flex flex-wrap justify-center gap-4">
              {data?.platformDistribution.map((entry, index) => (
                <div key={entry.platform} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-sm text-muted">{entry.platform}</span>
                </div>
              )) ?? null}
            </div>
            {!isLoading && (
              <p className="mt-3 text-center text-xs text-muted">{data?.totalUses ?? 0} total detections</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
