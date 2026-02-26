'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { name: "Resumo", href: "/dashboard/overview" },
    { name: "Skill Tree", href: "/dashboard/tree" },
    { name: "Biblioteca", href: "/dashboard/library" },
    { name: "Configurações", href: "/dashboard/settings" },
  ];

  return (
    <nav className="w-full border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-[100] transition-all duration-300">
      <div className="px-4 md:px-16 lg:px-24 py-4 flex justify-between items-center sm:grid sm:grid-cols-3">
        
        <div className="justify-self-start">
          <Link href="/dashboard/overview" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-full border border-[#c8b89a]/30 bg-[#c8b89a]/10 flex items-center justify-center transition-colors group-hover:border-[#c8b89a]/60">
              <span className="text-[#c8b89a] text-sm font-black">F</span>
            </div>
            <span className="text-zinc-200 text-[11px] font-black uppercase tracking-[0.2em] group-hover:text-[#c8b89a] transition-colors">
              Francisco
            </span>
          </Link>
        </div>

        <div className="hidden md:flex justify-self-center items-center gap-6 lg:gap-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] transition-colors group py-1 ${
                  isActive ? 'text-[#c8b89a]' : 'text-zinc-400 hover:text-[#c8b89a]'
                }`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-[#c8b89a] transition-all duration-300 shadow-[0_0_10px_rgba(200,184,154,0.5)] ${
                  isActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-end justify-self-end gap-4">
          <button className="hidden sm:block px-5 py-2 border border-white/10 bg-white/5 text-zinc-400 hover:bg-red-600 hover:border-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-500 cursor-pointer">
            Logout
          </button>

          <button
            className="md:hidden text-zinc-400 hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black border-b border-white/5 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-6 gap-6">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-[#c8b89a]"
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px w-full bg-white/5" />
            <button className="text-red-400 text-left text-[11px] font-black uppercase tracking-widest">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}