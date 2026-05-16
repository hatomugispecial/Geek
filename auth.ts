import { betterAuth } from "better-auth";

/**
 * `npx auth generate` が既定で読むファイル（スキーマ再生成用）。
 * アプリケーションの認証インスタンスは `@/lib/auth` を参照してください。
 */
export const auth = betterAuth({
  emailAndPassword: { enabled: true },
});
