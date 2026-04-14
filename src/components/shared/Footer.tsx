'use client';

import React, { forwardRef } from 'react';
import { Github } from 'lucide-react';

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={ref}
      className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-strong)] transition-colors duration-300"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 xl:max-w-7xl xl:px-10 2xl:max-w-[1600px] 2xl:px-16">
        <div className="grid gap-5 text-center md:grid-cols-3 md:items-center md:text-left">
          <div className="button-label flex items-center justify-center text-[var(--text-muted)] md:justify-start">
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
          <div className="ui-label whitespace-normal md:text-center">
            <span className="text-[var(--text-secondary)]">© {currentYear} • </span>
            <span className="text-[var(--text-primary)]">PawSpace</span>
          </div>
          <div className="flex items-center justify-center gap-6 md:justify-end">
            <a
              href="https://github.com/Francisco-Neto13/PawSpace"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors transition-transform duration-300 hover:scale-110"
            >
              <Github size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
export default Footer;
