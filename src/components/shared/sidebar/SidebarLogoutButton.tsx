'use client';

import { LogOut } from 'lucide-react';

interface SidebarLogoutButtonProps {
  collapsed?: boolean;
  onLogout: () => Promise<void>;
}

export function SidebarLogoutButton({
  collapsed = false,
  onLogout,
}: SidebarLogoutButtonProps) {
  return (
    <button
      onClick={() => void onLogout()}
      className={`${collapsed ? 'h-11' : 'h-10'} rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-colors duration-200 cursor-pointer flex items-center ${
        collapsed ? 'justify-center px-2' : 'justify-center gap-2 px-4'
      }`}
      title={collapsed ? 'Sair' : undefined}
    >
      <LogOut size={14} />
      {!collapsed && <span className="button-label">Sair</span>}
    </button>
  );
}
