import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AureliusWalletProvider } from "@/components/WalletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aurelius Colosseum - Monster Combat Jackpot on Solana",
  description: "Fight monsters, crack the vault, claim the SOL jackpot. The ultimate blockchain arena game.",
  keywords: "Solana, Game, NFT, Jackpot, Combat, Blockchain, Crypto",
  authors: [{ name: "Aurelius Colosseum Team" }],
  icons: {
    icon: [
      { url: '/colosseum-icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/colosseum-icon.svg',
    apple: '/colosseum-icon.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white overflow-hidden`}
      >
        <AureliusWalletProvider>
          {children}
        </AureliusWalletProvider>
      </body>
    </html>
  );
}
