'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen, Menu, X, LogOut } from 'lucide-react';
import { createClient } from '@/shared/supabase/client';
import { useNexusMeta } from '@/shared/contexts/NexusContext';
import { useJournal } from '@/shared/contexts/JournalContext';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAuthDisplayName } from '@/shared/hooks/useAuthDisplayName';
import { APP_NAV_LINKS } from './appNavigation';

const SIDEBAR_STORAGE_KEY = 'pawspace.sidebar.collapsed.v1';

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();

  const { displayName, isLoading: isLoadingDisplayName } = useAuthDisplayName();
  const { isDirty, setIsDirty, discardLocalChanges } = useNexusMeta();
  const { flushPending } = useJournal();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const avatarLetter = useMemo(
    () => (displayName.trim().charAt(0) || 'U').toUpperCase(),
    [displayName]
  );

  const handleSafeNavigation = async (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (href === pathname) {
      setIsMobileOpen(false);
      return;
    }

    if (isDirty) {
      const confirmExit = window.confirm(
        'Voce tem alteracoes nao salvas na sua arvore. Se sair agora, essas pegadas serao perdidas. Deseja continuar?'
      );
      if (!confirmExit) return;
      discardLocalChanges();
      setIsDirty(false);
    }

    await flushPending();
    setIsMobileOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
    if (isDirty) {
      const confirmExit = window.confirm('Sair do PawSpace e perder alteracoes nao salvas?');
      if (!confirmExit) return;
      setIsDirty(false);
    }

    try {
      await flushPending();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
    } catch {
      // Falha de escrita de storage nao impede o layout.
    }
  };

  const renderNavLinks = (collapsed: boolean) => (
    <div className="flex flex-col gap-1.5">
      {APP_NAV_LINKS.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={(e) => void handleSafeNavigation(e, link.href)}
            title={collapsed ? link.name : undefined}
            className={`relative ${collapsed ? 'h-11' : 'h-12'} rounded-xl border transition-all duration-200 overflow-hidden ${
              isActive
                ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                : 'border-transparent bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent opacity-60" />
            <div className={`relative z-10 h-full flex items-center ${collapsed ? 'justify-center px-2' : 'px-3 gap-3'}`}>
              <div
                className={`relative shrink-0 rounded-lg border transition-colors duration-200 ${
                  isActive
                    ? 'border-[var(--border-visible)] bg-[var(--bg-base)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                } ${collapsed ? 'h-8 w-8' : 'h-9 w-9'}`}
              >
                <Image
                  src={link.iconSrc}
                  alt={`${link.name} icon`}
                  fill
                  sizes={collapsed ? '32px' : '36px'}
                  className="object-contain p-1.5"
                  style={{
                    filter:
                      theme === 'dark'
                        ? isActive
                          ? 'invert(1) brightness(1.25)'
                          : 'invert(1) brightness(1.1)'
                        : 'none',
                  }}
                />
              </div>

              {!collapsed && (
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                  {link.name}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex h-screen sticky top-0 z-[95] border-r border-[var(--border-subtle)] bg-[var(--bg-strong)] backdrop-blur-md transition-[width] duration-250 ${
          isCollapsed ? 'w-[112px]' : 'w-[280px]'
        }`}
      >
        <div className="w-full p-4 flex flex-col gap-4">
          <div className="library-panel p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
            <div className={`relative z-10 flex items-center ${isCollapsed ? 'flex-col justify-center' : 'justify-between'} gap-2`}>
              {!isCollapsed && (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-full border border-[var(--border-muted)] bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
                    <span className="text-[var(--text-primary)] text-[11px] font-black">{avatarLetter}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="library-kicker">PawSpace</p>
                    <p className="text-[10px] font-black text-[var(--text-primary)] truncate">
                      {isLoadingDisplayName ? 'Carregando' : displayName}
                    </p>
                  </div>
                </div>
              )}

              {isCollapsed && (
                <>
                  <div className="h-9 w-9 rounded-full border border-[var(--border-muted)] bg-[var(--bg-elevated)] flex items-center justify-center">
                    <span className="text-[var(--text-primary)] text-[11px] font-black">{avatarLetter}</span>
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[var(--text-secondary)] text-center">
                    Paw
                  </p>
                </>
              )}

              <button
                onClick={toggleCollapsed}
                className="h-8 w-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-colors duration-200 flex items-center justify-center cursor-pointer"
                aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
              >
                {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
              </button>
            </div>
          </div>

          <nav className="flex-1 min-h-0">
            <div className="library-panel p-2 relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
              <div className="relative z-10 h-full overflow-y-auto overview-scroll-area pr-1">
                {renderNavLinks(isCollapsed)}
              </div>
            </div>
          </nav>

          <button
            onClick={() => void handleLogout()}
            className={`${isCollapsed ? 'h-11' : 'h-10'} rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-colors duration-200 cursor-pointer flex items-center ${
              isCollapsed ? 'justify-center px-2' : 'justify-center gap-2 px-4'
            }`}
            title={isCollapsed ? 'Sair' : undefined}
          >
            <LogOut size={14} />
            {!isCollapsed && <span className="text-[9px] font-black uppercase tracking-[0.2em]">Sair</span>}
          </button>
        </div>
      </aside>

      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[110] h-10 w-10 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-strong)] text-[var(--text-primary)] backdrop-blur-md flex items-center justify-center"
        aria-label="Abrir menu lateral"
      >
        <Menu size={18} />
      </button>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[120]">
          <button
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Fechar menu lateral"
          />

          <aside className="absolute top-0 left-0 h-full w-[280px] border-r border-[var(--border-subtle)] bg-[var(--bg-strong)] p-4 flex flex-col gap-4">
            <div className="library-panel p-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-full border border-[var(--border-muted)] bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
                    <span className="text-[var(--text-primary)] text-[11px] font-black">{avatarLetter}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="library-kicker">PawSpace</p>
                    <p className="text-[10px] font-black text-[var(--text-primary)] truncate">
                      {isLoadingDisplayName ? 'Carregando' : displayName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="h-8 w-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-colors duration-200 flex items-center justify-center"
                  aria-label="Fechar menu"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <nav className="flex-1 min-h-0 library-panel p-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
              <div className="relative z-10 h-full overflow-y-auto overview-scroll-area pr-1">
                {renderNavLinks(false)}
              </div>
            </nav>

            <button
              onClick={() => void handleLogout()}
              className="h-10 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2 px-4"
            >
              <LogOut size={14} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Sair</span>
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
