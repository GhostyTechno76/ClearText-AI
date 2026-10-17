'use client';

import { Volume2, X, BookOpen } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';

interface WordDefinitionPopoverProps {
  data: {
    word: string;
    definition: string;
    phonetic?: string;
    example?: string;
    x: number;
    y: number;
  };
  theme: ThemeConfig;
  onClose: () => void;
}

export default function WordDefinitionPopover({
  data,
  theme,
  onClose,
}: WordDefinitionPopoverProps) {
  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(data.word);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-3 w-72 sm:w-80 rounded-xl border p-4 shadow-lg backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
      style={{
        left: `${data.x}px`,
        top: `${data.y}px`,
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
      role="dialog"
      aria-label={`Definition for ${data.word}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm capitalize" style={{ color: theme.text }}>
            {data.word}
          </span>
          {data.phonetic && (
            <span className="text-[11px] font-mono opacity-70" style={{ color: theme.secondaryText }}>
              /{data.phonetic}/
            </span>
          )}
          <button
            onClick={handlePronounce}
            className="p-1 rounded-md hover:opacity-80 transition-opacity"
            style={{ color: theme.accent }}
            title="Pronounce word"
            aria-label="Listen to pronunciation"
          >
            <Volume2 size={13} />
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:opacity-80 transition-opacity"
          style={{ color: theme.secondaryText }}
          aria-label="Close definition"
        >
          <X size={14} />
        </button>
      </div>

      {/* Definition */}
      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-1.5">
          <BookOpen size={13} className="flex-shrink-0 mt-0.5" style={{ color: theme.accent }} />
          <p className="leading-relaxed" style={{ color: theme.text }}>
            {data.definition}
          </p>
        </div>

        {data.example && (
          <p className="text-[11px] italic pl-5 opacity-80" style={{ color: theme.secondaryText }}>
            &ldquo;{data.example}&rdquo;
          </p>
        )}
      </div>

      {/* Decorative arrow pointing to selected word */}
      <div
        className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 rotate-45 border-r border-b"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      />
    </div>
  );
}
