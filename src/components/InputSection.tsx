'use client';

import { useState } from 'react';
import { Link2, Type, FileText, Loader2, AlertCircle, X, Sparkles, ArrowRight } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { sampleArticlesList } from '@/lib/sample-article';

interface InputSectionProps {
  onContentLoaded: (data: { title: string; textContent: string; siteName: string }) => void;
  theme: ThemeConfig;
  onLoadSample: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function InputSection({
  onContentLoaded,
  theme,
  onLoadSample,
  onLoadingChange,
}: InputSectionProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = async () => {
    let cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Please enter a website URL.');
      return;
    }

    // Auto prepend https:// if missing
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    setLoading(true);
    onLoadingChange?.(true);
    setError(null);

    try {
      const res = await fetch('/api/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse URL.');
      }
      onContentLoaded(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch article. Please try direct text input or a quick sample.'
      );
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      setError('Please paste or type some text first.');
      return;
    }
    setError(null);
    onContentLoaded({
      title: 'Direct Text Input',
      textContent: textInput.trim(),
      siteName: 'Direct Paste',
    });
  };

  return (
    <section aria-label="Content input" className="w-full max-w-3xl mx-auto">
      {/* Sleek unified glassmorphic input capsule */}
      <div
        className="rounded-3xl border p-2 sm:p-3 shadow-xl backdrop-blur-xl transition-all duration-300"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          boxShadow: `0 12px 36px -4px ${theme.glowColor || 'rgba(0,0,0,0.06)'}`,
        }}
      >
        {/* Floating Capsule Tabs */}
        <div
          className="flex gap-1.5 p-1.5 rounded-2xl mb-3 border transition-colors"
          style={{ backgroundColor: theme.inputBg, borderColor: theme.border }}
          role="tablist"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'url'}
            onClick={() => {
              setActiveTab('url');
              setError(null);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: activeTab === 'url' ? theme.card : 'transparent',
              color: activeTab === 'url' ? theme.text : theme.secondaryText,
              boxShadow: activeTab === 'url' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Link2 size={15} aria-hidden="true" />
            <span>Web Article URL</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'text'}
            onClick={() => {
              setActiveTab('text');
              setError(null);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: activeTab === 'text' ? theme.card : 'transparent',
              color: activeTab === 'text' ? theme.text : theme.secondaryText,
              boxShadow: activeTab === 'text' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Type size={15} aria-hidden="true" />
            <span>Direct Text / Paste</span>
          </button>
        </div>

        {/* URL Input Form */}
        {activeTab === 'url' && (
          <div role="tabpanel" className="space-y-3 p-1">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste URL (e.g. wikipedia.org/wiki/Neurodiversity or news)..."
                  aria-label="Article or webpage URL"
                  className="w-full px-4 py-3.5 rounded-2xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-9 shadow-inner"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    aria-label="Clear input"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:opacity-75 transition-opacity"
                    style={{ color: theme.secondaryText }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <button
                onClick={handleUrlSubmit}
                disabled={loading}
                aria-label="Extract article content"
                className="px-6 py-3.5 rounded-2xl text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-md whitespace-nowrap"
                style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  <FileText size={16} aria-hidden="true" />
                )}
                {loading ? 'Refracting Content...' : 'Extract & Read'}
              </button>
            </div>
          </div>
        )}

        {/* Text Input Form */}
        {activeTab === 'text' && (
          <div role="tabpanel" className="space-y-3 p-1">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste or type any article, study guide, work report, or essay here..."
              aria-label="Raw text content"
              rows={5}
              className="w-full px-4 py-3 rounded-2xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y transition-all shadow-inner"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
                color: theme.text,
              }}
            />
            <div className="flex items-center justify-end">
              <button
                onClick={handleTextSubmit}
                aria-label="Load pasted text into reader"
                className="px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90 active:scale-95 flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-md"
                style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
              >
                <FileText size={16} aria-hidden="true" />
                Open in Reader
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Try Chips */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: theme.secondaryText }}>
          <Sparkles size={13} style={{ color: theme.accent }} />
          <span>Quick Try Sample Articles:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sampleArticlesList.map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                onContentLoaded({
                  title: sample.title,
                  textContent: sample.textContent,
                  siteName: sample.siteName,
                });
              }}
              type="button"
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.accent,
              }}
              title={`Load: ${sample.title}`}
            >
              {sample.badge}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 p-3.5 rounded-2xl text-xs sm:text-sm bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shadow-sm"
        >
          <AlertCircle size={16} aria-hidden="true" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            <p className="mt-1 text-[11px] opacity-80">
              Tip: Some sites use anti-bot paywalls or strict Cloudflare. You can easily copy the article text directly and switch to the &ldquo;Direct Text / Paste&rdquo; tab.
            </p>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:opacity-75"
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </section>
  );
}
