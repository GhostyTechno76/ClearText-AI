'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Eye, Pause, Play } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import SplineErrorBoundary from '@/components/SplineErrorBoundary';

// Dynamic import with SSR disabled to prevent window/browser hydration mismatch errors
const InteractiveColorBlob = dynamic(() => import('@/components/InteractiveColorBlob'), {
  ssr: false,
  loading: () => <SplineFallbackLoading />,
});

function SplineFallbackLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center relative select-none pointer-events-none">
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
        <div className="w-28 h-28 rounded-full border p-4 shadow-sm flex items-center justify-center bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10">
          <Eye size={24} className="opacity-40" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

interface SplineHeroProps {
  theme: ThemeConfig;
}

export default function SplineHeroPrism({ theme }: SplineHeroProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setPrefersReducedMotion(true);
        setIsPaused(true);
      }

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
        if (e.matches) setIsPaused(true);
      };
      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  // If WebGL fails, render a serene static chromatic orb
  if (hasError) {
    return (
      <div
        className="relative w-full h-[260px] sm:h-[320px] lg:h-[440px] xl:h-[480px] flex items-center justify-center pointer-events-none select-none transition-all"
        aria-hidden="true"
      >
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-500/25 via-indigo-400/20 to-slate-400/20 blur-2xl" />
            <div
              className="relative w-28 h-28 rounded-full backdrop-blur-xl border p-4 shadow-md flex items-center justify-center transition-all"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm"
                style={{ backgroundColor: theme.highlightBg }}
              >
                <Eye size={28} style={{ color: theme.accent }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[260px] sm:h-[320px] lg:h-[440px] xl:h-[480px] flex items-center justify-center select-none overflow-visible transition-all duration-300"
      style={{ background: 'transparent' }}
    >
      {/* Soft ambient radial backdrop that blends natively and seamlessly with main background */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-500"
        style={{
          background: `radial-gradient(circle at center, ${theme.highlightBg} 0%, transparent 70%)`,
          opacity: 0.65,
        }}
        aria-hidden="true"
      />

      {/* Discrete Sensory & Motion Control Toggle in bottom corner */}
      <button
        type="button"
        onClick={() => setIsPaused((prev) => !prev)}
        className="absolute bottom-1 right-2 sm:bottom-3 sm:right-3 z-20 pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition-opacity duration-200 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm"
        style={{
          backgroundColor: isPaused ? theme.card : `${theme.card}cc`,
          borderColor: isPaused ? theme.accent : theme.border,
          color: isPaused ? theme.accent : theme.text,
        }}
        aria-label={isPaused ? 'Resume 3D animation' : 'Pause 3D animation (reduce motion)'}
        aria-pressed={isPaused}
        title={isPaused ? 'Resume 3D animation' : 'Pause 3D animation for low sensory stimulation'}
      >
        {isPaused ? (
          <>
            <Play size={12} className="fill-current text-sky-400" aria-hidden="true" />
            <span>Motion Off</span>
          </>
        ) : (
          <>
            <Pause size={12} className="opacity-75" aria-hidden="true" />
            <span>Motion On</span>
          </>
        )}
      </button>

      {/* Seamless Floating 3D Canvas */}
      <div className="w-full h-full relative z-10 flex items-center justify-center pointer-events-auto">
        <SplineErrorBoundary
          fallback={<SplineFallbackLoading />}
          onError={() => setHasError(true)}
        >
          <InteractiveColorBlob theme={theme} isPaused={isPaused} />
        </SplineErrorBoundary>
      </div>
    </div>
  );
}

export { SplineHeroPrism as SplineHero };
