'use client';
import React, { useEffect, useRef, memo, useMemo } from 'react';

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: seededRandom(i * 4 + 0),
    y: seededRandom(i * 4 + 1),
    r: seededRandom(i * 4 + 2) * 1.1 + 0.2,
    opacity: seededRandom(i * 4 + 3) * 0.4 + 0.1,
    bucket: Math.floor(seededRandom(i * 4 + 3) * 4),
  }));
}

const STARS = generateStars(60);

const BUCKETS = [0, 1, 2, 3].map(b => STARS.filter(s => s.bucket === b));

const StarFieldComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bg = ctx.createRadialGradient(
        width * 0.5, height * 0.4, 0,
        width * 0.5, height * 0.4, Math.max(width, height) * 0.7
      );
      bg.addColorStop(0, '#0d0d0f');
      bg.addColorStop(1, '#030304');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      STARS.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 212, 232, ${s.opacity})`;
        ctx.fill();
      });

      const vig = ctx.createRadialGradient(
        width * 0.5, height * 0.5, 0,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.65
      );
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.9)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    };

    draw();

    let timeout: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(draw, 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="starfield-wrapper absolute inset-0 w-full h-full pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {BUCKETS.map((stars, bucket) => (
        <svg
          key={bucket}
          className="absolute inset-0 w-full h-full"
          style={{ willChange: 'opacity' }}
        >
          {stars.map((s, i) => (
            <circle
              key={i}
              cx={`${s.x * 100}%`}
              cy={`${s.y * 100}%`}
              r={s.r}
              fill={`rgba(200, 212, 232, ${s.opacity})`}
            />
          ))}
        </svg>
      ))}

    </div>
  );
};

export const StarField = memo(StarFieldComponent);