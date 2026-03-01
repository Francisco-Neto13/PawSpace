'use client';
import { useEffect, useRef } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const navRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => {
      const nav = navRef.current?.offsetHeight ?? 0;
      const footer = footerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty('--navbar-height', `${nav}px`);
      document.documentElement.style.setProperty('--footer-height', `${footer}px`);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Navbar ref={navRef} />
      <main className="relative flex-1 w-full overflow-y-auto">
        {children}
      </main>
      <Footer ref={footerRef} />
    </div>
  );
}