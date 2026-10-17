'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, Pause, Square, Gauge, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { splitIntoParagraphs } from '@/lib/bionic';

interface AudioPlayerProps {
  text: string;
  theme: ThemeConfig;
  activeParagraphIndex: number;
  onActiveParagraphChange: (index: number) => void;
  playRequestId?: number;
  onPlayingChange?: (isPlaying: boolean) => void;
}

export default function AudioPlayer({
  text,
  theme,
  activeParagraphIndex,
  onActiveParagraphChange,
  playRequestId,
  onPlayingChange,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  const rates = [0.75, 1, 1.25, 1.5];

  // Synchronously compute paragraphs
  const paragraphs = useMemo(() => splitIntoParagraphs(text), [text]);
  const paragraphsRef = useRef<string[]>(paragraphs);
  paragraphsRef.current = paragraphs;

  const currentIndexRef = useRef<number>(-1);
  const rateRef = useRef<number>(rate);
  rateRef.current = rate;

  // Utterance ref to prevent Chromium garbage collection
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakTimerRef = useRef<NodeJS.Timeout | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const prevPlayRequestIdRef = useRef<number | undefined>(playRequestId);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const updateVoices = () => {
      try {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          voicesRef.current = available;
        }
      } catch {
        // Safe fallback
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (utteranceRef.current) {
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
        utteranceRef.current = null;
      }
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
      const currentParagraphs = paragraphsRef.current;
      if (index < 0 || index >= currentParagraphs.length) {
        stop();
        return;
      }

      if (speakTimerRef.current) {
        clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }

      // Detach listeners from any previous utterance so cancellation doesn't trigger error cascades
      if (utteranceRef.current) {
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
        utteranceRef.current = null;
      }

      // Resume if engine was paused, then cancel to flush previous audio queue
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      // Clean leading bullet marks or numbers so speech sounds natural
      const rawText = currentParagraphs[index];
      const speechText = rawText.replace(/^[•\-\*]\s+/, '').replace(/^\d+\.\s+/, '').trim();
      if (!speechText) {
        if (index + 1 < currentParagraphs.length) {
          speakParagraph(index + 1);
        } else {
          stop();
        }
        return;
      }

      currentIndexRef.current = index;
      onActiveParagraphChange(index);
      setIsPlaying(true);
      setIsPaused(false);

      // 50ms tick to let Chromium reset its audio thread after cancel()
      speakTimerRef.current = setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(speechText);
          utterance.rate = rateRef.current;
          utterance.pitch = 1.0;
          utterance.lang = 'en-US';

          // Assign preferred voice if available
          if (voicesRef.current.length > 0) {
            const preferredVoice =
              voicesRef.current.find(
                (v) =>
                  v.lang.startsWith('en') &&
                  (v.name.includes('Natural') ||
                    v.name.includes('Google') ||
                    v.name.includes('Microsoft') ||
                    v.default)
              ) ||
              voicesRef.current.find((v) => v.lang.startsWith('en')) ||
              voicesRef.current[0];
            if (preferredVoice) {
              utterance.voice = preferredVoice;
            }
          }

          utterance.onend = () => {
            utteranceRef.current = null;
            if (currentIndexRef.current === index) {
              if (index + 1 < paragraphsRef.current.length) {
                speakParagraph(index + 1);
              } else {
                stop();
              }
            }
          };

          utterance.onerror = (e) => {
            // Ignore intentional cancellations or interruptions
            if (e.error === 'canceled' || e.error === 'interrupted') {
              return;
            }
            console.warn('SpeechSynthesis error:', e.error);
            utteranceRef.current = null;
            stop();
          };

          utteranceRef.current = utterance;
          window.speechSynthesis.speak(utterance);

          // Workaround for Chrome bug where paused state gets stuck
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch (err) {
          console.warn('Failed to start speech synthesis:', err);
          stop();
        }
      }, 50);
    },
    [stop, onActiveParagraphChange]
  );

  // Chrome bug keepalive: Chromium SpeechSynthesis can silently stall after 15 seconds.
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const play = useCallback(() => {
    if (!supported || paragraphs.length === 0) return;

    if (isPaused) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    const startIndex =
      currentIndexRef.current >= 0
        ? currentIndexRef.current
        : activeParagraphIndex >= 0
        ? activeParagraphIndex
        : 0;
    speakParagraph(startIndex);
  }, [supported, isPaused, paragraphs.length, activeParagraphIndex, speakParagraph]);

  const pause = useCallback(() => {
    if (isPlaying && supported) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
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

  // Handle direct click/play requests on paragraph (ReaderCanvas activation)
  useEffect(() => {
    if (playRequestId && playRequestId !== prevPlayRequestIdRef.current) {
      prevPlayRequestIdRef.current = playRequestId;
      if (activeParagraphIndex >= 0) {
        speakParagraph(activeParagraphIndex);
      }
    }
  }, [playRequestId, activeParagraphIndex, speakParagraph]);

  // Cleanup on unmount or when text changes
  useEffect(() => {
    return () => {
      if (speakTimerRef.current) {
        clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (utteranceRef.current) {
          utteranceRef.current.onend = null;
          utteranceRef.current.onerror = null;
          utteranceRef.current = null;
        }
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
      className="p-3.5 sm:p-4 rounded-2xl border shadow-sm backdrop-blur-xl transition-all duration-200"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
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
            className="w-10 h-10 rounded-xl transition-all duration-150 hover:opacity-90 shadow-sm flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: theme.buttonBg,
              color: theme.buttonText,
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
            className="w-9 h-9 rounded-lg border transition-all hover:opacity-80 disabled:opacity-30 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
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
              className="p-2 rounded-lg border transition-all hover:opacity-80 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ borderColor: theme.border, color: theme.text }}
              title="Previous section"
            >
              <SkipBack size={13} />
            </button>
            <button
              onClick={nextParagraph}
              disabled={!isPlaying && !isPaused}
              aria-label="Next section"
              className="p-2 rounded-lg border transition-all hover:opacity-80 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
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
        <div className="flex items-center gap-1.5 p-1 rounded-xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.border }}>
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
                  className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
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

      {/* Interactive & Keyboard-Accessible Paragraph Scrubber Bar */}
      {totalParagraphs > 0 && (
        <div className="mt-3 pt-2 border-t flex items-center gap-3" style={{ borderColor: theme.border }}>
          <span className="text-[10px] font-mono opacity-70" style={{ color: theme.secondaryText }}>
            Progress
          </span>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Reading progress scrubber"
            aria-valuemin={1}
            aria-valuemax={totalParagraphs}
            aria-valuenow={currentNum > 0 ? currentNum : 1}
            aria-valuetext={currentNum > 0 ? `Section ${currentNum} of ${totalParagraphs}` : 'Not started'}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault();
                prevParagraph();
              } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                nextParagraph();
              } else if (e.key === 'Home') {
                e.preventDefault();
                speakParagraph(0);
              } else if (e.key === 'End') {
                e.preventDefault();
                speakParagraph(totalParagraphs - 1);
              }
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              const targetIndex = Math.min(totalParagraphs - 1, Math.floor(ratio * totalParagraphs));
              speakParagraph(targetIndex);
            }}
            className="flex-1 h-3 py-0.5 rounded-full cursor-pointer relative transition-all focus-visible:outline-2 focus-visible:outline-offset-2 flex items-center"
            title="Jump or use arrow keys to navigate reading sections"
          >
            <div className="w-full h-2 rounded-full relative overflow-hidden bg-black/10 dark:bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: theme.accent,
                }}
              />
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold min-w-[32px] text-right" style={{ color: theme.secondaryText }}>
            {Math.round(progressPercent)}%
          </span>
        </div>
      )}
    </div>
  );
}
