'use client';
import React, { useEffect, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface NodeContextMenuProps {
  x: number;
  y: number;
  nodeName: string;
  onAddChild: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

const polySmall = `polygon(
  6px 0,
  calc(100% - 6px) 0,
  100% 6px,
  100% calc(100% - 8px),
  calc(100% - 6px) 100%,
  calc(50% + 8px) 100%,
  50% calc(100% - 6px),
  calc(50% - 8px) 100%,
  6px 100%,
  0 calc(100% - 8px),
  0 6px
)`;

export function NodeContextMenu({ x, y, nodeName, onAddChild, onDelete, onClose }: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[500] animate-in fade-in zoom-in-95 duration-150"
      style={{ top: y, left: x }}
    >
      <div
        className="min-w-[220px] p-[1.5px]"
        style={{ clipPath: polySmall, backgroundColor: '#c8b89a22' }}
      >
        <div style={{ clipPath: polySmall, backgroundColor: '#000' }}>
          <div
            className="relative overflow-hidden"
            style={{ clipPath: polySmall, backgroundColor: '#080808' }}
          >
            <div
              className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
              }}
            />

            <div className="px-4 pt-4 pb-3 border-b border-white/[0.04] relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-3 bg-[#c8b89a]/40" />
                <p className="text-[8px] text-zinc-600 uppercase font-black tracking-[0.25em]">
                  Nó selecionado
                </p>
              </div>
              <p className="text-[#c8b89a] text-[11px] font-bold truncate pl-3">{nodeName}</p>
            </div>

            <div className="py-1.5 relative z-10">
              <button
                onClick={() => { onAddChild(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-zinc-400 hover:bg-white/[0.04] hover:text-[#c8b89a] transition-all duration-200 group cursor-pointer"
              >
                <Plus size={13} className="text-[#c8b89a]/60 group-hover:text-[#c8b89a] transition-colors shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-widest">Adicionar Filho</span>
              </button>

              {onDelete && (
                <>
                  <div className="h-px bg-white/[0.04] mx-4 my-1" />
                  <button
                    onClick={() => { onDelete(); onClose(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-zinc-600 hover:bg-red-500/[0.06] hover:text-red-400 transition-all duration-200 group cursor-pointer"
                  >
                    <Trash2 size={13} className="shrink-0 group-hover:text-red-400 transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Deletar Nó</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}