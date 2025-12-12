import type { Metadata } from "next";
import { Noto_Sans_TC, Mountains_of_Christmas, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const mountainsOfChristmas = Mountains_of_Christmas({
  variable: "--font-mountains",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Gift Exchange | 交換禮物平台",
  description: "A modern, cozy Secret Santa platform for friends.",
};
import Snow from "@/components/Snow";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={cn(
          notoSansTC.variable,
          mountainsOfChristmas.variable,
          outfit.variable,
          "antialiased bg-background text-foreground font-sans min-h-screen"
        )}
      >
        <Snow />
        <Navbar />
        <main className="relative z-10 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
