import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import "./globals.css";
import SiteHeader from "@/app/components/SiteHeader";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import { Providers } from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Yuki Product Admin",
  description: "Minimal admin dashboard for managing products synced to YukiMobile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" className={spaceGrotesk.variable}>
      <body className="min-h-screen bg-white text-black antialiased">
        <Providers>
          <SiteHeader />
          <div className="pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
