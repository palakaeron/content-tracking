'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Upload, Bell, CheckCircle2, Activity as ActivityIcon, Download, ShieldAlert } from 'lucide-react';

type Alert = {
  id: string;
  severity: string;
  status: string;
  createdAt: string;
  report: {
    content: { title: string };
    sourceUrl: string;
    confidence: number;
    matchType: string;
  };
};

function severityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
    case 'HIGH':
      return 'text-danger';
    case 'MEDIUM':
      return 'text-warning';
    default:
      return 'text-success';
  }
}

function severityBg(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
    case 'HIGH':
      return 'bg-danger-light';
    case 'MEDIUM':
      return 'bg-warning-light';
    default:
      return 'bg-success-light';
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'DISMISSED':
      return 'Dismissed';
    case 'CONFIRMED':
      return 'Takedown filed';
    case 'REVIEWING':
      return 'Under review';
    default:
      return 'New detection';
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function downloadCSV(filename: string, rows: string[][]): void {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Activity() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api<Alert[]>('/alerts'),
  });

  const alerts: Alert[] = Array.isArray(data) ? (data as Alert[]) : [];

  const handleExportLog = () => {
    const header = ['Date', 'Asset', 'Platform', 'Severity', 'Status', 'Confidence', 'Match Type'];
    const rows = alerts.map((a) => [
      new Date(a.createdAt).toLocaleString(),
      a.report.content.title,
      extractDomain(a.report.sourceUrl),
      a.severity,
      statusLabel(a.status),
      `${Math.round(a.report.confidence * 100)}%`,
      a.report.matchType,
    ]);
    downloadCSV(`sentinel-activity-log-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows]);
  };

  if (isError) {
    return (
      <div className="card border-danger/30 bg-danger-light p-6 text-center">
        <ShieldAlert size={24} className="mx-auto mb-2 text-danger" />
        <p className="font-semibold text-danger">Failed to load activity log</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Audit Log</p>
          <h1 className="text-display mt-1 text-ink">Activity Timeline</h1>
        </div>
        <button
          className="btn btn-secondary"
          onClick={handleExportLog}
          disabled={isLoading || alerts.length === 0}
        >
          <Download size={16} /> Export Log
        </button>
      </div>

      <div className="card p-6">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-48" />
                  <div className="skeleton h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt">
              <ActivityIcon size={28} className="text-muted" />
            </div>
            <p className="font-semibold text-ink">No activity yet</p>
            <p className="mt-1 text-sm text-muted">Run a scan on your content to see activity here.</p>
          </div>
        ) : (
          <div className="relative pl-6">
            {/* Vertical timeline line */}
            <div className="absolute bottom-0 left-[27px] top-4 w-px bg-line" />

            <div className="space-y-8">
              {alerts.map((alert) => {
                const color = severityColor(alert.severity);
                const bg = severityBg(alert.severity);
                return (
                  <div key={alert.id} className="relative flex gap-6">
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-surface ${bg}`}
                    >
                      <Bell size={14} className={color} aria-hidden="true" />
                    </div>
                    <div className="-mt-1.5 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-semibold text-ink">
                          {alert.severity.charAt(0) + alert.severity.slice(1).toLowerCase()} risk detection
                          &mdash; {alert.report.content.title}
                        </h3>
                        <span className="text-xs font-medium text-muted whitespace-nowrap">
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {statusLabel(alert.status)} on{' '}
                        <span className="font-medium text-ink-secondary">
                          {extractDomain(alert.report.sourceUrl)}
                        </span>{' '}
                        &middot; {Math.round(alert.report.confidence * 100)}% confidence &middot;{' '}
                        {alert.report.matchType}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
