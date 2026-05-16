import Link from "next/link";

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rose-100 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 text-left text-sm text-rose-800/80 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <HeartIcon className="h-4 w-4 shrink-0 text-rose-400" />
          <p>
            <Link
              href="/"
              className="font-semibold text-rose-600 underline-offset-4 hover:underline"
            >
              Geek
            </Link>
            <span className="ml-1">ふわっとした体験を目指しています。</span>
          </p>
        </div>
        <p className="text-xs text-rose-700/70 sm:text-sm">
          © {new Date().getFullYear()} Geek
        </p>
      </div>
    </footer>
  );
}
