'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, ShieldAlert, CheckCircle2, FileText, Download, Scale, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ReportDetail() {
  const params = useParams();
  const router = useRouter();
  
  // Static mockup for now since the specific endpoint isn't fully robust in the mock
  const report = {
    id: params.id,
    sourceUrl: 'https://example-shop.com/product/summer-campaign',
    confidence: 0.987,
    status: 'PENDING',
    createdAt: '2023-10-14T10:30:00Z',
    platform: 'Custom Website',
    ipAddress: '192.168.1.104',
    content: {
      id: '123',
      title: 'Summer_Campaign_Banner.png',
      type: 'IMAGE',
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft size={16} /> Back to Reports
      </button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-display text-ink">Detection Report</h1>
            <span className="badge badge-warning">Needs Review</span>
          </div>
          <p className="mt-1 text-sm text-muted">ID: {report.id} • Generated {new Date(report.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary"><Download size={16} /> Export PDF</button>
          <button className="btn btn-primary"><Scale size={16} /> File Takedown</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Match Details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-0 overflow-hidden">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-ink flex items-center gap-2">
                <Eye size={18} className="text-muted"/> Visual Comparison
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-success">98.7% Match</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 divide-x divide-line">
              <div className="p-6 bg-surface-alt/30">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Original Asset</p>
                <div className="aspect-video w-full rounded-lg bg-surface border shadow-sm flex items-center justify-center">
                  <FileText size={32} className="text-brand/50" />
                </div>
                <p className="mt-3 text-sm font-medium text-ink text-center truncate">{report.content.title}</p>
              </div>
              <div className="p-6 bg-surface-alt/30">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted flex justify-between">
                  Detected Usage <a href={report.sourceUrl} className="text-brand hover:underline flex items-center gap-1">Visit <ExternalLink size={10}/></a>
                </p>
                <div className="aspect-video w-full rounded-lg bg-surface border shadow-sm flex items-center justify-center relative">
                  <div className="absolute inset-0 border-2 border-danger rounded-lg z-10 animate-pulse-slow" />
                  <FileText size={32} className="text-danger/50" />
                </div>
                <p className="mt-3 text-sm font-medium text-ink text-center truncate">{report.platform}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 font-semibold text-ink">Source Information</h3>
            <div className="grid sm:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs text-muted mb-1">URL</p>
                <a href={report.sourceUrl} className="text-sm font-medium text-brand break-all hover:underline">{report.sourceUrl}</a>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Platform Category</p>
                <p className="text-sm font-medium text-ink">{report.platform}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">IP Address</p>
                <p className="text-sm font-medium text-ink">{report.ipAddress}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">First Seen</p>
                <p className="text-sm font-medium text-ink">{new Date(report.createdAt).toLocaleString()}</p>
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
                <p className="text-sm text-muted">Oct 14, 10:30 AM</p>
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
            
            <div className="mt-8 space-y-3 pt-6 border-t">
              <button className="btn btn-primary w-full">Verify & Send Takedown</button>
              <button className="btn btn-secondary w-full text-danger hover:border-danger hover:bg-danger-light">Dismiss False Positive</button>
            </div>
          </div>

          <div className="card bg-surface-alt p-6 border-none">
            <div className="flex items-start gap-3">
              <ShieldAlert size={20} className="text-warning-dark shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-ink">Legal Disclaimer</p>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Filing a DMCA takedown is a legal process. Ensure you own the copyrights to the asset before proceeding. Misuse may result in account termination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
