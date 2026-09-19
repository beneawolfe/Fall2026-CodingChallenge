-- Users who can log in and own or collaborate on collections
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A board of saved images; share_token powers the unique share URL
CREATE TABLE collections (
  id          SERIAL PRIMARY KEY,
  owner_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_public   BOOLEAN NOT NULL DEFAULT FALSE,
  share_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Other accounts a collection is shared with (collaboration)
CREATE TABLE collection_members (
  collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'viewer')),
  PRIMARY KEY (collection_id, user_id)
);

-- Images saved into a collection
CREATE TABLE images (
  id            SERIAL PRIMARY KEY,
  collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  added_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  image_url     TEXT NOT NULL,
  preview_url   TEXT NOT NULL,
  tags          TEXT NOT NULL DEFAULT '',
  note          TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (collection_id, image_url)
);

-- Edit notifications for shared collections (bonus feature)
CREATE TABLE notifications (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  message       TEXT NOT NULL,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);