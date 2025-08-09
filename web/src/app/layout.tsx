import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BetBeastWalletProvider } from "@/components/WalletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BetBeast - Monster Combat FOMO Pools on Solana",
  description: "Battle fierce beasts in the dark forest. High-risk FOMO pools with massive jackpots. The ultimate Web3 betting arena.",
  keywords: "Solana, Game, NFT, Jackpot, Combat, Blockchain, Crypto",
  authors: [{ name: "BetBeast Team" }],
  icons: {
    icon: '/forest-icon.svg',
    shortcut: '/forest-icon.svg',
    apple: '/forest-icon.svg',
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
        <BetBeastWalletProvider>
          {children}
        </BetBeastWalletProvider>
      </body>
    </html>
  );
}
