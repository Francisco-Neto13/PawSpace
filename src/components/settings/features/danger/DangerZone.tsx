'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { deleteCurrentAccount } from '@/app/actions/account';
import { createClient } from '@/shared/supabase/client';

export default function DangerZone() {
  const router = useRouter();
  const [confirm, setConfirm] = useState('');
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CONFIRM_WORD = 'DELETAR';
  const canDelete = confirm === CONFIRM_WORD;

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;

    setIsDeleting(true);
    setError(null);

    const result = await deleteCurrentAccount();
    if (!result.success) {
      setError(result.error || 'Não foi possível deletar sua conta agora.');
      setIsDeleting(false);
      return;
    }

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error('[Danger Zone] Falha ao encerrar sessão após exclusão:', signOutError);
    }

    router.replace('/login');
    router.refresh();
  };

  return (
    <section className="library-panel p-6 relative overflow-hidden border-red-500/20 bg-red-500/[0.04]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

      <p className="library-kicker mb-1 flex items-center gap-2 text-red-400/90">
        <AlertTriangle className="w-3 h-3 shrink-0" />
        Zona de Risco
      </p>
      <p className="library-subtitle mb-5 ml-3">ações permanentes que apagam o seu espaço</p>

      <div className="border border-red-500/[0.16] rounded-xl bg-[var(--bg-elevated)] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="sidebar-title mb-1">Deletar Conta</p>
            <p className="ui-copy max-w-sm">
              Todos os seus dados serão removidos: árvore, estante, diário e ajustes. Esta ação não pode ser desfeita.
            </p>
          </div>
          <button
            onClick={() => {
              setOpen((value) => !value);
              setError(null);
            }}
            disabled={isDeleting}
            className="h-9 shrink-0 flex items-center gap-1.5 px-3 rounded-xl border border-red-500/20 button-label text-red-400/65 hover:text-red-400/90 hover:border-red-500/40 transition-all duration-200 disabled:opacity-50"
          >
            <Trash2 size={10} />
            Deletar
          </button>
        </div>

        {open && (
          <div className="mt-4 pt-4 border-t border-red-500/[0.12]" style={{ animation: 'slideDown 0.2s ease-out' }}>
            <p className="field-label mb-3">
              Digite <span className="text-red-400/80 font-black">{CONFIRM_WORD}</span> para confirmar
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={confirm}
                disabled={isDeleting}
                onChange={(event) => setConfirm(event.target.value.toUpperCase())}
                placeholder={CONFIRM_WORD}
                className="flex-1 h-10 bg-[var(--bg-input)] border border-red-500/[0.18] rounded-xl px-3 text-[var(--text-primary)] field-input tracking-[0.12em] outline-none focus:border-red-500/40 transition-colors placeholder:text-[var(--text-faint)] uppercase disabled:opacity-60"
              />
              <button
                onClick={() => void handleDelete()}
                disabled={!canDelete || isDeleting}
                className="h-10 px-4 rounded-xl border flex items-center gap-1.5 button-label transition-all duration-200"
                style={{
                  borderColor: canDelete ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.1)',
                  color: canDelete ? 'rgba(239,68,68,0.9)' : 'rgba(239,68,68,0.3)',
                  backgroundColor: canDelete ? 'rgba(239,68,68,0.08)' : 'transparent',
                  cursor: !canDelete || isDeleting ? 'not-allowed' : 'pointer',
                }}
              >
                {isDeleting ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                {isDeleting ? 'Deletando...' : 'Confirmar'}
              </button>
            </div>

            {error && (
              <p className="mt-3 helper-text text-red-400/90">
                {error}
              </p>
            )}
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
