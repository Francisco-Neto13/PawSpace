'use client';
import { useState } from 'react';
import { createClient } from '@/shared/supabase/client';
import { useRouter } from 'next/navigation';
import { PawIcon } from '@/components/shared/PawIcon';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Acesso negado: credenciais invalidas.');
      setLoading(false);
    } else {
      router.push('/overview');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-6 relative overflow-hidden text-[var(--text-primary)]">
      <div className="theme-grid-overlay absolute inset-0" />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
        <PawIcon className="absolute bottom-4 right-4 w-10 h-10 text-[var(--text-primary)] opacity-[0.04] pointer-events-none" />

        <div className="mb-8 text-center">
          <h2 className="text-[var(--text-primary)] text-[10px] font-black uppercase tracking-[0.5em] mb-2">System Access</h2>
          <div className="flex items-center justify-center gap-2">
            <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
            <h1 className="text-[var(--text-primary)] text-2xl font-black uppercase tracking-tighter">Pawspace Login</h1>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-widest ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-muted)] p-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--border-visible)] transition-colors rounded-xl"
              placeholder="admin@nexus.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-widest ml-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-muted)] p-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--border-visible)] transition-colors rounded-xl"
              placeholder="********"
              required
            />
          </div>

          {error && (
            <p className="text-[var(--text-secondary)] text-[10px] uppercase font-bold animate-pulse text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--text-primary)] text-[var(--bg-base)] font-black uppercase text-xs p-4 mt-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Iniciar sincronizacao'}
          </button>
        </form>

        <p className="mt-8 text-center text-[var(--text-muted)] text-[10px] uppercase tracking-widest">
          v1.0.5 // Restricted Area
        </p>
      </div>
    </div>
  );
}
