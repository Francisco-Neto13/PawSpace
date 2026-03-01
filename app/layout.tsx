import type { Metadata } from "next";
import "./globals.css";
import { NexusProvider } from "@/contexts/NexusContext";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Skill Tree",
  description: "Master your path in the digital void",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`
          font-sans
          antialiased
          bg-[#030304]
          min-h-screen
          text-white
          font-medium
        `}
      >
        <NexusProvider>
          <ClientLayout>{children}</ClientLayout>
        </NexusProvider>
      </body>
    </html>
  );
}