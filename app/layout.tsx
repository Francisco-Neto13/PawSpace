import type { Metadata } from "next";
import "./globals.css";
import { NexusProvider } from "@/shared/contexts/NexusContext";
import { LibraryProvider } from "@/shared/contexts/LibraryContext";
import { JournalProvider } from "@/shared/contexts/JournalContext";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Pawspace",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`
          font-sans
          antialiased
          bg-[#0a0a0a]
          min-h-screen
          text-white
          font-medium
        `}
      >
        <NexusProvider>
          <LibraryProvider>
            <JournalProvider>
              <ClientLayout>{children}</ClientLayout>
            </JournalProvider>
          </LibraryProvider>
        </NexusProvider>
      </body>
    </html>
  );
}

