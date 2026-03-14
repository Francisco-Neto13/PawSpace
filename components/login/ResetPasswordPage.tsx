import ResetPasswordForm from './features/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-base)]">
      <main className="relative z-10 flex min-h-screen items-center justify-center py-8 sm:py-10">
        <div className="w-full max-w-md px-6">
          <ResetPasswordForm />
        </div>
      </main>
    </div>
  );
}
