'use client';

import { useState } from 'react';
import { Link2, Type, FileText, Loader2, AlertCircle } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';

interface InputSectionProps {
  onContentLoaded: (data: { title: string; textContent: string; siteName: string }) => void;
  theme: ThemeConfig;
  onLoadSample: () => void;
}

export default function InputSection({ onContentLoaded, theme, onLoadSample }: InputSectionProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      setError('Please enter a URL.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse URL.');
      }
      onContentLoaded(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch article.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      setError('Please enter some text.');
      return;
    }
    setError(null);
    onContentLoaded({
      title: 'Pasted Text',
      textContent: textInput.trim(),
      siteName: 'Direct Input',
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
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            backgroundColor: activeTab === 'url' ? theme.card : 'transparent',
            color: activeTab === 'url' ? theme.text : theme.secondaryText,
            boxShadow: activeTab === 'url' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <Link2 size={16} aria-hidden="true" />
          Paste URL
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'text'}
          onClick={() => { setActiveTab('text'); setError(null); }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            backgroundColor: activeTab === 'text' ? theme.card : 'transparent',
            color: activeTab === 'text' ? theme.text : theme.secondaryText,
            boxShadow: activeTab === 'text' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <Type size={16} aria-hidden="true" />
          Paste Text
        </button>
      </div>

      {/* URL Input */}
      {activeTab === 'url' && (
        <div role="tabpanel" className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              aria-label="Article URL"
              className="flex-1 px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
              onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
            />
            <button
              onClick={handleUrlSubmit}
              disabled={loading}
              aria-label="Extract article content"
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <FileText size={16} aria-hidden="true" />}
              {loading ? 'Extracting...' : 'Extract'}
            </button>
          </div>
          <button
            onClick={onLoadSample}
            className="text-sm font-medium transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: theme.accent }}
          >
            ✨ Try Sample Article
          </button>
        </div>
      )}

      {/* Text Input */}
      {activeTab === 'text' && (
        <div role="tabpanel" className="space-y-3">
          <textarea
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            placeholder="Paste your text content here..."
            aria-label="Text content"
            rows={6}
            className="w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y transition-all"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
          />
          <button
            onClick={handleTextSubmit}
            aria-label="Load pasted text into reader"
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
          >
            <FileText size={16} aria-hidden="true" />
            Load Text
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div role="alert" className="mt-3 flex items-center gap-2 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          <AlertCircle size={16} aria-hidden="true" className="flex-shrink-0" />
          {error}
        </div>
      )}
    </section>
  );
}
