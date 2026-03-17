'use client';

import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';

interface SidebarIdentityCardProps {
  collapsed: boolean;
  avatarLetter: string;
  displayName: string;
  isLoadingDisplayName: boolean;
  onToggleCollapsed?: () => void;
  onCloseMobile?: () => void;
}

export function SidebarIdentityCard({
  collapsed,
  avatarLetter,
  displayName,
  isLoadingDisplayName,
  onToggleCollapsed,
  onCloseMobile,
}: SidebarIdentityCardProps) {
  const isMobile = typeof onCloseMobile === 'function';

  return (
    <div className="library-panel p-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
      <div className={`relative z-10 flex items-center ${collapsed ? 'flex-col justify-center' : 'justify-between'} gap-2`}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-full border border-[var(--border-muted)] bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
              <span className="text-[var(--text-primary)] text-[11px] font-black">{avatarLetter}</span>
            </div>
            <div className="min-w-0">
              <p className="library-kicker">PawSpace</p>
              <p className="sidebar-title truncate">
                {isLoadingDisplayName ? 'Carregando' : displayName}
              </p>
            </div>
          </div>
        )}

        {collapsed && (
          <>
            <div className="h-9 w-9 rounded-full border border-[var(--border-muted)] bg-[var(--bg-elevated)] flex items-center justify-center">
              <span className="text-[var(--text-primary)] text-[11px] font-black">{avatarLetter}</span>
            </div>
            <p className="ui-label text-center">Paw</p>
          </>
        )}

        {onToggleCollapsed && (
          <button
            onClick={onToggleCollapsed}
            className="h-8 w-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-colors duration-200 flex items-center justify-center cursor-pointer"
            aria-label={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          >
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        )}

        {isMobile && onCloseMobile && !onToggleCollapsed && (
          <button
            onClick={onCloseMobile}
            className="h-8 w-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-colors duration-200 flex items-center justify-center"
            aria-label="Fechar menu"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
