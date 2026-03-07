'use client';
import { User, Palette, Database, Shield, AlertTriangle } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import type { SettingsSection } from '../SettingsPage';

interface Props {
  active: SettingsSection;
  onChange: (section: SettingsSection) => void;
}

const NAV_ITEMS: {
  key: SettingsSection;
  label: string;
  sub: string;
  icon: React.ElementType;
  danger?: boolean;
}[] = [
  { key: 'account',    label: 'Conta',         sub: 'perfil e credenciais',  icon: User },
  { key: 'appearance', label: 'Aparência',      sub: 'tema da interface',     icon: Palette },
  { key: 'data',       label: 'Dados',          sub: 'uso e exportação',      icon: Database },
  { key: 'privacy',    label: 'Privacidade',    sub: 'sessões e acesso',      icon: Shield },
  { key: 'danger',     label: 'Zona de Perigo', sub: 'ações irreversíveis',   icon: AlertTriangle, danger: true },
];

export default function SettingsNav({ active, onChange }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--text-faint)] px-3 pt-2 pb-3 flex items-center gap-2">
        <PawIcon className="w-2.5 h-2.5 shrink-0" />
        Menu
      </p>

      <div className="space-y-0.5">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200"
              style={{ backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent' }}
            >
              <item.icon
                size={13}
                style={{
                  color: isActive
                    ? item.danger ? '#ef4444' : 'var(--text-primary)'
                    : item.danger ? 'rgba(239,68,68,0.4)' : 'var(--text-faint)',
                  transition: 'color 0.2s',
                  flexShrink: 0,
                }}
              />
              <div className="min-w-0">
                <p
                  className="text-[10px] font-black uppercase tracking-wider leading-none mb-0.5"
                  style={{
                    color: isActive
                      ? item.danger ? '#ef4444' : 'var(--text-primary)'
                      : item.danger ? 'rgba(239,68,68,0.5)' : 'var(--text-muted)',
                    transition: 'color 0.2s',
                  }}
                >
                  {item.label}
                </p>
                <p className="text-[8px] text-[var(--text-faint)] uppercase tracking-wider font-bold truncate">
                  {item.sub}
                </p>
              </div>
              {isActive && (
                <div className="ml-auto w-1 h-1 rounded-full bg-[var(--text-secondary)] shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}