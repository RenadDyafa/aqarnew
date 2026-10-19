"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, type AccountType } from "./db";
import { dummyVerify, hashPassword, verifyPassword } from "./password";
import { createSession, destroySession } from "./session";
import { hasLocale } from "@/i18n/config";

/*
  Server Actions for accounts. Next.js checks the Origin of every Server Action
  request, which protects these forms against cross-site submission.
  Errors are returned as keys; the forms translate them.
*/

export type AuthError =
  | "nameRequired"
  | "emailInvalid"
  | "phoneInvalid"
  | "typeRequired"
  | "passwordShort"
  | "passwordMismatch"
  | "emailTaken"
  | "credentials"
  | "tooMany";

export type AuthState = { error?: AuthError; fields?: Record<string, string> };

const TYPES: AccountType[] = ["owner", "resident", "corporate"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const localeOf = (fd: FormData) => {
  const l = str(fd, "locale");
  return hasLocale(l) ? l : "en";
};
// Only same-site paths are accepted as a return destination.
const safeNext = (fd: FormData, locale: string) => {
  const next = str(fd, "next");
  return next.startsWith(`/${locale}/`) && !next.startsWith("//") ? next : `/${locale}/account`;
};

// Throttle sign-in attempts per IP and email (in memory, per server instance).
const attempts = new Map<string, number[]>();
function throttled(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < 15 * 60 * 1000);
  attempts.set(key, recent);
  return recent.length >= 8;
}
const recordFailure = (key: string) => attempts.set(key, [...(attempts.get(key) ?? []), Date.now()]);

export async function signUp(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const locale = localeOf(fd);
  const name = str(fd, "name").slice(0, 120);
  const email = str(fd, "email").toLowerCase().slice(0, 200);
  const phone = str(fd, "phone").replace(/[\s-]/g, "").slice(0, 20);
  const type = str(fd, "accountType") as AccountType;
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  const fields = { name, email, phone, accountType: type };

  if (!name) return { error: "nameRequired", fields };
  if (!EMAIL.test(email)) return { error: "emailInvalid", fields };
  if (phone && !/^\+?\d{8,15}$/.test(phone)) return { error: "phoneInvalid", fields };
  if (!TYPES.includes(type)) return { error: "typeRequired", fields };
  if (password.length < 10) return { error: "passwordShort", fields };
  if (password !== confirm) return { error: "passwordMismatch", fields };

  const exists = db.prepare("SELECT 1 FROM users WHERE email = ?").get(email);
  if (exists) return { error: "emailTaken", fields };

  const result = db
    .prepare("INSERT INTO users (name, email, phone, account_type, password_hash, locale) VALUES (?, ?, ?, ?, ?, ?)")
    .run(name, email, phone || null, type, await hashPassword(password), locale);
  await createSession(Number(result.lastInsertRowid), false);
  redirect(`/${locale}/account?welcome=1`);
}

export async function signIn(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const locale = localeOf(fd);
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const remember = fd.get("remember") === "on";
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${ip}|${email}`;
  const fields = { email };

  if (throttled(key)) return { error: "tooMany", fields };

  const user = db.prepare("SELECT id, password_hash FROM users WHERE email = ?").get(email) as { id: number; password_hash: string } | undefined;
  const ok = user ? await verifyPassword(password, user.password_hash) : await dummyVerify(password);
  if (!user || !ok) {
    recordFailure(key);
    return { error: "credentials", fields };
  }
  attempts.delete(key);
  await createSession(user.id, remember);
  redirect(safeNext(fd, locale));
}

export async function signOut(fd: FormData) {
  await destroySession();
  redirect(`/${localeOf(fd)}`);
}
