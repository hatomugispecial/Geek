import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { isRelaxedEnvBuildPhase } from "@/lib/env-build";
import * as authSchema from "./auth-schema";

const url = process.env.DATABASE_URL?.trim();
const relaxed = isRelaxedEnvBuildPhase();

if (!url && !relaxed) {
  throw new Error(
    "DATABASE_URL が未設定です。Better Auth は Neon（PostgreSQL）に接続します。",
  );
}

/** ビルド専用のダミー URL（接続はビルド中には行われない想定）。ランタイムでは必ず DATABASE_URL を設定すること。 */
const effectiveUrl =
  url ?? "postgresql://build:build@127.0.0.1:5432/build?sslmode=disable";

export const authDb = drizzle(neon(effectiveUrl), { schema: authSchema });
