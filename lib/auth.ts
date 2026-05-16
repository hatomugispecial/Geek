import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import * as authSchema from "@/lib/db/auth-schema";
import { authDb } from "@/lib/db/drizzle-auth";
import { isRelaxedEnvBuildPhase } from "@/lib/env-build";

const isProd = process.env.NODE_ENV === "production";
const relaxedBuild = isRelaxedEnvBuildPhase();

function resolveBetterAuthSecret(): string {
  const raw = process.env.BETTER_AUTH_SECRET?.trim();
  if (raw) {
    if (raw.length < 32) {
      if (isProd && !relaxedBuild) {
        throw new Error(
          "BETTER_AUTH_SECRET は 32 文字以上のランダム文字列を設定してください。",
        );
      }
      if (isProd && relaxedBuild) {
        return "build-placeholder-secret-32chars-minimum!!";
      }
      console.warn(
        "[auth] BETTER_AUTH_SECRET が 32 文字未満のため、開発用の長いフォールバックに置き換えています（本番では 32 文字以上を必ず設定してください）。",
      );
      return "dev-only-insecure-secret-do-not-use-in-production-32chars";
    }
    return raw;
  }
  if (isProd && !relaxedBuild) {
    throw new Error(
      "BETTER_AUTH_SECRET が未設定です。32 文字以上のランダム文字列を設定してください。",
    );
  }
  if (relaxedBuild) {
    return "build-placeholder-secret-32chars-minimum!!";
  }
  console.warn(
    "[auth] BETTER_AUTH_SECRET 未設定のため開発用フォールバックを使います。`.env.local` に 32 文字以上の値を設定してください。",
  );
  // 開発専用（本番では必ず BETTER_AUTH_SECRET を設定すること）
  return "dev-only-insecure-secret-do-not-use-in-production-32chars";
}

function resolveBetterAuthBaseURL(): string {
  const raw = process.env.BETTER_AUTH_URL?.trim().replace(/\/+$/, "");
  if (raw) return raw;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel && isProd && !relaxedBuild) {
    const withScheme = (vercel.startsWith("http") ? vercel : `https://${vercel}`).replace(
      /\/+$/,
      "",
    );
    return withScheme;
  }
  if (isProd && !relaxedBuild) {
    throw new Error(
      "BETTER_AUTH_URL が未設定です。本番サイトの公開 URL（例: https://example.com）を設定するか、Vercel の VERCEL_URL に任せてください。",
    );
  }
  if (relaxedBuild) {
    return "https://build.placeholder.local";
  }
  console.warn(
    "[auth] BETTER_AUTH_URL 未設定のため http://localhost:3000 を使います。ポートが違う場合は .env.local に設定してください。",
  );
  return "http://localhost:3000";
}

const secret = resolveBetterAuthSecret();
const baseURL = resolveBetterAuthBaseURL();

/** Origin 検証用。開発では localhost 系を常に含め、BETTER_AUTH_URL だけが本番 URL でも登録できるようにする */
function buildTrustedOrigins(appBase: string): string[] {
  const origins = new Set<string>();
  try {
    origins.add(new URL(appBase).origin);
  } catch {
    /* ignore */
  }
  const fromEnv = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const o of fromEnv ?? []) {
    try {
      origins.add(o.includes("://") ? new URL(o).origin : new URL(`https://${o}`).origin);
    } catch {
      origins.add(o);
    }
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    try {
      origins.add(vercel.startsWith("http") ? new URL(vercel).origin : new URL(`https://${vercel}`).origin);
    } catch {
      /* ignore */
    }
  }
  if (!isProd) {
    for (const o of [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
    ]) {
      origins.add(o);
    }
  }
  return [...origins];
}

export const auth = betterAuth({
  secret,
  baseURL,
  trustedOrigins: buildTrustedOrigins(baseURL),
  /** 開発時はブラウザの Origin / Sec-Fetch-* と BETTER_AUTH_URL の不一致で 403 になりやすいため CSRF を無効化（本番では必ず有効） */
  advanced: {
    disableCSRFCheck: !isProd,
  },
  database: drizzleAdapter(authDb, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  /**
   * nextCookies の after フックは `cookies().set()` に依存する。
   * Next.js 16 の Route Handler では読み取り専用ストア上で set が失敗し、
   * サインアップ等が HTTP 500 になるケースがある。
   * Set-Cookie は better-call が Response の `set-cookie` に載せるため、
   * 本プロジェクトではプラグインなしで動作させる。
   */
  plugins: [],
});
