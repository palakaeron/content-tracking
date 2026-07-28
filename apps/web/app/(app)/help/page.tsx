'use client';

import { Search, Book, MessageCircle, FileQuestion, Video, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function Help() {
  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-16 text-center shadow-lg md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 right-10 h-[500px] w-[500px] rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-[300px] w-[300px] rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl">
          <h1 className="mb-4 text-3xl font-bold text-white md:text-5xl">How can we help?</h1>
          <p className="mb-8 text-brand-light">Search our knowledge base or browse categories below.</p>
          <div className="relative mx-auto max-w-xl">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search for articles, guides, or FAQs..." 
              className="w-full rounded-2xl border-none bg-white py-4 pl-12 pr-4 text-ink shadow-lg outline-none focus:ring-4 focus:ring-brand-light/50"
            />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Book, title: 'Getting Started', desc: 'Basics for new users', color: 'text-brand', bg: 'bg-brand/10' },
          { icon: FileQuestion, title: 'FAQs', desc: 'Answers to common questions', color: 'text-warning-dark', bg: 'bg-warning/10' },
          { icon: MessageCircle, title: 'Contact Support', desc: 'Get help from our team', color: 'text-success', bg: 'bg-success/10' },
          { icon: Video, title: 'Video Tutorials', desc: 'Watch step-by-step guides', color: 'text-accent', bg: 'bg-accent/10' },
        ].map((item) => (
          <div key={item.title} className="card card-hover flex flex-col items-center p-6 text-center cursor-pointer">
            <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg}`}>
              <item.icon size={24} className={item.color} />
            </div>
            <h3 className="font-semibold text-ink">{item.title}</h3>
            <p className="mt-1 text-sm text-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Popular Articles */}
      <div className="card p-6">
        <h2 className="mb-4 text-heading-sm font-semibold text-ink">Popular Articles</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            'How does Sentinel detect AI-generated content?',
            'Filing a DMCA Takedown Request',
            'Understanding Confidence Scores',
            'How to bulk upload assets',
            'Integrating the Sentinel API',
            'Billing and Subscription Management',
          ].map((title, i) => (
            <Link key={i} href="#" className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-surface-alt">
              <FileQuestion size={18} className="mt-0.5 text-brand" />
              <div>
                <p className="font-medium text-ink group-hover:text-brand">{title}</p>
                <p className="mt-1 text-xs text-muted">Last updated 2 weeks ago</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Still need help */}
      <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border bg-surface-alt p-8 text-center sm:flex-row sm:text-left">
        <div>
          <h3 className="text-heading-sm font-semibold text-ink">Can't find what you're looking for?</h3>
          <p className="mt-1 text-muted">Our support team is available 24/7 to assist you.</p>
        </div>
        <button className="btn btn-primary shrink-0">
          <MessageCircle size={16} /> Contact Support
        </button>
      </div>
    </div>
  );
}
