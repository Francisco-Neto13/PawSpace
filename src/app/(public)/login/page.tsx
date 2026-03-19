import type { Metadata } from 'next';
import LoginPage from '@/components/login/pages/LoginPage';

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesse sua conta no PawSpace.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Login() {
  return <LoginPage />;
}
