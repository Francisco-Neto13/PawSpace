'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

const FULLSCREEN_ROUTES = ['/tree'];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_ROUTES.some(route => pathname.startsWith(route));

  useEffect(() => {
    const update = () => {
      const nav = navRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty('--navbar-height', `${nav}px`);
      document.documentElement.style.setProperty('--footer-height', '0px');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar ref={navRef} />
      <main className="relative flex-1 w-full">
        {isFullscreen ? (
          children
        ) : (
          <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 xl:px-10 2xl:px-16 h-full">
            {children}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}