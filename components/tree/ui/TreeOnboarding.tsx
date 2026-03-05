'use client';
import { useState } from 'react';
import { X, MousePointer2, Plus, Edit3, Save, Eye, Move, Info } from 'lucide-react';

const steps = [
  {
    icon: <Plus size={13} />,
    title: 'Início do Nexus',
    desc: "Use o botão central 'Iniciar Protocolo' para criar o seu nó raiz.",
  },
  {
    icon: <MousePointer2 size={13} />,
    title: 'Expandir Árvore',
    desc: "Botão direito em um nó > 'Expandir Nexus' para ramificar seus conhecimentos.",
  },
  {
    icon: <Edit3 size={13} />,
    title: 'Customização',
    desc: "Botão direito > 'Configurar Protocolo' para alterar ícones, cores e forma do nó.",
  },
  {
    icon: <Move size={13} />,
    title: 'Navegação',
    desc: 'Arraste nós para organizar. Scroll para zoom, arraste o fundo para mover a câmera.',
  },
  {
    icon: <Eye size={13} />,
    title: 'Painel de Detalhes',
    desc: 'Clique esquerdo em um nó para abrir o painel de descrição e status.',
  },
  {
    icon: <Save size={13} />,
    title: 'Sincronização',
    desc: "O botão 'Salvar Alterações' aparece na base apenas quando há mudanças pendentes.",
  },
];

const polySmall = `polygon(
  6px 0,
  calc(100% - 6px) 0,
  100% 6px,
  100% calc(100% - 8px),
  calc(100% - 6px) 100%,
  calc(50% + 8px) 100%,
  50% calc(100% - 6px),
  calc(50% - 8px) 100%,
  6px 100%,
  0 calc(100% - 8px),
  0 6px
)`;

export function TreeOnboarding() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-24 right-6 z-[60] flex flex-col items-end gap-2">

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border transition-all duration-300 backdrop-blur-md cursor-pointer
          ${isOpen
            ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/10 text-[#2dd4bf]'
            : 'border-white/[0.06] bg-[#06090f]/80 text-zinc-500 hover:text-[#2dd4bf] hover:border-[#2dd4bf]/30'
          }`}
      >
        <Info size={13} />
        <span className="text-[9px] font-black uppercase tracking-[0.25em]">Guia de Comandos</span>
      </button>

      {isOpen && (
        <div
          className="w-72 p-[1.5px] animate-in fade-in zoom-in-95 duration-200 origin-top-right"
          style={{ clipPath: polySmall, backgroundColor: '#2dd4bf22' }}
        >
          <div style={{ clipPath: polySmall, backgroundColor: '#000' }}>
            <div
              className="relative overflow-hidden"
              style={{ clipPath: polySmall, backgroundColor: '#080808' }}
            >
              <div
                className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                }}
              />

              <div className="relative z-10 p-5">

                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-5 bg-[#2dd4bf]" />
                    <div>
                      <p className="text-[8px] text-zinc-600 uppercase font-black tracking-[0.3em] mb-0.5">
                        Documentação
                      </p>
                      <h3 className="text-[#2dd4bf] text-[11px] font-black uppercase tracking-[0.3em]">
                        Manual Nexus
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 flex items-center justify-center border border-white/10 text-zinc-600 hover:text-zinc-300 hover:border-white/20 transition-all duration-300 text-xs cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(45,212,191,0.2) transparent' }}>
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start group">
                      <div
                        className="shrink-0 p-1.5 border border-white/[0.06] bg-white/[0.02] text-[#2dd4bf]/60 group-hover:text-[#2dd4bf] group-hover:border-[#2dd4bf]/20 transition-all duration-300"
                      >
                        {step.icon}
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-[#2dd4bf] uppercase tracking-[0.2em] mb-1">
                          {step.title}
                        </h4>
                        <p className="text-[10px] text-zinc-300 font-normal leading-relaxed tracking-wide">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-5 pt-3 border-t border-white/[0.04] flex justify-between items-center"
                >
                  <span className="text-[8px] text-zinc-700 uppercase tracking-widest font-mono">
                    Protocol
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] text-emerald-400 uppercase tracking-widest font-mono">Online</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}