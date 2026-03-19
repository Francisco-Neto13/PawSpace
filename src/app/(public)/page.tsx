import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'Hub Visual de Estudos',
  description:
    'Mapeie trilhas de estudo, organize materiais, registre sessões e acompanhe progresso em um único espaço.',
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return <LandingPage />;
}
