import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/shared/contexts/ThemeContext";
import { AuthTransitionProvider } from "@/shared/contexts/AuthTransitionContext";

const siteUrl = 'https://pawspace-alpha.vercel.app';
const defaultDescription =
  'Organize trilhas de estudo, materiais, notas e progresso em um workspace visual conectado.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PawSpace",
    template: "%s | PawSpace",
  },
  description: defaultDescription,
  applicationName: "PawSpace",
  keywords: [
    "pawspace",
    "organização de estudos",
    "planejamento de estudos",
    "árvore de estudos",
    "study planner",
    "learning tracker",
    "study notes",
    "study dashboard",
  ],
  authors: [{ name: "Francisco Neto" }],
  creator: "Francisco Neto",
  publisher: "Francisco Neto",
  category: "education",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "PawSpace",
    title: "PawSpace",
    description: defaultDescription,
    images: [
      {
        url: "/landing/modelos.webp",
        width: 1568,
        height: 768,
        alt: "Preview da plataforma PawSpace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PawSpace",
    description: defaultDescription,
    images: ["/landing/modelos.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased bg-[var(--bg-base)] min-h-screen text-[var(--text-primary)] font-medium">
        <ThemeProvider>
          <AuthTransitionProvider>
            {children}
          </AuthTransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
