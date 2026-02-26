'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

const SkillTree = dynamic(
  () => import('@/components/tree/SkillTree').then(m => m.SkillTree),
  { 
    ssr: false,
    loading: () => <div className="flex-1 w-full bg-[#030304]" /> 
  }
);

export default function Home() {
  const [activeTab, setActiveTab] = useState('Skill Tree');

  return (
    <div className="flex flex-col h-full w-full bg-[#030304]">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="relative flex-1 w-full overflow-hidden">
        
        {activeTab === 'Resumo' && (
          <div className="flex items-center justify-center h-full text-[#c8b89a]/50 uppercase tracking-widest font-bold">
            [ Painel de Resumo em Desenvolvimento ]
          </div>
        )}

        {activeTab === 'Skill Tree' && (
          <SkillTree />
        )}

        {activeTab === 'Configurações' && (
          <div className="flex items-center justify-center h-full text-[#c8b89a]/50 uppercase tracking-widest font-bold">
            [ Configurações de Sistema em Desenvolvimento ]
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}