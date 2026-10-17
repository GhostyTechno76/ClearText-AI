'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Sparkles,
  ListChecks,
  Loader2,
  BookOpenCheck,
  ArrowLeft,
  RefreshCw,
  Columns,
  Sliders,
} from 'lucide-react';
import InputSection from '@/components/InputSection';
import ReaderCanvas from '@/components/ReaderCanvas';
import Toolbar from '@/components/Toolbar';
import AudioPlayer from '@/components/AudioPlayer';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import SplineHeroPrism from '@/components/SplineHeroPrism';
import InteractiveFeatureGrid from '@/components/InteractiveFeatureGrid';
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
  const [viewMode, setViewMode] = useState<'current' | 'original' | 'split'>('current');
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number>(-1);
  const [showNewInput, setShowNewInput] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const theme = themes[settings.theme];

  // Global keyboard shortcut: Ctrl+\ or Cmd+\ to toggle collapsible settings toolbar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    setViewMode('current');
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
    setViewMode('current');
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
        setViewMode('current');
      } catch (err: unknown) {
        setAiError(err instanceof Error ? err.message : 'AI processing failed.');
      } finally {
        setAiLoading(false);
      }
    },
    [article]
  );

  return (
    <div
      className="min-h-screen transition-colors duration-300 flex flex-col font-sans"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      {/* Header */}
      <header
        className="border-b sticky top-0 z-40 backdrop-blur-xl transition-colors duration-300"
        style={{
          borderColor: theme.border,
          backgroundColor: theme.glassBackdrop || theme.bg,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand (Clickable to return Home) */}
          <button
            onClick={handleResetHome}
            className="flex items-center gap-3 text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 rounded-2xl p-1.5 -m-1.5 transition-opacity hover:opacity-90"
            aria-label="ClearText AI - Click to return Home"
            title="Click to go back to Home"
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-colors"
              style={{
                backgroundColor: theme.accent,
                color: theme.accentText,
              }}
            >
              CT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight" style={{ color: theme.text }}>
                  ClearText<span style={{ color: theme.accent }}>.ai</span>
                </span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-sm"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.highlightBg,
                    color: theme.accent,
                  }}
                >
                  Reader Workspace
                </span>
              </div>
              <p className="text-[11px] font-medium tracking-wide" style={{ color: theme.secondaryText }}>
                Accessible Reading Tools
              </p>
            </div>
          </button>

          {/* Right Header Navigation / Actions */}
          <div className="flex items-center gap-2.5">
            {article && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm"
                style={{
                  borderColor: theme.border,
                  backgroundColor: isSidebarOpen ? theme.highlightBg : theme.card,
                  color: isSidebarOpen ? theme.accent : theme.text,
                }}
                title="Toggle Display Settings Panel (Ctrl+\)"
              >
                <Sliders size={14} />
                <span className="hidden sm:inline">Settings</span>
              </button>
            )}

            {article && (
              <button
                onClick={handleResetHome}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm"
                style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.card }}
                title="Go back to hero input"
              >
                <ArrowLeft size={13} />
                <span className="hidden sm:inline">New Article</span>
              </button>
            )}

            <a
              href="https://github.com/GhostyTechno76/ClearText-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm"
              style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.card }}
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section - Shown when no article is loaded */}
      {!article && !loading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-16 flex-1">
          {/* Responsive 2-Column Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (Approx 58% width): Primary Conversion Zone */}
            <div className="lg:col-span-7 flex flex-col text-left items-start order-1 w-full">
              {/* Top Accessibility Tagline */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 border shadow-sm transition-all"
                style={{
                  backgroundColor: theme.highlightBg,
                  borderColor: theme.border,
                  color: theme.accent,
                }}
              >
                <BookOpenCheck size={13} aria-hidden="true" />
                Adjust typography, layout, and language to suit how you read
              </div>

              {/* Master Headline */}
              <h1
                className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.12] mb-4"
                style={{ color: theme.text }}
              >
                Read web articles and text with{' '}
                <span
                  className="underline decoration-wavy decoration-2 transition-colors duration-300"
                  style={{ color: theme.accent, textDecorationColor: theme.accent }}
                >
                  less distraction
                </span>
                .
              </h1>

              {/* Subheadline Paragraph */}
              <p
                className="text-base sm:text-lg mb-6 leading-relaxed font-normal max-w-2xl"
                style={{ color: theme.secondaryText }}
              >
                Customize typography, line spacing, and color themes. Use text-to-speech, reading guides, or optional plain-language simplification to read comfortably.
              </p>

              {/* Unified Glassmorphic Input Capsule - Immediately Visible Above the Fold */}
              <div className="w-full">
                <InputSection
                  onContentLoaded={handleContentLoaded}
                  theme={theme}
                  onLoadSample={loadSample}
                  onLoadingChange={setLoading}
                />
              </div>
            </div>

            {/* Right Column (Approx 42% width): Seamless Floating 3D Canvas */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center order-2 w-full">
              <SplineHeroPrism theme={theme} />
            </div>
          </div>

          {/* Interactive 4-Card Feature Playgrounds (Beneath Split Hero) */}
          <div className="mt-14 sm:mt-20">
            <InteractiveFeatureGrid theme={theme} />
          </div>
        </section>
      )}

      {/* Loading Skeleton View */}
      {loading && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1">
          <div className="text-center mb-8">
            <Loader2 className="animate-spin mx-auto mb-3" size={36} style={{ color: theme.accent }} />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: theme.text }}>
              Loading article...
            </h2>
            <p className="text-xs sm:text-sm mt-1" style={{ color: theme.secondaryText }}>
              Extracting main text and removing page clutter.
            </p>
          </div>
          <LoadingSkeleton theme={theme} />
        </div>
      )}

      {/* Reader Layout - Shown when an article is loaded */}
      {article && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
          {/* Quick Context Bar */}
          <div
            className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border text-xs shadow-sm backdrop-blur-xl"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold uppercase tracking-widest text-[10px]" style={{ color: theme.secondaryText }}>
                Reading:
              </span>
              <span className="font-bold truncate max-w-xs sm:max-w-md text-sm" style={{ color: theme.text }}>
                {article.title}
              </span>
            </div>
            <button
              onClick={() => setShowNewInput(!showNewInput)}
              className="flex items-center gap-1.5 font-bold hover:underline py-1 px-2.5 rounded-lg border transition-all"
              style={{ color: theme.accent, borderColor: theme.border, backgroundColor: theme.inputBg }}
            >
              <RefreshCw size={12} className={showNewInput ? 'rotate-180 transition-transform' : ''} />
              <span>{showNewInput ? 'Hide Input Drawer' : 'Load Another URL / Text'}</span>
            </button>
          </div>

          {showNewInput && (
            <div
              className="mb-8 p-6 rounded-3xl border shadow-xl backdrop-blur-xl"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <InputSection
                onContentLoaded={handleContentLoaded}
                theme={theme}
                onLoadSample={loadSample}
                onLoadingChange={setLoading}
              />
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6 relative">
            {/* Collapsible Floating Dock Toolbar */}
            {isSidebarOpen && (
              <aside className="lg:w-80 flex-shrink-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:self-start transition-all duration-300">
                <Toolbar
                  settings={settings}
                  onSettingsChange={setSettings}
                  theme={theme}
                  isOpen={isSidebarOpen}
                  onToggleOpen={() => setIsSidebarOpen(false)}
                />
              </aside>
            )}

            {!isSidebarOpen && (
              <Toolbar
                settings={settings}
                onSettingsChange={setSettings}
                theme={theme}
                isOpen={false}
                onToggleOpen={() => setIsSidebarOpen(true)}
              />
            )}

            {/* Main Reading & AI Workspace */}
            <main className="flex-1 min-w-0 space-y-5">
              {/* AI Transformation Action Bar */}
              <div
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-3xl border shadow-md backdrop-blur-xl"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
                role="toolbar"
                aria-label="AI reading tools"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {/* Simplify Button */}
                  <button
                    onClick={() => handleAI('simplify')}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-md relative overflow-hidden"
                    style={{
                      backgroundColor: theme.buttonBg,
                      color: theme.buttonText,
                      boxShadow: `0 4px 12px ${theme.glowColor || 'rgba(0,0,0,0.1)'}`,
                    }}
                    title="Rewrite text in plain, direct language"
                  >
                    {aiLoading && aiMode === 'simplify' ? (
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Sparkles size={16} aria-hidden="true" />
                    )}
                    <span>Simplify Text</span>
                  </button>

                  {/* Key Takeaways Button */}
                  <button
                    onClick={() => handleAI('summarize')}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-colors hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm"
                    style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBg }}
                    title="Extract key takeaways into bullet points"
                  >
                    {aiLoading && aiMode === 'summarize' ? (
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <ListChecks size={16} aria-hidden="true" />
                    )}
                    <span>Key Takeaways</span>
                  </button>
                </div>

                {/* Comparative View Switcher (Available when AI result is present) */}
                {aiResult && (
                  <div
                    className="flex items-center gap-1 p-1 rounded-2xl border"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.border }}
                  >
                    <button
                      onClick={() => {
                        setViewMode('current');
                        setDisplayText(aiResult);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        backgroundColor: viewMode === 'current' ? theme.card : 'transparent',
                        color: viewMode === 'current' ? theme.accent : theme.secondaryText,
                        boxShadow: viewMode === 'current' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                      }}
                      title="View AI version"
                    >
                      <Sparkles size={12} className="inline mr-1" />
                      AI Text
                    </button>

                    <button
                      onClick={() => {
                        setViewMode('original');
                        setDisplayText(article.textContent);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        backgroundColor: viewMode === 'original' ? theme.card : 'transparent',
                        color: viewMode === 'original' ? theme.accent : theme.secondaryText,
                        boxShadow: viewMode === 'original' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                      }}
                      title="View original unedited text"
                    >
                      <BookOpenCheck size={12} className="inline mr-1" />
                      Original
                    </button>

                    <button
                      onClick={() => setViewMode('split')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hidden sm:inline-flex items-center"
                      style={{
                        backgroundColor: viewMode === 'split' ? theme.card : 'transparent',
                        color: viewMode === 'split' ? theme.accent : theme.secondaryText,
                        boxShadow: viewMode === 'split' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                      }}
                      title="Compare Original vs Simplified side-by-side"
                    >
                      <Columns size={12} className="inline mr-1" />
                      Split View
                    </button>
                  </div>
                )}
              </div>

              {/* AI Processing Alert / Error */}
              {aiError && (
                <div
                  role="alert"
                  className="p-4 rounded-2xl text-xs sm:text-sm bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shadow-sm"
                >
                  {aiError}
                </div>
              )}

              {/* Ambient Synchronized Audio Media Bar */}
              <AudioPlayer
                text={displayText}
                theme={theme}
                activeParagraphIndex={activeParagraphIndex}
                onActiveParagraphChange={setActiveParagraphIndex}
              />

              {/* Reader Canvas / Split View */}
              {viewMode === 'split' && aiResult ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-bold tracking-wider uppercase opacity-75" style={{ color: theme.secondaryText }}>
                      <BookOpenCheck size={13} />
                      <span>Original Text</span>
                    </div>
                    <ReaderCanvas
                      title={article.title}
                      siteName={article.siteName}
                      textContent={article.textContent}
                      settings={settings}
                      theme={theme}
                      activeParagraphIndex={activeParagraphIndex}
                      onParagraphClick={(idx) => setActiveParagraphIndex(idx)}
                      isAudioPlaying={false}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-bold tracking-wider uppercase" style={{ color: theme.accent }}>
                      <Sparkles size={13} />
                      <span>{aiMode === 'summarize' ? 'Key Takeaways' : 'Simplified Text'}</span>
                    </div>
                    <ReaderCanvas
                      title={aiMode === 'summarize' ? 'Article Takeaways' : 'Simplified Reading'}
                      siteName="ClearText Plain View"
                      textContent={aiResult}
                      settings={settings}
                      theme={theme}
                      activeParagraphIndex={activeParagraphIndex}
                      onParagraphClick={(idx) => setActiveParagraphIndex(idx)}
                      isAudioPlaying={activeParagraphIndex >= 0}
                    />
                  </div>
                </div>
              ) : (
                <ReaderCanvas
                  title={article.title}
                  siteName={article.siteName}
                  textContent={displayText}
                  settings={settings}
                  theme={theme}
                  activeParagraphIndex={activeParagraphIndex}
                  onParagraphClick={(idx) => setActiveParagraphIndex(idx)}
                  isAudioPlaying={activeParagraphIndex >= 0}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Accessible Footer */}
      <footer className="border-t mt-auto py-8 transition-colors duration-300" style={{ borderColor: theme.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p style={{ color: theme.secondaryText }}>
            &copy; 2026 ClearText AI &bull; A customizable, distraction-free reading workspace.
          </p>
          <div className="flex items-center gap-4 font-semibold" style={{ color: theme.secondaryText }}>
            <span>Accessible Typography</span>
            <span className="opacity-40">&bull;</span>
            <span>OpenDyslexic</span>
            <span className="opacity-40">&bull;</span>
            <span>Web Speech API</span>
            <span className="opacity-40">&bull;</span>
            <span>Built by SKD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
