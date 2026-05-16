This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Neon PostgreSQL（Vercel 想定）

サーバー側から Neon の PostgreSQL に接続する手順です。

1. [Neon](https://neon.tech/) でプロジェクトを作成し、ブランチの **Connection string**（`postgresql://...`）を控える。
2. Neon の **SQL Editor** でリポジトリ内の [`db/orders-schema.sql`](./db/orders-schema.sql) を実行し、`orders` と `order_items` を作成する（注文の保存先・[`/neon-sample`](http://localhost:3000/neon-sample) の表示元）。
3. ローカルでは `.env.example` を参考に `.env.local` を作成し、`DATABASE_URL` に接続文字列を設定する。
4. [Vercel](https://vercel.com/) にデプロイする場合は、プロジェクトの **Environment Variables** に `DATABASE_URL` を登録する（Neon の「Connect to Vercel」から連携してもよい）。
5. ブラウザで [`/neon-sample`](http://localhost:3000/neon-sample) を開き、注文一覧（または空メッセージ）が表示されれば接続成功です。任意で [`db/neon-sample.sql`](./db/neon-sample.sql) を実行すると別デモ用テーブル `neon_sample` も作成できます。

### 注文 API（客向け → Neon）

1. 上記のとおり `orders` / `order_items` が存在していること（新規は `orders-schema.sql`、旧 DB は `orders-migration-v2-seat-status.sql` も参照）。
2. [`/Order`](http://localhost:3000/Order) の「注文リスト」→「注文する」で **`POST /api/orders`** が呼ばれ、検証済みの内容が DB に保存される（任意の座席番号を同送可能）。
3. `DATABASE_URL` が未設定のときは API は 503 を返す。

### 店舗コンソール（受信注文）

1. `DATABASE_URL` と `orders` / `order_items`（新規は `orders-schema.sql`、旧 DB は `orders-migration-v2-seat-status.sql` と [`db/orders-migration-v3-order-item-status.sql`](./db/orders-migration-v3-order-item-status.sql) を参照）が用意できていること。
2. [`/store`](http://localhost:3000/store) の「受信注文（Neon）」で一覧取得（`GET /api/store/orders`）。座席をクエリ指定すると `summary` にメニュー別の合計数量・金額（`menus`）と合計金額が含まれる。**料理（明細）ごとの**ステータス変更は `PATCH /api/store/orders/:id/lines/:lineId`。注文ヘッダの `orders.status` は明細から自動集計される。全明細を同じ状態に揃える場合は `PATCH /api/store/orders/:id` も利用できる。
3. 既存 DB には [`db/orders-migration-v2-seat-status.sql`](./db/orders-migration-v2-seat-status.sql) で `seat_label` とステータス制約を、[`db/orders-migration-v3-order-item-status.sql`](./db/orders-migration-v3-order-item-status.sql) で `order_items.status` を追加できる。

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
