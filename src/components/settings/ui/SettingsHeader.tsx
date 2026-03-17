'use client';

import type { SettingsSection } from '../types';

const SECTION_META: Record<
  SettingsSection,
  { label: string; title: string; description: string }
> = {
  account: {
    label: 'Perfil',
    title: 'Perfil do PawSpace',
    description: 'Ajuste nome, e-mail e senha da sua base de estudos.',
  },
  appearance: {
    label: 'Clima',
    title: 'Clima do PawSpace',
    description: 'Escolha o visual mais confortável para estudar, revisar e circular pelo espaço.',
  },
  data: {
    label: 'Dados',
    title: 'Dados da sua trilha',
    description: 'Veja limites, acompanhe o uso e exporte uma cópia do seu espaço quando quiser.',
  },
  privacy: {
    label: 'Acesso',
    title: 'Pegadas de acesso',
    description: 'Gerencie os dispositivos com acesso à sua conta e feche sessões antigas com calma.',
  },
  danger: {
    label: 'Zona de risco',
    title: 'Ações permanentes',
    description: 'Revise com cuidado qualquer mudança irreversível antes de confirmar.',
  },
};

interface SettingsHeaderProps {
  active: SettingsSection;
}

export default function SettingsHeader({ active }: SettingsHeaderProps) {
  const meta = SECTION_META[active];

  return (
    <section className="library-panel library-panel-hover p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
      <p className="library-kicker mb-2">Ajustes / {meta.label}</p>
      <h1 className="page-display max-w-4xl mb-3">{meta.title}</h1>
      <p className="page-summary">{meta.description}</p>
    </section>
  );
}
