import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalCommandPalette } from "./home/components/GlobalCommandPalette";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VoiceMate — Voice-First AI Inventory Application",
  description: "Run your inventory by simply talking. VoiceMate turns everyday speech into verified inventory actions — without the forms, spreadsheets, and manual entry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)]">
        {children}
        <GlobalCommandPalette />
      </body>
    </html>
  );
}
