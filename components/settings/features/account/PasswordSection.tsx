'use client';
import { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

function PasswordInput({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••'}
          className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-4 py-2.5 pr-10 text-white text-[11px] font-bold tracking-wide outline-none focus:border-white/20 transition-colors placeholder:text-zinc-700"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          {show ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      </div>
    </div>
  );
}

export default function PasswordSection() {
  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [confirm, setConfirm]   = useState('');
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    if (!current) return setError('Digite a senha atual.');
    if (next.length < 8) return setError('A nova senha deve ter ao menos 8 caracteres.');
    if (next !== confirm) return setError('As senhas não coincidem.');
    setSaved(true);
    setCurrent(''); setNext(''); setConfirm('');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
        Senha
      </p>
      <p className="text-[9px] text-zinc-500 mb-6 ml-3">alterar senha de acesso</p>

      <div className="space-y-4">
        <PasswordInput label="Senha Atual"    value={current} onChange={setCurrent} />
        <PasswordInput label="Nova Senha"     value={next}    onChange={setNext} />
        <PasswordInput label="Confirmar Nova Senha" value={confirm} onChange={setConfirm} />

        <div className="flex items-center justify-between pt-1">
          <div>
            {error && (
              <p className="text-[8px] text-red-400/80 uppercase tracking-wider font-bold">{error}</p>
            )}
            {saved && (
              <p className="text-[8px] text-white/50 uppercase tracking-wider font-bold">Senha atualizada.</p>
            )}
          </div>
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
            {saved ? 'Salvo' : 'Alterar Senha'}
          </button>
        </div>
      </div>
    </div>
  );
}