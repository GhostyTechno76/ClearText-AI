'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Square, Gauge, SkipForward, SkipBack, Volume2, Sparkles } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { splitIntoParagraphs } from '@/lib/bionic';

interface AudioPlayerProps {
  text: string;
  theme: ThemeConfig;
  activeParagraphIndex: number;
  onActiveParagraphChange: (index: number) => void;
}

export default function AudioPlayer({
  text,
  theme,
  activeParagraphIndex,
  onActiveParagraphChange,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [supported, setSupported] = useState(true);

  const rates = [0.75, 1, 1.25, 1.5];
  const paragraphsRef = useRef<string[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const rateRef = useRef<number>(rate);
  rateRef.current = rate;

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  // Update paragraphs list when text changes
  useEffect(() => {
    paragraphsRef.current = splitIntoParagraphs(text);
  }, [text]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    currentIndexRef.current = -1;
    onActiveParagraphChange(-1);
  }, [onActiveParagraphChange]);

  const speakParagraph = useCallback(
    (index: number) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      const paragraphs = paragraphsRef.current;
      if (index < 0 || index >= paragraphs.length) {
        stop();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(paragraphs[index]);
      utterance.rate = rateRef.current;
      utterance.pitch = 1;
      utterance.lang = 'en-US';

      currentIndexRef.current = index;
      onActiveParagraphChange(index);

      utterance.onend = () => {
        if (currentIndexRef.current === index) {
          if (index + 1 < paragraphs.length) {
            speakParagraph(index + 1);
          } else {
            stop();
          }
        }
      };

      utterance.onerror = () => {
        stop();
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    },
    [stop, onActiveParagraphChange]
  );

  const play = useCallback(() => {
    if (!supported || paragraphsRef.current.length === 0) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    const startIndex = activeParagraphIndex >= 0 ? activeParagraphIndex : 0;
    speakParagraph(startIndex);
  }, [supported, isPaused, activeParagraphIndex, speakParagraph]);

  const pause = useCallback(() => {
    if (isPlaying && supported) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, [isPlaying, supported]);

  const nextParagraph = useCallback(() => {
    const nextIdx = (currentIndexRef.current >= 0 ? currentIndexRef.current : 0) + 1;
    if (nextIdx < paragraphsRef.current.length) {
      speakParagraph(nextIdx);
    } else {
      stop();
    }
  }, [speakParagraph, stop]);

  const prevParagraph = useCallback(() => {
    const prevIdx = Math.max(0, (currentIndexRef.current >= 0 ? currentIndexRef.current : 0) - 1);
    speakParagraph(prevIdx);
  }, [speakParagraph]);

  // Handle external selection change (e.g. user clicked a paragraph directly in canvas)
  useEffect(() => {
    if (
      activeParagraphIndex >= 0 &&
      activeParagraphIndex !== currentIndexRef.current &&
      isPlaying
    ) {
      speakParagraph(activeParagraphIndex);
    }
  }, [activeParagraphIndex, isPlaying, speakParagraph]);

  // Cleanup on unmount or when text changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  if (!supported) {
    return (
      <div
        className="p-3.5 rounded-2xl border text-xs shadow-sm"
        style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.secondaryText }}
      >
        Browser speech synthesis is not supported in this environment.
      </div>
    );
  }

  const totalParagraphs = paragraphsRef.current.length;
  const currentNum = currentIndexRef.current >= 0 ? currentIndexRef.current + 1 : 0;
  const progressPercent = totalParagraphs > 0 ? (currentNum / totalParagraphs) * 100 : 0;

  return (
    <div
      className="p-3.5 sm:p-4 rounded-3xl border shadow-xl backdrop-blur-xl transition-all duration-300"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        boxShadow: `0 8px 30px -4px ${theme.glowColor || 'rgba(0,0,0,0.06)'}`,
      }}
      role="region"
      aria-label="Read-aloud player"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback Transport Buttons */}
        <div className="flex items-center gap-2">
          {/* Main Play/Pause Button */}
          <button
            onClick={isPlaying ? pause : play}
            aria-label={isPlaying ? 'Pause reading aloud' : 'Start reading aloud'}
            className="w-10 h-10 rounded-2xl transition-all duration-150 hover:opacity-90 shadow-md flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: theme.buttonBg,
              color: theme.buttonText,
              boxShadow: `0 2px 8px ${theme.glowColor || 'rgba(0,0,0,0.1)'}`,
            }}
            title={isPlaying ? 'Pause (Space)' : 'Play reading aloud'}
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
          </button>

          {/* Stop Button */}
          <button
            onClick={stop}
            disabled={!isPlaying && !isPaused && currentIndexRef.current === -1}
            aria-label="Stop reading"
            className="w-9 h-9 rounded-xl border transition-all hover:opacity-80 disabled:opacity-30 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: theme.border, color: theme.text }}
            title="Stop reading"
          >
            <Square size={13} />
          </button>

          {/* Prev / Next Track */}
          <div className="flex items-center gap-1 border-l pl-2 ml-1" style={{ borderColor: theme.border }}>
            <button
              onClick={prevParagraph}
              disabled={!isPlaying && !isPaused}
              aria-label="Previous section"
              className="p-2 rounded-xl border transition-all hover:opacity-80 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ borderColor: theme.border, color: theme.text }}
              title="Previous section"
            >
              <SkipBack size={13} />
            </button>
            <button
              onClick={nextParagraph}
              disabled={!isPlaying && !isPaused}
              aria-label="Next section"
              className="p-2 rounded-xl border transition-all hover:opacity-80 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ borderColor: theme.border, color: theme.text }}
              title="Next section"
            >
              <SkipForward size={13} />
            </button>
          </div>
        </div>

        {/* Live Audio Status & Section Counter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold" style={{ backgroundColor: theme.inputBg, borderColor: theme.border }}>
          <div className="flex items-center gap-1">
            <Volume2 size={13} style={{ color: theme.accent }} />
            {isPlaying && (
              <span className="flex items-end gap-0.5 h-3 opacity-80" aria-hidden="true">
                <span className="w-0.5 h-2.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                <span className="w-0.5 h-3.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                <span className="w-0.5 h-2 rounded-full" style={{ backgroundColor: theme.accent }} />
              </span>
            )}
          </div>
          <span style={{ color: theme.text }}>
            {isPlaying
              ? `Reading Section ${currentNum} of ${totalParagraphs}`
              : isPaused
              ? `Paused at Section ${currentNum}`
              : 'Read-aloud ready'}
          </span>
        </div>

        {/* Tactile Segmented Speed Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.border }}>
          <Gauge size={13} className="ml-1 opacity-70" style={{ color: theme.secondaryText }} aria-hidden="true" />
          <div className="flex items-center gap-1">
            {rates.map((r) => {
              const isSelected = rate === r;
              return (
                <button
                  key={r}
                  onClick={() => {
                    setRate(r);
                    rateRef.current = r;
                    if (isPlaying) {
                      speakParagraph(currentIndexRef.current >= 0 ? currentIndexRef.current : 0);
                    }
                  }}
                  aria-label={`Speech rate ${r}x`}
                  aria-pressed={isSelected}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    backgroundColor: isSelected ? theme.accent : 'transparent',
                    color: isSelected ? theme.accentText : theme.secondaryText,
                    boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {r}x
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Paragraph Scrubber Bar */}
      {totalParagraphs > 0 && (
        <div className="mt-3 pt-2 border-t flex items-center gap-3" style={{ borderColor: theme.border }}>
          <span className="text-[10px] font-mono opacity-70" style={{ color: theme.secondaryText }}>
            Progress
          </span>
          <div
            className="flex-1 h-2 rounded-full cursor-pointer relative overflow-hidden transition-all bg-black/10 dark:bg-white/10"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              const targetIndex = Math.floor(ratio * totalParagraphs);
              speakParagraph(targetIndex);
            }}
            title="Click scrubber to jump directly to any paragraph"
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: theme.accent,
              }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold" style={{ color: theme.secondaryText }}>
            {Math.round(progressPercent)}%
          </span>
        </div>
      )}
    </div>
  );
}
