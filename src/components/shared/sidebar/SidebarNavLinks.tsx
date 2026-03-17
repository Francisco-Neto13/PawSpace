'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { MouseEvent } from 'react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

type NavLink = {
  name: string;
  href: string;
  iconSrc: string;
};

interface SidebarNavLinksProps {
  collapsed: boolean;
  pathname: string;
  theme: string;
  links: readonly NavLink[];
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => Promise<void>;
  router: AppRouterInstance;
}

function SidebarNavLinksComponent({
  collapsed,
  pathname,
  theme,
  links,
  onNavigate,
  router,
}: SidebarNavLinksProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            prefetch={false}
            onClick={(event) => void onNavigate(event, link.href)}
            onMouseEnter={() => router.prefetch(link.href)}
            onFocus={() => router.prefetch(link.href)}
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

              {!collapsed && <span className="ui-label">{link.name}</span>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export const SidebarNavLinks = memo(SidebarNavLinksComponent);
