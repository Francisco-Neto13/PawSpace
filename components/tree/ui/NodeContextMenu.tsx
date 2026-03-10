'use client';
import React, { useEffect, useRef } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';

interface NodeContextMenuProps {
  x: number;
  y: number;
  nodeName: string;
  onAddChild: () => void;
  onEdit: () => void; 
  onDelete?: () => void;
  onClose: () => void;
}

export function NodeContextMenu({ 
  x, 
  y, 
  nodeName, 
  onAddChild, 
  onEdit, 
  onDelete, 
  onClose 
}: NodeContextMenuProps) {
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
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onDragStart={(e) => e.preventDefault()}
      draggable={false}
    >
      <div className="relative min-w-[220px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

        <div className="px-4 pt-4 pb-3 border-b border-[var(--border-subtle)] relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-3 bg-[var(--text-secondary)]" />
            <p className="text-[8px] text-[var(--text-secondary)] uppercase font-black tracking-[0.25em]">
              Módulo Selecionado
            </p>
          </div>
          <p className="text-[var(--text-primary)] text-[11px] font-bold truncate pl-3">{nodeName}</p>
        </div>

        <div className="py-1.5 relative z-10">
          <button
            onClick={() => { onEdit(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all duration-200 group cursor-pointer"
          >
            <Edit3 size={13} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-widest">Configurar Módulo</span>
          </button>

          <button
            onClick={() => { onAddChild(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all duration-200 group cursor-pointer"
          >
            <Plus size={13} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-widest">Adicionar Submódulo</span>
          </button>

          {onDelete && (
            <>
              <div className="h-px bg-[var(--border-subtle)] mx-4 my-1" />
              <button
                onClick={() => { onDelete(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all duration-200 group cursor-pointer"
              >
                <Trash2 size={13} className="shrink-0 group-hover:text-[var(--text-primary)] transition-colors" />
                <span className="text-[9px] font-black uppercase tracking-widest">Remover Módulo</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
