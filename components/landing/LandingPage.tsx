'use client';

import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { ProductSection } from './ProductSection';
import { WorkflowSection } from './WorkflowSection';
import { FeatureSection } from './FeatureSection';
import { FinalCtaSection } from './FinalCtaSection';

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-base)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_62%)]" />
        <div className="absolute left-[-8%] top-[10%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent_72%)] blur-2xl" />
        <div className="absolute right-[-10%] top-[26%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.04),transparent_72%)] blur-3xl" />
      </div>

      <LandingNavbar />

      <main className="relative z-10 pt-[84px] md:pt-[92px]">
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
