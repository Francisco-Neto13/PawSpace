'use client';

import React, { forwardRef } from 'react';
import { Github, Instagram, Linkedin } from 'lucide-react';

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={ref}
      className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-strong)] backdrop-blur-md transition-colors duration-300"
    >
      <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 xl:px-10 2xl:px-16 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 relative">
          <div className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] flex items-center order-2 md:order-1">
            Dev by
            <a
              href="https://github.com/Francisco-Neto13"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-primary)] ml-2 hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              Francisco
            </a>
          </div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] order-1 md:order-2 md:absolute md:left-1/2 md:-translate-x-1/2 whitespace-nowrap">
            <span className="text-[var(--text-secondary)]">© {currentYear} • </span>
            <span className="text-[var(--text-primary)]">PawSpace</span>
          </div>
          <div className="flex items-center gap-6 order-3">
            <a
              href="https://github.com/Francisco-Neto13"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors transition-transform duration-300 hover:scale-110"
            >
              <Github size={18} />
            </a>
            <a
              href="https://www.instagram.com/cisscoo_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors transition-transform duration-300 hover:scale-110"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://www.linkedin.com/in/jfrancisco-neto/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors transition-transform duration-300 hover:scale-110"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
export default Footer;
