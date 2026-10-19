"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Fragment, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { consentReopened, getConsent, subscribeConsent } from "@/lib/consent";
import { dur, ease } from "@/lib/motion";

type Turn = { id: number; role: "user" | "assistant"; text: string; notice?: boolean; failed?: boolean };

const storeKey = (l: Locale) => `aqar-assistant-${l}`;
const bannerShown = () => getConsent() === null || consentReopened();

/*
  Floating support assistant. Streams replies from /api/assistant.
  The conversation is kept in sessionStorage for this tab only, as a convenience.
*/
export function Assistant({ t, locale }: { t: Dictionary; locale: Locale }) {
  const a = t.assistant;
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const nextId = useRef(1);
  // The cookie banner sits at the bottom edge; keep the launcher out of its way until a choice is made.
  const banner = useSyncExternalStore(subscribeConsent, bannerShown, () => true);

  // Restore this tab's conversation.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storeKey(locale));
      if (!saved) return;
      const parsed = JSON.parse(saved) as Turn[];
      nextId.current = Math.max(0, ...parsed.map((x) => x.id)) + 1;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from browser storage
      setTurns(parsed);
    } catch {}
  }, [locale]);

  useEffect(() => {
    if (busy) return;
    try {
      sessionStorage.setItem(storeKey(locale), JSON.stringify(turns));
    } catch {}
  }, [turns, busy, locale]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [turns, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function close() {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }

  function reset() {
    abortRef.current?.abort();
    setBusy(false);
    setTurns([]);
    inputRef.current?.focus();
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setDraft("");
    const userTurn: Turn = { id: nextId.current++, role: "user", text: q };
    const replyId = nextId.current++;
    const history = [...turns.filter((x) => !x.notice && !x.failed), userTurn].map(({ role, text }) => ({ role, content: text }));
    setTurns((prev) => [...prev, userTurn, { id: replyId, role: "assistant", text: "" }]);
    setBusy(true);

    const update = (fn: (t: Turn) => Turn) => setTurns((prev) => prev.map((x) => (x.id === replyId ? fn(x) : x)));
    const fail = (notice: string) => {
      setTurns((prev) => prev.map((x) => (x.id === userTurn.id ? { ...x, failed: true } : x.id === replyId ? { ...x, text: notice, notice: true } : x)));
    };

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history, locale }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        fail(data.error ?? a.disclaimer);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        // A NUL marks a server notice (declined or failed): it replaces the reply.
        const cut = acc.indexOf("\u0000");
        if (cut >= 0) {
          fail(acc.slice(cut + 1));
          continue;
        }
        update((x) => ({ ...x, text: acc }));
      }
      if (!acc.trim()) fail(a.disclaimer);
    } catch (e) {
      if ((e as Error).name !== "AbortError") fail(a.disclaimer);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  const empty = turns.length === 0;

  return (
    <>
      <AnimatePresence>
        {!open && !banner && (
          <motion.button
            ref={launcherRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls={`${uid}-panel`}
            className="fixed bottom-5 end-5 z-[55] flex h-14 items-center gap-3 bg-basalt pe-6 ps-4 text-paper shadow-[0_10px_30px_-10px_rgb(35_34_36/0.5)] transition-colors duration-[var(--dur-micro)] hover:bg-bronze-deep"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: dur.ui, ease: ease.out }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aqar-mark.svg" alt="" className="h-7 w-auto" />
            <span className="text-[0.95rem]">{a.launcher}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.section
            id={`${uid}-panel`}
            role="dialog"
            aria-modal="false"
            aria-labelledby={`${uid}-title`}
            data-lenis-prevent
            className="fixed inset-x-0 bottom-0 z-[66] flex h-[min(40rem,88svh)] flex-col bg-paper text-basalt shadow-[0_30px_80px_-20px_rgb(35_34_36/0.45)] sm:inset-x-auto sm:bottom-5 sm:end-5 sm:w-[26rem]"
            initial={{ opacity: 0, y: 24, clipPath: "inset(12% 0 0 0)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: dur.ui, ease: ease.out }}
          >
            <div className="flex items-center justify-between gap-3 bg-basalt px-5 py-4 text-paper">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/aqar-mark.svg" alt="" className="h-8 w-auto" />
                <h2 id={`${uid}-title`} className="text-[0.95rem]">
                  {a.title}
                </h2>
              </div>
              <div className="flex items-center gap-1">
                {!empty && (
                  <button type="button" onClick={reset} className="px-2 py-1 text-sm text-sand hover:text-paper">
                    {a.clear}
                  </button>
                )}
                <button type="button" onClick={close} aria-label={a.close} className="grid h-9 w-9 place-items-center text-sand hover:text-paper">
                  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </button>
              </div>
            </div>

            <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite" aria-busy={busy}>
              <Bubble role="assistant">{a.greeting}</Bubble>
              {empty && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {a.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="border border-basalt/20 px-3 py-2 text-start text-sm transition-colors duration-[var(--dur-micro)] hover:border-basalt/60"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {turns.map((x) =>
                x.role === "assistant" && !x.text && busy ? (
                  <p key={x.id} className="text-sm text-olive">
                    <span className="sr-only">{a.thinking}</span>
                    <TypingDots />
                  </p>
                ) : (
                  <Bubble key={x.id} role={x.role} notice={x.notice}>
                    {x.role === "assistant" ? <Rich text={x.text} /> : x.text}
                    {x.notice && (
                      <Link href={`/${locale}/contact`} onClick={close} className="mt-2 block underline decoration-bronze underline-offset-4">
                        {a.contact}
                      </Link>
                    )}
                  </Bubble>
                ),
              )}
            </div>

            <form
              className="border-t border-basalt/10 px-5 pb-4 pt-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
            >
              <div className="flex items-end gap-2">
                <label htmlFor={`${uid}-input`} className="sr-only">
                  {a.placeholder}
                </label>
                <textarea
                  id={`${uid}-input`}
                  ref={inputRef}
                  rows={1}
                  maxLength={2000}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send(draft);
                    }
                  }}
                  placeholder={a.placeholder}
                  className="max-h-32 min-h-11 flex-1 resize-none border-0 border-b border-basalt/25 bg-transparent px-0 py-2 text-[0.95rem] placeholder:text-olive focus:border-bronze focus:outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  disabled={busy || !draft.trim()}
                  className="h-11 bg-basalt px-4 text-sm text-paper transition-colors duration-[var(--dur-micro)] hover:bg-bronze-deep disabled:opacity-40"
                >
                  {a.send}
                </button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-olive">{a.disclaimer}</p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ role, notice, children }: { role: "user" | "assistant"; notice?: boolean; children: ReactNode }) {
  if (role === "user")
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap bg-basalt px-4 py-3 text-[0.95rem] text-paper">{children}</p>
      </div>
    );
  return <div className={`max-w-[92%] text-[0.95rem] leading-relaxed ${notice ? "border-s-2 border-bronze ps-3 text-basalt/85" : ""}`}>{children}</div>;
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-olive"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

/** Minimal, safe rendering of the assistant's text: paragraphs, "- " bullets, [label](url) links. */
function Rich({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*[-•]\s+/.test(l)))
          return (
            <ul key={bi} className="mb-3 list-disc space-y-1 ps-5 last:mb-0">
              {lines.map((l, li) => (
                <li key={li}>
                  <Inline text={l.replace(/^\s*[-•]\s+/, "")} />
                </li>
              ))}
            </ul>
          );
        return (
          <p key={bi} className="mb-3 whitespace-pre-wrap last:mb-0">
            <Inline text={block} />
          </p>
        );
      })}
    </>
  );
}

function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[3]) parts.push(<strong key={m.index} className="font-medium">{m[3]}</strong>);
    else {
      const href = m[2];
      // Only site paths and https links; anything else stays plain text.
      if (href.startsWith("/")) parts.push(<Link key={m.index} href={href} className="underline decoration-bronze underline-offset-4">{m[1]}</Link>);
      else if (href.startsWith("https://"))
        parts.push(<a key={m.index} href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-bronze underline-offset-4">{m[1]}</a>);
      else parts.push(m[1]);
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}
