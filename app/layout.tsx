import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_JP } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OSAKI ダイニング | オーダーシステム",
  description:
    "株式会社 OSAKI ダイニング（架空）向けの客注文・店舗コンソールのデモ環境です。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geist.variable} ${notoSansJp.variable} h-full`}
    >
      <body
        className={`${notoSansJp.className} min-h-dvh overflow-x-hidden bg-background font-sans text-foreground antialiased`}
      >
        <TooltipProvider delay={200}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
