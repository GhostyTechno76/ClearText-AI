'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { ThemeConfig, ReaderSettings } from '@/lib/themes';
import { bionicParagraph, splitIntoParagraphs } from '@/lib/bionic';
import { estimateReadingTime } from '@/lib/utils';
import { Clock, Hash, Copy, Check, Printer, Volume2 } from 'lucide-react';

interface ReaderCanvasProps {
  title: string;
  siteName: string;
  textContent: string;
  settings: ReaderSettings;
  theme: ThemeConfig;
  activeParagraphIndex: number;
  onParagraphClick?: (index: number) => void;
}

export default function ReaderCanvas({
  title,
  siteName,
  textContent,
  settings,
  theme,
  activeParagraphIndex,
  onParagraphClick,
}: ReaderCanvasProps) {
  const [copied, setCopied] = useState(false);
  const activeParagraphRef = useRef<HTMLDivElement | null>(null);

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
        block: 'nearest',
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

  return (
    <article
      className="rounded-2xl border p-6 sm:p-10 shadow-sm transition-all"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
      aria-label="Reader view"
    >
      {/* Header */}
      <header className="mb-8 pb-5 border-b" style={{ borderColor: theme.border }}>
        <div className="flex items-center justify-between gap-4 mb-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.accent }}>
            {siteName}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ borderColor: theme.border, color: theme.text }}
              title="Copy text to clipboard"
            >
              {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ borderColor: theme.border, color: theme.text }}
              title="Print or save as PDF"
            >
              <Printer size={13} />
              Print
            </button>
          </div>
        </div>

        <h1
          className="text-2xl sm:text-3xl font-extrabold leading-tight mb-4"
          style={{ color: theme.text }}
        >
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 font-medium" style={{ color: theme.secondaryText }}>
            <Hash size={13} aria-hidden="true" />
            {words.toLocaleString()} words
          </span>
          <span className="flex items-center gap-1.5 font-medium" style={{ color: theme.secondaryText }}>
            <Clock size={13} aria-hidden="true" />
            {minutes} min read
          </span>
          <span className="text-[11px] font-normal italic" style={{ color: theme.secondaryText }}>
            Tip: Click any paragraph to start read-aloud from there
          </span>
        </div>
      </header>

      {/* Content Area */}
      <div
        className="space-y-4 select-text"
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
          const cleanText = p.replace(/^[•\-\*]\s+/, '');

          const paragraphHtml = settings.bionicReading
            ? bionicParagraph(isBullet ? cleanText : p)
            : isBullet
            ? cleanText
            : p;

          return (
            <div
              key={idx}
              ref={isActive ? activeParagraphRef : null}
              onClick={() => onParagraphClick?.(idx)}
              className={`group relative rounded-xl transition-all cursor-pointer p-3 -mx-3 ${
                isActive
                  ? 'border-l-4 shadow-sm'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 border-l-4 border-transparent'
              }`}
              style={{
                backgroundColor: isActive ? theme.highlightBg : 'transparent',
                borderLeftColor: isActive ? theme.accent : 'transparent',
              }}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onParagraphClick?.(idx);
                }
              }}
              aria-label={`Paragraph ${idx + 1}. Click to read aloud.`}
            >
              {isActive && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full mb-1 uppercase tracking-wider"
                  style={{ backgroundColor: theme.accent, color: theme.accentText }}
                >
                  <Volume2 size={11} className="animate-pulse" /> Reading Now
                </span>
              )}

              {isBullet ? (
                <div className="flex items-start gap-3">
                  <span
                    className="inline-block mt-2 h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: theme.accent }}
                    aria-hidden="true"
                  />
                  <div
                    className="flex-1"
                    dangerouslySetInnerHTML={{ __html: paragraphHtml }}
                  />
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: paragraphHtml }} />
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}
