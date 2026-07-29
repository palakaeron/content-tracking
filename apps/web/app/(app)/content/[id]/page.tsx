'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../lib/api';
import { useState } from 'react';
import { FileText, Calendar, Shield, Activity, MoreHorizontal, Trash, Scan, ImageIcon, Play, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
export default function ContentDetail() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const id = params.id as string;

  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [scanCount, setScanCount] = useState<number | null>(null);

  const { data: c, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => api<any>(`/content/${id}`),
  });

  const handleScan = async () => {
    if (scanState === 'scanning') return;
    setScanState('scanning');
    try {
      const result = await api<{ created: number }>(`/content/${id}/scan`, { method: 'POST' });
      setScanCount(result.created);
      setScanState('done');

      // Save result for dashboard banner
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'sentinel_last_scan',
          JSON.stringify({
            assetTitle: c?.title ?? 'Unknown Asset',
            detectionsFound: result.created,
            scannedAt: new Date().toISOString(),
          }),
        );
      }

      // Invalidate queries so dashboard/analytics data is fresh
      qc.invalidateQueries({ queryKey: ['summary'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
      qc.invalidateQueries({ queryKey: ['alerts'] });

      // Small delay for user to see the "done" state, then redirect smoothly
      setTimeout(() => {
        router.push('/analytics');
      }, 900);
    } catch {
      setScanState('idle');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-12 w-1/3" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="skeleton lg:col-span-2 h-96" />
          <div className="skeleton h-96" />
        </div>
      </div>
    );
  }

  if (!c) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-heading font-bold text-ink">Asset Not Found</h2>
        <p className="mt-2 text-muted">This asset may have been deleted or you don&apos;t have access.</p>
        <button onClick={() => router.push('/content')} className="btn btn-primary mt-6">Back to Library</button>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'IMAGE': return <ImageIcon size={24} className="text-brand" />;
      case 'VIDEO': return <Play size={24} className="text-brand" />;
      default: return <FileText size={24} className="text-brand" />;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Scan result banner */}
      {scanState === 'done' && scanCount !== null && (
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success-light px-5 py-3 text-sm font-medium text-success animate-fade-in">
          <CheckCircle2 size={18} />
          Scan complete — {scanCount} new detection{scanCount !== 1 ? 's' : ''} found. Redirecting to Analytics…
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand/10">
            {getIcon(c.type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-display text-ink">{c.title}</h1>
              <span className={`badge ${c.status === 'PROTECTED' ? 'badge-success' : 'badge-neutral'}`}>
                {c.status}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-3 text-sm text-muted">
              <span className="flex items-center gap-1.5"><Calendar size={14}/> Added {new Date(c.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>ID: {c.id.split('-')[0]}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleScan}
            disabled={scanState !== 'idle'}
            className="btn btn-primary"
          >
            {scanState === 'scanning' ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Scanning…
              </>
            ) : scanState === 'done' ? (
              <>
                <CheckCircle2 size={16} /> Done
              </>
            ) : (
              <>
                <Scan size={16} /> Scan Now
              </>
            )}
          </button>
          <button className="btn btn-secondary px-3">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold text-ink">Asset Preview</h2>
            </div>
            <div className="bg-surface-alt p-6">
              {c.type === 'TEXT' ? (
                <div className="prose prose-sm max-w-none rounded-xl border bg-surface p-6 shadow-sm">
                  {c.textBody || 'No text content available.'}
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-xl border bg-surface shadow-sm">
                  <p className="text-muted">Preview not available for this file type.</p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-ink">Detection History</h2>
              <Link href="/reports" className="text-sm font-medium text-brand hover:underline">View all reports</Link>
            </div>
            {c.reports && c.reports.length > 0 ? (
              <div className="divide-y divide-line">
                {c.reports.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between py-3">
                    <div>
                      <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-ink hover:text-brand">{r.sourceUrl}</a>
                      <p className="text-sm text-muted">Detected on {new Date(r.detectedAt ?? r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="badge badge-warning">{Math.round(r.confidence * 100)}% Match</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity size={24} className="mb-2 text-muted" />
                <p className="text-sm text-muted">No detections found yet. Run a scan to check for matches.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="mb-4 font-semibold text-ink">Asset Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Type</span>
                <span className="font-medium text-ink">{c.type}</span>
              </div>
              {c.byteSize && (
                <div className="flex justify-between">
                  <span className="text-muted">Size</span>
                  <span className="font-medium text-ink">{(c.byteSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Total Detections</span>
                <span className="font-medium text-ink">{c._count?.reports ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <span className="font-medium text-ink capitalize">{c.status?.toLowerCase()}</span>
              </div>
            </div>
            <div className="mt-6 border-t pt-6">
              <button className="btn btn-ghost w-full justify-start text-danger hover:bg-danger-light">
                <Trash size={16} /> Delete Asset
              </button>
            </div>
          </div>

          <div className="card bg-brand-light p-6 border-brand/20">
            <div className="mb-2 flex items-center gap-2 text-brand">
              <Shield size={20} />
              <h3 className="font-semibold">Protection Status</h3>
            </div>
            <p className="text-sm text-brand-dark">
              This asset is actively monitored across 50+ platforms. You will receive an alert immediately if a high-confidence match is found.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
