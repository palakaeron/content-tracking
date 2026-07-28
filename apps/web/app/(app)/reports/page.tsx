'use client';

import { useState } from 'react';
import { Download, Search, Filter, MoreHorizontal, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function UsageReports() {
  const [q, setQ] = useState('');

  const reports = [
    { id: '1', asset: 'Product_Launch_Q3_Hero.mp4', platform: 'YouTube', confidence: 99.2, similarity: 98, date: 'Oct 14, 2023', status: 'VERIFIED' },
    { id: '2', asset: 'CEO_Headshot_Official.jpg', platform: 'Medium', confidence: 95.8, similarity: 100, date: 'Oct 14, 2023', status: 'PENDING' },
    { id: '3', asset: 'Proprietary_Algorithm_v2.pdf', platform: 'Reddit', confidence: 92.1, similarity: 85, date: 'Oct 13, 2023', status: 'DISMISSED' },
    { id: '4', asset: 'Summer_Campaign_Banner.png', platform: 'Instagram', confidence: 98.7, similarity: 99, date: 'Oct 12, 2023', status: 'VERIFIED' },
    { id: '5', asset: 'Q2_Financial_Summary.pdf', platform: 'Scribd', confidence: 91.0, similarity: 100, date: 'Oct 10, 2023', status: 'VERIFIED' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED': return <span className="badge badge-danger"><AlertCircle size={12}/> Verified Match</span>;
      case 'PENDING': return <span className="badge badge-warning"><Clock size={12}/> Needs Review</span>;
      case 'DISMISSED': return <span className="badge badge-neutral"><CheckCircle2 size={12}/> Dismissed</span>;
      default: return null;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Analytics</p>
          <h1 className="text-display mt-1 text-ink">Usage Reports</h1>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary"><Download size={16} /> Export CSV</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent pl-9 text-sm text-ink outline-none placeholder:text-muted"
              placeholder="Search reports by asset name..."
            />
          </div>
          <button className="btn btn-ghost btn-sm">
            <Filter size={14} /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink">
            <thead className="bg-surface-alt/50 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-6 py-4 font-semibold">Asset Name</th>
                <th className="px-6 py-4 font-semibold">Platform</th>
                <th className="px-6 py-4 font-semibold">Confidence</th>
                <th className="px-6 py-4 font-semibold">Similarity</th>
                <th className="px-6 py-4 font-semibold">Detection Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {reports.map((report) => (
                <tr key={report.id} className="transition-colors hover:bg-surface-alt/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                        <FileText size={20} className="text-brand" />
                      </div>
                      <span className="font-semibold">{report.asset}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{report.platform}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-alt">
                        <div className="h-full bg-brand" style={{ width: `${report.confidence}%` }} />
                      </div>
                      {report.confidence}%
                    </div>
                  </td>
                  <td className="px-6 py-4">{report.similarity}%</td>
                  <td className="px-6 py-4 text-muted">{report.date}</td>
                  <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded p-1 text-muted hover:bg-surface-alt hover:text-ink">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <p className="text-xs text-muted">Showing 1 to 5 of 128 results</p>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" disabled>Previous</button>
            <button className="btn btn-secondary btn-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
