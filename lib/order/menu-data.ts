export type MenuCategoryId =
  | "otsumami"
  | "okazu"
  | "salad"
  | "cocktail"
  | "nihonshu"
  | "whiskey"
  | "beer"
  | "other-alcohol";

export type MenuItem = {
  id: string;
  categoryId: MenuCategoryId;
  name: string;
  /** 税込想定の単価（円） */
  price: number;
};

export const MENU_CATEGORIES: { id: MenuCategoryId; label: string }[] = [
  { id: "otsumami", label: "おつまみ" },
  { id: "okazu", label: "おかず" },
  { id: "salad", label: "サラダ" },
  { id: "cocktail", label: "カクテル" },
  { id: "nihonshu", label: "日本酒" },
  { id: "whiskey", label: "ウイスキー" },
  { id: "beer", label: "ビール" },
  { id: "other-alcohol", label: "その他アルコール" },
];

export const MENU_ITEMS: MenuItem[] = [
  { id: "m1", categoryId: "otsumami", name: "枝豆", price: 380 },
  { id: "m2", categoryId: "otsumami", name: "冷奴", price: 420 },
  { id: "m3", categoryId: "okazu", name: "唐揚げ定食", price: 1180 },
  { id: "m4", categoryId: "okazu", name: "焼魚定食", price: 1280 },
  { id: "m5", categoryId: "salad", name: "シーザーサラダ", price: 680 },
  { id: "m6", categoryId: "salad", name: "大崎野菜のサラダ", price: 720 },
  { id: "m7", categoryId: "cocktail", name: "大崎サワー", price: 580 },
  { id: "m8", categoryId: "cocktail", name: "季節のフルーツカクテル", price: 720 },
  { id: "m9", categoryId: "nihonshu", name: "純米吟醸（一合）", price: 780 },
  { id: "m10", categoryId: "nihonshu", name: "本醸造（一合）", price: 580 },
  { id: "m11", categoryId: "whiskey", name: "ハイボール", price: 480 },
  { id: "m12", categoryId: "whiskey", name: "角（ダブル）", price: 680 },
  { id: "m13", categoryId: "beer", name: "生ビール（中）", price: 580 },
  { id: "m14", categoryId: "beer", name: "瓶ビール", price: 620 },
  { id: "m15", categoryId: "other-alcohol", name: "焼酎（芋）", price: 520 },
  { id: "m16", categoryId: "other-alcohol", name: "ワイン（グラス）", price: 680 },
];

export const GUEST_STORE_NAME = "OSAKI 亭 品川シーサイド店";
