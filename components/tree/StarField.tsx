'use client';
import React, { useMemo } from 'react';

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seededRandom(i * 5 + 0) * 100,
    y: seededRandom(i * 5 + 1) * 100,
    size: seededRandom(i * 5 + 2) * 1.5 + 0.5,
    opacity: seededRandom(i * 5 + 3) * 0.4 + 0.1,
    delay: seededRandom(i * 5 + 4) * 3,
    dur: 2 + seededRandom(i * 5 + 4) * 2,
  }));
}

export function StarField() {
  const stars = useMemo(() => generateStars(80), []);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {stars.map(s => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.size} fill="white" opacity={s.opacity}>
          <animate
            attributeName="opacity"
            values={`${s.opacity};${s.opacity * 0.2};${s.opacity}`}
            dur={`${s.dur}s`}
            repeatCount="indefinite"
            begin={`${s.delay}s`}
          />
        </circle>
      ))}
      <defs>
        <radialGradient id="vig" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.65)" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#vig)" />
    </svg>
  );
}