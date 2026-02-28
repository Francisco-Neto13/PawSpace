import type { Metadata } from "next";
import { Rajdhani, Share_Tech_Mono } from "next/font/google"; 
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from '@/components/shared/Footer'; 
import { NexusProvider } from "@/contexts/NexusContext";

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
  title: "Skill Tree",
  description: "Master your path in the digital void",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body 
        className={`
          ${futuristicSans.variable} 
          ${futuristicMono.variable} 
          bg-[#030304] 
          min-h-screen
          font-sans 
          antialiased
          text-white
          font-medium
        `}
      >
        <NexusProvider>
          <div className="flex flex-col min-h-screen w-full">
            
            <Navbar /> 
            
            <main className="relative flex-1 w-full">
              {children}
            </main>
            
            <Footer /> 
            
          </div>
        </NexusProvider>
      </body>
    </html>
  );
}