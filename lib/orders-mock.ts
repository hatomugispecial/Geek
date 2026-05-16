export type OrderStatus = "受付済" | "調理中" | "配達待ち" | "完了";

export type OrderRow = {
  id: string;
  orderedAt: string;
  brand: string;
  store: string;
  channel: "店内" | "テイクアウト" | "デリバリー";
  items: string;
  amount: number;
  status: OrderStatus;
};

export const MOCK_ORDERS: OrderRow[] = [
  {
    id: "OD-20250516-001",
    orderedAt: "2025-05-16 11:42",
    brand: "OSAKI 亭",
    store: "品川シーサイド店",
    channel: "店内",
    items: "定食A・味噌汁変更",
    amount: 1280,
    status: "調理中",
  },
  {
    id: "OD-20250516-002",
    orderedAt: "2025-05-16 11:38",
    brand: "大崎グリル",
    store: "大崎ゲートシティ店",
    channel: "テイクアウト",
    items: "ハンバーグ弁当 ×2",
    amount: 1960,
    status: "受付済",
  },
  {
    id: "OD-20250516-003",
    orderedAt: "2025-05-16 11:35",
    brand: "OSAKI 亭",
    store: "五反田TOC店",
    channel: "デリバリー",
    items: "ランチセット・ドリンクL",
    amount: 1540,
    status: "配達待ち",
  },
  {
    id: "OD-20250516-004",
    orderedAt: "2025-05-16 11:20",
    brand: "品川そば処",
    store: "品川駅前店",
    channel: "店内",
    items: "かけそば・玉子トッピング",
    amount: 780,
    status: "完了",
  },
  {
    id: "OD-20250516-005",
    orderedAt: "2025-05-16 11:05",
    brand: "OSAKI 亭",
    store: "目黒フランチャイズ店",
    channel: "テイクアウト",
    items: "カレー大盛・サラダ",
    amount: 1120,
    status: "完了",
  },
];

export const COMPANY = {
  name: "株式会社 OSAKI ダイニング",
  address: "東京都品川区大崎",
  description:
    "「OSAKI 亭」など複数ブランドの飲食店を全国展開。直営 20 店舗、フランチャイズ加盟 80 店舗でオペレーションを共通化しています。",
} as const;
