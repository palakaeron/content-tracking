'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Upload, Activity, ShieldAlert, TrendingUp, ArrowUpRight,
  Scan, CheckCircle2, X, RefreshCw, ExternalLink,
} from 'lucide-react';

type Summary = {
  totalContent: number;
  totalUses: number;
  activeAlerts: number;
  averageConfidence: number;
  detectionTrend: Array<{ date: string; count: number }>;
  activity: Array<{
    id: string;
    severity: string;
    createdAt: string;
    report: { content: { title: string }; sourceUrl: string };
  }>;
};

type LastScanResult = {
  assetTitle: string;
  detectionsFound: number;
  scannedAt: string;
};

const LAST_SCAN_KEY = 'sentinel_last_scan';

/** Shorten a date string "2026-07-29" → "Jul 29" */
function shortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

const SEVERITY_DOT: Record<string, string> = {
  CRITICAL: 'bg-danger',
  HIGH:     'bg-danger',
  MEDIUM:   'bg-warning',
  LOW:      'bg-success',
};

const SEVERITY_BADGE: Record<string, string> = {
  CRITICAL: 'bg-danger/10 text-danger',
  HIGH:     'bg-danger/10 text-danger',
  MEDIUM:   'bg-warning/10 text-warning-dark',
  LOW:      'bg-success/10 text-success',
};

