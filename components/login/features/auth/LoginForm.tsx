'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole, Mail, User } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import { createClient } from '@/shared/supabase/client';
import RecoveryModal from '@/components/login/features/auth/RecoveryModal';
import { LIMITS } from '@/lib/limits';

type AuthMode = 'login' | 'signup';

const NAME_MAX_LENGTH = LIMITS.auth.displayName;
const EMAIL_MAX_LENGTH = LIMITS.auth.email;
const PASSWORD_MAX_LENGTH = LIMITS.auth.password;

function mapAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('email not confirmed')) {
    return 'Esse usuário ainda não confirmou o e-mail.';
  }

  if (normalized.includes('invalid login credentials')) {
    return 'Email ou senha inválidos.';
  }

  if (normalized.includes('invalid email or password')) {
    return 'Email ou senha inválidos.';
  }

  if (normalized.includes('signup is disabled')) {
    return 'O cadastro por e-mail está desativado neste projeto.';
  }

  return `Falha no login: ${message}`;
}

function mapSignUpError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('user already registered')) {
    return 'Já existe uma conta com esse e-mail.';
  }

  if (normalized.includes('password should be at least')) {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }

  if (normalized.includes('invalid email')) {
    return 'Digite um e-mail válido.';
  }

  if (normalized.includes('unable to validate email')) {
    return 'Digite um e-mail válido.';
  }

  if (normalized.includes('signup is disabled')) {
    return 'O cadastro por e-mail está desativado neste projeto.';
  }

  if (normalized.includes('rate limit')) {
    return 'O Supabase bloqueou temporariamente novos e-mails de confirmação. Tente novamente mais tarde.';
  }

  return `Falha ao criar conta: ${message}`;
}

function getPasswordStrength(password: string) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password) && /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const score = checks.filter(Boolean).length;

  if (score <= 1) {
    return {
      label: 'Senha fraca',
      widthClass: 'w-1/4',
      toneClass: 'bg-rose-400',
      textClass: 'text-rose-300',
    };
  }

  if (score === 2) {
    return {
      label: 'Senha média',
      widthClass: 'w-2/4',
      toneClass: 'bg-amber-300',
      textClass: 'text-amber-200',
    };
  }

  if (score === 3) {
    return {
      label: 'Senha boa',
      widthClass: 'w-3/4',
      toneClass: 'bg-lime-300',
      textClass: 'text-lime-200',
    };
  }

  return {
    label: 'Senha forte',
    widthClass: 'w-full',
    toneClass: 'bg-emerald-300',
    textClass: 'text-emerald-200',
  };
}

function RemainingWarning({ current, max }: { current: number; max: number }) {
  const remaining = max - current;
  if (current === 0 || remaining > 10) return null;

  return (
    <span className="text-[9px] font-bold text-[var(--text-muted)]">
      {remaining}
    </span>
  );
}

