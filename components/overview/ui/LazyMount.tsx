'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyMountProps {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
}

export default function LazyMount({
  children,
  minHeight = 240,
  rootMargin = '200px 0px',
}: LazyMountProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const supportsIntersectionObserver = typeof IntersectionObserver !== 'undefined';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!supportsIntersectionObserver) return;
    if (isVisible) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible, rootMargin, supportsIntersectionObserver]);

  return (
    <div ref={containerRef} className="h-full" style={{ minHeight }}>
      {isVisible || !supportsIntersectionObserver ? (
        children
      ) : (
        <div
          className="h-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] animate-pulse"
          style={{ minHeight }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
