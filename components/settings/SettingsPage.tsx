'use client';
import { useState } from 'react';
import { PawIcon } from '@/components/shared/PawIcon';
import { PageBackground } from '@/components/shared/PageBackground';
import ProfileSection from './features/account/ProfileSection';
import EmailSection from './features/account/EmailSection';
import PasswordSection from './features/account/PasswordSection';
import UsageLimits from './features/data/UsageLimits';
import ExportSection from './features/data/ExportSection';
import SessionsSection from './features/privacy/SessionsSection';
import DangerZone from './features/danger/DangerZone';
import SettingsNav from './ui/SettingsNav';
import AppearanceSection from './features/appearance/AppearanceSection';

export type SettingsSection = 'account' | 'appearance' | 'data' | 'privacy' | 'danger';

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsSection>('account');

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <PageBackground src="/cat6.webp" />

      <main className="relative z-10 py-8 pb-20">

        <div className="flex items-center gap-3 mb-8">
          <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
          <span className="text-[var(--text-primary)] text-[9px] font-black uppercase tracking-[0.4em]">
            Pawspace / Configurações
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border-subtle)] to-transparent" />
        </div>

        <div className="mb-8">
          <h1 className="text-[var(--text-primary)] text-2xl font-black uppercase tracking-tighter leading-none mb-1">
            Configurações
          </h1>
          <p className="text-[var(--text-muted)] text-[11px] uppercase tracking-widest font-bold ml-0.5">
            gerencie sua conta e preferências
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SettingsNav active={active} onChange={setActive} />
          </div>

          <div className="lg:col-span-3 space-y-4">
            {active === 'account' && (
              <>
                <ProfileSection />
                <EmailSection />
                <PasswordSection />
              </>
            )}
            {active === 'appearance' && <AppearanceSection />}
            {active === 'data' && (
              <>
                <UsageLimits />
                <ExportSection />
              </>
            )}
            {active === 'privacy' && <SessionsSection />}
            {active === 'danger' && <DangerZone />}
          </div>
        </div>
      </main>
    </div>
  );
}