'use client';
import { useState } from 'react';
import { X, MousePointer2, Plus, Edit3, Save, Eye, Move, Info } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

const steps = [
  {
    icon: <Plus size={13} />,
    title: 'Início do Pawspace',
    desc: "Use o botão central 'Iniciar Árvore' para criar o seu nó raiz.",
  },
  {
    icon: <MousePointer2 size={13} />,
    title: 'Adicionar Submódulo',
    desc: "Botão direito em um nó > 'Adicionar Submódulo' para ramificar seus conhecimentos.",
  },
  {
    icon: <Edit3 size={13} />,
    title: 'Customização',
    desc: "Botão direito > 'Configurar Módulo' para alterar ícones, cores e forma do nó.",
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
            ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
            : 'border-[var(--border-subtle)] bg-[var(--bg-strong)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)]'
          }`}
      >
        <Info size={13} />
        <span className="text-[9px] font-black uppercase tracking-[0.25em]">Guia de Comandos</span>
      </button>

      {isOpen && (
        <div
          className="w-72 p-[1.5px] animate-in fade-in zoom-in-95 duration-200 origin-top-right"
          style={{ clipPath: polySmall, backgroundColor: 'var(--border-visible)' }}
        >
          <div style={{ clipPath: polySmall, backgroundColor: 'var(--bg-base)' }}>
            <div
              className="relative overflow-hidden"
              style={{ clipPath: polySmall, backgroundColor: 'var(--bg-strong)' }}
            >
              <div
                className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, var(--grid-line) 2px, var(--grid-line) 4px)',
                }}
              />

              <div className="relative z-10 p-5">
                <PawIcon className="absolute bottom-4 right-4 w-10 h-10 text-[var(--text-primary)] opacity-[0.04] pointer-events-none" />

                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-5 bg-[var(--text-primary)]" />
                    <div>
                      <p className="text-[8px] text-[var(--text-secondary)] uppercase font-black tracking-[0.3em] mb-0.5">
                        Documentação
                      </p>
                      <div className="flex items-center gap-2">
                        <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
                        <h3 className="text-[var(--text-primary)] text-[11px] font-black uppercase tracking-[0.3em]">
                          Manual Pawspace
                        </h3>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 flex items-center justify-center border border-[var(--border-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-all duration-300 text-xs cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-visible) transparent' }}>
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start group">
                      <div
                        className="shrink-0 p-1.5 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:border-[var(--border-visible)] transition-all duration-300"
                      >
                        {step.icon}
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-1">
                          {step.title}
                        </h4>
                        <p className="text-[10px] text-[var(--text-secondary)] font-normal leading-relaxed tracking-wide">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex justify-between items-center"
                >
                  <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest font-mono">
                    Pawspace
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)] animate-pulse" />
                    <span className="text-[8px] text-[var(--text-primary)] uppercase tracking-widest font-mono">Online</span>
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
