'use client';
import React, { useMemo, memo } from 'react';

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seededRandom(i * 4 + 0) * 100,
    y: seededRandom(i * 4 + 1) * 100,
    size: seededRandom(i * 4 + 2) * 1.1 + 0.2, 
    opacity: seededRandom(i * 4 + 3) * 0.4 + 0.1,
    duration: 3 + seededRandom(i * i) * 4, 
    delay: seededRandom(i) * -10, 
  }));
}

const StarFieldComponent = () => {
  const stars = useMemo(() => generateStars(60), []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--base-op); transform: scale(1); }
          50% { opacity: 0.1; transform: scale(0.8); }
        }
        .star {
          animation: twinkle var(--dur) ease-in-out infinite;
          animation-delay: var(--delay);
          will-change: opacity;
        }
      `}</style>

      <svg className="w-full h-full">
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#0d0d0f" />
            <stop offset="100%" stopColor="#030304" />
          </radialGradient>
          <radialGradient id="vig" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.9)" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#bgGrad)" />

        {stars.map(s => (
          <circle
            key={s.id}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.size}
            fill="#c8d4e8"
            className="star"
            style={{ 
              '--base-op': s.opacity,
              '--dur': `${s.duration}s`,
              '--delay': `${s.delay}s`
            } as React.CSSProperties}
          />
        ))}

        <rect width="100%" height="100%" fill="url(#vig)" />
      </svg>
    </div>
  );
};

export const StarField = memo(StarFieldComponent);