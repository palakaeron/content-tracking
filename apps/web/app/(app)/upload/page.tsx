'use client';

import { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { apiUpload } from '../../../lib/api';

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

interface QueuedFile {
  file: File;
  title: string;
  state: UploadState;
  error?: string;
}

export default function UploadCenter() {
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const qc = useQueryClient();

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const next: QueuedFile[] = Array.from(fileList).map((file) => ({
      file,
      title: file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
      state: 'idle',
    }));
    setQueue((prev) => [...prev, ...next]);
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTitle = (index: number, title: string) => {
    setQueue((prev) => prev.map((item, i) => (i === index ? { ...item, title } : item)));
  };

  const handleUpload = async () => {
    setIsUploading(true);
    let allDone = true;

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.state === 'done') continue;

      const mimeType = item.file.type;
      const type: 'IMAGE' | 'VIDEO' | null = mimeType.startsWith('image/')
        ? 'IMAGE'
        : mimeType.startsWith('video/')
          ? 'VIDEO'
          : null;

      if (!type) {
        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i ? { ...q, state: 'error', error: 'Unsupported file type (image/video only)' } : q,
          ),
        );
        allDone = false;
        continue;
      }

      setQueue((prev) => prev.map((q, idx) => (idx === i ? { ...q, state: 'uploading' } : q)));

      try {
        const fd = new FormData();
        fd.append('file', item.file);
        fd.append('title', item.title || item.file.name);
        fd.append('type', type);
        await apiUpload('/content/upload', fd);
        setQueue((prev) => prev.map((q, idx) => (idx === i ? { ...q, state: 'done' } : q)));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, state: 'error', error: message } : q)),
        );
        allDone = false;
      }
    }

    setIsUploading(false);
    if (allDone) {
      qc.invalidateQueries({ queryKey: ['content'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
      router.push('/content');
    }
  };

  const pendingCount = queue.filter((q) => q.state !== 'done').length;

  return (
    <div className="animate-fade-in mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">Add Asset</p>
        <h1 className="text-display mt-1 text-ink">Upload Center</h1>
      </div>

      <div
        aria-label="File drop zone"
        role="region"
        className={`relative flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
          isDragging ? 'border-brand bg-brand/5' : 'border-line bg-surface'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="sr-only"
          aria-label="Choose files to upload"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt">
          <UploadCloud size={32} className="text-brand" aria-hidden="true" />
        </div>
        <h2 className="text-heading font-semibold text-ink">Click or drag files to upload</h2>
        <p className="mt-2 text-sm text-muted">
          Securely upload your images and videos to Sentinel.
        </p>
        <p className="mt-1 text-xs text-muted">Supports JPG, PNG, GIF, MP4, MOV (Max 50&nbsp;MB)</p>
        <button
          className="btn btn-secondary mt-6"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          Browse Files
        </button>
      </div>

      {queue.length > 0 && (
        <div className="card p-6">
          <h3 className="mb-4 font-semibold text-ink">Upload Queue ({queue.length})</h3>
          <ul className="space-y-3">
            {queue.map((item, i) => (
              <li
                key={i}
                className={`flex items-center justify-between rounded-xl border p-3 ${
                  item.state === 'error' ? 'border-danger/30 bg-danger-light/40' : 'bg-surface-alt'
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface">
                    {item.state === 'uploading' ? (
                      <Loader2 size={20} className="animate-spin text-brand" aria-label="Uploading" />
                    ) : item.state === 'done' ? (
                      <CheckCircle2 size={20} className="text-success" aria-label="Done" />
                    ) : (
                      <File size={20} className="text-muted" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <input
                      className="input w-full border-none bg-transparent py-0 text-sm font-medium shadow-none focus:ring-0"
                      value={item.title}
                      onChange={(e) => updateTitle(i, e.target.value)}
                      aria-label={`Title for ${item.file.name}`}
                      disabled={item.state === 'uploading' || item.state === 'done'}
                    />
                    <p className="text-xs text-muted">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      {item.error && (
                        <span className="ml-2 text-danger">&nbsp;— {item.error}</span>
                      )}
                    </p>
                  </div>
                </div>
                {item.state !== 'uploading' && item.state !== 'done' && (
                  <button
                    onClick={() => removeFile(i)}
                    className="ml-2 rounded-lg p-2 text-muted hover:bg-surface hover:text-danger"
                    type="button"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <button
              onClick={() => setQueue([])}
              className="btn btn-ghost"
              type="button"
              disabled={isUploading}
            >
              Clear All
            </button>
            <button
              onClick={handleUpload}
              className="btn btn-primary"
              type="button"
              disabled={isUploading || pendingCount === 0}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Uploading…
                </>
              ) : (
                `Upload ${pendingCount} ${pendingCount === 1 ? 'Asset' : 'Assets'}`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
