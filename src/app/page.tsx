'use client';

import { useState, useCallback } from 'react';
import {
  Sparkles,
  ListChecks,
  Loader2,
  BookOpenCheck,
  Zap,
  Shield,
  Eye,
  Volume2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
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
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number>(-1);
  const [showNewInput, setShowNewInput] = useState(false);

  const theme = themes[settings.theme];

  // Reset to home page when clicking the top-left logo
  const handleResetHome = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setArticle(null);
    setDisplayText('');
    setAiResult(null);
    setAiMode(null);
    setAiError(null);
    setShowOriginal(false);
    setActiveParagraphIndex(-1);
    setLoading(false);
    setShowNewInput(false);
  }, []);

  const handleContentLoaded = useCallback((data: ArticleData) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setArticle(data);
    setDisplayText(data.textContent);
    setAiResult(null);
    setAiMode(null);
    setAiError(null);
    setShowOriginal(false);
    setActiveParagraphIndex(-1);
    setShowNewInput(false);
  }, []);

  const loadSample = useCallback(() => {
    handleContentLoaded(sampleArticle);
  }, [handleContentLoaded]);

  const handleAI = useCallback(
    async (mode: 'simplify' | 'summarize') => {
      if (!article) return;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setAiLoading(true);
      setAiError(null);
      setAiMode(mode);
      setActiveParagraphIndex(-1);

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
    },
    [article]
  );

  const toggleOriginal = useCallback(() => {
    if (!article) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveParagraphIndex(-1);
    if (showOriginal) {
      setDisplayText(aiResult || article.textContent);
      setShowOriginal(false);
    } else {
      setDisplayText(article.textContent);
      setShowOriginal(true);
    }
  }, [article, aiResult, showOriginal]);

  return (
    <div
      className="min-h-screen transition-colors duration-300 flex flex-col"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      {/* Header */}
      <header className="border-b sticky top-0 z-40 backdrop-blur-md bg-opacity-95" style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Logo & Brand (Clickable to return Home) */}
          <button
            onClick={handleResetHome}
            className="flex items-center gap-3 text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 rounded-xl p-1 -m-1 transition-transform hover:scale-[1.01]"
            aria-label="ClearText AI - Click to go back to Home"
            title="Click to go back to Home"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-105"
              style={{ backgroundColor: theme.accent, color: theme.accentText }}
            >
              CT
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight" style={{ color: theme.text }}>
                  ClearText<span style={{ color: theme.accent }}>.ai</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border opacity-75" style={{ borderColor: theme.border }}>
                  WCAG AAA
                </span>
              </div>
              <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: theme.secondaryText }}>
                Accessible Reader &amp; Simplifier
              </p>
            </div>
          </button>

          {/* Right Header Navigation / Actions */}
          <div className="flex items-center gap-2">
            {article && (
              <button
                onClick={handleResetHome}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ borderColor: theme.border, color: theme.text }}
                title="Go back to hero input"
              >
                <ArrowLeft size={13} />
                <span className="hidden sm:inline">New Article</span>
              </button>
            )}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ borderColor: theme.border, color: theme.secondaryText }}
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section - Shown when no article is loaded */}
      {!article && !loading && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12 text-center flex-1">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6 border shadow-sm"
            style={{ backgroundColor: theme.highlightBg, borderColor: theme.border, color: theme.accent }}
          >
            <Zap size={13} aria-hidden="true" />
            Empowering Neurodivergent &amp; Dyslexic Readers Everywhere
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-5" style={{ color: theme.text }}>
            Read anything with{' '}
            <span
              className="underline decoration-wavy decoration-2"
              style={{ color: theme.accent, textDecorationColor: theme.accent }}
            >
              crystal clarity
            </span>
            .
          </h1>

          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-normal" style={{ color: theme.secondaryText }}>
            Transform dense articles, paywall-free web pages, and raw text into a clean, distraction-free, dyslexia-friendly format with instant 5th-grade AI simplification and audio read-aloud.
          </p>

          <InputSection
            onContentLoaded={handleContentLoaded}
            theme={theme}
            onLoadSample={loadSample}
            onLoadingChange={setLoading}
          />

          {/* Value Proposition Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 text-left">
            {[
              {
                icon: <Eye size={20} />,
                title: 'Bionic Reading',
                desc: 'Guides saccadic eye movements by bolding the initial 40–50% of every word.',
              },
              {
                icon: <Sparkles size={20} />,
                title: 'AI Simplification',
                desc: 'Translates academic & complex prose into clear 5th-grade language without lost facts.',
              },
              {
                icon: <Shield size={20} />,
                title: 'Dyslexia Typography',
                desc: 'OpenDyslexic font support, weighted bottoms, custom leading & letter tracking.',
              },
              {
                icon: <Volume2 size={20} />,
                title: 'Synchronized Speech',
                desc: 'Zero-latency browser text-to-speech with live paragraph-by-paragraph tracking.',
              },
            ].map(f => (
              <div
                key={f.title}
                className="p-5 rounded-2xl border transition-all hover:scale-[1.02] shadow-sm"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
              >
                <div className="mb-3.5 inline-block p-2 rounded-xl" style={{ backgroundColor: theme.highlightBg, color: theme.accent }}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold mb-1.5" style={{ color: theme.text }}>
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: theme.secondaryText }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1">
          <div className="text-center mb-8">
            <Loader2 className="animate-spin mx-auto mb-3" size={32} style={{ color: theme.accent }} />
            <h2 className="text-lg font-bold" style={{ color: theme.text }}>
              Extracting &amp; Formatting Content...
            </h2>
            <p className="text-xs" style={{ color: theme.secondaryText }}>
              Removing clutter, ads, navigation bars, and applying accessibility styles.
            </p>
          </div>
          <LoadingSkeleton theme={theme} />
        </div>
      )}

      {/* Reader Layout - Shown when an article is loaded */}
      {article && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
          {/* Quick Bar to switch / load another article */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border text-xs" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-[10px]" style={{ color: theme.secondaryText }}>
                Currently Reading:
              </span>
              <span className="font-semibold truncate max-w-xs sm:max-w-md" style={{ color: theme.text }}>
                {article.title}
              </span>
            </div>
            <button
              onClick={() => setShowNewInput(!showNewInput)}
              className="flex items-center gap-1.5 font-bold hover:underline"
              style={{ color: theme.accent }}
            >
              <RefreshCw size={12} />
              {showNewInput ? 'Hide Input Bar' : 'Load Another URL / Text'}
            </button>
          </div>

          {showNewInput && (
            <div className="mb-8 p-6 rounded-2xl border shadow-md" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <InputSection
                onContentLoaded={handleContentLoaded}
                theme={theme}
                onLoadSample={loadSample}
                onLoadingChange={setLoading}
              />
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Customization Toolbar */}
            <aside className="lg:w-72 flex-shrink-0 lg:sticky lg:top-20 lg:self-start">
              <Toolbar
                settings={settings}
                onSettingsChange={setSettings}
                theme={theme}
              />
            </aside>

            {/* Main Reading & AI Column */}
            <main className="flex-1 min-w-0 space-y-4">
              {/* AI & Quick Action Bar */}
              <div
                className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-2xl border shadow-sm"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
                role="toolbar"
                aria-label="AI reading tools"
              >
                <button
                  onClick={() => handleAI('simplify')}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm"
                  style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                  title="Simplify vocabulary and sentence complexity to 5th-grade level"
                >
                  {aiLoading && aiMode === 'simplify' ? (
                    <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles size={15} aria-hidden="true" />
                  )}
                  Simplify (5th-Grade)
                </button>

                <button
                  onClick={() => handleAI('summarize')}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ borderColor: theme.border, color: theme.text }}
                  title="Extract essential takeaways into clean bullet points"
                >
                  {aiLoading && aiMode === 'summarize' ? (
                    <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <ListChecks size={15} aria-hidden="true" />
                  )}
                  Key Bullets
                </button>

                {aiResult && (
                  <button
                    onClick={toggleOriginal}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:opacity-80 ml-auto focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ borderColor: theme.border, color: theme.secondaryText }}
                  >
                    <BookOpenCheck size={14} aria-hidden="true" />
                    {showOriginal ? 'View AI Version' : 'View Original Text'}
                  </button>
                )}
              </div>

              {/* AI Processing Alert / Error */}
              {aiError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl text-xs bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                >
                  {aiError}
                </div>
              )}

              {/* Synchronized Audio Player */}
              <AudioPlayer
                text={displayText}
                theme={theme}
                activeParagraphIndex={activeParagraphIndex}
                onActiveParagraphChange={setActiveParagraphIndex}
              />

              {/* Reader Canvas */}
              <ReaderCanvas
                title={article.title}
                siteName={article.siteName}
                textContent={displayText}
                settings={settings}
                theme={theme}
                activeParagraphIndex={activeParagraphIndex}
                onParagraphClick={idx => setActiveParagraphIndex(idx)}
              />
            </main>
          </div>
        </div>
      )}

      {/* Accessible Footer */}
      <footer className="border-t mt-auto py-6" style={{ borderColor: theme.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p style={{ color: theme.secondaryText }}>
            &copy; 2024 ClearText AI — Built for neurodivergent and accessible web reading.
          </p>
          <div className="flex items-center gap-4 font-medium" style={{ color: theme.secondaryText }}>
            <span>WCAG 2.1 AAA</span>
            <span>&bull;</span>
            <span>OpenDyslexic</span>
            <span>&bull;</span>
            <span>Web Speech API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
