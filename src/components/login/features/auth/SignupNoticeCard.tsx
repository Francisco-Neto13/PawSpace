'use client';

interface SignupNoticeCardProps {
  email: string;
  onChangeEmail: () => void;
  onGoToLogin: () => void;
}

export function SignupNoticeCard({
  email,
  onChangeEmail,
  onGoToLogin,
}: SignupNoticeCardProps) {
  return (
    <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
      <p className="mb-2 text-[9px] font-black uppercase tracking-[0.34em] text-[var(--text-secondary)]">
        Conta iniciada
      </p>
      <h2 className="mb-3 text-xl font-black tracking-tight text-[var(--text-primary)]">
        Verifique seu e-mail
      </h2>
      <p className="mb-6 text-[11px] leading-6 text-[var(--text-secondary)]">
        Se o e-mail estiver disponível, enviamos um link de confirmação para{' '}
        <span className="text-[var(--text-primary)]">{email}</span>.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onChangeEmail}
          className="flex-1 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] transition-all hover:border-[var(--border-visible)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
        >
          Alterar e-mail
        </button>
        <button
          type="button"
          onClick={onGoToLogin}
          className="flex-1 rounded-2xl bg-[var(--text-primary)] py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bg-base)] transition-all hover:opacity-90"
        >
          Ir para login
        </button>
      </div>
    </div>
  );
}
