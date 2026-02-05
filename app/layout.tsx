import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import SiteHeader from "@/app/components/SiteHeader";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import SiteFooter from "@/app/components/SiteFooter";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI Clan • Feed",
  description: "Minimal social feed with auth on Antaqor backend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" className={spaceGrotesk.variable}>
      <body className="min-h-screen font-sans text-neutral-100 antialiased">
        <Providers>
          <SiteHeader />
          <div className="pb-[calc(84px+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
          <SiteFooter />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
