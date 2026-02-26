import type { Metadata } from "next";
import { Rajdhani, Share_Tech_Mono } from "next/font/google"; 
import "./globals.css";

const futuristicSans = Rajdhani({
  variable: "--font-futuristic",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const futuristicMono = Share_Tech_Mono({
  variable: "--font-futuristic-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "RPG Skill Tree | Nexus Protocol",
  description: "Master your path in the digital void",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body 
        className={`
          ${futuristicSans.variable} 
          ${futuristicMono.variable} 
          bg-[#030304] 
          h-full w-full 
          overflow-hidden 
          font-sans 
          antialiased
        `}
      >

        <div className="flex flex-col h-full w-full">
          {children}
        </div>
      </body>
    </html>
  );
}