# OSAKI ダイニング向けオーダーシステム（デモ）

飲食店向けの **客席 QR からの注文** と **店舗側の受注・会計確認** を想定した Web アプリです。クライアント・店名は架空の「株式会社 OSAKI ダイニング」想定で、要件の詳細は [`Direction.md`](./Direction.md) にまとめています。

## 本番で使う

次の URL からブラウザで利用できます（Neon・認証の環境変数が Vercel に設定されていることが前提です）。

**[https://geek-practice.vercel.app](https://geek-practice.vercel.app)**

| 画面 | パス | 説明 |
|------|------|------|
| 入口 | `/` | お客様用・店舗用への導線 |
| 注文（客向け） | `/Order` | メニュー・カート・注文確定（`POST /api/orders` で Neon に保存） |
| 店舗コンソール | `/store` | 受信注文の一覧・ステータス（ログイン必須） |
| ログイン | `/login` | 店舗スタッフ用（Better Auth） |
| 初回登録 | `/register` | 店舗アカウント作成（運用では導線を外す想定） |
| DB 確認用 | `/neon-sample` | Neon の注文系テーブル表示のサンプル |

ローカルでは `npm run dev` 後に [http://localhost:3000](http://localhost:3000) から同様のパスで開けます。

## 技術スタック

- **Next.js**（App Router）・**React**・**TypeScript**
- **Neon**（PostgreSQL）— 注文データと Better Auth 用ユーザー
- **Better Auth** — 店舗向けセッション

## ディレクトリ構成（抜粋）

```
geek/
├── app/                 # ページと Route Handler（/api/*）
├── components/          # UI（orders / store / ui など）
├── lib/                 # 認証・DB・API 向けロジック
├── db/                  # Neon 用 SQL（スキーマ・マイグレーション）
├── public/              # 静的ファイル
├── proxy.ts             # 店舗ルート用のリクエストガード（Cookie の有無）
├── Store/               # Direction.md 上の「店舗用」将来配置用（現状は README のみ）
├── Backend/             # Direction.md 上のバックエンド将来配置用（現状は README のみ）
└── Direction.md         # 要件・実装済みタスクのメモ
```

実装済みの店舗 UI は **`app/store`** と **`components/store`** にあります。ルートの `Store/`・`Backend/` は将来の分割用プレースホルダです。

## セットアップ

### 1. Neon（スキーマ）

1. [Neon](https://neon.tech/) でプロジェクトを作成し、**Connection string** を取得する。
2. SQL Editor で順に実行する（未実行だと注文・ログインが失敗します）。
   - [`db/orders-schema.sql`](./db/orders-schema.sql) … `orders` / `order_items`
   - [`db/better-auth-schema.sql`](./db/better-auth-schema.sql) … Better Auth 用テーブル
3. 既存 DB 向けの差分は [`db/orders-migration-v2-seat-status.sql`](./db/orders-migration-v2-seat-status.sql)・[`db/orders-migration-v3-order-item-status.sql`](./db/orders-migration-v3-order-item-status.sql) を参照。

### 2. 環境変数

リポジトリ直下に **`.env.local`** を置く（Git に含めない）。Vercel では **Environment Variables** に同じ名前で登録する。**Production / Preview** 双方でビルド・ランタイムから参照できるようにする。

| 変数 | 説明 |
|------|------|
| `DATABASE_URL` | Neon の接続文字列（Vercel 連携では `POSTGRES_URL` 等だけの場合もあり。アプリは複数キーを順に参照） |
| `BETTER_AUTH_SECRET` | **32 文字以上**のランダム文字列。ターミナルで `openssl rand -base64 32` を実行し、**出力された1行だけ**を値に書く（コマンド全文を値にしない） |
| `BETTER_AUTH_URL` | 公開 URL（例: `http://localhost:3000`、本番は `https://geek-practice.vercel.app`）。末尾の `/` は不要 |

任意: `BETTER_AUTH_TRUSTED_ORIGINS`（カンマ区切りで追加オリジン）

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
```

### 3. 開発サーバー

```bash
npm install
npm run dev
```

`SKIP_ENV_VALIDATION=true` は CI 等の緊急時のみ `next build` 向け。通常は使わない。

## API（参考）

- `POST /api/orders` — 客向け注文の保存
- `GET` / `PATCH` `/api/store/orders` … 店舗向け（セッション必須）
- `PATCH` `/api/store/orders/:id` / `.../lines/:lineId` — 注文・明細の更新

`DATABASE_URL` が未設定のとき、注文系 API は 503 を返すことがあります。

## デプロイ

[Vercel](https://vercel.com/) に接続し、上記の環境変数と Neon を本番プロジェクトに設定してください。詳細は [Next.js のデプロイ手順](https://nextjs.org/docs/app/building-your-application/deploying)を参照してください。
