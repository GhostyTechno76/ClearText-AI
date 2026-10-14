'use client';

import { ThemeConfig } from '@/lib/themes';

interface LoadingSkeletonProps {
  theme: ThemeConfig;
}

export default function LoadingSkeleton({ theme }: LoadingSkeletonProps) {
  return (
    <div
      className="rounded-2xl border p-8 space-y-4 animate-pulse"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
      role="status"
      aria-label="Loading content"
    >
      <div className="h-4 rounded-full w-24" style={{ backgroundColor: theme.border }} />
      <div className="h-8 rounded-full w-3/4" style={{ backgroundColor: theme.border }} />
      <div className="flex gap-4">
        <div className="h-3 rounded-full w-20" style={{ backgroundColor: theme.border }} />
        <div className="h-3 rounded-full w-20" style={{ backgroundColor: theme.border }} />
      </div>
      <div className="h-px my-4" style={{ backgroundColor: theme.border }} />
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-full"
          style={{
            backgroundColor: theme.border,
            width: `${70 + Math.random() * 30}%`,
            opacity: 1 - i * 0.08,
          }}
        />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}
