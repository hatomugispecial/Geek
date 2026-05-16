import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./auth-schema";

const url = process.env.DATABASE_URL?.trim();

if (!url) {
  throw new Error(
    "DATABASE_URL が未設定です。Better Auth は Neon（PostgreSQL）に接続します。",
  );
}

export const authDb = drizzle(neon(url), { schema: authSchema });