export default function LoginForm() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupNoticeEmail, setSignupNoticeEmail] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const isSignup = mode === 'signup';
  const passwordStrength = getPasswordStrength(password);
  const fieldClassName =
    'w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3.5 pl-11 pr-4 text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-faint)] focus:border-[var(--border-visible)] focus:bg-[var(--bg-elevated)] focus:ring-2 focus:ring-white/10';

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
    setSignupNoticeEmail(null);
    setShowPasswordStrength(false);
  }

  useEffect(() => {
    if (!isSignup || !password) {
      setShowPasswordStrength(false);
      return;
    }

    setShowPasswordStrength(true);
    const timer = window.setTimeout(() => {
      setShowPasswordStrength(false);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isSignup, password]);

  useEffect(() => {
    let isActive = true;

    const syncIfSessionExists = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isActive || !session) return;

      router.replace('/overview');
      router.refresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncIfSessionExists();
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive || !session) return;
      router.replace('/overview');
      router.refresh();
    });

    window.addEventListener('focus', syncIfSessionExists);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    void syncIfSessionExists();

    return () => {
      isActive = false;
      subscription.unsubscribe();
      window.removeEventListener('focus', syncIfSessionExists);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router, supabase]);

  async function handleLogin() {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(mapAuthError(signInError.message));
      return;
    }

    router.replace('/overview');
    router.refresh();
  }

  async function handleSignUp() {
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres.');
      return;
    }

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=%2Foverview`,
        data: {
          display_name: trimmedName,
          name: trimmedName,
        },
      },
    });

    if (signUpError) {
      setError(mapSignUpError(signUpError.message));
      return;
    }

    if (data.session) {
      router.replace('/overview');
      router.refresh();
      return;
    }

    setSignupNoticeEmail(email.toLowerCase());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignup) {
        await handleSignUp();
      } else {
        await handleLogin();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="relative z-10 w-full">
        <div className="mb-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-visible)] bg-[var(--bg-elevated)]">
            <PawIcon className="h-5 w-5 text-[var(--text-primary)]" />
          </div>

          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.34em] text-[var(--text-secondary)]">
            Entrada na toca
          </p>

          <h1 className="overview-title mb-2 text-2xl sm:text-[2rem]">
            {isSignup ? 'Criar conta no PawSpace' : 'Entrar no PawSpace'}
          </h1>

          <p className="max-w-sm text-[11px] leading-6 text-[var(--text-secondary)]">
            {isSignup
              ? 'Crie sua conta com e-mail e senha para montar sua árvore, sua estante e o diário do PawSpace.'
              : 'Entre para continuar cuidando das trilhas, materiais e pegadas do seu PawSpace.'}
          </p>
        </div>

        {signupNoticeEmail ? (
          <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.34em] text-[var(--text-secondary)]">
              Conta iniciada
            </p>
            <h2 className="mb-3 text-xl font-black tracking-tight text-[var(--text-primary)]">
              Verifique seu e-mail
            </h2>
            <p className="mb-6 text-[11px] leading-6 text-[var(--text-secondary)]">
              Se o e-mail estiver disponível, enviamos um link de confirmação para{' '}
              <span className="text-[var(--text-primary)]">{signupNoticeEmail}</span>.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSignupNoticeEmail(null);
                  setError(null);
                }}
                className="flex-1 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] transition-all hover:border-[var(--border-visible)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              >
                Alterar e-mail
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignupNoticeEmail(null);
                  setError(null);
                  setMode('login');
                }}
                className="flex-1 rounded-2xl bg-[var(--text-primary)] py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bg-base)] transition-all hover:opacity-90"
              >
                Ir para login
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {isSignup && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="ml-1 block text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
                    Nome
                  </label>
                  <RemainingWarning current={name.length} max={NAME_MAX_LENGTH} />
                </div>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={NAME_MAX_LENGTH}
                    placeholder="Como você quer aparecer"
                    className={fieldClassName}
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setError(null);
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="ml-1 block text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
                  Endereço de e-mail
                </label>
                <RemainingWarning current={email.length} max={EMAIL_MAX_LENGTH} />
              </div>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={EMAIL_MAX_LENGTH}
                  placeholder="Digite seu e-mail"
                  className={fieldClassName}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError(null);
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="ml-1 block text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
                  Senha
                </label>
                {!isSignup ? (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="cursor-pointer text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    Esqueci a senha
                  </button>
                ) : (
                  <RemainingWarning current={password.length} max={PASSWORD_MAX_LENGTH} />
                )}
              </div>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                  maxLength={PASSWORD_MAX_LENGTH}
                  placeholder={isSignup ? 'Crie uma senha' : 'Digite sua senha'}
                  className={`${fieldClassName} pr-28`}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{showPassword ? 'Ocultar' : 'Exibir'}</span>
                </button>
              </div>

              {isSignup && showPasswordStrength && password.length > 0 && (
                <div className="mt-3">
                  <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.widthClass} ${passwordStrength.toneClass}`} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${passwordStrength.textClass}`}>
                      {passwordStrength.label}
                    </p>
                    <p className="text-[9px] text-[var(--text-muted)]">Use letras, número e símbolo</p>
                  </div>
                </div>
              )}
            </div>

            {isSignup && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="ml-1 block text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
                    Confirmar senha
                  </label>
                  <RemainingWarning current={confirmPassword.length} max={PASSWORD_MAX_LENGTH} />
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    maxLength={PASSWORD_MAX_LENGTH}
                    placeholder="Repita sua senha"
                    className={fieldClassName}
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setError(null);
                    }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-[#4e2331] bg-[#1b1017] px-4 py-3 text-[10px] font-bold text-[#ffb4c4]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-[var(--text-primary)] py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--bg-base)] shadow-[0_10px_30px_rgba(255,255,255,0.08)] transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Processando...' : isSignup ? 'Criar conta' : 'Entrar'}
            </button>
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-[var(--text-secondary)]">
          <span>{isSignup ? 'Já tem uma conta?' : 'Primeira vez aqui?'}</span>
          <button
            type="button"
            onClick={() => switchMode(isSignup ? 'login' : 'signup')}
            className="font-black uppercase tracking-[0.16em] text-[var(--text-primary)]"
          >
            {isSignup ? 'Entrar' : 'Criar conta'}
          </button>
        </div>

        <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-4 text-center text-[9px] font-black uppercase tracking-[0.22em] text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-primary)] opacity-80 animate-pulse" />
            Sessão Segura
          </div>
          <span className="text-[var(--text-faint)]">|</span>
          <span>Protegido por SSL</span>
        </div>
      </div>

      {isModalOpen && <RecoveryModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
