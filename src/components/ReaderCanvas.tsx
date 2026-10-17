'use client';

import { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { ThemeConfig, ReaderSettings } from '@/lib/themes';
import { bionicParagraph, splitIntoParagraphs } from '@/lib/bionic';
import { estimateReadingTime } from '@/lib/utils';
import { lookupWord } from '@/lib/dictionary';
import { Clock, Hash, Copy, Check, Printer, Volume2, BookOpen } from 'lucide-react';
import ReadingRuler from '@/components/ReadingRuler';
import WordDefinitionPopover from '@/components/WordDefinitionPopover';

interface ReaderCanvasProps {
  title: string;
  siteName: string;
  textContent: string;
  settings: ReaderSettings;
  theme: ThemeConfig;
  activeParagraphIndex: number;
  onParagraphClick?: (index: number) => void;
  isAudioPlaying?: boolean;
}

export default function ReaderCanvas({
  title,
  siteName,
  textContent,
  settings,
  theme,
  activeParagraphIndex,
  onParagraphClick,
  isAudioPlaying = false,
}: ReaderCanvasProps) {
  const [copied, setCopied] = useState(false);
  const activeParagraphRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  // Popover state for 5th-grade inline word definitions
  const [activeWordDefinition, setActiveWordDefinition] = useState<{
    word: string;
    definition: string;
    phonetic?: string;
    example?: string;
    x: number;
    y: number;
  } | null>(null);

  // Split into structured paragraphs
  const paragraphs = useMemo(() => {
    return splitIntoParagraphs(textContent);
  }, [textContent]);

  const { words, minutes } = useMemo(() => estimateReadingTime(textContent), [textContent]);

  // Auto-scroll the currently read paragraph into view smoothly if playing
  useEffect(() => {
    if (activeParagraphIndex >= 0 && activeParagraphRef.current) {
      activeParagraphRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeParagraphIndex]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${textContent}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Handle double-click or selection for inline 5th-grade word definition
  const handleTextSelection = useCallback(() => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.includes(' ')) return;

    const match = lookupWord(selectedText);
    if (match) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setActiveWordDefinition({
        word: match.word,
        definition: match.definition,
        phonetic: match.phonetic,
        example: match.example,
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
  }, []);

  return (
    <article
      ref={containerRef}
      onMouseUp={handleTextSelection}
      className="relative rounded-2xl border p-6 sm:p-10 shadow-sm backdrop-blur-xl transition-all duration-200"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
      aria-label="Reader view"
    >
      {/* Interactive Guided Reading Ruler Spotlight */}
      <ReadingRuler
        active={!!settings.readingRuler}
        theme={theme}
        containerRef={containerRef}
      />

      {/* Floating 5th-grade word definition popover */}
      {activeWordDefinition && (
        <WordDefinitionPopover
          data={activeWordDefinition}
          theme={theme}
          onClose={() => setActiveWordDefinition(null)}
        />
      )}

      {/* Article Header */}
      <header className="mb-10 pb-6 border-b" style={{ borderColor: theme.border }}>
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm"
              style={{
                backgroundColor: theme.highlightBg,
                borderColor: theme.border,
                color: theme.accent,
              }}
            >
              {siteName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm min-h-[36px]"
              style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBg }}
              title="Copy text to clipboard"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm min-h-[36px]"
              style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBg }}
              title="Print or save as PDF"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
          </div>
        </div>

        <h1
          className="text-2xl sm:text-4xl font-black tracking-tight leading-snug mb-5 max-w-[65ch]"
          style={{ color: theme.text }}
        >
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Audio Status */}
          <div className="flex items-center gap-1.5 font-semibold" style={{ color: isAudioPlaying ? theme.accent : theme.secondaryText }}>
            <Volume2 size={13} aria-hidden="true" />
            <span>{isAudioPlaying ? 'Reading Aloud' : 'Read Aloud Ready'}</span>
          </div>

          <span className="opacity-30">•</span>

          <span className="flex items-center gap-1.5 font-semibold" style={{ color: theme.secondaryText }}>
            <Hash size={13} aria-hidden="true" />
            {words.toLocaleString()} words
          </span>

          <span className="opacity-30">•</span>

          <span className="flex items-center gap-1.5 font-semibold" style={{ color: theme.secondaryText }}>
            <Clock size={13} aria-hidden="true" />
            {minutes} min read
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-normal opacity-70 italic ml-auto" style={{ color: theme.secondaryText }}>
            <BookOpen size={11} style={{ color: theme.accent }} />
            Select any word to view a definition
          </span>
        </div>
      </header>

      {/* Prose Canvas strictly tuned to 65ch–72ch line measure */}
      <div
        className="max-w-[70ch] mx-auto space-y-6 select-text transition-all duration-200"
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          letterSpacing: `${settings.letterSpacing}em`,
          fontFamily:
            settings.fontFamily === 'dyslexic'
              ? 'OpenDyslexic, "Comic Sans MS", cursive, sans-serif'
              : 'Inter, system-ui, sans-serif',
          color: theme.text,
        }}
      >
        {paragraphs.map((p, idx) => {
          const isActive = activeParagraphIndex === idx;
          const isBullet = /^[•\-\*]\s+/.test(p) || /^\d+\.\s+/.test(p);
          const cleanText = p.replace(/^[•\-\*]\s+/, '').replace(/^\d+\.\s+/, '');

          const paragraphHtml = settings.bionicReading
            ? bionicParagraph(isBullet ? cleanText : p)
            : isBullet
            ? cleanText
            : p;

          if (isBullet) {
            return (
              <div
                key={idx}
                ref={isActive ? activeParagraphRef : null}
                onClick={() => onParagraphClick?.(idx)}
                className={`p-4 rounded-xl border transition-colors duration-150 cursor-pointer shadow-sm group ${
                  isActive ? 'ring-2 ring-offset-2' : 'hover:border-opacity-80'
                }`}
                style={{
                  backgroundColor: isActive ? theme.highlightBg : theme.inputBg,
                  borderColor: isActive ? theme.accent : theme.border,
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onParagraphClick?.(idx);
                  }
                }}
                aria-label={`Key takeaway bullet point ${idx + 1}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="p-1.5 rounded-lg flex-shrink-0 mt-0.5 shadow-sm"
                    style={{ backgroundColor: theme.card, color: theme.accent }}
                  >
                    <BookOpen size={14} />
                  </div>
                  <div
                    className="flex-1 font-medium"
                    style={{ lineHeight: settings.lineHeight }}
                    dangerouslySetInnerHTML={{ __html: paragraphHtml }}
                  />
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              ref={isActive ? activeParagraphRef : null}
              onClick={() => onParagraphClick?.(idx)}
              className={`group relative rounded-xl transition-colors duration-150 cursor-pointer p-4 -mx-4 ${
                isActive
                  ? 'border-l-4 shadow-sm'
                  : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02] border-l-4 border-transparent'
              }`}
              style={{
                backgroundColor: isActive ? theme.highlightBg : 'transparent',
                borderLeftColor: isActive ? theme.accent : 'transparent',
                boxShadow: isActive ? `0 2px 8px ${theme.glowColor || 'rgba(0,0,0,0.05)'}` : 'none',
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onParagraphClick?.(idx);
                }
              }}
              aria-label={`Paragraph ${idx + 1}. Click to read aloud.`}
            >
              {isActive && (
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider mb-2" style={{ color: theme.accent }}>
                  <Volume2 size={12} />
                  <span>Actively Reading</span>
                </div>
              )}

              <div
                className="transition-all"
                style={{ lineHeight: settings.lineHeight }}
                dangerouslySetInnerHTML={{ __html: paragraphHtml }}
              />
            </div>
          );
        })}
      </div>
    </article>
  );
}
