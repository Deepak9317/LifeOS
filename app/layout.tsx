import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import { Providers } from "@/components/providers";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "LifeOS",
  description: "Production-ready personal productivity dashboard built with Next.js and Supabase.",
  icons: {
    icon: "/lifeos-browser-icon.png",
    shortcut: "/lifeos-browser-icon.png",
    apple: "/lifeos-browser-icon.png"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${manrope.variable} ${spaceGrotesk.variable}`} lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
