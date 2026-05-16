-- 既存 DB（旧 orders-schema.sql 適用済み）向け。Neon の SQL Editor で一度だけ実行。
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS seat_label TEXT NOT NULL DEFAULT '';

UPDATE orders
SET
  status = 'pending'
WHERE
  status = 'received';

ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'pending',
    'cooking',
    'ready',
    'served',
    'cancelled'
  )
);
