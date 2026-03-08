'use client';

import React, { forwardRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/shared/supabase/client';
import { useNexus } from '@/shared/contexts/NexusContext';
import { useJournal } from '@/shared/contexts/JournalContext';
import { useAuthDisplayName } from '@/shared/hooks/useAuthDisplayName';

const Navbar = forwardRef<HTMLElement>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const { displayName, isLoading: isLoadingDisplayName } = useAuthDisplayName();
  const { isDirty, setIsDirty, discardLocalChanges } = useNexus();
  const { flushPending } = useJournal();
  const avatarLetter = (displayName.trim().charAt(0) || 'U').toUpperCase();

  if (pathname === '/login') return null;

  const handleSafeNavigation = async (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (href === pathname) {
      setIsOpen(false);
      return;
    }

    if (isDirty) {
      const confirmExit = window.confirm(
        'Você tem alterações não salvas na sua Árvore. Se sair agora, elas serão perdidas. Deseja sair mesmo assim?'
      );
      if (!confirmExit) return;
      discardLocalChanges();
      setIsDirty(false);
    }

    await flushPending();
    setIsOpen(false);
    router.push(href);
  };

  const links = [
    { name: 'Resumo', href: '/overview' },
    { name: 'Árvore', href: '/tree' },
    { name: 'Biblioteca', href: '/library' },
    { name: 'Diário', href: '/journal' },
    { name: 'Conquistas', href: '/achievements' },
    { name: 'Configurações', href: '/settings' },
  ];

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (isDirty) {
      const confirmExit = window.confirm('Sair e perder alterações não salvas?');
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

  return (
    <nav
      ref={ref}
      className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-strong)] backdrop-blur-xl sticky top-0 z-[100]"
    >
      <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 xl:px-10 2xl:px-16 py-3 flex justify-between items-center sm:grid sm:grid-cols-3">
        <div className="justify-self-start">
          <Link
            href="/overview"
            onClick={(e) => handleSafeNavigation(e, '/overview')}
            className="flex items-center gap-3 group"
          >
            <div className="h-9 w-9 rounded-full border border-[var(--border-muted)] bg-[var(--bg-elevated)] flex items-center justify-center transition-colors group-hover:border-[var(--border-visible)]">
              <span className="text-[var(--text-primary)] text-sm font-black">{avatarLetter}</span>
            </div>
            <span className="text-[var(--text-primary)] text-[11px] font-black uppercase tracking-[0.2em] group-hover:text-[var(--text-primary)] transition-colors">
              {isLoadingDisplayName ? 'Carregando' : displayName}
            </span>
          </Link>
        </div>

        <div className="hidden md:flex justify-self-center items-center gap-8 lg:gap-10">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleSafeNavigation(e, link.href)}
                className={`relative text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] transition-colors group py-1 ${
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {link.name}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-end justify-self-end gap-4">
          <button
            onClick={handleLogout}
            className="hidden sm:block px-5 py-2 border border-[var(--border-muted)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:border-[var(--border-visible)] hover:text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-500 cursor-pointer"
          >
            Logout
          </button>

          <button
            className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[var(--bg-strong)] border-b border-[var(--border-subtle)] animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-6 gap-6">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleSafeNavigation(e, link.href)}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px w-full bg-[var(--border-subtle)]" />
            <button
              onClick={handleLogout}
              className="text-[var(--text-secondary)] text-left text-[11px] font-black uppercase tracking-widest"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;
