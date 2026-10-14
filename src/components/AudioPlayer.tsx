'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Square, Gauge, SkipForward, SkipBack, Volume2 } from 'lucide-react';
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

  // Handle external selection change (e.g. user clicked a paragraph directly)
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
        className="p-3 rounded-xl border text-xs"
        style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.secondaryText }}
      >
        Speech synthesis is not supported on this browser.
      </div>
    );
  }

  const totalParagraphs = paragraphsRef.current.length;
  const currentNum = currentIndexRef.current >= 0 ? currentIndexRef.current + 1 : 0;

  return (
    <div
      className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 rounded-xl border shadow-sm transition-all"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
      role="region"
      aria-label="Audio read-aloud player"
    >
      {/* Play / Pause */}
      <button
        onClick={isPlaying ? pause : play}
        aria-label={isPlaying ? 'Pause reading aloud' : 'Start reading aloud'}
        className="p-2.5 rounded-full transition-all hover:opacity-90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 flex items-center justify-center"
        style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
        title={isPlaying ? 'Pause (Space)' : 'Play'}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>

      {/* Stop */}
      <button
        onClick={stop}
        disabled={!isPlaying && !isPaused && currentIndexRef.current === -1}
        aria-label="Stop reading"
        className="p-2 rounded-full border transition-all hover:opacity-80 disabled:opacity-30 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ borderColor: theme.border, color: theme.text }}
        title="Stop"
      >
        <Square size={14} />
      </button>

      {/* Navigation: Prev / Next */}
      <div className="flex items-center gap-1">
        <button
          onClick={prevParagraph}
          disabled={!isPlaying && !isPaused}
          aria-label="Previous paragraph"
          className="p-1.5 rounded-lg border transition-all hover:opacity-80 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ borderColor: theme.border, color: theme.text }}
          title="Previous paragraph"
        >
          <SkipBack size={13} />
        </button>
        <button
          onClick={nextParagraph}
          disabled={!isPlaying && !isPaused}
          aria-label="Next paragraph"
          className="p-1.5 rounded-lg border transition-all hover:opacity-80 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ borderColor: theme.border, color: theme.text }}
          title="Next paragraph"
        >
          <SkipForward size={13} />
        </button>
      </div>

      {/* Status & Paragraph Indicator */}
      <div className="flex items-center gap-1.5 text-xs font-medium px-2" style={{ color: theme.text }}>
        <Volume2 size={14} style={{ color: theme.accent }} aria-hidden="true" />
        <span>
          {isPlaying
            ? `Reading section ${currentNum} of ${totalParagraphs}`
            : isPaused
            ? `Paused at section ${currentNum}`
            : 'Audio Reader Ready'}
        </span>
      </div>

      {/* Speed Controls */}
      <div className="flex items-center gap-1 ml-auto">
        <Gauge size={13} style={{ color: theme.secondaryText }} aria-hidden="true" />
        <span className="text-[11px] font-semibold hidden sm:inline" style={{ color: theme.secondaryText }}>
          Speed:
        </span>
        {rates.map(r => (
          <button
            key={r}
            onClick={() => {
              setRate(r);
              rateRef.current = r;
              if (isPlaying) {
                // Restart current paragraph with new speed smoothly
                speakParagraph(currentIndexRef.current >= 0 ? currentIndexRef.current : 0);
              }
            }}
            aria-label={`Speed ${r}x`}
            aria-pressed={rate === r}
            className="px-2 py-1 rounded text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: rate === r ? theme.accent : 'transparent',
              color: rate === r ? theme.accentText : theme.secondaryText,
              borderColor: rate === r ? theme.accent : 'transparent',
            }}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  );
}
