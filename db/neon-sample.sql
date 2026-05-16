-- Neon SQL Editor などで実行し、サンプルテーブルと行を作成します（冪等）。
CREATE TABLE IF NOT EXISTS neon_sample (
  id INTEGER PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL
);

INSERT INTO neon_sample (id, label, value) VALUES
  (1, '店舗', 'OSAKI 亭 品川シーサイド店'),
  (2, 'データソース', 'Neon PostgreSQL'),
  (3, 'アプリ', 'Next.js（Vercel 想定）')
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  value = EXCLUDED.value;
