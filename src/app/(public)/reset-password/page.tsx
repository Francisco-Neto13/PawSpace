import type { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPasswordPage from '@/components/login/pages/ResetPasswordPage';

export const metadata: Metadata = {
  title: 'Redefinir senha',
  description: 'Redefina sua senha de acesso no PawSpace.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPage />
    </Suspense>
  );
}
