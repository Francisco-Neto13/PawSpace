'use client';

import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { ProductSection } from './ProductSection';
import { WorkflowSection } from './WorkflowSection';
import { FeatureSection } from './FeatureSection';
import { FinalCtaSection } from './FinalCtaSection';

export function LandingPage() {
  return (
    <div className="relative min-h-svh overflow-x-hidden bg-[var(--bg-base)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_62%)] sm:h-[520px] lg:h-[620px]" />
        <div className="absolute left-[-24%] top-[8%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent_72%)] blur-2xl sm:left-[-8%] sm:h-80 sm:w-80" />
        <div className="absolute right-[-24%] top-[22%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.04),transparent_72%)] blur-3xl sm:right-[-10%] sm:top-[26%] sm:h-[28rem] sm:w-[28rem]" />
      </div>

      <LandingNavbar />

      <main className="relative z-10 pt-[72px] sm:pt-[78px] md:pt-[88px]">
        <HeroSection />
        <div className="border-t border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.008))]">
          <ProductSection />
        </div>
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <WorkflowSection />
        </div>
        <div className="border-t border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.016),rgba(255,255,255,0.006))]">
          <FeatureSection />
        </div>
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <FinalCtaSection />
        </div>
      </main>
    </div>
  );
}
