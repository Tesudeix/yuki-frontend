import type { Metadata } from "next";

import "./globals.css";
import SiteHeader from "@/app/components/SiteHeader";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import { Providers } from "./providers";

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
    <html lang="mn">
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
