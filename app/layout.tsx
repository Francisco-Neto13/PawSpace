import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SvgDefs } from "@/components/tree/SkillNode";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RPG Skill Tree",
  description: "Master your path",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#030304] text-[#ededed] overflow-hidden`}
      >
        <SvgDefs />

        <main className="relative z-10 w-screen h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}