import { Suspense } from 'react';
import ResetPasswordPage from '@/components/login/pages/ResetPasswordPage';

export default function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPage />
    </Suspense>
  );
}
