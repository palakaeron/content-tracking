'use client';

import { useState } from 'react';
import { UploadCloud, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UploadCenter() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="animate-fade-in mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">Add Asset</p>
        <h1 className="text-display mt-1 text-ink">Upload Center</h1>
      </div>

      <div
        className={`relative flex min-h-[360px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
          isDragging ? 'border-brand bg-brand/5' : 'border-line bg-surface'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
          onChange={(e) => {
            if (e.target.files) {
              setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
            }
          }}
        />
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt group-hover:bg-brand/10">
          <UploadCloud size={32} className="text-brand" />
        </div>
        <h3 className="text-heading font-semibold text-ink">Click or drag files to upload</h3>
        <p className="mt-2 text-sm text-muted">Securely upload your images, videos, and text documents.</p>
        <p className="mt-1 text-xs text-muted">Supports JPG, PNG, MP4, PDF, DOCX (Max 500MB)</p>
        <button className="btn btn-secondary pointer-events-none mt-6">Browse Files</button>
      </div>

      {files.length > 0 && (
        <div className="card p-6">
          <h3 className="mb-4 font-semibold text-ink">Upload Queue ({files.length})</h3>
          <ul className="space-y-3">
            {files.map((file, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl border bg-surface-alt p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface">
                    <File size={20} className="text-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink line-clamp-1">{file.name}</p>
                    <p className="text-xs text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => removeFile(i)} className="rounded-lg p-2 text-muted hover:bg-surface hover:text-danger">
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <button onClick={() => setFiles([])} className="btn btn-ghost">Clear All</button>
            <button 
              onClick={() => {
                alert('In this mockup, uploads are simulated. Assets will be added to the library.');
                setFiles([]);
                router.push('/content');
              }} 
              className="btn btn-primary"
            >
              Upload {files.length} {files.length === 1 ? 'Asset' : 'Assets'}
            </button>
          </div>
        </div>
      )}

      {/* Recent Uploads */}
      <div className="card p-6">
        <h3 className="mb-4 font-semibold text-ink">Recent Uploads</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border p-3">
            <div className="flex items-center gap-3">
              <File size={20} className="text-muted" />
              <p className="text-sm font-medium text-ink">summer_campaign_video_final.mp4</p>
            </div>
            <span className="badge badge-success"><CheckCircle2 size={12}/> Completed</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border p-3 border-danger/30 bg-danger-light/50">
            <div className="flex items-center gap-3">
              <File size={20} className="text-danger" />
              <p className="text-sm font-medium text-ink">product_shots_raw.zip</p>
            </div>
            <span className="badge badge-danger"><AlertCircle size={12}/> Failed (Format not supported)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
