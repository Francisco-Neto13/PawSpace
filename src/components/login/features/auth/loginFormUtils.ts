export type AuthMode = 'login' | 'signup';

export const SIGNUP_PASSWORD_REQUIREMENTS =
  'Use no mínimo 6 caracteres, com letra maiúscula, letra minúscula, número e símbolo.';

export function isEmailRateLimitError(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('rate limit') ||
    normalized.includes('over_email_send_rate_limit') ||
    normalized.includes('email rate limit') ||
    normalized.includes('too many requests')
  );
}

export function getEmailRateLimitMessage() {
  return 'O limite de envios de e-mail do Supabase foi atingido. No serviço padrão, signup, recuperação e troca de e-mail compartilham janelas curtas entre tentativas e um limite horário baixo. Aguarde e tente novamente ou configure SMTP próprio para produção.';
}

export function mapAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('captcha')) {
    return 'Confirme a verificação de segurança e tente novamente.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Esse usuário ainda não confirmou o e-mail.';
  }

  if (normalized.includes('invalid login credentials')) {
    return 'E-mail ou senha inválidos.';
  }

  if (normalized.includes('invalid email or password')) {
    return 'E-mail ou senha inválidos.';
  }

  if (normalized.includes('signup is disabled')) {
    return 'O cadastro por e-mail está desativado neste projeto.';
  }

  return `Falha no login: ${message}`;
}

export function mapSignUpError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('captcha')) {
    return 'Confirme a verificação de segurança e tente novamente.';
  }

  if (normalized.includes('user already registered')) {
    return 'Já existe uma conta com esse e-mail.';
  }

  if (normalized.includes('password should be at least')) {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }

  if (
    normalized.includes('uppercase') ||
    normalized.includes('lowercase') ||
    normalized.includes('number') ||
    normalized.includes('digit') ||
    normalized.includes('symbol') ||
    normalized.includes('special character')
  ) {
    return SIGNUP_PASSWORD_REQUIREMENTS;
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

  if (isEmailRateLimitError(message)) {
    return getEmailRateLimitMessage();
  }

  return `Falha ao criar conta: ${message}`;
}

export function isPasswordAllowedForSignUp(password: string) {
  return (
    password.length >= 6 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
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
