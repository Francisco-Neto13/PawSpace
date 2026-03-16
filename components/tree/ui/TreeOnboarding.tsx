'use client';
import { useState } from 'react';
import { X, MousePointer2, Plus, Edit3, Save, Move, Info } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

const steps = [
  {
    icon: <Plus size={13} />,
    title: 'Primeira Trilha',
    desc: "Use o botao central 'Iniciar Arvore' para abrir o tronco do seu mapa.",
  },
  {
    icon: <MousePointer2 size={13} />,
    title: 'Selecao',
    desc: 'Clique esquerdo em uma trilha para destacar conexoes e abrir o resumo lateral.',
  },
  {
    icon: <MousePointer2 size={13} />,
    title: 'Menu da Trilha',
    desc: "Botao direito em uma trilha para criar subtrilhas, editar detalhes e remover o que nao serve mais.",
  },
  {
    icon: <Edit3 size={13} />,
    title: 'Personalizacao',
    desc: "Use 'Editar trilha' para ajustar nome, icone, cor e a identidade desse ponto do mapa.",
  },
  {
    icon: <Move size={13} />,
    title: 'Navegacao',
    desc: 'Arraste as trilhas para organizar o territorio. Scroll faz zoom e o fundo move a camera.',
  },
  {
    icon: <Save size={13} />,
    title: 'Salvar Pegadas',
    desc: "O botao 'Salvar Alteracoes' aparece na base quando o mapa tem mudancas pendentes.",
  },
];

interface TreeOnboardingProps {
  className?: string;
  direction?: 'up' | 'down';
  panelMaxHeight?: string;
}

export function TreeOnboarding({
  className,
  direction = 'down',
  panelMaxHeight,
}: TreeOnboardingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const directionClass = direction === 'up' ? 'flex-col-reverse' : 'flex-col';
  const containerClassName = className
    ? `${className} flex ${directionClass} items-end gap-2`
    : `fixed top-24 right-6 z-[60] flex ${directionClass} items-end gap-2`;

  return (
    <div className={containerClassName}>
      <button
        onClick={() => setIsOpen((value) => !value)}
        className={`h-10 flex items-center gap-2 px-3 rounded-xl border transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'border-[var(--border-visible)] bg-[var(--bg-base)] text-[var(--text-primary)]'
            : 'border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)]'
        }`}
      >
        <Info size={13} />
        <span className="text-[9px] font-black uppercase tracking-[0.25em]">Guia da Arvore</span>
      </button>

      {isOpen && (
        <div
          className={`w-72 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-2xl relative flex flex-col ${
            direction === 'up' ? 'origin-bottom-right' : 'origin-top-right'
          }`}
          style={panelMaxHeight ? { maxHeight: panelMaxHeight, height: panelMaxHeight } : undefined}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
          <div className="relative z-10 p-5 flex flex-col min-h-0 h-full">
            <PawIcon className="absolute bottom-4 right-4 w-10 h-10 text-[var(--text-primary)] opacity-[0.04] pointer-events-none" />

            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <p className="library-kicker mb-1">Guia rapido</p>
                <div className="flex items-center gap-2">
                  <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
                  <h3 className="text-[var(--text-primary)] text-[11px] font-black uppercase tracking-[0.3em]">Manual PawSpace</h3>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-[var(--border-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-all duration-200 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>

            <div className="space-y-4 grow min-h-0 overview-scroll-area pr-1">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-3 items-start group">
                  <div className="shrink-0 w-7 h-7 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:border-[var(--border-visible)] transition-all duration-200 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-1">{step.title}</h4>
                    <p className="text-[10px] text-[var(--text-secondary)] font-normal leading-relaxed tracking-wide">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
