'use client';
import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const tabs = [
    { id: 'resumo', label: 'Resumo' },
    { id: 'skilltree', label: 'Skill Tree' },
    { id: 'configuracoes', label: 'Configurações' }
  ];
  
  return (
    <nav className="w-full h-16 border-b border-[#c8b89a]/20 bg-[#030304] z-[60] shrink-0">
      <div className="mx-auto max-w-7xl h-full flex items-center justify-between px-8">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#c8b89a]/30 bg-[#c8b89a]/10 flex items-center justify-center">
            <span className="text-[#c8b89a] text-sm font-bold">U1</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-[#f0ede6] font-bold leading-none">Operator Nexus</span>
            <span className="text-[10px] text-[#c8b89a]/50 font-medium mt-1 uppercase tracking-wider">Admin Level 04</span>
          </div>
        </div>

        <div className="hidden md:flex h-full items-center gap-2">
          {tabs.map((tab) => {
            const isActive = tab.label === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.label)} 
                className={`px-5 h-10 text-[11px] uppercase tracking-widest font-bold transition-all duration-200 rounded-md
                ${isActive 
                  ? 'text-black bg-[#c8b89a]' 
                  : 'text-[#c8b89a]/60 hover:text-[#c8b89a] hover:bg-white/5'}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-[#c8b89a]/50 uppercase font-bold tracking-tighter leading-none">Knowledge Points</span>
            <span className="text-sm font-bold text-[#c8b89a] mt-0.5">
              1,450 <span className="text-[10px] font-normal opacity-60">SP</span>
            </span>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <button className="text-[10px] font-bold text-[#ff4444]/70 hover:text-[#ff4444] uppercase tracking-widest transition-colors">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}