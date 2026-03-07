'use client';
import { useState, useRef } from 'react';
import { Camera, Check } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

export default function ProfileSection() {
  const [username, setUsername] = useState('Francisco Neto');
  const [saved, setSaved] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
        Perfil
      </p>
      <p className="text-[9px] text-zinc-500 mb-6 ml-3">nome de usuário e foto</p>

      <div className="flex items-start gap-6">
        <div className="shrink-0">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative w-16 h-16 rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden group transition-all duration-200 hover:border-white/20"
          >
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl">🐱</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={14} className="text-white" />
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-[7px] text-zinc-700 uppercase tracking-wider font-bold text-center mt-1.5">
            Foto
          </p>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block mb-2">
              Nome de Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-[11px] font-bold tracking-wide outline-none focus:border-white/20 transition-colors placeholder:text-zinc-700"
              placeholder="Seu nome"
            />
          </div>

          <div className="flex justify-end">
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
              {saved ? 'Salvo' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}