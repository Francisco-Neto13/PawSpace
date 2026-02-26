"use client";
import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[#c8b89a]/20 bg-[#030304] shrink-0">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 items-center px-8 py-6 gap-6 md:gap-0">
        
        <div className="text-[#c8b89a]/50 text-xs font-medium tracking-wide text-center md:text-left">
          Desenvolvido por 
          <span className="text-[#c8b89a] ml-1.5 hover:text-white transition-colors cursor-default font-semibold tracking-wider">
            Francisco
          </span>
        </div>

        <div className="text-[#c8b89a]/40 text-[11px] uppercase tracking-[0.4em] font-bold text-center">
          © {currentYear} • Francisco Neto
        </div>

        <div className="flex items-center gap-6 justify-self-center md:justify-self-end">
          <a href="https://github.com/Francisco-Neto13" target="_blank" rel="noopener noreferrer" className="text-[#c8b89a]/50 hover:text-white transition-all hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          </a>
          <a href="https://www.instagram.com/cisscoo_" target="_blank" rel="noopener noreferrer" className="text-[#c8b89a]/50 hover:text-white transition-all hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="https://discord.com/users/iyasuo_" target="_blank" rel="noopener noreferrer" className="text-[#c8b89a]/50 hover:text-[#5865F2] transition-all hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6,.48,80.21h0A105.73,105.73,0,0,0,32.47,96.36,77.7,77.7,0,0,0,39.2,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.73,11.1,105.32,105.32,0,0,0,32.05-16.14h0C129.58,52.84,121.21,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.07,65.69,84.69,65.69Z"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}