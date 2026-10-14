'use client';

import { Eye, BookOpen, Minus, Plus, Sun, Moon, Contrast, Coffee } from 'lucide-react';
import { ThemeConfig, ThemeKey, ReaderSettings, themes } from '@/lib/themes';

interface ToolbarProps {
  settings: ReaderSettings;
  onSettingsChange: (settings: ReaderSettings) => void;
  theme: ThemeConfig;
}

export default function Toolbar({ settings, onSettingsChange, theme }: ToolbarProps) {
  const update = (partial: Partial<ReaderSettings>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  const themeIcons: Record<ThemeKey, React.ReactNode> = {
    light: <Sun size={14} aria-hidden="true" />,
    dark: <Moon size={14} aria-hidden="true" />,
    'high-contrast': <Contrast size={14} aria-hidden="true" />,
    sepia: <Coffee size={14} aria-hidden="true" />,
  };

  return (
    <div
      className="rounded-2xl border p-4 space-y-5 shadow-lg"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
      role="toolbar"
      aria-label="Reader customization controls"
    >
      <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: theme.border }}>
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.secondaryText }}>
          Display Settings
        </h3>
        <button
          onClick={() =>
            onSettingsChange({
              fontSize: 18,
              lineHeight: 1.8,
              letterSpacing: 0.02,
              fontFamily: 'sans',
              bionicReading: false,
              theme: settings.theme,
            })
          }
          className="text-[11px] underline transition-opacity hover:opacity-80"
          style={{ color: theme.secondaryText }}
          title="Reset typography settings to default"
        >
          Reset
        </button>
      </div>

      {/* Font Toggle */}
      <div className="space-y-2">
        <label className="text-xs font-medium" style={{ color: theme.secondaryText }}>Font Family</label>
        <div className="flex gap-2">
          <button
            onClick={() => update({ fontFamily: 'sans' })}
            aria-pressed={settings.fontFamily === 'sans'}
            className="flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: settings.fontFamily === 'sans' ? theme.accent : 'transparent',
              color: settings.fontFamily === 'sans' ? theme.accentText : theme.text,
              borderColor: settings.fontFamily === 'sans' ? theme.accent : theme.border,
            }}
          >
            Sans-Serif
          </button>
          <button
            onClick={() => update({ fontFamily: 'dyslexic' })}
            aria-pressed={settings.fontFamily === 'dyslexic'}
            className="flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: settings.fontFamily === 'dyslexic' ? theme.accent : 'transparent',
              color: settings.fontFamily === 'dyslexic' ? theme.accentText : theme.text,
              borderColor: settings.fontFamily === 'dyslexic' ? theme.accent : theme.border,
              fontFamily: 'OpenDyslexic, "Comic Sans MS", cursive, sans-serif',
            }}
          >
            Dyslexic
          </button>
        </div>
      </div>

      {/* Bionic Reading */}
      <div className="flex items-center justify-between">
        <label htmlFor="bionic-toggle" className="text-xs font-medium flex items-center gap-2 cursor-pointer" style={{ color: theme.secondaryText }}>
          <Eye size={14} aria-hidden="true" />
          Bionic Reading
        </label>
        <button
          id="bionic-toggle"
          role="switch"
          aria-checked={settings.bionicReading}
          onClick={() => update({ bionicReading: !settings.bionicReading })}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ backgroundColor: settings.bionicReading ? theme.accent : theme.border }}
        >
          <span
            className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
            style={{ transform: settings.bionicReading ? 'translateX(1.35rem)' : 'translateX(0.25rem)' }}
          />
        </button>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="text-xs font-medium flex items-center justify-between" style={{ color: theme.secondaryText }}>
          <span className="flex items-center gap-2"><BookOpen size={14} aria-hidden="true" />Font Size</span>
          <span className="font-mono">{settings.fontSize}px</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => update({ fontSize: Math.max(14, settings.fontSize - 1) })}
            aria-label="Decrease font size"
            className="p-1.5 rounded-lg border transition-all hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: theme.border, color: theme.text }}
          >
            <Minus size={12} />
          </button>
          <input
            type="range"
            min={14}
            max={36}
            step={1}
            value={settings.fontSize}
            onChange={e => update({ fontSize: Number(e.target.value) })}
            aria-label="Font size slider"
            className="flex-1 accent-blue-500 h-1.5 cursor-pointer"
          />
          <button
            onClick={() => update({ fontSize: Math.min(36, settings.fontSize + 1) })}
            aria-label="Increase font size"
            className="p-1.5 rounded-lg border transition-all hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: theme.border, color: theme.text }}
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Line Height */}
      <div className="space-y-2">
        <div className="text-xs font-medium flex items-center justify-between" style={{ color: theme.secondaryText }}>
          <span>Line Height</span>
          <span className="font-mono">{settings.lineHeight.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={1.2}
          max={3.0}
          step={0.1}
          value={settings.lineHeight}
          onChange={e => update({ lineHeight: Number(e.target.value) })}
          aria-label="Line height slider"
          className="w-full accent-blue-500 h-1.5 cursor-pointer"
        />
      </div>

      {/* Letter Spacing */}
      <div className="space-y-2">
        <div className="text-xs font-medium flex items-center justify-between" style={{ color: theme.secondaryText }}>
          <span>Letter Spacing</span>
          <span className="font-mono">{settings.letterSpacing.toFixed(2)}em</span>
        </div>
        <input
          type="range"
          min={0}
          max={0.25}
          step={0.01}
          value={settings.letterSpacing}
          onChange={e => update({ letterSpacing: Number(e.target.value) })}
          aria-label="Letter spacing slider"
          className="w-full accent-blue-500 h-1.5 cursor-pointer"
        />
      </div>

      {/* Theme Switcher */}
      <div className="space-y-2">
        <label className="text-xs font-medium" style={{ color: theme.secondaryText }}>Theme</label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(themes) as ThemeKey[]).map(key => (
            <button
              key={key}
              onClick={() => update({ theme: key })}
              aria-pressed={settings.theme === key}
              aria-label={`${themes[key].name} theme`}
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: settings.theme === key ? theme.accent : 'transparent',
                color: settings.theme === key ? theme.accentText : theme.text,
                borderColor: settings.theme === key ? theme.accent : theme.border,
              }}
            >
              {themeIcons[key]}
              {themes[key].name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
