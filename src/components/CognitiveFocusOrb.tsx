'use client';

import { useState } from 'react';
import { ThemeConfig } from '@/lib/themes';

interface CognitiveFocusOrbProps {
  isPlaying: boolean;
  theme: ThemeConfig;
  className?: string;
}

export default function CognitiveFocusOrb({ isPlaying, theme, className = '' }: CognitiveFocusOrbProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative flex items-center justify-center select-none cursor-pointer group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={isPlaying ? 'Cognitive Focus Orb — Synchronized Audio Pulse' : 'Cognitive Focus Orb — Ambient Clarity'}
      aria-hidden="true"
    >
      {/* Outer pulsating wave rings when active reading */}
      {isPlaying && (
        <>
          <span
            className="absolute -inset-2 rounded-full animate-ping opacity-40"
            style={{ backgroundColor: theme.accent, animationDuration: '2.4s' }}
          />
          <span
            className="absolute -inset-1 rounded-full animate-pulse opacity-60"
            style={{ backgroundColor: theme.highlightBg }}
          />
        </>
      )}

      {/* Ambient glow */}
      <div
        className="absolute -inset-1 rounded-full blur-md transition-opacity duration-500"
        style={{
          backgroundColor: theme.accent,
          opacity: isPlaying ? 0.45 : isHovered ? 0.35 : 0.15,
        }}
      />

      {/* The 3D Glass Sphere Body */}
      <div
        className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md transform"
        style={{
          transform: isHovered ? 'scale(1.12) translateY(-1px)' : 'scale(1)',
          background: `radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.25) 30%, ${theme.accent} 75%, rgba(0, 0, 0, 0.3) 100%)`,
          boxShadow: `inset -2px -2px 6px rgba(0, 0, 0, 0.35), inset 2px 2px 6px rgba(255, 255, 255, 0.6), 0 4px 12px ${theme.glowColor || 'rgba(0,0,0,0.15)'}`,
          border: '1px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* Core light refractor */}
        <div
          className={`w-3.5 h-3.5 rounded-full transition-transform duration-700 ${
            isPlaying ? 'animate-spin' : ''
          }`}
          style={{
            animationDuration: '6s',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), transparent)',
          }}
        />

        {/* Dynamic inner soundwave ripples when reading */}
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center gap-0.5">
            <span className="w-0.5 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 h-3.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  );
}
