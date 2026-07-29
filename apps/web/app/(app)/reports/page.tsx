'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Search, Filter, MoreHorizontal, FileText, CheckCircle2, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { api } from '../../../lib/api';

type Report = {
  id: string;
  sourceUrl: string;
  confidence: number;
  matchType: string;
  detectedAt: string;
  content: { title: string };
  alert?: { status: string } | null;
};

type ReportsResponse = Report[];

function extractPlatform(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Unknown';
  }
}

function reportStatus(report: Report): string {
  if (report.alert?.status === 'DISMISSED') return 'DISMISSED';
  if (report.alert?.status === 'CONFIRMED') return 'VERIFIED';
  if (report.confidence >= 0.9) return 'VERIFIED';
  return 'PENDING';
}

function downloadCSV(filename: string, rows: string[][]): void {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function UsageReports() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['reports', q, page],
    queryFn: async () => {
      const search = q ? `&search=${encodeURIComponent(q)}` : '';
      return api<ReportsResponse>(`/reports?page=${page}&limit=${limit}${search}`);
    },
  });

  // For CSV we fetch all reports (large limit) without pagination
  const handleExportCSV = async () => {
    try {
      const allReports = await api<ReportsResponse>('/reports?page=1&limit=1000');
      const reports = Array.isArray(allReports) ? allReports : [];
      const header = ['Asset Name', 'Platform', 'Confidence (%)', 'Match Type', 'Detection Date', 'Status', 'Source URL'];
      const rows = reports.map((r) => [
        r.content.title,
        extractPlatform(r.sourceUrl),
        String(Math.round(r.confidence * 100)),
        r.matchType,
        new Date(r.detectedAt).toLocaleDateString(),
        reportStatus(r),
        r.sourceUrl,
      ]);
      downloadCSV(`sentinel-usage-reports-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows]);
    } catch {
      // silently ignore; user can retry
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="badge badge-danger">
            <AlertCircle size={12} /> Verified Match
          </span>
        );
      case 'PENDING':
        return (
          <span className="badge badge-warning">
            <Clock size={12} /> Needs Review
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="badge badge-neutral">
            <CheckCircle2 size={12} /> Dismissed
          </span>
        );
      default:
        return null;
    }
  };

  if (isError) {
    return (
      <div className="card border-danger/30 bg-danger-light p-6 text-center">
        <ShieldAlert size={24} className="mx-auto mb-2" />
        <p className="font-semibold text-danger">{error instanceof Error ? error.message : 'Failed to load reports'}</p>
        <button className="btn btn-primary mt-4" onClick={() => refetch()} type="button">
          Retry
        </button>
      </div>
    );
  }

  const reports = data ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Analytics</p>
          <h1 className="text-display mt-1 text-ink">Usage Reports</h1>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent pl-9 text-sm text-ink outline-none placeholder:text-muted"
              placeholder="Search reports by asset name..."
              aria-label="Search reports"
            />
          </div>
          <button type="button" className="btn btn-ghost btn-sm">
            <Filter size={14} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink">
            <thead className="bg-surface-alt/50 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-6 py-4 font-semibold">Asset Name</th>
                <th className="px-6 py-4 font-semibold">Platform</th>
                <th className="px-6 py-4 font-semibold">Confidence</th>
                <th className="px-6 py-4 font-semibold">Match Type</th>
                <th className="px-6 py-4 font-semibold">Detection Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {isLoading ?
                [1, 2, 3, 4, 5].map((item) => (
                  <tr key={item}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="skeleton h-10 w-full" />
                    </td>
                  </tr>
                ))
              : reports.length ?
                reports.map((report) => {
                  const status = reportStatus(report);
                  const confidencePct = Math.round(report.confidence * 100);
                  return (
                    <tr key={report.id} className="transition-colors hover:bg-surface-alt/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                            <FileText size={20} className="text-brand" />
                          </div>
                          <span className="font-semibold">{report.content.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{extractPlatform(report.sourceUrl)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-alt">
                            <div className="h-full bg-brand" style={{ width: `${confidencePct}%` }} />
                          </div>
                          {confidencePct}%
                        </div>
                      </td>
                      <td className="px-6 py-4">{report.matchType}</td>
                      <td className="px-6 py-4 text-muted">{new Date(report.detectedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{getStatusBadge(status)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/reports/${report.id}`}
                          className="rounded p-1 text-muted hover:bg-surface-alt hover:text-ink"
                          aria-label={`View report for ${report.content.title}`}
                        >
                          <MoreHorizontal size={18} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted">
                    No usage reports found. Run a scan on your content to detect matches.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <p className="text-xs text-muted">Page {page}</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={!reports.length || reports.length < limit}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
