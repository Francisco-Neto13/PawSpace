import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function GlassPanel({ children, className = '', title }: GlassPanelProps) {
  return (
    <div className={`
      relative bg-[#0d0d0f]/90 
      border-2 border-[#3a3830] 
      shadow-[6px_6px_0px_rgba(0,0,0,0.5)]
      after:content-[''] after:absolute after:inset-[2px] 
      after:border after:border-[#c8b89a]/10 after:pointer-events-none
      flex flex-col /* Garante que o título e o corpo se alinhem verticalmente */
      ${className}
    `}>
      {title && (
        <div className="border-b-2 border-[#3a3830] bg-[#1a1a1c] px-4 py-2 shrink-0">
          <h3 className="text-[#c8b89a] font-normal uppercase tracking-[0.2em] text-[11px] text-shadow-[1px_1px_0px_#000]">
            {title}
          </h3>
        </div>
      )}
      <div className="relative z-10 flex-1">
        {children}
      </div>
    </div>
  );
}