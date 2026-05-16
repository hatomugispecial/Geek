/**
 * Vercel / Neon 連携では `DATABASE_URL` 以外のキーだけが注入されることがある。
 * 店舗用の raw SQL（neon）と Better Auth（Drizzle）で同じ解決順を使う。
 */
const CANDIDATE_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "NEON_DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
] as const;

export function resolveDatabaseUrlFromEnv(): string | undefined {
  for (const key of CANDIDATE_KEYS) {
    const v = process.env[key]?.trim();
    if (v) return v;
  }
  return undefined;
}
