import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

/*
  Account storage: Node's built-in SQLite, one file at data/aqar.db.
  Suitable for a single server. On serverless hosting the file system is not
  persistent: point this module at a hosted database (Postgres, the Laravel
  API) before going live there.
*/

const dir = process.env.AQAR_DATA_DIR ?? join(process.cwd(), "data");
const globalForDb = globalThis as unknown as { aqarDb?: DatabaseSync };

function open() {
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(join(dir, "aqar.db"));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
      phone         TEXT,
      account_type  TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      locale        TEXT NOT NULL DEFAULT 'en',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
  `);
  return db;
}

// Reuse one connection across hot reloads in development.
export const db = (globalForDb.aqarDb ??= open());

export type AccountType = "owner" | "resident" | "corporate";
export type User = { id: number; name: string; email: string; phone: string | null; account_type: AccountType; locale: string; created_at: string };
