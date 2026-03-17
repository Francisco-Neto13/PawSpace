export type AuthMode = 'login' | 'signup';

export function mapAuthError(message: string) {
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

export function mapSignUpError(message: string) {
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

export function getPasswordStrength(password: string) {
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
