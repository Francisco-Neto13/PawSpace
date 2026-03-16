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
import AppearanceSection from './features/appearance/AppearanceSection';
import SettingsNav from './ui/SettingsNav';
import SettingsHeader from './ui/SettingsHeader';

export type SettingsSection = 'account' | 'appearance' | 'data' | 'privacy' | 'danger';

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsSection>('account');

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <PageBackground src="/cat6.webp" />

      <main className="relative z-10 py-8 pb-20">
        <div className="relative max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 xl:px-10 2xl:px-16 space-y-5">
          <div className="flex items-center gap-3 reveal-fade delay-0">
            <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
            <span className="text-[var(--text-primary)] text-[9px] font-black uppercase tracking-[0.4em]">
              PawSpace / Ajustes
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--shimmer-via)] to-transparent" />
          </div>

          <div className="reveal-up delay-100">
            <SettingsHeader active={active} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-4 items-start reveal-up delay-200">
            <div>
              <SettingsNav active={active} onChange={setActive} />
            </div>

            <section key={active} className="space-y-4 reveal-up delay-300">
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
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
