import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";

const sqlite = new Database("./local.db");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS visitor_daily (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL,
    visit_date TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(visitor_id, visit_date)
  );
  CREATE INDEX IF NOT EXISTS idx_visitor_daily_visit_date
  ON visitor_daily (visit_date);

  CREATE TABLE IF NOT EXISTS visitor_lifetime (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL UNIQUE,
    first_seen_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS chat_daily_usage (
    client_id TEXT NOT NULL,
    date_key TEXT NOT NULL,
    used_count INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (client_id, date_key)
  );
  CREATE INDEX IF NOT EXISTS idx_chat_daily_usage_date_key
  ON chat_daily_usage (date_key);
`);

export { sqlite };
export const db = drizzle(sqlite, { schema });
