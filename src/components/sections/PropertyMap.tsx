"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/en";
import { ksaMap, project } from "@/content/ksa-map";
import { mappedAssets, type AssetType } from "@/content/properties";
import { dur, ease } from "@/lib/motion";

/*
  The Kingdom as a field of bronze points inside its drawn outline. Pins mark
  the units and assets listed in src/content/properties.ts; selecting one
  opens a card with a route into the contact page. Type filters appear once
  assets are listed. No prices: the brand reference keeps Aqar Dyafa away
  from listing-portal language, and no asset is shown until it is confirmed.
*/
const PIN = "M12 0C5.4 0 0 5.2 0 11.7 0 20 12 31 12 31s12-11 12-19.3C24 5.2 18.6 0 12 0z";

export function PropertyMap({ t }: { t: Dictionary }) {
  const m = t.propertyMap;
  const lang = t.locale;
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const [filter, setFilter] = useState<AssetType | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);

  const visible = useMemo(() => (filter === "all" ? mappedAssets : mappedAssets.filter((a) => a.type === filter)), [filter]);
  // The card always shows an asset: the one picked, or the first one the filter leaves.
  const asset = visible.find((a) => a.id === selected) ?? visible[0];
  const hasAssets = mappedAssets.length > 0;
  const filters: (AssetType | "all")[] = ["all", "residential", "commercial", "hospitality"];
  const { width, height, outline } = ksaMap;
  const inView = { once: true, amount: 0.3 } as const;

  // Rounded so server and client render identical attributes (float drift breaks hydration).
  const pins = visible.map((a) => {
    const { x, y } = project(a.lat, a.lng);
    return {
      id: a.id,
      label: a.name[lang],
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    };
  });

  return (
    <section id="map" aria-labelledby="map-title" className="relative z-10 bg-paper py-[14vh]">
      <div className="shell">
        <div className="mx-auto max-w-[44rem] text-center">
          <h2 id="map-title" className="font-display text-[clamp(2.2rem,4.4vw,4rem)] leading-[1.02] text-basalt">
            {m.heading}
          </h2>
          <p className="mt-5 text-[1.1rem] leading-[1.7] text-olive">{m.text}</p>
        </div>

        {hasAssets && (
          <div role="group" aria-label={m.filterLabel} className="mt-10 flex flex-wrap justify-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`h-11 px-6 text-[0.95rem] transition-colors duration-[var(--dur-micro)] ${
                  filter === f ? "bg-bronze text-basalt" : "border border-basalt/20 text-basalt/75 hover:border-basalt/50"
                }`}
              >
                {m.filters[f]}
              </button>
            ))}
          </div>
        )}

        <div className="relative mt-10 border border-basalt/10 bg-limestone">
          <div className="grid grid-cols-12 items-center gap-6 p-4 md:p-8">
            <div className={hasAssets ? "col-span-12 md:col-span-7" : "col-span-12 mx-auto w-full max-w-[44rem]"}>
              <svg viewBox={`0 0 ${width} ${height}`} role="group" aria-label={m.alt} className="h-auto w-full">
                <defs>
                  <pattern id={`${uid}-dots`} width="9" height="9" patternUnits="userSpaceOnUse">
                    <circle cx="4.5" cy="4.5" r="1.5" className="fill-bronze" />
                  </pattern>
                  <clipPath id={`${uid}-clip`}>
                    <path d={outline} />
                  </clipPath>
                </defs>

                <motion.rect
                  width={width}
                  height={height}
                  fill={`url(#${uid}-dots)`}
                  clipPath={`url(#${uid}-clip)`}
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={inView}
                  transition={{
                    duration: dur.cine,
                    ease: ease.out,
                    delay: 0.6,
                  }}
                />
                <motion.path
                  d={outline}
                  fill="none"
                  className="stroke-bronze"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={inView}
                  transition={{
                    duration: 2.4,
                    ease: ease.inOut,
                  }}
                />

                {pins.map((p) => {
                  const on = asset?.id === p.id;
                  const s = on ? 1.45 : 1.15;
                  return (
                    <g
                      key={p.id}
                      role="button"
                      tabIndex={0}
                      aria-label={p.label}
                      aria-pressed={on}
                      onClick={() => setSelected(p.id)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelected(p.id))}
                      className="cursor-pointer outline-none [&:focus-visible>path]:stroke-basalt"
                    >
                      <title>{p.label}</title>
                      <g
                        transform={`translate(${p.x - 12 * s} ${p.y - 31 * s}) scale(${s})`}
                        style={{
                          transition: "transform 200ms",
                        }}
                      >
                        <path d={PIN} className={on ? "fill-bronze-deep" : "fill-bronze"} strokeWidth={1.5} />
                        <circle cx="12" cy="11.5" r="4.2" className="fill-paper" />
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {hasAssets && (
              <div className="col-span-12 md:col-span-5">
                <AnimatePresence mode="wait">
                  {asset && (
                    <motion.article
                      key={asset.id}
                      className="bg-paper p-4 shadow-[0_24px_60px_-20px_rgb(35_34_36/0.45)]"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 14 }}
                      transition={{
                        duration: dur.ui,
                        ease: ease.out,
                      }}
                    >
                      <>
                        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                          {asset.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={asset.image} alt="" className="h-full w-full object-cover" />
                          )}
                          <span className="absolute start-3 top-3 bg-bronze px-3 py-1 text-sm text-basalt">{m.filters[asset.type]}</span>
                        </div>
                        <div className="mt-4 bg-limestone p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-display text-[1.5rem] leading-tight text-basalt">{asset.name[lang]}</h3>
                              <p className="mt-1 text-sm text-olive">{asset.location[lang]}</p>
                            </div>
                            <span className="shrink-0 border border-bronze/60 px-2.5 py-1 text-xs text-bronze-deep">
                              {m.services[asset.service]}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/${lang}/contact?intent=${asset.service === "leasing" ? "tenant" : "owner"}`}
                          className="mt-4 flex h-12 items-center justify-center bg-basalt text-paper transition-colors duration-[var(--dur-micro)] hover:bg-bronze-deep"
                        >
                          {asset.service === "leasing" ? m.leasingCta : m.managementCta}
                        </Link>
                      </>
                    </motion.article>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {!hasAssets && (
          <div className="mt-8 flex justify-center">
            <Link
              href={`/${lang}/contact?intent=owner`}
              className="flex h-12 items-center bg-basalt px-8 text-paper transition-colors duration-[var(--dur-micro)] hover:bg-bronze-deep"
            >
              {m.managementCta}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
