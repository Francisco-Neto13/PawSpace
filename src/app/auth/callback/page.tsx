import { Suspense } from 'react';
import AuthCallbackPage from '@/components/login/pages/AuthCallbackPage';

export default function AuthCallback() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackPage />
    </Suspense>
  );
}
