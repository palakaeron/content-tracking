'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../lib/api';
import { FileText, Calendar, Shield, Activity, MoreHorizontal, Download, Trash, Scan, ImageIcon, Play } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ContentDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: c, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => api<any>(`/content/${id}`),
  });

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
          <button className="btn btn-primary bg-surface text-ink border hover:bg-surface-alt">
            <Scan size={16} /> Scan Now
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
                      <a href={r.sourceUrl} target="_blank" className="font-medium text-ink hover:text-brand">{r.sourceUrl}</a>
                      <p className="text-sm text-muted">Detected on {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="badge badge-warning">{Math.round(r.confidence * 100)}% Match</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity size={24} className="mb-2 text-muted" />
                <p className="text-sm text-muted">No detections found yet.</p>
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
              <div className="flex justify-between">
                <span className="text-muted">Size</span>
                <span className="font-medium text-ink">2.4 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Last Scanned</span>
                <span className="font-medium text-ink">2 hours ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Total Detections</span>
                <span className="font-medium text-ink">{c._count?.reports || 0}</span>
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
