'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DangerZone() {
  const [confirm, setConfirm] = useState('');
  const [open, setOpen] = useState(false);

  const CONFIRM_WORD = 'DELETAR';
  const canDelete = confirm === CONFIRM_WORD;

  const handleDelete = () => {
    if (!canDelete) return;
    console.log('Deletar conta...');
  };

  return (
    <section className="library-panel p-6 relative overflow-hidden border-red-500/20 bg-red-500/[0.04]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

      <p className="library-kicker mb-1 flex items-center gap-2 text-red-400/90">
        <AlertTriangle className="w-3 h-3 shrink-0" />
        Zona de Perigo
      </p>
      <p className="library-subtitle mb-5 ml-3">acoes permanentes e irreversiveis</p>

      <div className="border border-red-500/[0.16] rounded-xl bg-[var(--bg-elevated)] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] text-[var(--text-primary)] font-bold uppercase tracking-wider mb-1">Deletar Conta</p>
            <p className="text-[9px] text-[var(--text-muted)] leading-relaxed max-w-sm">
              Todos os seus dados serao removidos: arvore, diario, biblioteca e configuracoes. Esta acao nao pode ser desfeita.
            </p>
          </div>
          <button
            onClick={() => setOpen((value) => !value)}
            className="h-9 shrink-0 flex items-center gap-1.5 px-3 rounded-xl border border-red-500/20 text-[9px] font-black uppercase tracking-wider text-red-400/65 hover:text-red-400/90 hover:border-red-500/40 transition-all duration-200"
          >
            <Trash2 size={10} />
            Deletar
          </button>
        </div>

        {open && (
          <div className="mt-4 pt-4 border-t border-red-500/[0.12]" style={{ animation: 'slideDown 0.2s ease-out' }}>
            <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider font-bold mb-3">
              Digite <span className="text-red-400/80 font-black">{CONFIRM_WORD}</span> para confirmar
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder={CONFIRM_WORD}
                className="flex-1 h-10 bg-[var(--bg-input)] border border-red-500/[0.18] rounded-xl px-3 text-[var(--text-primary)] text-[11px] font-bold tracking-widest outline-none focus:border-red-500/40 transition-colors placeholder:text-[var(--text-faint)] uppercase"
              />
              <button
                onClick={handleDelete}
                disabled={!canDelete}
                className="h-10 px-4 rounded-xl border flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-all duration-200"
                style={{
                  borderColor: canDelete ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.1)',
                  color: canDelete ? 'rgba(239,68,68,0.9)' : 'rgba(239,68,68,0.3)',
                  backgroundColor: canDelete ? 'rgba(239,68,68,0.08)' : 'transparent',
                  cursor: canDelete ? 'pointer' : 'not-allowed',
                }}
              >
                <Trash2 size={10} />
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
