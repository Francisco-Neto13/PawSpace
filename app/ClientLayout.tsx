'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/shared/Footer';
import AppSidebar from '@/components/shared/AppSidebar';

const SIDEBAR_ROUTES = ['/overview', '/tree', '/library', '/journal', '/achievements', '/settings'];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasSidebarLayout = SIDEBAR_ROUTES.some(route => pathname.startsWith(route));

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
          <main className="relative flex-1 min-w-0 pt-14 lg:pt-0">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="relative flex-1 w-full">
        <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 xl:px-10 2xl:px-16 h-full">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
