'use client';

import { useMemo, useState } from 'react';
import { Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/shared/supabase/client';
import { useAuthTransition } from '@/shared/contexts/AuthTransitionContext';
import { usePawSpaceMeta } from '@/shared/contexts/PawSpaceContext';
import { useJournal } from '@/shared/contexts/JournalContext';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAuthDisplayName } from '@/shared/hooks/useAuthDisplayName';
import { APP_NAV_LINKS } from './appNavigation';
import { SidebarIdentityCard } from './sidebar/SidebarIdentityCard';
import { SidebarLogoutButton } from './sidebar/SidebarLogoutButton';
import { SidebarNavLinks } from './sidebar/SidebarNavLinks';

const SIDEBAR_STORAGE_KEY = 'pawspace.sidebar.collapsed.v1';

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();
  const { beginAuthTransition, cancelAuthTransition } = useAuthTransition();

  const { displayName, avatarUrl, isLoading: isLoadingDisplayName } = useAuthDisplayName();
  const { isDirty, setIsDirty, discardLocalChanges } = usePawSpaceMeta();
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

  const handleSafeNavigation = async (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();

    if (href === pathname) {
      setIsMobileOpen(false);
      return;
    }

    if (isDirty) {
      const confirmExit = window.confirm(
        'Você tem alterações não salvas na sua árvore. Se sair agora, essas pegadas serão perdidas. Deseja continuar?'
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
      const confirmExit = window.confirm('Sair do PawSpace e perder alterações não salvas?');
      if (!confirmExit) return;
      setIsDirty(false);
    }

    try {
      await beginAuthTransition({
        kind: 'exit',
        title: 'Saindo do PawSpace',
      });
      await flushPending();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      cancelAuthTransition();
      console.error('Erro ao sair:', error);
    }
  };

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);

    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
    } catch {
      // Falha de escrita de storage não impede o layout.
    }
  };

  return (
    <>
      <aside
        className={`hidden lg:flex h-screen sticky top-0 z-[95] border-r border-[var(--border-subtle)] bg-[var(--bg-strong)] transition-[width] duration-250 ${
          isCollapsed ? 'w-[112px]' : 'w-[280px]'
        }`}
      >
        <div className="w-full p-4 flex flex-col gap-4">
          <SidebarIdentityCard
            collapsed={isCollapsed}
            avatarLetter={avatarLetter}
            avatarUrl={avatarUrl}
            displayName={displayName}
            isLoadingDisplayName={isLoadingDisplayName}
            onToggleCollapsed={toggleCollapsed}
          />

          <nav className="flex-1 min-h-0">
            <div className="library-panel p-2 relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
              <div className="relative z-10 h-full overflow-y-auto overview-scroll-area pr-1">
                <SidebarNavLinks
                  collapsed={isCollapsed}
                  pathname={pathname}
                  theme={theme}
                  links={APP_NAV_LINKS}
                  onNavigate={handleSafeNavigation}
                  router={router}
                />
              </div>
            </div>
          </nav>

          <SidebarLogoutButton collapsed={isCollapsed} onLogout={handleLogout} />
        </div>
      </aside>

      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed left-3 top-3 z-[110] flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-strong)] text-[var(--text-primary)] shadow-[0_14px_40px_rgba(0,0,0,0.2)] sm:left-4 sm:top-4"
        aria-label="Abrir menu lateral"
      >
        <Menu size={18} />
      </button>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[120]">
          <button
            className="absolute inset-0 bg-black/45"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Fechar menu lateral"
          />

          <aside className="absolute left-0 top-0 flex h-full w-[min(20rem,calc(100vw-0.75rem))] max-w-full flex-col gap-4 border-r border-[var(--border-subtle)] bg-[var(--bg-base)] p-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:w-[280px] sm:p-4">
            <SidebarIdentityCard
              collapsed={false}
              avatarLetter={avatarLetter}
              avatarUrl={avatarUrl}
              displayName={displayName}
              isLoadingDisplayName={isLoadingDisplayName}
              onCloseMobile={() => setIsMobileOpen(false)}
            />

            <nav className="relative flex-1 min-h-0 overflow-hidden library-panel p-2">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
              <div className="relative z-10 h-full overflow-y-auto overview-scroll-area pr-1">
                <SidebarNavLinks
                  collapsed={false}
                  pathname={pathname}
                  theme={theme}
                  links={APP_NAV_LINKS}
                  onNavigate={handleSafeNavigation}
                  router={router}
                />
              </div>
            </nav>

            <SidebarLogoutButton onLogout={handleLogout} />
          </aside>
        </div>
      )}
    </>
  );
}
