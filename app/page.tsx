import Link from "next/link";
import { SparkleIcon } from "@/components/SparkleIcon";

function BlobDecor({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="currentColor"
        fillOpacity="0.35"
        d="M44.7 29.3C62 12 88.4 8 112 15.8c23.7 7.7 44.5 27.4 52.8 51.2 8.2 23.8 3.8 51.3-10.5 71.4-14.3 20-38.4 32.6-63.2 35.4-24.8 2.8-50.3-4.3-68.8-20.4C3.8 137.3-4.5 111.6 3.6 88 11.8 64.5 27.4 46.6 44.7 29.3Z"
      />
    </svg>
  );
}

const features = [
  {
    title: "やさしい進め方",
    body: "画面も言葉も、角を少し丸めて。急がず、一緒に形にしていくイメージです。",
    accent: "text-fuchsia-500",
    border: "border-fuchsia-100",
  },
  {
    title: "見える化",
    body: "迷子になりにくいよう、いまの位置と次の一歩が伝わる構成を意識しています。",
    accent: "text-violet-500",
    border: "border-violet-100",
  },
  {
    title: "あそび心",
    body: "ちょっとした装飾や余白で、作っている側も見ている側もほっとできる空気感を。",
    accent: "text-rose-500",
    border: "border-rose-100",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section
        className="relative isolate flex min-h-[80svh] flex-col justify-center overflow-hidden bg-gradient-to-b from-fuchsia-50 via-rose-50 to-[#fffafd] px-4 pb-16 pt-8 sm:px-6"
        aria-labelledby="hero-heading"
      >
        <BlobDecor className="pointer-events-none absolute -right-16 top-10 h-56 w-56 text-fuchsia-200 sm:right-4 sm:h-72 sm:w-72" />
        <BlobDecor className="pointer-events-none absolute -left-20 bottom-8 h-48 w-48 -rotate-12 text-violet-200 sm:left-0 sm:h-64 sm:w-64" />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 text-left">
          <p className="text-sm font-medium tracking-wide text-rose-600/90 sm:text-base">
            小さなアイデアから、ちゃんとした形へ
          </p>
          <div className="max-w-2xl space-y-5">
            <h1
              id="hero-heading"
              className="text-balance text-3xl font-bold leading-tight tracking-wide text-rose-900 sm:text-4xl md:text-5xl"
            >
              ふわっと始まる、
              <br className="sm:hidden" />
              ちゃんと続くプロジェクト
            </h1>
            <p className="max-w-prose text-base leading-relaxed text-rose-800/85 sm:text-lg">
              Geek は、システムとデザインのあいだをなでるようにつなぐための場所です。難しい言葉は少なめに、やることははっきりと。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="#cta"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[14px] bg-rose-500 px-6 text-base font-semibold text-white transition-colors hover:bg-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            >
              <SparkleIcon className="h-5 w-5 shrink-0 fill-current" />
              はじめの一歩を見る
            </Link>
            <Link
              href="#about"
              className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] border-2 border-violet-200 bg-violet-100 px-6 text-base font-semibold text-violet-900 transition-colors hover:bg-violet-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
            >
              ストーリーを読む
            </Link>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-20 border-y border-rose-100 bg-white px-4 py-16 sm:px-6"
        aria-labelledby="about-heading"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            id="about-heading"
            className="text-2xl font-bold tracking-wide text-rose-900 sm:text-3xl"
          >
            このサイトについて
          </h2>
          <div className="mt-8 max-w-prose space-y-4 text-left text-base leading-relaxed text-rose-900/85 sm:text-lg">
            <p>
              リポジトリ内の設計メモ（Direction）に沿って、これからの仕組みや画面を少しずつ育てていく予定です。いまは入り口だけでも、色と余白で気持ちよく立ち上がれるように整えました。
            </p>
            <p>
              カタチはこれから変わっても、トーンは「やさしさ」と「ちゃんとさ」のバランスを大切にします。
            </p>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-20 px-4 py-16 sm:px-6"
        aria-labelledby="features-heading"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            id="features-heading"
            className="text-2xl font-bold tracking-wide text-rose-900 sm:text-3xl"
          >
            大切にしていること
          </h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {features.map((item) => (
              <li
                key={item.title}
                className={`flex flex-col rounded-none border-2 ${item.border} bg-white p-5 sm:p-6`}
              >
                <h3
                  className={`text-lg font-bold tracking-wide ${item.accent} sm:text-xl`}
                >
                  {item.title}
                </h3>
                <p className="mt-3 text-left text-sm leading-relaxed text-rose-900/80 sm:text-base">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="cta"
        className="scroll-mt-20 px-4 pb-20 pt-4 sm:px-6"
        aria-labelledby="cta-heading"
      >
        <div className="mx-auto max-w-5xl">
          <div className="border-2 border-rose-100 bg-gradient-to-r from-rose-50 to-fuchsia-50 p-8 sm:p-10">
            <h2
              id="cta-heading"
              className="text-xl font-bold tracking-wide text-rose-900 sm:text-2xl"
            >
              一緒に、次の画面を描きませんか
            </h2>
            <p className="mt-4 max-w-prose text-left text-base leading-relaxed text-rose-900/85">
              まずは雑談レベルでも大丈夫です。やりたいことや困りごとを、短いメモでも共有してみてください。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="mailto:hello@example.com"
                className="inline-flex min-h-[48px] min-w-[44px] items-center justify-center gap-2 rounded-[14px] bg-rose-500 px-6 text-base font-semibold text-white transition-colors hover:bg-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
              >
                <SparkleIcon className="h-5 w-5 shrink-0 fill-current" />
                メールで連絡する
              </Link>
              <Link
                href="#about"
                className="inline-flex min-h-[48px] min-w-[44px] items-center justify-center rounded-[14px] border-2 border-rose-200 bg-rose-50 px-6 text-base font-semibold text-rose-800 transition-colors hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
              >
                もう一度読む
              </Link>
            </div>
            <p className="mt-4 text-left text-xs text-rose-800/70 sm:text-sm">
              ※ メールアドレスはダミーです。実運用時は差し替えてください。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
