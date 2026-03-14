'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/shared/supabase/client';

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Validando acesso...');
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
        setMessage('Confirmando link de redefinicao...');
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
        setMessage('Trocando codigo por sessao...');
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          await finish('/login');
          return;
        }

        await finish(isRecoveryFlow ? '/reset-password' : next);
        return;
      }

      if (accessToken && refreshToken) {
        setMessage('Restaurando sessao segura...');
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          await finish('/login');
          return;
        }

        await finish(isRecoveryFlow ? '/reset-password' : next);
        return;
      }

      setMessage('Aguardando autenticacao...');
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!session) return;
        if (event === 'PASSWORD_RECOVERY' || isRecoveryFlow) {
          void finish('/reset-password');
          return;
        }
        void finish(next);
      });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        subscription.unsubscribe();
        await finish(isRecoveryFlow ? '/reset-password' : next);
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
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-strong)] p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
        <div className="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-[var(--border-subtle)] border-t-[var(--text-primary)] animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
          {message}
        </p>
      </div>
    </div>
  );
}
