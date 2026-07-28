'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../lib/api';
import { ArrowLeft, ExternalLink, ShieldAlert, FileText, Download, Scale, Eye } from 'lucide-react';

type ReportDetail = {
  id: string;
  sourceUrl: string;
  confidence: number;
  matchType: string;
  detectedAt: string;
  content: { id: string; title: string; type: string };
  alert: { id: string; status: string; severity: string } | null;
};

function extractPlatform(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Unknown';
  }
}

export default function ReportDetail() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = String(params.id);

  const { data: report, isLoading, isError, error } = useQuery({
    queryKey: ['report', id],
    queryFn: () => api<ReportDetail>(`/reports/${id}`),
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="skeleton h-6 w-32" />
        <div className="skeleton h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="skeleton h-96 lg:col-span-2" />
          <div className="skeleton h-64" />
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="card border-danger/30 bg-danger-light p-6 text-center">
        <ShieldAlert size={24} className="mx-auto mb-2 text-danger" />
        <p className="font-semibold text-danger">
          {error instanceof Error ? error.message : 'Report not found'}
        </p>
        <button className="btn btn-primary mt-4" onClick={() => router.back()} type="button">
          Go Back
        </button>
      </div>
    );
  }

  const confidencePct = Math.round(report.confidence * 100);
  const platform = extractPlatform(report.sourceUrl);

  const handleDismiss = async () => {
    if (!report.alert) return;
    await api(`/alerts/${report.alert.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'DISMISSED' }),
    });
    queryClient.invalidateQueries({ queryKey: ['report', id] });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    router.back();
  };

  const handleConfirm = async () => {
    if (!report.alert) return;
    await api(`/alerts/${report.alert.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'CONFIRMED' }),
    });
    queryClient.invalidateQueries({ queryKey: ['report', id] });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
        type="button"
      >
        <ArrowLeft size={16} /> Back to Reports
      </button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-display text-ink">Detection Report</h1>
            <span className="badge badge-warning">Needs Review</span>
          </div>
          <p className="mt-1 text-sm text-muted">
            ID: {report.id} • Detected {new Date(report.detectedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" type="button">
            <Download size={16} /> Export PDF
          </button>
          <button className="btn btn-primary" type="button" onClick={handleConfirm}>
            <Scale size={16} /> File Takedown
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Match Details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card overflow-hidden p-0">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="flex items-center gap-2 font-semibold text-ink">
                <Eye size={18} className="text-muted" aria-hidden="true" /> Visual Comparison
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-success">{confidencePct}% Match</span>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-line">
              <div className="bg-surface-alt/30 p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Original Asset</p>
                <div className="flex aspect-video w-full items-center justify-center rounded-lg border bg-surface shadow-sm">
                  <FileText size={32} className="text-brand/50" aria-hidden="true" />
                </div>
                <p className="mt-3 truncate text-center text-sm font-medium text-ink">
                  {report.content.title}
                </p>
              </div>
              <div className="bg-surface-alt/30 p-6">
                <p className="mb-4 flex justify-between text-xs font-semibold uppercase tracking-wider text-muted">
                  Detected Usage{' '}
                  <a
                    href={report.sourceUrl}
                    className="flex items-center gap-1 text-brand hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit source: ${report.sourceUrl}`}
                  >
                    Visit <ExternalLink size={10} aria-hidden="true" />
                  </a>
                </p>
                <div className="relative flex aspect-video w-full items-center justify-center rounded-lg border bg-surface shadow-sm">
                  <div className="absolute inset-0 animate-pulse rounded-lg border-2 border-danger" />
                  <FileText size={32} className="text-danger/50" aria-hidden="true" />
                </div>
                <p className="mt-3 truncate text-center text-sm font-medium text-ink">{platform}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 font-semibold text-ink">Source Information</h3>
            <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-muted">URL</p>
                <a
                  href={report.sourceUrl}
                  className="break-all text-sm font-medium text-brand hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {report.sourceUrl}
                </a>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted">Platform</p>
                <p className="text-sm font-medium text-ink">{platform}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted">Match Type</p>
                <p className="text-sm font-medium text-ink">{report.matchType}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted">First Detected</p>
                <p className="text-sm font-medium text-ink">
                  {new Date(report.detectedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="mb-4 font-semibold text-ink">Resolution Workflow</h3>
            <div className="space-y-4">
              <div className="relative pl-8">
                <div className="absolute left-3 top-2 h-full w-px bg-success" />
                <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full bg-success ring-4 ring-surface" />
                <p className="font-semibold text-ink">Detection Made</p>
                <p className="text-sm text-muted">{new Date(report.detectedAt).toLocaleString()}</p>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-3 top-2 h-full w-px bg-line" />
                <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-brand bg-surface ring-4 ring-surface" />
                <p className="font-semibold text-ink">Pending Review</p>
                <p className="text-sm text-muted">Awaiting your action</p>
              </div>
              <div className="relative pl-8 opacity-50">
                <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-muted bg-surface ring-4 ring-surface" />
                <p className="font-semibold text-ink">Resolution</p>
                <p className="text-sm text-muted">Takedown or Dismiss</p>
              </div>
            </div>

            {report.alert && (
              <div className="mt-8 space-y-3 border-t pt-6">
                <button
                  className="btn btn-primary w-full"
                  type="button"
                  onClick={handleConfirm}
                >
                  Verify &amp; Send Takedown
                </button>
                <button
                  className="btn btn-secondary w-full text-danger hover:border-danger hover:bg-danger-light"
                  type="button"
                  onClick={handleDismiss}
                >
                  Dismiss False Positive
                </button>
              </div>
            )}
          </div>

          <div className="card border-none bg-surface-alt p-6">
            <div className="flex items-start gap-3">
              <ShieldAlert size={20} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
              <div>
                <p className="font-semibold text-ink">Legal Disclaimer</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Filing a DMCA takedown is a legal process. Ensure you own the copyrights to the
                  asset before proceeding. Misuse may result in account termination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
