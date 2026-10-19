"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import type { Dictionary } from "@/i18n/en";
import { signIn, signUp, type AuthState } from "@/lib/auth/actions";

const field =
  "mt-2 block w-full border-0 border-b border-basalt/25 bg-transparent px-0 py-2.5 text-basalt focus:border-bronze focus:outline-none focus:ring-0 aria-[invalid=true]:border-[#8a3b2a]";
const label = "block text-sm text-olive";

function Submit({ pending, idle, busy }: { pending: boolean; idle: string; busy: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-13 w-full items-center justify-center bg-basalt px-7 text-paper transition-colors duration-[var(--dur-micro)] hover:bg-bronze-deep disabled:opacity-60 sm:w-auto"
    >
      {pending ? busy : idle}
    </button>
  );
}

function ErrorLine({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} role="alert" className="min-h-6 text-sm text-[#8a3b2a]">
      {message}
    </p>
  );
}

function PasswordInput({ t, name, autoComplete, describedBy, invalid }: { t: Dictionary; name: string; autoComplete: string; describedBy?: string; invalid?: boolean }) {
  const [shown, setShown] = useState(false);
  return (
    <span className="relative block">
      <input
        name={name}
        type={shown ? "text" : "password"}
        autoComplete={autoComplete}
        required
        dir="ltr"
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className={`${field} rtl:text-end [html[dir=ltr]_&]:pr-16 [html[dir=rtl]_&]:pl-16`}
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-pressed={shown}
        className="absolute bottom-2.5 end-0 text-sm text-olive underline-offset-4 hover:text-basalt hover:underline"
      >
        {shown ? t.auth.hide : t.auth.show}
      </button>
    </span>
  );
}

export function SignUpForm({ t }: { t: Dictionary }) {
  const a = t.auth;
  const uid = useId();
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});
  const err = state.error;
  const f = state.fields ?? {};
  const [type, setType] = useState(f.accountType || "owner");

  return (
    <form action={action} noValidate className="space-y-7" aria-describedby={`${uid}-err`}>
      <input type="hidden" name="locale" value={t.locale} />
      <fieldset>
        <legend className={label}>{a.accountType}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["owner", "resident", "corporate"] as const).map((k) => (
            <label
              key={k}
              className={`inline-flex h-11 cursor-pointer items-center px-4 text-[0.95rem] transition-colors duration-[var(--dur-micro)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-bronze ${
                type === k ? "bg-basalt text-paper" : "border border-basalt/20 text-basalt hover:border-basalt/50"
              }`}
            >
              <input type="radio" name="accountType" value={k} checked={type === k} onChange={() => setType(k)} className="sr-only" />
              {a.types[k]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className={label}>
        {a.name}
        <input name="name" autoComplete="name" required defaultValue={f.name} aria-invalid={err === "nameRequired" || undefined} className={field} />
      </label>
      <div className="grid gap-7 sm:grid-cols-2">
        <label className={label}>
          {a.email}
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            dir="ltr"
            defaultValue={f.email}
            aria-invalid={err === "emailInvalid" || err === "emailTaken" || undefined}
            className={`${field} rtl:text-end`}
          />
        </label>
        <label className={label}>
          {a.phone}
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            dir="ltr"
            defaultValue={f.phone}
            aria-invalid={err === "phoneInvalid" || undefined}
            className={`${field} rtl:text-end`}
          />
        </label>
      </div>
      <div className="grid gap-7 sm:grid-cols-2">
        <label className={label}>
          {a.password}
          <PasswordInput t={t} name="password" autoComplete="new-password" describedBy={`${uid}-hint`} invalid={err === "passwordShort"} />
          <span id={`${uid}-hint`} className="mt-2 block text-xs text-olive">
            {a.passwordHint}
          </span>
        </label>
        <label className={label}>
          {a.confirm}
          <PasswordInput t={t} name="confirm" autoComplete="new-password" invalid={err === "passwordMismatch"} />
        </label>
      </div>

      <ErrorLine id={`${uid}-err`} message={err && a.errors[err as keyof typeof a.errors]} />
      {err === "emailTaken" && (
        <p className="-mt-5 text-sm">
          <Link href={`/${t.locale}/login`} className="underline decoration-bronze underline-offset-4">
            {a.signInLink}
          </Link>
        </p>
      )}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Submit pending={pending} idle={a.submitSignUp} busy={a.pending} />
        <p className="text-sm text-olive">
          {a.haveAccount}{" "}
          <Link href={`/${t.locale}/login`} className="text-basalt underline decoration-bronze underline-offset-4">
            {a.signInLink}
          </Link>
        </p>
      </div>
    </form>
  );
}

export function SignInForm({ t, next }: { t: Dictionary; next?: string }) {
  const a = t.auth;
  const uid = useId();
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});
  const [forgot, setForgot] = useState(false);
  const err = state.error;

  return (
    <form action={action} noValidate className="space-y-7" aria-describedby={`${uid}-err`}>
      <input type="hidden" name="locale" value={t.locale} />
      {next && <input type="hidden" name="next" value={next} />}
      <label className={label}>
        {a.email}
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          dir="ltr"
          defaultValue={state.fields?.email}
          aria-invalid={err === "credentials" || undefined}
          className={`${field} rtl:text-end`}
        />
      </label>
      <label className={label}>
        {a.password}
        <PasswordInput t={t} name="password" autoComplete="current-password" invalid={err === "credentials"} />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <label className="inline-flex cursor-pointer items-center gap-3 text-basalt">
          <input type="checkbox" name="remember" className="h-4 w-4 accent-[var(--color-basalt)]" />
          {a.remember}
        </label>
        <button type="button" onClick={() => setForgot((v) => !v)} aria-expanded={forgot} className="text-olive underline-offset-4 hover:text-basalt hover:underline">
          {a.forgot}
        </button>
      </div>
      {forgot && (
        <p className="border-s-2 border-bronze ps-4 text-sm text-basalt/85">
          {a.forgotHelp}{" "}
          <Link href={`/${t.locale}/contact`} className="underline decoration-bronze underline-offset-4">
            {t.nav.contact}
          </Link>
        </p>
      )}

      <ErrorLine id={`${uid}-err`} message={err && a.errors[err as keyof typeof a.errors]} />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Submit pending={pending} idle={a.submitSignIn} busy={a.pending} />
        <p className="text-sm text-olive">
          {a.noAccount}{" "}
          <Link href={`/${t.locale}/signup`} className="text-basalt underline decoration-bronze underline-offset-4">
            {a.createOne}
          </Link>
        </p>
      </div>
    </form>
  );
}
