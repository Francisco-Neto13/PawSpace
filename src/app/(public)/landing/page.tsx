import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'Landing',
  description:
    'Conheça o PawSpace, uma plataforma para estruturar trilhas de estudo, materiais e progresso.',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LandingRoute() {
  return <LandingPage />;
}
