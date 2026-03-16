'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/shared/supabase/client';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success'>('loading');
  const [message, setMessage] = useState('Criando conta...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    let isActive = true;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    async function finish(destination: string) {
      if (!isActive) return;
      router.replace(destination);
      router.refresh();
    }

    function finishSignupSuccess() {
      if (!isActive) return;
      setStatus('success');
      setMessage('Conta criada com sucesso. Pode fechar esta página.');
    }

    async function handleCallback() {
      const next = searchParams.get('next') || '/overview';
      const type = searchParams.get('type');
      const code = searchParams.get('code');
      const tokenHash = searchParams.get('token_hash');
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const hashType = hashParams.get('type');
      const isRecoveryFlow =
        next === '/reset-password' ||
        type === 'recovery' ||
        hashType === 'recovery';

      if (tokenHash && type === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({
          type: 'recovery',
          token_hash: tokenHash,
        });

        if (error) {
          await finish('/login');
          return;
        }

        await finish('/reset-password');
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          await finish('/login');
          return;
        }

        if (isRecoveryFlow) {
          await finish('/reset-password');
          return;
        }

        finishSignupSuccess();
        return;
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          await finish('/login');
          return;
        }

        if (isRecoveryFlow) {
          await finish('/reset-password');
          return;
        }

        finishSignupSuccess();
        return;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!session) return;
        if (event === 'PASSWORD_RECOVERY' || isRecoveryFlow) {
          void finish('/reset-password');
          return;
        }
        finishSignupSuccess();
      });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        subscription.unsubscribe();
        if (isRecoveryFlow) {
          await finish('/reset-password');
          return;
        }

        finishSignupSuccess();
        return;
      }

      fallbackTimer = setTimeout(() => {
        subscription.unsubscribe();
        if (!isActive) return;
        void finish('/login');
      }, 3500);
    }

    void handleCallback();

    return () => {
      isActive = false;
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [router, searchParams, supabase]);

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--bg-base)] px-6 text-center">
      {status === 'loading' ? (
        <>
          <div className="w-8 h-8 border-2 border-[var(--border-visible)] border-t-[var(--text-primary)] rounded-full animate-spin" />
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] animate-pulse">
            {message}
          </p>
        </>
      ) : (
        <>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)]">
            {message}
          </p>
        </>
      )}
    </div>
  );
}
