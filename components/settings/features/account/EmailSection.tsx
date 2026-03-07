'use client';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

export default function EmailSection() {
  const [email, setEmail] = useState('francisco@email.com');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
        Email
      </p>
      <p className="text-[9px] text-zinc-500 mb-6 ml-3">endereço de email da conta</p>

      <div className="space-y-4">
        <div>
          <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block mb-2">
            Email Atual
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-[11px] font-bold tracking-wide outline-none focus:border-white/20 transition-colors placeholder:text-zinc-700"
            placeholder="seu@email.com"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[8px] text-zinc-700 uppercase tracking-wider font-bold">
            Um link de confirmação será enviado para o novo email.
          </p>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 border text-[9px] font-black uppercase tracking-wider transition-all duration-200"
            style={{
              borderColor: saved ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              color: saved ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
              backgroundColor: saved ? 'rgba(255,255,255,0.06)' : 'transparent',
            }}
          >
            {saved ? <Check size={10} /> : null}
            {saved ? 'Enviado' : 'Atualizar'}
          </button>
        </div>
      </div>
    </div>
  );
}