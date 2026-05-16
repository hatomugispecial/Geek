-- 明細ごとのステータス。Neon の SQL Editor で一度だけ実行。
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

UPDATE order_items i
SET
  status = o.status
FROM
  orders o
WHERE
  i.order_id = o.id;

ALTER TABLE order_items
DROP CONSTRAINT IF EXISTS order_items_status_check;

ALTER TABLE order_items
ADD CONSTRAINT order_items_status_check CHECK (
  status IN (
    'pending',
    'cooking',
    'ready',
    'served',
    'cancelled'
  )
);
