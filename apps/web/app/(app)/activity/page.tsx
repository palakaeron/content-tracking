'use client';

import { Upload, Bell, CheckCircle2, User, Activity as ActivityIcon } from 'lucide-react';

export default function Activity() {
  const events = [
    { type: 'alert', title: 'High risk usage detected', desc: 'A 98% match for "Product Launch Video" was found on Vimeo.', time: '2 hours ago', icon: Bell, color: 'text-warning' },
    { type: 'upload', title: 'Asset uploaded successfully', desc: '"Q3_Marketing_Assets.zip" was processed and added to your library.', time: '5 hours ago', icon: Upload, color: 'text-brand' },
    { type: 'action', title: 'DMCA Takedown filed', desc: 'John Doe filed a takedown request against example-shop.com.', time: 'Yesterday at 4:23 PM', icon: ShieldCheck, color: 'text-success' },
    { type: 'user', title: 'New team member added', desc: 'Sarah Smith accepted the invitation to join Sentinel.', time: 'Yesterday at 9:00 AM', icon: User, color: 'text-muted' },
    { type: 'scan', title: 'AI Scan completed', desc: 'Weekly deep scan of 540 assets completed across 12M pages.', time: 'Mon, Oct 12 at 2:00 AM', icon: ActivityIcon, color: 'text-brand' },
    { type: 'alert', title: 'Critical copyright violation', desc: 'Exact match found for "Proprietary Algorithm Diagram" on a public forum.', time: 'Sun, Oct 11 at 8:45 PM', icon: Bell, color: 'text-danger' },
  ];

  return (
    <div className="animate-fade-in mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Audit Log</p>
          <h1 className="text-display mt-1 text-ink">Activity Timeline</h1>
        </div>
        <button className="btn btn-secondary">Export Log</button>
      </div>

      <div className="card p-6">
        <div className="relative pl-6">
          {/* Vertical Line */}
          <div className="absolute bottom-0 left-[27px] top-4 w-px bg-line" />
          
          <div className="space-y-8">
            {events.map((event, i) => (
              <div key={i} className="relative flex gap-6">
                <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-surface bg-surface-alt ${event.color.replace('text-', 'bg-').replace('warning', 'warning-light').replace('brand', 'brand-light').replace('success', 'success-light').replace('danger', 'danger-light')}`}>
                  <event.icon size={14} className={event.color} />
                </div>
                <div className="-mt-1.5 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h3 className="font-semibold text-ink">{event.title}</h3>
                    <span className="text-xs font-medium text-muted">{event.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 flex justify-center border-t pt-6">
          <button className="btn btn-ghost">Load Older Activity</button>
        </div>
      </div>
    </div>
  );
}

// Dummy icon to avoid lucide import error in this specific file if missing
function ShieldCheck({ size, className }: { size: number, className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>;
}
