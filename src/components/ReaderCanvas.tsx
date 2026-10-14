'use client';

import { useMemo } from 'react';
import { ThemeConfig, ReaderSettings } from '@/lib/themes';
import { bionicHTML, plainTextToHTML } from '@/lib/bionic';
import { estimateReadingTime } from '@/lib/utils';
import { Clock, Hash } from 'lucide-react';

interface ReaderCanvasProps {
  title: string;
  siteName: string;
  textContent: string;
  settings: ReaderSettings;
  theme: ThemeConfig;
}

export default function ReaderCanvas({ title, siteName, textContent, settings, theme }: ReaderCanvasProps) {
  const renderedHTML = useMemo(() => {
    return settings.bionicReading ? bionicHTML(textContent) : plainTextToHTML(textContent);
  }, [textContent, settings.bionicReading]);

  const { words, minutes } = useMemo(() => estimateReadingTime(textContent), [textContent]);

  return (
    <article
      className="rounded-2xl border p-6 md:p-10 shadow-sm"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
      aria-label="Reader view"
    >
      {/* Header */}
      <header className="mb-6 pb-4 border-b" style={{ borderColor: theme.border }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: theme.accent }}>
          {siteName}
        </p>
        <h1
          className="text-2xl md:text-3xl font-bold leading-tight mb-3"
          style={{ color: theme.text }}
        >
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: theme.secondaryText }}>
            <Hash size={12} aria-hidden="true" />
            {words.toLocaleString()} words
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: theme.secondaryText }}>
            <Clock size={12} aria-hidden="true" />
            {minutes} min read
          </span>
        </div>
      </header>

      {/* Content */}
      <div
        className="prose prose-slate max-w-none"
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          letterSpacing: `${settings.letterSpacing}em`,
          fontFamily: settings.fontFamily === 'dyslexic' ? 'OpenDyslexic, sans-serif' : 'Inter, system-ui, sans-serif',
          color: theme.text,
        }}
        dangerouslySetInnerHTML={{ __html: renderedHTML }}
      />
    </article>
  );
}
