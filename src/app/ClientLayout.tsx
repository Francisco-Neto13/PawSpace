'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const SIDEBAR_ROUTES = ['/overview', '/tree', '/library', '/journal', '/achievements', '/settings'];
const FULL_BLEED_ROUTES = ['/login', '/reset-password', '/auth/callback'];
const MARKETING_ROUTES = ['/', '/landing'];

const AppSidebar = dynamic(() => import('@/components/shared/AppSidebar'), {
  loading: () => (
    <aside
      className="hidden lg:flex h-screen sticky top-0 z-[95] w-[280px] shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-strong)]"
      aria-hidden="true"
    />
  ),
});

const Footer = dynamic(() => import('@/components/shared/Footer'), {
  loading: () => <div className="w-full h-[73px]" aria-hidden="true" />,
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasSidebarLayout = SIDEBAR_ROUTES.some(route => pathname.startsWith(route));
  const hasFullBleedLayout = FULL_BLEED_ROUTES.some(route => pathname.startsWith(route));
  const hasMarketingLayout = MARKETING_ROUTES.includes(pathname);

  useEffect(() => {
    const update = () => {
      const nav = 0;
      document.documentElement.style.setProperty('--navbar-height', `${nav}px`);
      document.documentElement.style.setProperty('--footer-height', '0px');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (hasSidebarLayout) {
    return (
      <div className="min-h-screen w-full">
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="relative flex-1 min-w-0 pt-16 sm:pt-[4.5rem] lg:pt-0">
            {children}
          </main>
        </div>
      </div>
    );
  }

  if (hasFullBleedLayout) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  if (hasMarketingLayout) {
    return (
      <div className="flex flex-col min-h-screen w-full">
        <main className="relative flex-1 w-full">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="relative flex-1 w-full">
        <div className="mx-auto h-full max-w-6xl px-4 sm:px-6 xl:max-w-7xl xl:px-10 2xl:max-w-[1600px] 2xl:px-16">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
