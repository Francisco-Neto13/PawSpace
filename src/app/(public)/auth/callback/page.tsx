import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthCallbackPage from '@/components/login/pages/AuthCallbackPage';

export const metadata: Metadata = {
  title: 'Autenticando',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthCallback() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackPage />
    </Suspense>
  );
}
