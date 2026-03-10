'use client';
import { useSyncExternalStore } from 'react';
import { MiniMap, Panel, useReactFlow } from '@xyflow/react';
import { useTheme } from '@/shared/contexts/ThemeContext';

interface TreeMiniMapProps {
  selectedNodeId: string | null;
}

const MINIMAP_WIDTH = 248;
const MINIMAP_HEIGHT = 152;
const OFFSET = 14;

export function TreeMiniMap({ selectedNodeId }: TreeMiniMapProps) {
  const { fitView } = useReactFlow();
  const { theme } = useTheme();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const minimapMaskColor = isHydrated && theme === 'light' ? 'rgba(24, 24, 27, 0.22)' : 'rgba(0, 0, 0, 0.45)';

  const handleCenter = () => {
    void fitView({ padding: 0.24, duration: 280 });
  };

  return (
    <>
      <MiniMap
        position="bottom-right"
        pannable
        zoomable
        maskColor={minimapMaskColor}
        nodeBorderRadius={999}
        nodeColor={(node) => (node.id === selectedNodeId ? 'var(--text-primary)' : 'var(--text-secondary)')}
        className="minimap-card"
        style={{
          width: MINIMAP_WIDTH,
          height: MINIMAP_HEIGHT,
          margin: OFFSET,
        }}
      />

      <Panel
        position="bottom-right"
        style={{
          margin: 0,
          marginRight: OFFSET,
          marginBottom: MINIMAP_HEIGHT + OFFSET + 4,
          pointerEvents: 'auto',
        }}
      >
        <div className="relative box-border rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-2xl" style={{ width: MINIMAP_WIDTH }}>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
          <div className="relative z-10 h-10 px-2.5 flex items-center justify-between gap-2">
            <p className="text-[7px] uppercase tracking-[0.2em] font-black text-[var(--text-secondary)]">Navegacao</p>
            <button
              type="button"
              onClick={handleCenter}
              className="relative inline-flex items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 overflow-hidden hover:border-[var(--border-visible)] hover:bg-[var(--bg-elevated)] transition-colors duration-200"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
              <span className="relative z-10 leading-none text-[7px] uppercase tracking-[0.16em] font-black text-[var(--text-secondary)]">
                Centralizar
              </span>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--border-muted)]" />
            </button>
          </div>
        </div>
      </Panel>
    </>
  );
}
