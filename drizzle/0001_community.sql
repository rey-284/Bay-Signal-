CREATE TABLE community_posts (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL, title TEXT NOT NULL,
  zip TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE community_replies (
  id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES community_posts(id),
  message TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX replies_by_post ON community_replies(post_id, created_at);
