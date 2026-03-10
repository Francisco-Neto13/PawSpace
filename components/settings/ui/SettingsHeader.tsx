'use client';

import type { SettingsSection } from '../SettingsPage';

const SECTION_META: Record<
  SettingsSection,
  { label: string; title: string; description: string }
> = {
  account: {
    label: 'Conta',
    title: 'Identidade e Credenciais',
    description: 'Atualize perfil, email e senha da sua conta.',
  },
  appearance: {
    label: 'Aparencia',
    title: 'Tema da Interface',
    description: 'Escolha o modo visual que melhor se adapta ao seu fluxo.',
  },
  data: {
    label: 'Dados',
    title: 'Uso e Exportacao',
    description: 'Acompanhe limites e exporte seus dados quando precisar.',
  },
  privacy: {
    label: 'Privacidade',
    title: 'Sessoes Ativas',
    description: 'Gerencie os dispositivos com acesso a sua conta.',
  },
  danger: {
    label: 'Zona de Perigo',
    title: 'Acoes Irreversiveis',
    description: 'Controle operacoes permanentes com confirmacao explicita.',
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
      <p className="library-kicker mb-2">Configuracoes / {meta.label}</p>
      <h1 className="overview-title text-2xl md:text-3xl mb-2">{meta.title}</h1>
      <p className="library-subtitle max-w-2xl">{meta.description}</p>
    </section>
  );
}
