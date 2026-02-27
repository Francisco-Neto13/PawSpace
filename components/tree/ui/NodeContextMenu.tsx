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

export function NodeContextMenu({ x, y, nodeName, onAddChild, onDelete, onClose }: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
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

  const style: React.CSSProperties = {
    position: 'fixed',
    top: y,
    left: x,
    zIndex: 500,
  };

  return (
    <div ref={menuRef} style={style}>
      <div className="bg-[#0a0a0b] border border-[#c8b89a]/20 shadow-[0_0_30px_rgba(0,0,0,0.8)] min-w-[200px] overflow-hidden">
        
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Nó selecionado</p>
          <p className="text-[#c8b89a] text-xs font-bold mt-0.5 truncate">{nodeName}</p>
        </div>

        <div className="py-1">
          <button
            onClick={() => { onAddChild(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-zinc-300 hover:bg-white/5 hover:text-[#c8b89a] transition-colors group"
          >
            <Plus size={14} className="text-[#c8b89a] shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Filho</span>
          </button>

          {onDelete && (
            <>
              <div className="h-px bg-white/5 mx-4" />
              <button
                onClick={() => { onDelete(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} className="shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest">Deletar Nó</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}