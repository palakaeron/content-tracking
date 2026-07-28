'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { ShieldAlert, AlertTriangle, Info, Filter, ExternalLink, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

type AlertItem = {
  id: string;
  severity: string;
  status: string;
  createdAt: string;
  report: {
    sourceUrl: string;
    confidence: number;
    content: { title: string };
  };
};

export default function Alerts() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api<AlertItem[]>('/alerts'),
  });

  const filteredData = data?.filter((alert) => tab === 'ALL' || alert.severity === tab) ?? [];

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'HIGH':
      case 'CRITICAL':
        return { icon: ShieldAlert, bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20' };
      case 'MEDIUM':
        return { icon: AlertTriangle, bg: 'bg-warning/10', text: 'text-warning-dark', border: 'border-warning/20' };
      default:
        return { icon: Info, bg: 'bg-brand/10', text: 'text-brand', border: 'border-brand/20' };
    }
  };

  if (isError) {
    return (
      <div className="card border-danger/30 bg-danger-light p-6 text-center">
        <ShieldAlert size={24} className="mx-auto mb-2" />
        <p className="font-semibold text-danger">{error instanceof Error ? error.message : 'Failed to load alerts'}</p>
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
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Review Queue</p>
          <h1 className="text-display mt-1 text-ink">Action Center</h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-secondary">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="flex space-x-1 rounded-xl bg-surface-alt p-1 sm:w-max" role="tablist" aria-label="Alert severity filters">
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === value ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
          >
            {value === 'ALL' ? 'All Alerts' : `${value} Risk`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ?
          [1, 2, 3, 4].map((item) => <div key={item} className="skeleton card h-24" />)
        : filteredData.length > 0 ?
          filteredData.map((alert) => {
            const styles = getSeverityStyles(alert.severity);
            const Icon = styles.icon;

            return (
              <article
                className={`card flex flex-col gap-4 p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${styles.border} border-l-4`}
                key={alert.id}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.bg}`}>
                    <Icon size={20} className={styles.text} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">{alert.report.content.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <span className="flex items-center gap-1.5 font-medium">{alert.severity} RISK</span>
                      <span className="text-muted">•</span>
                      <span className="text-muted">{Math.round(alert.report.confidence * 100)}% Confidence Match</span>
                      <span className="text-muted">•</span>
                      <span className="text-muted">{new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                    <a
                      className="mt-2 flex items-center gap-1.5 text-sm text-brand hover:underline"
                      href={alert.report.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={14} aria-hidden="true" /> Review source content
                    </a>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
                  <button type="button" className="btn btn-primary btn-sm w-full sm:w-auto">
                    Take Action
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await api(`/alerts/${alert.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ status: 'DISMISSED' }),
                      });
                      queryClient.invalidateQueries({ queryKey: ['alerts'] });
                    }}
                    className="btn btn-ghost btn-sm w-full text-muted hover:text-danger sm:w-auto"
                  >
                    Dismiss
                  </button>
                </div>
              </article>
            );
          })
        : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <ShieldCheck size={32} className="text-success" aria-hidden="true" />
            </div>
            <h2 className="text-heading font-bold text-ink">All clear!</h2>
            <p className="mt-2 max-w-md text-sm text-muted">
              You have no active alerts in this category. We&apos;ll notify you when new potential infringements are detected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
