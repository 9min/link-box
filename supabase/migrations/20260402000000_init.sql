-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Folders ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS folders (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own folders"
  ON folders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Links ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS links (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url         TEXT        NOT NULL,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  og_image    TEXT,
  favicon     TEXT        NOT NULL DEFAULT '',
  domain      TEXT        NOT NULL,
  category_id TEXT        NOT NULL DEFAULT 'etc',
  folder_id   UUID        REFERENCES folders(id) ON DELETE SET NULL,
  is_favorite BOOLEAN     NOT NULL DEFAULT false,
  note        TEXT        NOT NULL DEFAULT '',
  visit_count INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, url)
);

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own links"
  ON links FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS links_user_id_created_at_idx ON links (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS links_user_id_url_idx        ON links (user_id, url);
CREATE INDEX IF NOT EXISTS folders_user_id_idx          ON folders (user_id);

-- ── increment_visit_count RPC ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_visit_count(link_id UUID)
RETURNS VOID AS $$
  UPDATE links
  SET visit_count = visit_count + 1
  WHERE id = link_id AND user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;
