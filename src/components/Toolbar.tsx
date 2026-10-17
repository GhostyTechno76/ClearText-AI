'use client';

import { useState } from 'react';
import {
  Eye,
  BookOpen,
  Minus,
  Plus,
  Sun,
  Moon,
  Contrast,
  Coffee,
  RotateCcw,
  Sliders,
  Compass,
} from 'lucide-react';
import { ThemeConfig, ThemeKey, ReaderSettings, themes } from '@/lib/themes';

interface ToolbarProps {
  settings: ReaderSettings;
  onSettingsChange: (settings: ReaderSettings) => void;
  theme: ThemeConfig;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

export default function Toolbar({
  settings,
  onSettingsChange,
  theme,
  isOpen = true,
  onToggleOpen,
}: ToolbarProps) {
  const [resetRotating, setResetRotating] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const update = (partial: Partial<ReaderSettings>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  const handleReset = () => {
    setResetRotating(true);
    setTimeout(() => setResetRotating(false), 500);
    onSettingsChange({
      fontSize: 18,
      lineHeight: 1.8,
      letterSpacing: 0.02,
      fontFamily: 'sans',
      bionicReading: false,
      theme: settings.theme,
      readingRuler: false,
    });
  };

  const themeIcons: Record<ThemeKey, React.ReactNode> = {
    light: <Sun size={14} aria-hidden="true" />,
    dark: <Moon size={14} aria-hidden="true" />,
    'high-contrast': <Contrast size={14} aria-hidden="true" />,
    sepia: <Coffee size={14} aria-hidden="true" />,
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full border shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          color: theme.text,
          boxShadow: `0 8px 30px ${theme.glowColor || 'rgba(0,0,0,0.15)'}`,
        }}
        aria-label="Open Display Settings (Ctrl+\)"
        title="Open Display Settings (Ctrl+\)"
      >
        <Sliders size={16} style={{ color: theme.accent }} />
        <span className="text-xs font-bold">Display Settings</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded border opacity-60 font-mono hidden sm:inline" style={{ borderColor: theme.border }}>
          Ctrl+\
        </span>
      </button>
    );
  }

  return (
    <div
      className="rounded-3xl border p-5 space-y-6 shadow-xl backdrop-blur-xl transition-all duration-300 relative"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        boxShadow: `0 10px 30px -4px ${theme.glowColor || 'rgba(0,0,0,0.06)'}`,
      }}
      role="toolbar"
      aria-label="Reader customization controls"
    >
      {/* Header with Title and Animated Reset */}
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-2">
          <Sliders size={15} style={{ color: theme.accent }} />
          <h3 className="text-xs font-extrabold uppercase tracking-widest" style={{ color: theme.text }}>
            Reading Settings
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all hover:opacity-80 active:scale-95"
            style={{ borderColor: theme.border, color: theme.secondaryText }}
            title="Reset typography settings to default"
          >
            <RotateCcw
              size={12}
              className={`transition-transform duration-500 ${resetRotating ? '-rotate-180' : ''}`}
            />
            <span>Reset</span>
          </button>
          {onToggleOpen && (
            <button
              onClick={onToggleOpen}
              className="text-[11px] font-semibold px-2 py-1 rounded-lg border hover:opacity-80"
              style={{ borderColor: theme.border, color: theme.secondaryText }}
              title="Close panel (Ctrl+\)"
            >
              Hide
            </button>
          )}
        </div>
      </div>

      {/* Font Family Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold flex items-center justify-between" style={{ color: theme.secondaryText }}>
          <span>Font</span>
          <span className="text-[10px] font-mono opacity-70">
            {settings.fontFamily === 'dyslexic' ? 'OpenDyslexic' : 'Standard Sans'}
          </span>
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => update({ fontFamily: 'sans' })}
            aria-pressed={settings.fontFamily === 'sans'}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: settings.fontFamily === 'sans' ? theme.accent : 'transparent',
              color: settings.fontFamily === 'sans' ? theme.accentText : theme.text,
              borderColor: settings.fontFamily === 'sans' ? theme.accent : theme.border,
              boxShadow: settings.fontFamily === 'sans' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Sans-Serif
          </button>
          <button
            onClick={() => update({ fontFamily: 'dyslexic' })}
            aria-pressed={settings.fontFamily === 'dyslexic'}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: settings.fontFamily === 'dyslexic' ? theme.accent : 'transparent',
              color: settings.fontFamily === 'dyslexic' ? theme.accentText : theme.text,
              borderColor: settings.fontFamily === 'dyslexic' ? theme.accent : theme.border,
              fontFamily: 'OpenDyslexic, "Comic Sans MS", cursive, sans-serif',
              boxShadow: settings.fontFamily === 'dyslexic' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            OpenDyslexic
          </button>
        </div>
      </div>

      {/* Bionic Reading Toggle */}
      <div
        className="flex items-center justify-between p-3 rounded-2xl border transition-all"
        style={{ backgroundColor: theme.inputBg, borderColor: theme.border }}
      >
        <label
          htmlFor="bionic-toggle"
          className="text-xs font-bold flex items-center gap-2 cursor-pointer select-none"
          style={{ color: theme.text }}
        >
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: theme.highlightBg, color: theme.accent }}>
            <Eye size={14} aria-hidden="true" />
          </div>
          <div>
            <span>Bionic Reading</span>
            <span className="block text-[10px] font-normal opacity-70" style={{ color: theme.secondaryText }}>
              Bolds the start of words
            </span>
          </div>
        </label>
        <button
          id="bionic-toggle"
          role="switch"
          aria-checked={settings.bionicReading}
          onClick={() => update({ bionicReading: !settings.bionicReading })}
          className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ backgroundColor: settings.bionicReading ? theme.accent : theme.border }}
        >
          <span
            className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm"
            style={{ transform: settings.bionicReading ? 'translateX(1.6rem)' : 'translateX(0.25rem)' }}
          />
        </button>
      </div>

      {/* Reading Ruler Focus Guide Toggle */}
      <div
        className="flex items-center justify-between p-3 rounded-2xl border transition-all"
        style={{ backgroundColor: theme.inputBg, borderColor: theme.border }}
      >
        <label
          htmlFor="ruler-toggle"
          className="text-xs font-bold flex items-center gap-2 cursor-pointer select-none"
          style={{ color: theme.text }}
        >
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: theme.highlightBg, color: theme.accent }}>
            <Compass size={14} aria-hidden="true" />
          </div>
          <div>
            <span>Reading Guide</span>
            <span className="block text-[10px] font-normal opacity-70" style={{ color: theme.secondaryText }}>
              Focus bar follows cursor
            </span>
          </div>
        </label>
        <button
          id="ruler-toggle"
          role="switch"
          aria-checked={settings.readingRuler}
          onClick={() => update({ readingRuler: !settings.readingRuler })}
          className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ backgroundColor: settings.readingRuler ? theme.accent : theme.border }}
        >
          <span
            className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm"
            style={{ transform: settings.readingRuler ? 'translateX(1.6rem)' : 'translateX(0.25rem)' }}
          />
        </button>
      </div>

      {/* Font Size Slider with Floating Pill Tooltip */}
      <div className="space-y-2 relative">
        <div className="text-xs font-bold flex items-center justify-between" style={{ color: theme.secondaryText }}>
          <span className="flex items-center gap-1.5">
            <BookOpen size={14} aria-hidden="true" />
            <span>Text Size</span>
          </span>
          <span className="font-mono px-2 py-0.5 rounded-full border text-[11px]" style={{ borderColor: theme.border, color: theme.text }}>
            {settings.fontSize}px
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => update({ fontSize: Math.max(14, settings.fontSize - 1) })}
            aria-label="Decrease font size"
            className="p-2 rounded-xl border transition-all hover:opacity-80 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: theme.border, color: theme.text }}
          >
            <Minus size={12} />
          </button>
          <div className="relative flex-1 flex items-center">
            {activeTooltip === 'fontSize' && (
              <div
                className="absolute -top-7 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shadow-md transform -translate-x-1/2 pointer-events-none"
                style={{
                  left: `${((settings.fontSize - 14) / (36 - 14)) * 100}%`,
                  backgroundColor: theme.accent,
                  color: theme.accentText,
                }}
              >
                {settings.fontSize}px
              </div>
            )}
            <input
              type="range"
              min={14}
              max={36}
              step={1}
              value={settings.fontSize}
              onMouseEnter={() => setActiveTooltip('fontSize')}
              onMouseLeave={() => setActiveTooltip(null)}
              onChange={(e) => update({ fontSize: Number(e.target.value) })}
              aria-label="Font size slider"
              className="w-full accent-blue-600 h-2 rounded-lg cursor-pointer bg-black/10 dark:bg-white/10"
            />
          </div>
          <button
            onClick={() => update({ fontSize: Math.min(36, settings.fontSize + 1) })}
            aria-label="Increase font size"
            className="p-2 rounded-xl border transition-all hover:opacity-80 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: theme.border, color: theme.text }}
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Line Height Slider with Floating Pill Tooltip */}
      <div className="space-y-2 relative">
        <div className="text-xs font-bold flex items-center justify-between" style={{ color: theme.secondaryText }}>
          <span>Line Spacing</span>
          <span className="font-mono px-2 py-0.5 rounded-full border text-[11px]" style={{ borderColor: theme.border, color: theme.text }}>
            {settings.lineHeight.toFixed(1)}x
          </span>
        </div>
        <div className="relative flex items-center">
          {activeTooltip === 'lineHeight' && (
            <div
              className="absolute -top-7 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shadow-md transform -translate-x-1/2 pointer-events-none"
              style={{
                left: `${((settings.lineHeight - 1.2) / (3.0 - 1.2)) * 100}%`,
                backgroundColor: theme.accent,
                color: theme.accentText,
              }}
            >
              {settings.lineHeight.toFixed(1)}x
            </div>
          )}
          <input
            type="range"
            min={1.2}
            max={3.0}
            step={0.1}
            value={settings.lineHeight}
            onMouseEnter={() => setActiveTooltip('lineHeight')}
            onMouseLeave={() => setActiveTooltip(null)}
            onChange={(e) => update({ lineHeight: Number(e.target.value) })}
            aria-label="Line height slider"
            className="w-full accent-blue-600 h-2 rounded-lg cursor-pointer bg-black/10 dark:bg-white/10"
          />
        </div>
      </div>

      {/* Letter Spacing Slider with Floating Pill Tooltip */}
      <div className="space-y-2 relative">
        <div className="text-xs font-bold flex items-center justify-between" style={{ color: theme.secondaryText }}>
          <span>Letter Spacing</span>
          <span className="font-mono px-2 py-0.5 rounded-full border text-[11px]" style={{ borderColor: theme.border, color: theme.text }}>
            {settings.letterSpacing.toFixed(2)}em
          </span>
        </div>
        <div className="relative flex items-center">
          {activeTooltip === 'letterSpacing' && (
            <div
              className="absolute -top-7 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shadow-md transform -translate-x-1/2 pointer-events-none"
              style={{
                left: `${(settings.letterSpacing / 0.25) * 100}%`,
                backgroundColor: theme.accent,
                color: theme.accentText,
              }}
            >
              {settings.letterSpacing.toFixed(2)}em
            </div>
          )}
          <input
            type="range"
            min={0}
            max={0.25}
            step={0.01}
            value={settings.letterSpacing}
            onMouseEnter={() => setActiveTooltip('letterSpacing')}
            onMouseLeave={() => setActiveTooltip(null)}
            onChange={(e) => update({ letterSpacing: Number(e.target.value) })}
            aria-label="Letter spacing slider"
            className="w-full accent-blue-600 h-2 rounded-lg cursor-pointer bg-black/10 dark:bg-white/10"
          />
        </div>
      </div>

      {/* Tactile Theme Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold" style={{ color: theme.secondaryText }}>
          Color Theme
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(themes) as ThemeKey[]).map((key) => {
            const isSelected = settings.theme === key;
            return (
              <button
                key={key}
                onClick={() => update({ theme: key })}
                aria-pressed={isSelected}
                aria-label={`${themes[key].name} theme`}
                className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-150 hover:scale-[1.02] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  backgroundColor: isSelected ? theme.accent : 'transparent',
                  color: isSelected ? theme.accentText : theme.text,
                  borderColor: isSelected ? theme.accent : theme.border,
                  boxShadow: isSelected ? `0 4px 12px ${theme.glowColor || 'rgba(0,0,0,0.1)'}` : 'none',
                }}
              >
                {themeIcons[key]}
                <span className="truncate">{themes[key].name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
