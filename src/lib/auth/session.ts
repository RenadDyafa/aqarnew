import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { db, type User } from "./db";

/*
  Sessions: a random token in an httpOnly cookie; only its SHA-256 hash is
  stored, so a leaked database cannot be replayed as live sessions.
  "Remember me" keeps the cookie for 30 days; otherwise it ends with the browser
  (the server-side record still expires after 1 day).
*/
export const SESSION_COOKIE = "aqar_session";
const DAY = 24 * 60 * 60 * 1000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: number, remember: boolean) {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  const expires = now + (remember ? 30 : 1) * DAY;
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(hashToken(token), userId, expires, now);
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(now);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { expires: new Date(expires) } : {}),
  });
}

export async function getCurrentUser(): Promise<User | null> {
  // Synchronous SQLite and the clock must run per request, never at prerender.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.phone, u.account_type, u.locale, u.created_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(hashToken(token), Date.now()) as User | undefined;
  return row ?? null;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  store.delete(SESSION_COOKIE);
}
