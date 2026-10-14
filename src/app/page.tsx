'use client';

import { useState, useCallback } from 'react';
import { Sparkles, ListChecks, Loader2, BookOpenCheck, Zap, Shield, Eye, Volume2 } from 'lucide-react';
import InputSection from '@/components/InputSection';
import ReaderCanvas from '@/components/ReaderCanvas';
import Toolbar from '@/components/Toolbar';
import AudioPlayer from '@/components/AudioPlayer';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { themes, defaultSettings, ReaderSettings } from '@/lib/themes';
import { sampleArticle } from '@/lib/sample-article';

interface ArticleData {
  title: string;
  textContent: string;
  siteName: string;
}

export default function Home() {
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [displayText, setDisplayText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<'simplify' | 'summarize' | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  const theme = themes[settings.theme];

  const handleContentLoaded = useCallback((data: ArticleData) => {
    setArticle(data);
    setDisplayText(data.textContent);
    setAiResult(null);
    setAiMode(null);
    setAiError(null);
    setShowOriginal(false);
  }, []);

  const loadSample = useCallback(() => {
    handleContentLoaded(sampleArticle);
  }, [handleContentLoaded]);

  const handleAI = useCallback(async (mode: 'simplify' | 'summarize') => {
    if (!article) return;
    setAiLoading(true);
    setAiError(null);
    setAiMode(mode);
    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: article.textContent, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI processing failed.');
      setAiResult(data.result);
      setDisplayText(data.result);
      setShowOriginal(false);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'AI processing failed.');
    } finally {
      setAiLoading(false);
    }
  }, [article]);

  const toggleOriginal = useCallback(() => {
    if (!article) return;
    if (showOriginal) {
      setDisplayText(aiResult || article.textContent);
      setShowOriginal(false);
    } else {
      setDisplayText(article.textContent);
      setShowOriginal(true);
    }
  }, [article, aiResult, showOriginal]);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg, color: theme.text }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: theme.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: theme.accent }}>
              CT
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight" style={{ color: theme.text }}>ClearText AI</h1>
              <p className="text-[10px] font-medium tracking-wide uppercase" style={{ color: theme.secondaryText }}>Accessible Reading</p>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: theme.border, color: theme.secondaryText }}
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Hero Section - shown when no article loaded */}
      {!article && !loading && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6" style={{ backgroundColor: theme.highlightBg, color: theme.accent }}>
            <Zap size={12} aria-hidden="true" />
            AI-Powered Accessibility
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4" style={{ color: theme.text }}>
            Read anything,{' '}
            <span style={{ color: theme.accent }}>clearly.</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: theme.secondaryText }}>
            Transform complex articles and web pages into a clean, customizable, dyslexia-friendly reading experience.
          </p>

          <InputSection
            onContentLoaded={handleContentLoaded}
            theme={theme}
            onLoadSample={loadSample}
          />

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
            {[
              { icon: <Eye size={20} />, title: 'Bionic Reading', desc: 'Bold word beginnings to guide your eyes' },
              { icon: <Sparkles size={20} />, title: 'AI Simplify', desc: 'Rewrite to 5th-grade reading level' },
              { icon: <Shield size={20} />, title: 'Dyslexia-Friendly', desc: 'OpenDyslexic font & custom spacing' },
              { icon: <Volume2 size={20} />, title: 'Read Aloud', desc: 'Built-in text-to-speech player' },
            ].map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-xl border text-left"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
              >
                <div className="mb-3" style={{ color: theme.accent }}>{f.icon}</div>
                <h3 className="text-sm font-bold mb-1" style={{ color: theme.text }}>{f.title}</h3>
                <p className="text-xs" style={{ color: theme.secondaryText }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <LoadingSkeleton theme={theme} />
        </div>
      )}

      {/* Reader Layout */}
      {article && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Compact Input for changing content */}
          <div className="mb-6">
            <InputSection
              onContentLoaded={handleContentLoaded}
              theme={theme}
              onLoadSample={loadSample}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Toolbar */}
            <aside className="lg:w-72 flex-shrink-0 lg:sticky lg:top-4 lg:self-start">
              <Toolbar
                settings={settings}
                onSettingsChange={setSettings}
                theme={theme}
              />
            </aside>

            {/* Main Reader */}
            <main className="flex-1 min-w-0 space-y-4">
              {/* AI Actions Bar */}
              <div
                className="flex flex-wrap items-center gap-3 p-4 rounded-xl border"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
                role="toolbar"
                aria-label="AI actions"
              >
                <button
                  onClick={() => handleAI('simplify')}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                >
                  {aiLoading && aiMode === 'simplify' ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles size={14} aria-hidden="true" />
                  )}
                  Simplify to 5th Grade
                </button>
                <button
                  onClick={() => handleAI('summarize')}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  {aiLoading && aiMode === 'summarize' ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <ListChecks size={14} aria-hidden="true" />
                  )}
                  Key Bullets
                </button>

                {aiResult && (
                  <button
                    onClick={toggleOriginal}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:opacity-90 ml-auto focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ borderColor: theme.border, color: theme.secondaryText }}
                  >
                    <BookOpenCheck size={14} aria-hidden="true" />
                    {showOriginal ? 'Show AI Version' : 'Show Original'}
                  </button>
                )}

                {aiError && (
                  <span className="text-xs text-red-500 ml-2">{aiError}</span>
                )}
              </div>

              {/* Audio Player */}
              <AudioPlayer text={displayText} theme={theme} />

              {/* Reader */}
              <ReaderCanvas
                title={article.title}
                siteName={article.siteName}
                textContent={displayText}
                settings={settings}
                theme={theme}
              />
            </main>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t mt-16 py-6" style={{ borderColor: theme.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: theme.secondaryText }}>© 2024 ClearText AI — Built for accessible reading.</p>
          <p className="text-xs" style={{ color: theme.secondaryText }}>WCAG AAA • Dyslexia-Friendly • AI-Powered</p>
        </div>
      </footer>
    </div>
  );
}