/* Custom tooltip for the area chart */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-surface px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-ink">{label}</p>
      <p className="mt-0.5 text-brand font-medium">
        {payload[0].value} detection{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['summary'],
    queryFn: () => api<Summary>('/analytics/summary'),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const [lastScan, setLastScan] = useState<LastScanResult | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_SCAN_KEY);
      if (raw) {
        setLastScan(JSON.parse(raw) as LastScanResult);
        setBannerVisible(true);
      }
    } catch { /* ignore */ }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Prepare chart data — convert ISO dates to readable labels
  const chartData = (data?.detectionTrend ?? []).map((p) => ({
    date: shortDate(p.date),
    full: p.date,
    count: p.count,
  }));

  // Summary stats derived from trend
  const totalDetections = chartData.reduce((s, p) => s + p.count, 0);
  const peakDay = chartData.reduce((best, p) => (p.count > best.count ? p : best), { date: '—', count: 0, full: '' });
  const recentDays = chartData.slice(-7);
  const recentCount = recentDays.reduce((s, p) => s + p.count, 0);
  const prevDays = chartData.slice(-14, -7);
  const prevCount = prevDays.reduce((s, p) => s + p.count, 0);
  const trendUp = recentCount >= prevCount;

  const cards = [
    {
      label: 'Total Assets',
      value: data?.totalContent ?? 0,
      icon: Upload,
      sub: 'in your library',
      color: 'text-brand',
      bg: 'bg-brand/10',
    },
    {
      label: 'Total Detections',
      value: data?.totalUses ?? 0,
      icon: Activity,
      sub: 'matches found',
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'Active Alerts',
      value: data?.activeAlerts ?? 0,
      icon: ShieldAlert,
      sub: 'need review',
      color: 'text-danger',
      bg: 'bg-danger/10',
    },
    {
      label: 'Avg Confidence',
      value: data ? `${Math.round(data.averageConfidence * 100)}%` : '—',
      icon: TrendingUp,
      sub: 'match accuracy',
      color: 'text-success',
      bg: 'bg-success/10',
    },
  ];

  if (isError) {
    return (
      <div className="card border-danger/30 bg-danger-light p-6 text-center">
        <p className="font-semibold text-danger">
          {error instanceof Error ? error.message : 'Failed to load dashboard'}
        </p>
        <button className="btn btn-primary mt-4" onClick={() => refetch()} type="button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Overview</p>
          <h1 className="text-display mt-1 text-ink">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            className="btn btn-secondary"
            title="Refresh data"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <Link className="btn btn-primary" href="/content">
            <Upload size={16} /> Add Content
          </Link>
        </div>
      </div>

      {/* Last Scan Banner */}
      {bannerVisible && lastScan && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-success/30 bg-success-light px-5 py-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/20">
              <CheckCircle2 size={18} className="text-success" />
            </div>
            <div>
              <p className="font-semibold text-ink">
                Scan complete —{' '}
                <span className="text-success">{lastScan.detectionsFound}</span>{' '}
                new detection{lastScan.detectionsFound !== 1 ? 's' : ''} found
              </p>
              <p className="mt-0.5 text-sm text-muted">
                <span className="font-medium text-ink-secondary">{lastScan.assetTitle}</span>
                {' · '}
                {new Date(lastScan.scannedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/analytics" className="btn btn-secondary btn-sm">
              Full Analytics <ArrowUpRight size={14} />
            </Link>
            <button
              onClick={() => {
                setBannerVisible(false);
                localStorage.removeItem(LAST_SCAN_KEY);
              }}
              className="rounded-lg p-1.5 text-muted hover:bg-success/10 hover:text-ink"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div className="card flex flex-col gap-3 p-5" key={card.label}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{card.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight text-ink">
              {isLoading ? <span className="skeleton inline-block h-8 w-16 rounded" /> : card.value}
            </p>
            <p className="text-xs text-muted">{card.sub}</p>
          </div>
        ))}
      </section>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Detection Trends — Recharts AreaChart */}
        <section className="card lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-heading-sm font-semibold text-ink">Detection Trends</h2>
              {!isLoading && chartData.length > 0 && (
                <p className="mt-0.5 text-xs text-muted">
                  {totalDetections} total · peak {peakDay.count} on {peakDay.date}
                  {chartData.length >= 14 && (
                    <span
                      className={`ml-2 inline-flex items-center gap-0.5 font-medium ${trendUp ? 'text-danger' : 'text-success'}`}
                    >
                      <TrendingUp size={11} className={trendUp ? '' : 'rotate-180'} />
                      {trendUp ? '+' : '−'}{Math.abs(recentCount - prevCount)} vs prev 7d
                    </span>
                  )}
                </p>
              )}
            </div>
            <Link
              href="/analytics"
              className="text-xs font-semibold text-brand hover:underline"
            >
              Full report →
            </Link>
          </div>

          <div className="flex-1 p-4">
            {isLoading ? (
              <div className="skeleton h-64 w-full rounded-xl" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(var(--brand))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--brand))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--line))"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted))', fontSize: 11 }}
                    interval="preserveStartEnd"
                    dy={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted))', fontSize: 11 }}
                    allowDecimals={false}
                    width={36}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Detections"
                    stroke="hsl(var(--brand))"
                    strokeWidth={2.5}
                    fill="url(#trendGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: 'hsl(var(--brand))', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-center text-sm text-muted">
                <Activity size={36} className="text-muted/30" />
                <div>
                  <p className="font-semibold text-ink">No detections yet</p>
                  <p className="mt-1 text-xs">Scan content to start seeing trends here.</p>
                </div>
                <Link href="/content" className="btn btn-secondary btn-sm mt-1">
                  <Scan size={13} /> Scan Content
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="card flex flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-heading-sm font-semibold text-ink">Recent Activity</h2>
            <Link className="text-xs font-semibold text-brand hover:underline" href="/alerts">
              View all →
            </Link>
          </div>
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="skeleton h-3 w-3/4 rounded" />
                      <div className="skeleton h-3 w-1/2 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data?.activity.length ? (
              <ul className="divide-y divide-line">
                {data.activity.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-alt/40"
                  >
                    {/* Severity dot */}
                    <div
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[entry.severity] ?? 'bg-muted'}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-ink">
                          {entry.report.content.title}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            SEVERITY_BADGE[entry.severity] ?? 'bg-surface-alt text-muted'
                          }`}
                        >
                          {entry.severity}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                        <span>{extractDomain(entry.report.sourceUrl)}</span>
                        <span>·</span>
                        <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <a
                      href={entry.report.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 shrink-0 text-muted hover:text-brand"
                      aria-label="View source"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt">
                  <Activity size={22} className="text-muted" />
                </div>
                <p className="text-sm font-semibold text-ink">No activity yet</p>
                <p className="text-xs text-muted">Scan content to see detections here.</p>
                <Link href="/content" className="btn btn-secondary btn-sm mt-2">
                  <Scan size={13} /> Go to Library
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
