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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden text-zinc-200">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <PawIcon className="absolute bottom-4 right-4 w-10 h-10 text-white opacity-[0.04] pointer-events-none" />

        <div className="mb-8 text-center">
          <h2 className="text-white text-[10px] font-black uppercase tracking-[0.5em] mb-2">System Access</h2>
          <div className="flex items-center justify-center gap-2">
            <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
            <h1 className="text-white text-2xl font-black uppercase tracking-tighter">Pawspace Login</h1>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.1] p-3 text-white text-sm focus:outline-none focus:border-white/40 transition-colors rounded-xl"
              placeholder="admin@nexus.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest ml-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.1] p-3 text-white text-sm focus:outline-none focus:border-white/40 transition-colors rounded-xl"
              placeholder="********"
              required
            />
          </div>

          {error && (
            <p className="text-white/70 text-[10px] uppercase font-bold animate-pulse text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-black uppercase text-xs p-4 mt-4 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Iniciar sincronizacao'}
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-600 text-[10px] uppercase tracking-widest">
          v1.0.5 // Restricted Area
        </p>
      </div>
    </div>
  );
}
