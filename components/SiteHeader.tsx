import Link from "next/link";

const nav = [
  { href: "#about", label: "このサイトについて" },
  { href: "#features", label: "特徴" },
  { href: "#cta", label: "はじめる" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-rose-100 bg-[#fffafd]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[12px] px-2 text-lg font-bold tracking-wide text-rose-600 transition-colors hover:text-rose-700 sm:text-xl"
        >
          Geek
        </Link>
        <nav
          aria-label="メイン"
          className="flex items-center gap-1 text-sm font-medium tracking-wide sm:gap-3 sm:text-base"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-[10px] px-2 py-2 text-rose-700 transition-colors hover:bg-rose-100/80 hover:text-rose-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 sm:px-3"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
