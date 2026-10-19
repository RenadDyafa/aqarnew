import Image from "next/image";
import type { ReactNode } from "react";
import type { Dictionary } from "@/i18n/en";
import { media } from "@/content/media";

/* Two-column frame for sign-in and sign-up: a photograph with the brand promise, and the form. */
export function AuthShell({ t, title, intro, children }: { t: Dictionary; title: string; intro: string; children: ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className="relative z-10 grid min-h-svh bg-paper outline-none lg:grid-cols-12">
      <aside className="relative hidden overflow-hidden bg-basalt lg:col-span-5 lg:block">
        <Image src={media.threshold.src} alt="" fill priority sizes="42vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-linear-to-t from-basalt/90 via-basalt/30 to-basalt/10" />
        <div className="absolute inset-x-0 bottom-0 p-[clamp(2rem,4vw,4rem)] text-paper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aqar-mark.svg" alt="" className="h-14 w-auto" />
          <p className="font-display mt-8 max-w-[14ch] text-[clamp(2.2rem,3.4vw,3.4rem)] leading-[1.02]">{t.consult.heading}</p>
          <p className="mt-4 max-w-[28rem] text-sand">{t.footer.line}</p>
        </div>
      </aside>

      <section className="shell flex flex-col justify-center pb-[10vh] pt-[clamp(7rem,16vh,10rem)] lg:col-span-7 lg:px-[clamp(3rem,7vw,8rem)]">
        <div className="w-full max-w-[34rem]">
          <h1 className="font-display text-[clamp(2.8rem,5.4vw,4.8rem)] leading-[0.98] text-basalt">{title}</h1>
          <p className="mt-5 text-[1.05rem] text-olive">{intro}</p>
          <div className="mt-12">{children}</div>
        </div>
      </section>
    </main>
  );
}
