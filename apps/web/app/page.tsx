'use client';

import Link from 'next/link';
import { Shield, Search, BarChart3, Bell, ArrowRight, Check, Star, Zap, Globe, Lock, ChevronRight } from 'lucide-react';

const features = [
  { icon: Search, title: 'AI-Powered Detection', desc: 'Automatically scan the web for unauthorized copies of your content with 98%+ accuracy.' },
  { icon: BarChart3, title: 'Usage Analytics', desc: 'Track where and how your content is being used with interactive dashboards and heatmaps.' },
  { icon: Bell, title: 'Real-time Alerts', desc: 'Get instant notifications when new usage or potential infringement is detected.' },
  { icon: Lock, title: 'Copyright Protection', desc: 'One-click DMCA takedown requests and detailed evidence reports for legal action.' },
  { icon: Globe, title: 'Global Monitoring', desc: 'Monitor content usage across 50+ platforms and millions of websites worldwide.' },
  { icon: Zap, title: 'Instant Reports', desc: 'Generate comprehensive usage reports with similarity scores and source verification.' },
];

const stats = [
  { value: '2M+', label: 'Content Scanned' },
  { value: '99.2%', label: 'Detection Rate' },
  { value: '150K+', label: 'Takedowns Filed' },
  { value: '50+', label: 'Platforms Tracked' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Head of Creative, PixelWorks', text: 'Sentinel caught 47 unauthorized uses of our photography portfolio in the first week. The ROI was immediate.', rating: 5 },
  { name: 'Marcus Rodriguez', role: 'IP Attorney, ClearPath Legal', text: 'The evidence reports are court-ready. This has transformed how we handle digital copyright cases.', rating: 5 },
  { name: 'Emily Watson', role: 'Marketing Director, BrandVault', text: 'We reduced content theft by 80% in 3 months. The AI detection is remarkably accurate.', rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand">
              <Shield size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-ink">Sentinel</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted transition-colors hover:text-ink">Features</a>
            <a href="#stats" className="text-sm text-muted transition-colors hover:text-ink">Results</a>
            <a href="#testimonials" className="text-sm text-muted transition-colors hover:text-ink">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-20 md:pt-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-brand/5 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-surface px-4 py-1.5 text-sm text-muted shadow-card">
            <Zap size={14} className="text-brand" />
            AI-Powered Content Intelligence
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-ink md:text-6xl md:leading-[1.1]">
            Protect your content.
            <br />
            <span className="gradient-text">Track every usage.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted md:text-xl">
            Upload your digital assets, and our AI automatically monitors the internet for unauthorized copies — giving you complete visibility and control over your intellectual property.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup" className="btn btn-primary btn-lg w-full sm:w-auto">
              Start Tracking for Free <ArrowRight size={16} />
            </Link>
            <Link href="#features" className="btn btn-secondary btn-lg w-full sm:w-auto">
              See How It Works
            </Link>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="rounded-2xl border bg-surface p-2 shadow-elevated">
            <div className="rounded-xl bg-canvas p-6">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Assets', value: '2,847', trend: '+12%', color: 'text-success' },
                  { label: 'Detections', value: '156', trend: '+23%', color: 'text-brand' },
                  { label: 'High Risk', value: '12', trend: '-8%', color: 'text-danger' },
                  { label: 'Takedowns', value: '89', trend: '+15%', color: 'text-success' },
                ].map((card) => (
                  <div key={card.label} className="card p-4">
                    <p className="text-caption text-muted">{card.label}</p>
                    <p className="mt-1 text-2xl font-bold text-ink">{card.value}</p>
                    <p className={`mt-1 text-caption font-semibold ${card.color}`}>{card.trend}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">Detection Trends</p>
                  <p className="text-caption text-muted">Last 30 days</p>
                </div>
                <div className="mt-4 flex items-end gap-1" style={{ height: 120 }}>
                  {[40, 55, 35, 60, 45, 70, 50, 80, 65, 90, 75, 85, 70, 95, 80, 60, 75, 85, 90, 100, 80, 70, 85, 95].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-brand/20 transition-all hover:bg-brand/40" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y bg-surface px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-ink md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">Features</p>
            <h2 className="mb-4 text-3xl font-bold text-ink md:text-4xl">Everything you need to protect your work</h2>
            <p className="mx-auto max-w-2xl text-muted">Comprehensive AI-powered tools for content monitoring, detection, and enforcement.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card card-hover p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light">
                  <f.icon size={20} className="text-brand" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-ink">{f.title}</h3>
                <p className="text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t bg-surface px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">Testimonials</p>
            <h2 className="mb-4 text-3xl font-bold text-ink">Trusted by creators worldwide</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-6">
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} className="fill-warning text-warning" />
                  ))}
                </div>
                <p className="mb-4 text-sm text-ink-secondary">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-caption text-muted">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-ink md:text-4xl">Ready to protect your content?</h2>
          <p className="mb-8 text-lg text-muted">Start with a free account. No credit card required.</p>
          <Link href="/signup" className="btn btn-primary btn-lg">
            Get Started Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-surface px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-brand" />
            <span className="font-bold text-ink">Sentinel</span>
          </div>
          <p className="text-caption text-muted">&copy; {new Date().getFullYear()} Sentinel. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted hover:text-ink">Privacy</a>
            <a href="#" className="text-sm text-muted hover:text-ink">Terms</a>
            <a href="#" className="text-sm text-muted hover:text-ink">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
