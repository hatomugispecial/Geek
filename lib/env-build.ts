/**
 * `next build` の静的解析・コンパイル時にのみ真になりがち。
 * この間は認証用 env が未設定でもモジュール読み込みで落とさない（実行時は必ず設定すること）。
 */
export function isRelaxedEnvBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.SKIP_ENV_VALIDATION === "true"
  );
}
