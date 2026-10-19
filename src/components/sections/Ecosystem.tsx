import type { Dictionary } from "@/i18n/en";

/*
  AQAR's place in the Dyafa group, kept in AQAR's own palette.
  The three disciplines are written as a sum that resolves to the mark.
*/
export function Ecosystem({ t }: { t: Dictionary }) {
  const [a, b, c] = t.ecosystem.terms;
  return (
    <section aria-labelledby="eco-title" className="relative z-10 bg-limestone py-[18vh]">
      <div className="shell grid grid-cols-12 gap-x-6 gap-y-16">
        <h2 id="eco-title" className="font-display col-span-12 text-[clamp(1.4rem,2vw,2rem)] text-olive">
          {t.ecosystem.heading}
        </h2>

        <p className="font-display col-span-12 text-[clamp(2.4rem,6.6vw,7rem)] leading-[1.02] text-basalt">
          <span className="block">{a}</span>
          <span className="block ps-[8vw]">
            <span className="text-taupe">+ </span>
            {b}
          </span>
          <span className="block ps-[16vw]">
            <span className="text-taupe">+ </span>
            {c}
          </span>
        </p>

        <div className="col-span-12 flex items-center gap-6 md:col-span-5 md:col-start-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aqar-mark.svg" alt="" className="h-20 w-auto" />
          <p className="max-w-[26rem] text-basalt">{t.ecosystem.text}</p>
        </div>

        <ul className="col-span-12 grid gap-6 sm:grid-cols-3 md:col-span-5 md:col-start-8">
          {t.ecosystem.members.map((m) => (
            <li key={m.name}>
              <p className="text-basalt">{m.name}</p>
              <p className="mt-1 text-sm text-basalt/75">{m.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
