import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Yuki Studio • Салон захиалга",
  description: "Twilio Verify баталгаажуулалттай минимал салон захиалгын систем",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black font-sans text-neutral-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
