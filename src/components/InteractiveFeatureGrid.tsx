'use client';

import { useState } from 'react';
import { Eye, Sparkles, Shield, Volume2, ArrowRight } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { bionicParagraph } from '@/lib/bionic';

interface InteractiveFeatureGridProps {
  theme: ThemeConfig;
}

export default function InteractiveFeatureGrid({ theme }: InteractiveFeatureGridProps) {
  // 1. Bionic interactive state
  const [bionicActive, setBionicActive] = useState(true);

  // 2. Simplification slider state (0: Academic, 1: 5th-Grade)
  const [simplificationLevel, setSimplificationLevel] = useState<0 | 1>(0);

  // 3. Dyslexia font toggle state
  const [isDyslexicPreview, setIsDyslexicPreview] = useState(false);

  // 4. Audio preview state
  const [audioTesting, setAudioTesting] = useState(false);

  const sampleBionicSentence = "Saccadic fixation guides your eyes effortlessly across complex text.";
  const academicText = "The prefrontal cortex regulates executive cognitive functioning and inhibitory control.";
  const simpleText = "The front part of your brain helps you plan things and make thoughtful choices.";

  const handleTestAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (audioTesting) {
        window.speechSynthesis.cancel();
        setAudioTesting(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("ClearText reads aloud with live synchronization.");
      utterance.rate = 1.0;
      utterance.onend = () => setAudioTesting(false);
      utterance.onerror = () => setAudioTesting(false);
      window.speechSynthesis.speak(utterance);
      setAudioTesting(true);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 text-left">
      {/* 1. Bionic Reading Playground */}
      <div
        className="p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg flex flex-col justify-between group"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          boxShadow: `0 4px 20px -2px ${theme.glowColor || 'rgba(0,0,0,0.04)'}`,
        }}
      >
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div
              className="p-2.5 rounded-xl transition-transform group-hover:scale-105"
              style={{ backgroundColor: theme.highlightBg, color: theme.accent }}
            >
              <Eye size={18} aria-hidden="true" />
            </div>
            <button
              onClick={() => setBionicActive(!bionicActive)}
              className="text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all hover:opacity-80"
              style={{
                borderColor: theme.border,
                backgroundColor: bionicActive ? theme.accent : 'transparent',
                color: bionicActive ? theme.accentText : theme.secondaryText,
              }}
              title="Toggle bionic preview"
            >
              {bionicActive ? 'Active' : 'Preview'}
            </button>
          </div>
          <h3 className="text-sm font-bold mb-1.5" style={{ color: theme.text }}>
            Bionic Reading
          </h3>
          <p className="text-xs leading-relaxed mb-3" style={{ color: theme.secondaryText }}>
            Guides saccadic eye movements by bolding the initial anchors of words.
          </p>
        </div>

        {/* Mini interactive preview */}
        <div
          className="p-2.5 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer"
          style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
          onClick={() => setBionicActive(!bionicActive)}
          title="Click to toggle Bionic effect"
        >
          {bionicActive ? (
            <span dangerouslySetInnerHTML={{ __html: bionicParagraph(sampleBionicSentence) }} />
          ) : (
            <span>{sampleBionicSentence}</span>
          )}
        </div>
      </div>

      {/* 2. AI Simplification Playground */}
      <div
        className="p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg flex flex-col justify-between group"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          boxShadow: `0 4px 20px -2px ${theme.glowColor || 'rgba(0,0,0,0.04)'}`,
        }}
      >
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div
              className="p-2.5 rounded-xl transition-transform group-hover:scale-105"
              style={{ backgroundColor: theme.highlightBg, color: theme.accent }}
            >
              <Sparkles size={18} aria-hidden="true" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span style={{ color: simplificationLevel === 0 ? theme.accent : theme.secondaryText }}>Academic</span>
              <span style={{ color: theme.secondaryText }}>⇄</span>
              <span style={{ color: simplificationLevel === 1 ? theme.accent : theme.secondaryText }}>5th-Grade</span>
            </div>
          </div>
          <h3 className="text-sm font-bold mb-1.5" style={{ color: theme.text }}>
            AI Simplification
          </h3>
          <p className="text-xs leading-relaxed mb-3" style={{ color: theme.secondaryText }}>
            Translates technical jargon into crystal clear language while keeping all facts.
          </p>
        </div>

        {/* Mini interactive slider/toggle */}
        <div
          onClick={() => setSimplificationLevel(simplificationLevel === 0 ? 1 : 0)}
          className="p-2.5 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
          title="Click to toggle between Academic and 5th-Grade version"
        >
          <div className="flex items-center gap-1.5 mb-1 text-[9px] font-bold tracking-wider uppercase" style={{ color: theme.accent }}>
            <span>{simplificationLevel === 0 ? '🔬 Academic Prose' : '✨ 5th-Grade Plain English'}</span>
            <ArrowRight size={10} />
          </div>
          <p className="italic">
            &ldquo;{simplificationLevel === 0 ? academicText : simpleText}&rdquo;
          </p>
        </div>
      </div>

      {/* 3. Dyslexia Typography Playground */}
      <div
        className="p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg flex flex-col justify-between group"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          boxShadow: `0 4px 20px -2px ${theme.glowColor || 'rgba(0,0,0,0.04)'}`,
        }}
      >
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div
              className="p-2.5 rounded-xl transition-transform group-hover:scale-105"
              style={{ backgroundColor: theme.highlightBg, color: theme.accent }}
            >
              <Shield size={18} aria-hidden="true" />
            </div>
            <button
              onClick={() => setIsDyslexicPreview(!isDyslexicPreview)}
              className="text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all hover:opacity-80"
              style={{
                borderColor: theme.border,
                backgroundColor: isDyslexicPreview ? theme.accent : 'transparent',
                color: isDyslexicPreview ? theme.accentText : theme.secondaryText,
              }}
              title="Toggle OpenDyslexic preview font"
            >
              {isDyslexicPreview ? 'OpenDyslexic' : 'Sans-Serif'}
            </button>
          </div>
          <h3 className="text-sm font-bold mb-1.5" style={{ color: theme.text }}>
            Dyslexia Typography
          </h3>
          <p className="text-xs leading-relaxed mb-3" style={{ color: theme.secondaryText }}>
            Weighted bottoms prevent letter inversion (b vs d) with custom tracking.
          </p>
        </div>

        {/* Mini interactive typography view */}
        <div
          onClick={() => setIsDyslexicPreview(!isDyslexicPreview)}
          className="p-2.5 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer"
          style={{
            backgroundColor: theme.inputBg,
            borderColor: theme.border,
            color: theme.text,
            fontFamily: isDyslexicPreview ? 'OpenDyslexic, "Comic Sans MS", cursive, sans-serif' : 'Inter, system-ui, sans-serif',
            letterSpacing: isDyslexicPreview ? '0.04em' : 'normal',
          }}
          title="Click to toggle OpenDyslexic font"
        >
          <p className="font-semibold text-center text-sm py-0.5">
            {isDyslexicPreview ? 'OpenDyslexic b d p q' : 'Standard Sans b d p q'}
          </p>
          <span className="block text-[10px] text-center opacity-70">
            {isDyslexicPreview ? 'Bottom-weighted glyphs active' : 'Click to test baseline gravity'}
          </span>
        </div>
      </div>

      {/* 4. Synchronized Audio Playground */}
      <div
        className="p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg flex flex-col justify-between group"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          boxShadow: `0 4px 20px -2px ${theme.glowColor || 'rgba(0,0,0,0.04)'}`,
        }}
      >
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div
              className="p-2.5 rounded-xl transition-transform group-hover:scale-105"
              style={{ backgroundColor: theme.highlightBg, color: theme.accent }}
            >
              <Volume2 size={18} aria-hidden="true" />
            </div>
            {/* Equalizer bars */}
            <div className="flex items-end gap-0.5 h-4">
              <span className={`w-1 bg-current rounded-full transition-all ${audioTesting ? 'h-4 animate-pulse' : 'h-1.5'}`} style={{ color: theme.accent }} />
              <span className={`w-1 bg-current rounded-full transition-all ${audioTesting ? 'h-3 animate-bounce' : 'h-2.5'}`} style={{ color: theme.accent, animationDelay: '100ms' }} />
              <span className={`w-1 bg-current rounded-full transition-all ${audioTesting ? 'h-5 animate-pulse' : 'h-2'}`} style={{ color: theme.accent, animationDelay: '200ms' }} />
            </div>
          </div>
          <h3 className="text-sm font-bold mb-1.5" style={{ color: theme.text }}>
            Synchronized Speech
          </h3>
          <p className="text-xs leading-relaxed mb-3" style={{ color: theme.secondaryText }}>
            Browser text-to-speech with live sentence-by-sentence visual highlighting.
          </p>
        </div>

        {/* Mini interactive play button */}
        <button
          onClick={handleTestAudio}
          className="w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
          style={{
            backgroundColor: audioTesting ? theme.accent : theme.inputBg,
            color: audioTesting ? theme.accentText : theme.text,
            borderColor: theme.border,
          }}
        >
          <Volume2 size={13} className={audioTesting ? 'animate-spin' : ''} />
          {audioTesting ? 'Speaking Demo...' : 'Listen to Live Sample'}
        </button>
      </div>
    </div>
  );
}
