'use client';
import React, { forwardRef } from 'react';
import { usePathname } from 'next/navigation';
import { Github, Instagram } from 'lucide-react';

const HIDDEN_PATHS = ['/journal', '/library', '/tree', '/achievements'];

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null;

  return (
    <footer
      ref={ref}
      className="w-full border-t border-white/5 bg-black/60 backdrop-blur-xl transition-all duration-300"
    >
      <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 xl:px-10 2xl:px-16 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 relative">
          <div className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center order-2 md:order-1">
            Dev by
            <a
              href="https://github.com/Francisco-Neto13"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c8b89a] ml-2 hover:text-white transition-colors cursor-pointer"
            >
              Francisco
            </a>
          </div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] order-1 md:order-2 md:absolute md:left-1/2 md:-translate-x-1/2 whitespace-nowrap">
            <span className="text-white">© {currentYear} • </span>
            <span className="text-[#c8b89a]">Francisco Neto</span>
          </div>
          <div className="flex items-center gap-6 order-3">
            <a
              href="https://github.com/Francisco-Neto13"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#c8b89a] transition-all duration-300 hover:scale-110"
            >
              <Github size={18} />
            </a>
            <a
              href="https://www.instagram.com/cisscoo_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#c8b89a] transition-all duration-300 hover:scale-110"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://discord.com/users/iyasuo_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#5865F2] transition-all duration-300 hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6,.48,80.21h0A105.73,105.73,0,0,0,32.47,96.36,77.7,77.7,0,0,0,39.2,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.73,11.1,105.32,105.32,0,0,0,32.05-16.14h0C129.58,52.84,121.21,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.07,65.69,84.69,65.69Z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
export default Footer;