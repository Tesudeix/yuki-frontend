import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import SiteHeader from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "AI Clan • Feed",
  description: "Minimal social feed with auth on tesudeix backend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#181818] to-[#0A0A0A] font-sans text-neutral-100 antialiased">
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
