'use client';
import { User, Palette, Database, Shield, AlertTriangle } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import type { SettingsSection } from '../types';

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
  { key: 'account', label: 'Perfil', sub: 'nome, e-mail e senha', icon: User },
  { key: 'appearance', label: 'Clima', sub: 'tema do espaço', icon: Palette },
  { key: 'data', label: 'Dados', sub: 'limites e backup', icon: Database },
  { key: 'privacy', label: 'Acesso', sub: 'sessões abertas', icon: Shield },
  { key: 'danger', label: 'Zona de risco', sub: 'ações permanentes', icon: AlertTriangle, danger: true },
];

export default function SettingsNav({ active, onChange }: Props) {
  return (
    <aside className="library-panel self-start relative overflow-hidden p-3 xl:sticky xl:top-[calc(var(--navbar-height)+24px)]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <p className="library-kicker px-2.5 pt-2 pb-3 flex items-center gap-2">
        <PawIcon className="w-2.5 h-2.5 shrink-0" />
        Menu da Toca
      </p>

      <div className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left border transition-all duration-200 ${
                isActive
                  ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)]'
                  : 'border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              <item.icon
                size={13}
                style={{
                  color: item.danger
                    ? isActive
                      ? 'rgba(239,68,68,0.95)'
                      : 'rgba(239,68,68,0.55)'
                    : isActive
                      ? 'var(--text-primary)'
                      : 'var(--text-faint)',
                }}
              />
              <div className="min-w-0">
                <p
                  className="ui-label mb-1"
                  style={{
                    color: item.danger
                      ? isActive
                        ? 'rgba(239,68,68,0.95)'
                        : 'rgba(239,68,68,0.55)'
                      : isActive
                        ? 'var(--text-primary)'
                        : 'var(--text-muted)',
                  }}
                >
                  {item.label}
                </p>
                <p className="ui-meta truncate">{item.sub}</p>
              </div>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] shrink-0" />}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
