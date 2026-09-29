import type { Metadata } from "next";
import { Outfit, Poppins } from "next/font/google";

import { DevToolsShell } from "@/components/devtools";

import "./globals.css";

// The QuickMD design system's font families. The variables are set on <html> because
// globals.css reads them from :root to build --font-sans and --font-poppins.
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins-face", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "QuickMD Together",
  description: "A private community for QuickMD patients.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${poppins.variable}`}>
      <body>
        {children}
        <DevToolsShell />
      </body>
    </html>
  );
}
