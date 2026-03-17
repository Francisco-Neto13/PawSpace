'use client';
import { useState } from 'react';
import { X, MousePointer2, Plus, Edit3, Save, Move, Info } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

const steps = [
  {
    icon: <Plus size={13} />,
    title: 'Primeira Trilha',
    desc: "Use o botão central 'Iniciar Árvore' para abrir o tronco do seu mapa.",
  },
  {
    icon: <MousePointer2 size={13} />,
    title: 'Seleção',
    desc: 'Clique esquerdo em uma trilha para destacar conexões e abrir o resumo lateral.',
  },
  {
    icon: <MousePointer2 size={13} />,
    title: 'Menu da Trilha',
    desc: "Botão direito em uma trilha para criar subtrilhas, editar detalhes e remover o que não serve mais.",
  },
  {
    icon: <Edit3 size={13} />,
    title: 'Personalização',
    desc: "Use 'Editar trilha' para ajustar nome, ícone, cor e a identidade desse ponto do mapa.",
  },
  {
    icon: <Move size={13} />,
    title: 'Navegação',
    desc: 'Arraste as trilhas para organizar o território. Scroll faz zoom e o fundo move a câmera.',
  },
  {
    icon: <Save size={13} />,
    title: 'Salvar Pegadas',
    desc: "O botão 'Salvar alterações' aparece na base quando o mapa tem mudanças pendentes.",
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
    : `fixed right-3 top-20 z-[60] flex ${directionClass} items-end gap-2 sm:right-6 sm:top-24`;

  return (
    <div className={containerClassName}>
      <button
        onClick={() => setIsOpen((value) => !value)}
        className={`h-11 w-11 sm:h-10 sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-0 sm:px-3 rounded-xl border transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'border-[var(--border-visible)] bg-[var(--bg-base)] text-[var(--text-primary)]'
            : 'border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)]'
        }`}
      >
        <Info size={13} />
        <span className="hidden sm:inline button-label">Guia da Árvore</span>
      </button>

      {isOpen && (
        <div
          className={`relative flex w-[min(15.5rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] animate-in fade-in zoom-in-95 duration-200 shadow-2xl sm:w-72 ${
            direction === 'up' ? 'origin-bottom-right' : 'origin-top-right'
          }`}
          style={panelMaxHeight ? { maxHeight: panelMaxHeight, height: panelMaxHeight } : undefined}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
          <div className="relative z-10 p-5 flex flex-col min-h-0 h-full">
            <PawIcon className="absolute bottom-4 right-4 w-10 h-10 text-[var(--text-primary)] opacity-[0.04] pointer-events-none" />

            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <p className="library-kicker mb-1">Guia rápido</p>
                <div className="flex items-center gap-2">
                  <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
                  <h3 className="surface-title text-[1rem]">Manual PawSpace</h3>
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
                    <h4 className="ui-label text-[var(--text-primary)] mb-1">{step.title}</h4>
                    <p className="ui-copy tracking-wide">{step.desc}</p>
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
