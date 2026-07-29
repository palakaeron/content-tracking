'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Upload, Activity, ShieldAlert, ArrowUpRight, MoreHorizontal, Scan, CheckCircle2, X } from 'lucide-react';

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
    report: { content: { title: string } };
  }>;
};

type LastScanResult = {
  assetTitle: string;
  detectionsFound: number;
  scannedAt: string;
};

const LAST_SCAN_KEY = 'sentinel_last_scan';

export function saveLastScanResult(result: LastScanResult) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_SCAN_KEY, JSON.stringify(result));
  }
}

export default function Dashboard() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['summary'],
    queryFn: () => api<Summary>('/analytics/summary'),
  });

  const [lastScan, setLastScan] = useState<LastScanResult | null>(null);
  const [scanBannerVisible, setScanBannerVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_SCAN_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LastScanResult;
        setLastScan(parsed);
        setScanBannerVisible(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const dismissScanBanner = () => {
    setScanBannerVisible(false);
    localStorage.removeItem(LAST_SCAN_KEY);
  };

  const maxTrend = Math.max(...(data?.detectionTrend.map((point) => point.count) ?? [1]), 1);

  const cards = [
    { label: 'Total Assets', value: data?.totalContent, icon: Upload },
    { label: 'Detected Uses', value: data?.totalUses, icon: Activity },
    { label: 'Active Alerts', value: data?.activeAlerts, icon: ShieldAlert },
    {
      label: 'Avg Confidence',
      value: data ? `${Math.round(data.averageConfidence * 100)}%` : undefined,
      icon: Activity,
    },
  ];

  if (isError) {
    return (
      <div className="card border-danger/30 bg-danger-light p-6 text-center">
        <p className="font-semibold text-danger">{error instanceof Error ? error.message : 'Failed to load dashboard'}</p>
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
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Overview</p>
          <h1 className="text-display mt-1 text-ink">Dashboard</h1>
        </div>
        <Link className="btn btn-primary" href="/content">
          <Upload size={16} /> Add Content
        </Link>
      </div>

      {/* Last Scan Results Banner */}
      {scanBannerVisible && lastScan && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-success/30 bg-success-light px-5 py-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/20">
              <CheckCircle2 size={18} className="text-success" />
            </div>
            <div>
              <p className="font-semibold text-ink">
                Last scan completed — {lastScan.detectionsFound} new detection{lastScan.detectionsFound !== 1 ? 's' : ''} found
              </p>
              <p className="mt-0.5 text-sm text-muted">
                Asset: <span className="font-medium text-ink-secondary">{lastScan.assetTitle}</span>
                {' '}·{' '}
                {new Date(lastScan.scannedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/analytics" className="btn btn-secondary btn-sm">
              View Analytics <ArrowUpRight size={14} />
            </Link>
            <button
              onClick={dismissScanBanner}
              className="rounded-lg p-1.5 text-muted hover:bg-success/10 hover:text-ink"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div className="card card-hover flex flex-col p-5" key={card.label}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{card.label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt">
                <card.icon size={16} className="text-ink-secondary" />
              </div>
            </div>
            <p className="text-kpi mt-auto">
              {isLoading ? <span className="skeleton inline-block h-8 w-16" /> : (card.value ?? 0)}
            </p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-heading-sm">Detection Trends</h2>
            <button
              type="button"
              aria-label="Chart options"
              className="focus-ring rounded-lg p-1 text-muted hover:bg-surface-alt hover:text-ink"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="skeleton h-64 w-full" />
            ) : data?.detectionTrend.length ? (
              <div className="flex h-64 items-end gap-1" role="img" aria-label="Detection trend chart">
                {data.detectionTrend.map((point) => (
                  <div key={point.date} className="group relative flex-1">
                    <div
                      className="absolute bottom-0 w-full rounded-t bg-brand/20 transition-all group-hover:bg-brand"
                      style={{ height: `${Math.max(8, (point.count / maxTrend) * 100)}%` }}
                      title={`${point.date}: ${point.count} detections`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-muted">
                No detection activity yet. Scan content to populate trends.
              </div>
            )}
          </div>
        </section>

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
                {[1, 2, 3].map((item) => (
                  <div key={item} className="skeleton h-12 w-full" />
                ))}
              </div>
            ) : data?.activity.length ? (
              <ul className="divide-y divide-line">
                {data.activity.map((entry) => (
                  <li className="flex items-start gap-3 p-4 transition-colors hover:bg-surface-alt/50" key={entry.id}>
                    <div
                      className={`mt-0.5 flex h-2 w-2 shrink-0 rounded-full ${
                        entry.severity === 'HIGH' || entry.severity === 'CRITICAL'
                          ? 'bg-danger'
                          : entry.severity === 'MEDIUM'
                            ? 'bg-warning'
                            : 'bg-success'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-ink">{entry.report.content.title}</p>
                      <p className="mt-1 text-caption text-muted">
                        {new Date(entry.createdAt).toLocaleString()} · {entry.severity.toLowerCase()} risk
                      </p>
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
                <Link href="/content" className="btn btn-secondary btn-sm mt-4">
                  <Scan size={14} /> Go to Content Library
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
