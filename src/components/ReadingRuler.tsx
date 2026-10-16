'use client';

import { useEffect, useState } from 'react';
import { ThemeConfig } from '@/lib/themes';

interface ReadingRulerProps {
  active: boolean;
  theme: ThemeConfig;
  containerRef: React.RefObject<HTMLElement | null>;
}

export default function ReadingRuler({ active, theme, containerRef }: ReadingRulerProps) {
  const [mouseY, setMouseY] = useState<number | null>(null);
  const [rulerHeight] = useState(48);

  useEffect(() => {
    if (!active) {
      setMouseY(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        setMouseY(e.clientY - rect.top);
      }
    };

    const handleMouseLeave = () => {
      setMouseY(null);
    };

    const node = containerRef.current;
    if (node) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      node.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (node) {
        node.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [active, containerRef]);

  if (!active || mouseY === null) return null;

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-20 transition-all duration-75 ease-out select-none"
      style={{
        top: `${Math.max(0, mouseY - rulerHeight / 2)}px`,
        height: `${rulerHeight}px`,
      }}
      aria-hidden="true"
    >
      {/* Soft spotlight strip with subtle glowing borders */}
      <div
        className="w-full h-full rounded-lg border-y transition-colors duration-150 backdrop-contrast-125"
        style={{
          borderColor: theme.accent,
          backgroundColor: theme.highlightBg,
          opacity: 0.35,
          boxShadow: `0 0 20px ${theme.glowColor || 'rgba(0,0,0,0.1)'}`,
        }}
      />
    </div>
  );
}
