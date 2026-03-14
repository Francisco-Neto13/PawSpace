import LoginForm from './features/auth/LoginForm';
import AuthBackLink from './ui/AuthBackLink';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-base)]">
      <AuthBackLink href="/" label="Voltar ao Site" />

      <main className="relative z-10 flex min-h-screen items-center justify-center py-8 sm:py-10">
        <div className="w-full max-w-md px-6">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
