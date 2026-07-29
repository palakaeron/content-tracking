'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, FileText, ImageIcon, Play, CheckCircle2, ShieldAlert, Library, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type C = {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
};

export default function Content() {
  const [q, setQ] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [scanningId, setScanningId] = useState<string | null>(null);
  const qc = useQueryClient();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['content', q],
    queryFn: () => api<C[]>(`/content?page=1&limit=50&search=${encodeURIComponent(q)}`),
  });

  const create = async () => {
    const title = prompt('Enter a title for the new text content:');
    if (title) {
      await api('/content', {
        method: 'POST',
        body: JSON.stringify({ title, type: 'TEXT', textBody: title }),
      });
      qc.invalidateQueries({ queryKey: ['content'] });
    }
  };

  const runScan = async (id: string, title: string) => {
    if (scanningId) return;
    setScanningId(id);
    try {
      const result = await api<{ created: number }>(`/content/${id}/scan`, { method: 'POST' });

      // Save result for dashboard banner
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'sentinel_last_scan',
          JSON.stringify({
            assetTitle: title,
            detectionsFound: result.created,
            scannedAt: new Date().toISOString(),
          }),
        );
      }

      qc.invalidateQueries({ queryKey: ['summary'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
      qc.invalidateQueries({ queryKey: ['alerts'] });
      router.push('/analytics');
    } catch {
      setScanningId(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'IMAGE': return <ImageIcon size={20} className="text-brand" />;
      case 'VIDEO': return <Play size={20} className="text-brand" />;
      default: return <FileText size={20} className="text-brand" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'PROTECTED') return <span className="badge badge-success"><CheckCircle2 size={12} /> Protected</span>;
    if (s === 'AT RISK') return <span className="badge badge-danger"><ShieldAlert size={12} /> At Risk</span>;
    return <span className="badge badge-neutral">{status}</span>;
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Library</p>
          <h1 className="text-display mt-1 text-ink">Content Assets</h1>
        </div>
        <button onClick={create} className="btn btn-primary">
          <Plus size={16} /> New Asset
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border bg-surface p-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input w-full border-none bg-transparent pl-9 shadow-none focus:ring-0"
            placeholder="Search assets by name or ID..."
          />
        </div>
        <div className="flex items-center gap-2 px-2 sm:px-0">
          <div className="h-6 w-px bg-line" />
          <button className="btn btn-ghost btn-sm text-muted">
            <Filter size={14} /> Filter
          </button>
          <div className="flex rounded-lg bg-surface-alt p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h5v5H2V2zm7 0h5v5H9V2zM2 9h5v5H2V9zm7 0h5v5H9V9z"/></svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-md p-1.5 transition-colors ${viewMode === 'list' ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h12v2H2v-2z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`skeleton card ${viewMode === 'grid' ? 'h-64' : 'h-20'}`} />
          ))}
        </div>
      ) : error ? (
        <div className="card border-danger/30 bg-danger-light p-6 text-center text-danger">
          <ShieldAlert size={24} className="mx-auto mb-2" />
          <p className="font-semibold">{error.message}</p>
        </div>
      ) : data?.length ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {data.map((c) => (
            <div key={c.id} className={`card card-hover group flex ${viewMode === 'list' ? 'items-center p-3' : 'flex-col overflow-hidden'}`}>
              {/* Preview Thumbnail */}
              <div className={`flex items-center justify-center bg-surface-alt ${viewMode === 'list' ? 'h-14 w-14 shrink-0 rounded-lg' : 'aspect-video w-full'}`}>
                {getIcon(c.type)}
              </div>
              
              {/* Details */}
              <div className={`flex flex-1 flex-col ${viewMode === 'list' ? 'ml-4' : 'p-4'}`}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate font-semibold text-ink" title={c.title}>{c.title}</h3>
                  <button className="rounded p-1 text-muted opacity-0 transition-opacity hover:bg-surface-alt hover:text-ink group-hover:opacity-100">
                    <MoreVertical size={16} />
                  </button>
                </div>
                
                {viewMode === 'list' ? (
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1.5"><FileText size={12}/> {c.type}</span>
                    <span>Added {new Date(c.createdAt).toLocaleDateString()}</span>
                    <div className="ml-auto flex items-center gap-3">
                      {getStatusBadge(c.status)}
                      <button
                        onClick={() => runScan(c.id, c.title)}
                        disabled={!!scanningId}
                        className="btn btn-secondary btn-sm"
                      >
                        {scanningId === c.id ? (
                          <><Loader2 size={14} className="animate-spin" /> Scanning…</>
                        ) : 'Run Scan'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="badge badge-brand">{c.type}</span>
                      {getStatusBadge(c.status)}
                    </div>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t mt-4">
                      <span className="text-caption text-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => runScan(c.id, c.title)}
                        disabled={!!scanningId}
                        className="text-sm font-semibold text-brand hover:underline disabled:opacity-50"
                      >
                        {scanningId === c.id ? 'Scanning…' : 'Run Scan'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
            <Library size={32} className="text-brand" />
          </div>
          <h2 className="text-heading font-bold text-ink">Your library is empty</h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            Start protecting your digital assets by adding them to Sentinel. We support text, images, and video files.
          </p>
          <button onClick={create} className="btn btn-primary mt-6">
            <Plus size={16} /> Add First Asset
          </button>
        </div>
      )}
    </div>
  );
}
