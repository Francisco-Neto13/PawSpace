'use client';

import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Produto', href: '#produto' },
  { label: 'Fluxo', href: '#fluxo' },
  { label: 'Vantagens', href: '#vantagens' },
  { label: 'Começar', href: '#comecar' },
];

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleTopClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;

    event.preventDefault();

    const target = document.querySelector(href);
    if (!(target instanceof HTMLElement)) return;

    const navbarOffset = 112;
    const top = target.getBoundingClientRect().top + window.scrollY - navbarOffset;

    window.history.pushState(null, '', href);
    window.scrollTo({ top, behavior: 'smooth' });
    setIsOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 16);

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${
        hasScrolled
          ? 'border-[var(--border-visible)] bg-[var(--bg-strong)]/96 shadow-[0_18px_48px_rgba(0,0,0,0.18)]'
          : 'border-[var(--border-subtle)] bg-[var(--bg-strong)]/88'
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 xl:max-w-7xl xl:px-10 2xl:max-w-[1600px] 2xl:px-16">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3 transition-all duration-300 md:py-4 lg:grid-cols-[1fr_auto_1fr]">
          <Link href="/" onClick={handleTopClick} className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[var(--border-visible)] bg-[var(--bg-elevated)] transition-colors duration-200 group-hover:bg-[var(--bg-input)]">
              <Image
                src="/favicon.ico"
                alt="PawSpace"
                width={20}
                height={20}
                className="h-5 w-5 object-contain"
              />
            </div>
            <p className="text-[16px] font-black leading-none tracking-[-0.02em] text-[var(--text-primary)] [font-family:Georgia,serif]">
              PawSpace
            </p>
          </Link>

          <nav className="hidden items-center justify-center gap-8 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(event) => handleAnchorClick(event, item.href)}
                className="text-center text-[11px] font-black uppercase tracking-[0.22em] text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center justify-end lg:flex">
            <Link
              href="/login"
              className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] transition-all duration-200 hover:border-[var(--border-visible)] hover:text-[var(--text-primary)]"
            >
              Entrar
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--bg-elevated)] lg:hidden"
            aria-label="Alternar menu"
          >
            {isOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>

        {isOpen && (
          <div className="border-t border-[var(--border-subtle)] py-4 lg:hidden">
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(event) => handleAnchorClick(event, item.href)}
                  className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]"
                >
                  Entrar
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
