/**
 * メニュー名に対応した画像（Unsplash・`curl` で 200 を確認済みの URL のみ）。
 * 参照: https://unsplash.com/license
 */
const Q = "?auto=format&fit=crop&w=960&q=82";

const MENU_IMAGE_BY_ID: Record<string, string> = {
  /** 枝豆 … 豆・小鉢のイメージ */
  m1: `https://images.unsplash.com/photo-1611143669185-af224c5e3252${Q}`,
  /** 冷奴 … 白い器の和風前菜 */
  m2: `https://images.unsplash.com/photo-1604908176997-125f25cc6f3d${Q}`,
  /** 唐揚げ定食 … から揚げ */
  m3: `https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec${Q}`,
  /** 焼魚定食 … グリルされた魚料理 */
  m4: `https://images.unsplash.com/photo-1544025162-d76694265947${Q}`,
  /** シーザーサラダ … レタス中心のサラダ */
  m5: `https://images.unsplash.com/photo-1512621776951-a57141f2eefd${Q}`,
  /** 大崎野菜のサラダ … カラフルな生野菜 */
  m6: `https://images.unsplash.com/photo-1540189549336-e6e99c3679fe${Q}`,
  /** 大崎サワー … 柑橘系の冷たいドリンク */
  m7: `https://images.unsplash.com/photo-1556679343-c7306c1976bc${Q}`,
  /** 季節のフルーツカクテル … カクテルグラス */
  m8: `https://images.unsplash.com/photo-1470337458703-46ad1756a187${Q}`,
  /** 純米吟醸（一合）… 日本酒・徳利・お猪口イメージ */
  m9: `https://images.unsplash.com/photo-1546171753-97d7676e4602${Q}`,
  /** 本醸造（一合）… グラスで飲む日本酒 */
  m10: `https://images.unsplash.com/photo-1510812431401-41d2bd2722f3${Q}`,
  /** ハイボール … ウイスキー＋炭酸のグラス */
  m11: `https://images.unsplash.com/photo-1558642452-9d2a7deb7f62${Q}`,
  /** 角（ダブル）… ウイスキーロック */
  m12: `https://images.unsplash.com/photo-1561758033-d89a9ad46330${Q}`,
  /** 生ビール（中）… ジョッキのビール */
  m13: `https://images.unsplash.com/photo-1532634922-8fe0b757fb13${Q}`,
  /** 瓶ビール … 瓶とグラスのビール */
  m14: `https://images.unsplash.com/photo-1528821128474-27f963b062bf${Q}`,
  /** 焼酎（芋）… 琥珀色の蒸留酒グラス */
  m15: `https://images.unsplash.com/photo-1569529465841-dfecdab7503b${Q}`,
  /** ワイン（グラス）… 赤ワイングラス */
  m16: `https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb${Q}`,
};

/** 履歴行など、メニュー ID から画像を引くときのフォールバック付き */
export function menuImageUrlForId(menuId: string): string {
  return MENU_IMAGE_BY_ID[menuId] ?? MENU_IMAGE_BY_ID.m1;
}

export type MenuCategoryId =
  | "otsumami"
  | "okazu"
  | "salad"
  | "cocktail"
  | "nihonshu"
  | "whiskey"
  | "beer"
  | "other-alcohol";

/** タブ用。「すべて」＋各カテゴリ */
export type MenuTabId = "all" | MenuCategoryId;

export type MenuItem = {
  id: string;
  categoryId: MenuCategoryId;
  name: string;
  /** 税込想定の単価（円） */
  price: number;
  /** メニュー写真（メニュー名に対応） */
  imageUrl: string;
  /** true のときカートへ追加不可（デモ用フラグ） */
  soldOut?: boolean;
};

export const MENU_CATEGORY_ORDER: { id: MenuCategoryId; label: string }[] = [
  { id: "otsumami", label: "おつまみ" },
  { id: "okazu", label: "おかず" },
  { id: "salad", label: "サラダ" },
  { id: "cocktail", label: "カクテル" },
  { id: "nihonshu", label: "日本酒" },
  { id: "whiskey", label: "ウイスキー" },
  { id: "beer", label: "ビール" },
  { id: "other-alcohol", label: "その他アルコール" },
];

export const MENU_TABS: { id: MenuTabId; label: string }[] = [
  { id: "all", label: "すべて" },
  ...MENU_CATEGORY_ORDER,
];

const MENU_ITEMS_BASE: Omit<MenuItem, "imageUrl">[] = [
  { id: "m1", categoryId: "otsumami", name: "枝豆", price: 380 },
  { id: "m2", categoryId: "otsumami", name: "冷奴", price: 420, soldOut: true },
  { id: "m3", categoryId: "okazu", name: "唐揚げ定食", price: 1180 },
  { id: "m4", categoryId: "okazu", name: "焼魚定食", price: 1280 },
  { id: "m5", categoryId: "salad", name: "シーザーサラダ", price: 680 },
  { id: "m6", categoryId: "salad", name: "大崎野菜のサラダ", price: 720 },
  { id: "m7", categoryId: "cocktail", name: "大崎サワー", price: 580 },
  {
    id: "m8",
    categoryId: "cocktail",
    name: "季節のフルーツカクテル",
    price: 720,
    soldOut: true,
  },
  { id: "m9", categoryId: "nihonshu", name: "純米吟醸（一合）", price: 780 },
  { id: "m10", categoryId: "nihonshu", name: "本醸造（一合）", price: 580 },
  { id: "m11", categoryId: "whiskey", name: "ハイボール", price: 480 },
  { id: "m12", categoryId: "whiskey", name: "角（ダブル）", price: 680 },
  { id: "m13", categoryId: "beer", name: "生ビール（中）", price: 580 },
  { id: "m14", categoryId: "beer", name: "瓶ビール", price: 620 },
  { id: "m15", categoryId: "other-alcohol", name: "焼酎（芋）", price: 520 },
  { id: "m16", categoryId: "other-alcohol", name: "ワイン（グラス）", price: 680 },
];

export const MENU_ITEMS: MenuItem[] = MENU_ITEMS_BASE.map((row) => ({
  ...row,
  imageUrl: menuImageUrlForId(row.id),
}));

export const GUEST_STORE_NAME = "OSAKI 亭 品川シーサイド店";
