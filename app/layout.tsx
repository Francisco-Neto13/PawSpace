import type { Metadata } from "next";
import "./globals.css";
import { NexusProvider } from "@/shared/contexts/NexusContext";
import { LibraryProvider } from "@/shared/contexts/LibraryContext";
import { JournalProvider } from "@/shared/contexts/JournalContext";
import { OverviewProvider } from "@/shared/contexts/OverviewContext";
import { ThemeProvider } from "@/shared/contexts/ThemeContext";
import { ConfirmDialogProvider } from "@/shared/contexts/ConfirmDialogContext";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "PawSpace",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased bg-[var(--bg-base)] min-h-screen text-[var(--text-primary)] font-medium">
        <ThemeProvider>
          <NexusProvider>
            <LibraryProvider>
              <JournalProvider>
                <OverviewProvider>
                  <ConfirmDialogProvider>
                    <ClientLayout>{children}</ClientLayout>
                  </ConfirmDialogProvider>
                </OverviewProvider>
              </JournalProvider>
            </LibraryProvider>
          </NexusProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
