CREATE TABLE weather_snapshots (
  source TEXT PRIMARY KEY,
  checked_at TEXT NOT NULL,
  payload TEXT NOT NULL
);
