"use client";

import { useLenis } from "lenis/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/en";
import { EnquiryForm } from "./EnquiryForm";

export function useEnquiryDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();
  const open = useCallback(() => {
    ref.current?.showModal();
    lenis?.stop();
  }, [lenis]);
  const close = useCallback(() => ref.current?.close(), []);
  return { ref, open, close, lenis };
}

export function EnquiryDialog({ t, control }: { t: Dictionary; control: ReturnType<typeof useEnquiryDialog> }) {
  const f = t.contact.form;
  const { ref, close, lenis } = control;
  // Remount the form on each open so a sent confirmation resets to a fresh form.
  const [session, setSession] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClose = () => {
      lenis?.start();
      setSession((n) => n + 1);
    };
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, [ref, lenis]);

  return (
    <dialog
      ref={ref}
      data-lenis-prevent
      aria-labelledby="enquiry-title"
      className="enquiry m-auto max-h-[92svh] w-[min(40rem,calc(100vw-2rem))] overflow-y-auto bg-paper p-0 text-basalt backdrop:bg-basalt/55"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="p-[clamp(1.5rem,4vw,3rem)]">
        <div className="mb-8 flex items-start justify-between gap-6">
          <h2 id="enquiry-title" className="font-display text-[clamp(2rem,4vw,2.8rem)]">
            {f.title}
          </h2>
          <button type="button" onClick={close} className="text-olive underline-offset-4 hover:underline">
            {f.close}
          </button>
        </div>
        <EnquiryForm key={session} t={t} intent="owner" autoFocus />
      </div>
    </dialog>
  );
}
