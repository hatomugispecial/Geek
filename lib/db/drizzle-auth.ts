import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { isRelaxedEnvBuildPhase } from "@/lib/env-build";
import { resolveDatabaseUrlFromEnv } from "@/lib/db/resolve-database-url";
import * as authSchema from "./auth-schema";

const url = resolveDatabaseUrlFromEnv();
const relaxed = isRelaxedEnvBuildPhase();

if (!url && !relaxed) {
  throw new Error(
    "PostgreSQL 接続用の環境変数が見つかりません。DATABASE_URL（または Vercel / Neon が注入する POSTGRES_URL 等）を設定してください。",
  );
}

/** ビルド専用のダミー URL（接続はビルド中には行われない想定）。ランタイムでは必ず DATABASE_URL を設定すること。 */
const effectiveUrl =
  url ?? "postgresql://build:build@127.0.0.1:5432/build?sslmode=disable";

export const authDb = drizzle(neon(effectiveUrl), { schema: authSchema });
