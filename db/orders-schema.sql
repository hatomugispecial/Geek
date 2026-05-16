-- 客向け注文 API ・店舗受信画面用（Neon の SQL Editor で実行）
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_code TEXT NOT NULL DEFAULT 'osaki-shinagawa',
  seat_label TEXT NOT NULL DEFAULT '',
  total_yen INTEGER NOT NULL CHECK (total_yen >= 0),
  line_count INTEGER NOT NULL CHECK (line_count > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',
      'cooking',
      'ready',
      'served',
      'cancelled'
    )
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  menu_id TEXT NOT NULL,
  name TEXT NOT NULL,
  qty INTEGER NOT NULL CHECK (qty >= 1 AND qty <= 99),
  unit_price_yen INTEGER NOT NULL CHECK (
    unit_price_yen >= 0
    AND unit_price_yen <= 1000000
  ),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',
      'cooking',
      'ready',
      'served',
      'cancelled'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_seat_label ON orders (seat_label);
