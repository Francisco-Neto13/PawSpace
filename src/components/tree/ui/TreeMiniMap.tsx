'use client';
import { memo, useSyncExternalStore } from 'react';
import { MiniMap, Panel, useReactFlow } from '@xyflow/react';
import { useTheme } from '@/shared/contexts/ThemeContext';

interface TreeMiniMapProps {
  selectedNodeId: string | null;
}

const DESKTOP_MINIMAP_WIDTH = 220;
const DESKTOP_MINIMAP_HEIGHT = 136;
const MOBILE_MINIMAP_WIDTH = 152;
const MOBILE_MINIMAP_HEIGHT = 96;
const DESKTOP_OFFSET = 14;
const MOBILE_OFFSET = 10;

function subscribeViewport(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function getViewportWidth() {
  return window.innerWidth;
}

function TreeMiniMapComponent({ selectedNodeId }: TreeMiniMapProps) {
  const { fitView } = useReactFlow();
  const { theme } = useTheme();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const viewportWidth = useSyncExternalStore(
    subscribeViewport,
    getViewportWidth,
    () => 1024
  );

  const isCompact = viewportWidth < 768;
  const minimapWidth = isCompact ? MOBILE_MINIMAP_WIDTH : DESKTOP_MINIMAP_WIDTH;
  const minimapHeight = isCompact ? MOBILE_MINIMAP_HEIGHT : DESKTOP_MINIMAP_HEIGHT;
  const offset = isCompact ? MOBILE_OFFSET : DESKTOP_OFFSET;

  const minimapMaskColor =
    isHydrated && theme === 'light' ? 'rgba(24, 24, 27, 0.22)' : 'rgba(0, 0, 0, 0.45)';

  const handleCenter = () => {
    void fitView({ padding: 0.24, duration: 280 });
  };

  return (
    <>
      {!isCompact && (
        <MiniMap
          position="bottom-right"
          maskColor={minimapMaskColor}
          nodeBorderRadius={999}
          nodeColor={(node) => (node.id === selectedNodeId ? 'var(--text-primary)' : 'var(--text-secondary)')}
          className="minimap-card"
          style={{
            width: minimapWidth,
            height: minimapHeight,
            margin: offset,
          }}
        />
      )}

      <Panel
        position="bottom-right"
        style={{
          margin: 0,
          marginRight: offset,
          marginBottom: (isCompact ? 0 : minimapHeight) + offset + 4,
          pointerEvents: 'auto',
        }}
      >
        <div
          className="relative box-border overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl"
          style={{ width: isCompact ? 'auto' : minimapWidth }}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
          <div className="relative z-10 flex h-10 items-center justify-between gap-2 px-2.5">
            {!isCompact && <p className="field-label text-[var(--text-secondary)]">Navegação</p>}
            <button
              type="button"
              onClick={handleCenter}
              className="relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 transition-colors duration-200 hover:border-[var(--border-visible)] hover:bg-[var(--bg-elevated)]"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
              <span className="relative z-10 leading-none field-label text-[var(--text-secondary)]">
                {isCompact ? 'Centro' : 'Centralizar'}
              </span>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--border-muted)]" />
            </button>
          </div>
        </div>
      </Panel>
    </>
  );
}

export const TreeMiniMap = memo(TreeMiniMapComponent);
