'use client';

import { useState } from 'react';
import { Link2, Type, FileText, Loader2, AlertCircle, X } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';

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
      setError(err instanceof Error ? err.message : 'Failed to fetch article. Please try direct text input or sample.');
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
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ backgroundColor: theme.inputBg }} role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'url'}
          onClick={() => { setActiveTab('url'); setError(null); }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            backgroundColor: activeTab === 'url' ? theme.card : 'transparent',
            color: activeTab === 'url' ? theme.text : theme.secondaryText,
            boxShadow: activeTab === 'url' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <Link2 size={16} aria-hidden="true" />
          Paste Web URL
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'text'}
          onClick={() => { setActiveTab('text'); setError(null); }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            backgroundColor: activeTab === 'text' ? theme.card : 'transparent',
            color: activeTab === 'text' ? theme.text : theme.secondaryText,
            boxShadow: activeTab === 'text' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <Type size={16} aria-hidden="true" />
          Direct Text Input
        </button>
      </div>

      {/* URL Input */}
      {activeTab === 'url' && (
        <div role="tabpanel" className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="e.g. en.wikipedia.org/wiki/Neurodiversity or news article"
                aria-label="Article or webpage URL"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-8"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
                onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  aria-label="Clear input"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:opacity-75"
                  style={{ color: theme.secondaryText }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={handleUrlSubmit}
              disabled={loading}
              aria-label="Extract article content"
              className="px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm whitespace-nowrap"
              style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <FileText size={16} aria-hidden="true" />
              )}
              {loading ? 'Extracting Article...' : 'Extract & Clean'}
            </button>
          </div>
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={onLoadSample}
              type="button"
              className="font-medium transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 flex items-center gap-1.5"
              style={{ color: theme.accent }}
            >
              <span>✨</span> Try Sample Article (Reading & Neuroscience)
            </button>
            <span style={{ color: theme.secondaryText }}>Supports most news, blogs & docs</span>
          </div>
        </div>
      )}

      {/* Text Input */}
      {activeTab === 'text' && (
        <div role="tabpanel" className="space-y-3">
          <textarea
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            placeholder="Paste or type any article, study guide, work report, or text here..."
            aria-label="Raw text content"
            rows={5}
            className="w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y transition-all"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
          />
          <div className="flex items-center justify-between">
            <button
              onClick={handleTextSubmit}
              aria-label="Load pasted text into reader"
              className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm"
              style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
            >
              <FileText size={16} aria-hidden="true" />
              Open in Reader
            </button>
            <button
              onClick={onLoadSample}
              type="button"
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: theme.accent }}
            >
              Or load sample article
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl text-xs sm:text-sm bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
        >
          <AlertCircle size={16} aria-hidden="true" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            <p className="mt-1 text-[11px] opacity-80">
              Note: Some sites use Cloudflare or paywalls. You can always copy the text from the page and use &ldquo;Direct Text Input&rdquo;.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
