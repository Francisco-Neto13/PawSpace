'use client';
import { useState } from 'react';
import { createClient } from '@/shared/supabase/client'; 
import { useRouter } from 'next/navigation';

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
      setError('Acesso negado: Credenciais inválidas.');
      setLoading(false);
    } else {
      router.push('/overview');
      router.refresh(); 
    }
  };

  return (
    <div className="min-h-screen bg-[#06090f] flex items-center justify-center p-6 relative overflow-hidden text-zinc-200">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#2dd4bf05_1px,transparent_1px),linear-gradient(to_bottom,#2dd4bf05_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <h2 className="text-[#2dd4bf] text-[10px] font-black uppercase tracking-[0.5em] mb-2">System Access</h2>
          <h1 className="text-white text-2xl font-black uppercase tracking-tighter">Nexus <span className="text-[#2dd4bf]">Login</span></h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest ml-1">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 text-white text-sm focus:outline-none focus:border-[#2dd4bf]/50 transition-colors rounded-sm"
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
              className="w-full bg-white/5 border border-white/10 p-3 text-white text-sm focus:outline-none focus:border-[#2dd4bf]/50 transition-colors rounded-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-[10px] uppercase font-bold animate-pulse text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2dd4bf] text-black font-black uppercase text-xs p-4 mt-4 hover:bg-[#d9cbb2] transition-colors disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Iniciar Sincronização'}
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-600 text-[10px] uppercase tracking-widest">
          v1.0.5 // Restricted Area
        </p>
      </div>
    </div>
  );
}
