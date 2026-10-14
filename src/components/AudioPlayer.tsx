'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Square, Gauge } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';

interface AudioPlayerProps {
  text: string;
  theme: ThemeConfig;
}

export default function AudioPlayer({ text, theme }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const rates = [0.75, 1, 1.25, 1.5];

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    utteranceRef.current = null;
  }, []);

  const play = useCallback(() => {
    if (!text.trim() || !supported) return;

    if (isPaused && utteranceRef.current) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  }, [text, rate, isPaused, stop, supported]);

  const pause = useCallback(() => {
    if (isPlaying && supported) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, [isPlaying, supported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported) return null;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
      role="region"
      aria-label="Audio player controls"
    >
      {/* Play/Pause */}
      <button
        onClick={isPlaying ? pause : play}
        aria-label={isPlaying ? 'Pause reading' : 'Play reading'}
        className="p-2.5 rounded-full transition-all hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>

      {/* Stop */}
      <button
        onClick={stop}
        disabled={!isPlaying && !isPaused}
        aria-label="Stop reading"
        className="p-2 rounded-full border transition-all hover:opacity-80 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ borderColor: theme.border, color: theme.text }}
      >
        <Square size={14} />
      </button>

      {/* Status */}
      <span className="text-xs font-medium px-2" style={{ color: theme.secondaryText }}>
        {isPlaying ? '🔊 Playing...' : isPaused ? '⏸ Paused' : '🔇 Ready'}
      </span>

      {/* Speed */}
      <div className="flex items-center gap-1 ml-auto">
        <Gauge size={14} style={{ color: theme.secondaryText }} aria-hidden="true" />
        {rates.map(r => (
          <button
            key={r}
            onClick={() => {
              setRate(r);
              if (isPlaying) {
                // Restart with new rate
                const wasPlaying = isPlaying;
                stop();
                if (wasPlaying) {
                  setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.rate = r;
                    utterance.pitch = 1;
                    utterance.lang = 'en-US';
                    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); utteranceRef.current = null; };
                    utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); utteranceRef.current = null; };
                    utteranceRef.current = utterance;
                    window.speechSynthesis.speak(utterance);
                    setIsPlaying(true);
                  }, 100);
                }
              }
            }}
            aria-label={`Speed ${r}x`}
            aria-pressed={rate === r}
            className="px-2 py-1 rounded text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: rate === r ? theme.accent : 'transparent',
              color: rate === r ? '#ffffff' : theme.secondaryText,
            }}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  );
}
