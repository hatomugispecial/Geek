import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Geek | やさしいこれからのプロジェクト",
  description:
    "Geek は、やわらかい雰囲気で進める開発・デザインのためのひとときの入り口です。",
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
    <html lang="ja" className={`${notoSansJp.variable} h-full`}>
      <body
        className={`${notoSansJp.className} flex min-h-dvh flex-col overflow-x-hidden bg-[#fffafd] text-rose-950 antialiased`}
      >
        <SiteHeader />
        <main className="flex w-full flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
