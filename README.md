This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Neon PostgreSQL（Vercel 想定）

サーバー側から Neon の PostgreSQL に接続する手順です。

1. [Neon](https://neon.tech/) でプロジェクトを作成し、ブランチの **Connection string**（`postgresql://...`）を控える。
2. Neon の **SQL Editor** でリポジトリ内の [`db/orders-schema.sql`](./db/orders-schema.sql) を実行し、`orders` と `order_items` を作成する（注文の保存先・[`/neon-sample`](http://localhost:3000/neon-sample) の表示元）。
3. プロジェクトルートに **`.env.local`** を作成し、少なくとも `DATABASE_URL` に Neon の接続文字列を設定する（変数の一覧と例は下記「環境変数（.env.local）」を参照）。
4. **従業員向けログイン（Better Auth）**: Neon の SQL Editor で [`db/better-auth-schema.sql`](./db/better-auth-schema.sql) を実行し、`BETTER_AUTH_SECRET`（32 文字以上推奨）と `BETTER_AUTH_URL`（例: `http://localhost:3000`）を `.env.local` / Vercel の環境変数に設定する。初回は [`/register`](http://localhost:3000/register) で店舗ユーザーを作成し、[`/login`](http://localhost:3000/login) から [`/store`](http://localhost:3000/store) に入る。
5. [Vercel](https://vercel.com/) にデプロイする場合は、プロジェクトの **Environment Variables** に `DATABASE_URL`・`BETTER_AUTH_SECRET`・`BETTER_AUTH_URL` を登録する（Neon の「Connect to Vercel」から連携してもよい）。
6. ブラウザで [`/neon-sample`](http://localhost:3000/neon-sample) を開き、注文一覧（または空メッセージ）が表示されれば接続成功です。任意で [`db/neon-sample.sql`](./db/neon-sample.sql) を実行すると別デモ用テーブル `neon_sample` も作成できます。

### 注文 API（客向け → Neon）

1. 上記のとおり `orders` / `order_items` が存在していること（新規は `orders-schema.sql`、旧 DB は `orders-migration-v2-seat-status.sql` も参照）。
2. [`/Order`](http://localhost:3000/Order) の「注文リスト」→「注文する」で **`POST /api/orders`** が呼ばれ、検証済みの内容が DB に保存される（任意の座席番号を同送可能）。
3. `DATABASE_URL` が未設定のときは API は 503 を返す。

### 店舗コンソール（受信注文）

1. `DATABASE_URL` と `orders` / `order_items`（新規は `orders-schema.sql`、旧 DB は `orders-migration-v2-seat-status.sql` と [`db/orders-migration-v3-order-item-status.sql`](./db/orders-migration-v3-order-item-status.sql) を参照）が用意できていること。**未ログインでは `/store` と `GET/PATCH /api/store/**` にアクセスできません**（[`proxy.ts`](./proxy.ts) と各 Route Handler のセッション検証）。
2. [`/store`](http://localhost:3000/store) の「受信注文（Neon）」で一覧取得（`GET /api/store/orders`）。座席をクエリ指定すると `summary` に取消除く合計金額などが含まれ、画面では明細行ごと（日時・メニュー・個数・小計）のお会計一覧を表示します。**料理（明細）ごとの**ステータス変更は `PATCH /api/store/orders/:id/lines/:lineId`。注文ヘッダの `orders.status` は明細から自動集計される。全明細を同じ状態に揃える場合は `PATCH /api/store/orders/:id` も利用できる。
3. 既存 DB には [`db/orders-migration-v2-seat-status.sql`](./db/orders-migration-v2-seat-status.sql) で `seat_label` とステータス制約を、[`db/orders-migration-v3-order-item-status.sql`](./db/orders-migration-v3-order-item-status.sql) で `order_items.status` を追加できる。

## 環境変数（`.env.local`）

ローカルではリポジトリ直下に **`.env.local`** を置き、Next.js が読み込みます（Git には含めないでください）。Vercel では同じ名前を **Environment Variables** に登録します。**Production / Preview のビルド**でも `DATABASE_URL`・`BETTER_AUTH_SECRET`（32 文字以上）・`BETTER_AUTH_URL`（デプロイ先の `https://…`）を読み込めるようにしてください（未設定だとビルドやランタイムで失敗します）。

緊急時のみ CI で `SKIP_ENV_VALIDATION=true` を渡すと、`next build` 中の env 厳格チェックを緩めます（通常は使わないでください）。

```bash
# Neon（PostgreSQL）接続文字列
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require

# Better Auth（従業員ログイン）。32 文字以上推奨（例: openssl rand -base64 32）
BETTER_AUTH_SECRET=

# アプリの公開オリジン（ローカル例: http://localhost:3000）。Vercel 本番では `https://あなたのドメイン` を推奨。未設定時は `VERCEL_URL`（`https://` 付き）が自動利用されます。
BETTER_AUTH_URL=http://localhost:3000

# 任意。カンマ区切りで追加の許可オリジン（プレビュー URL など）
# BETTER_AUTH_TRUSTED_ORIGINS=https://branch--project.vercel.app
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
