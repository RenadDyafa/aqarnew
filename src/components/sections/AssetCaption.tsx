import type { Dictionary } from "@/i18n/en";

/*
  Project details set over a full-bleed photograph. Shared by Dive and Assets.
  The caption carries its own dark backing (a tall gradient that reaches solid
  basalt behind the text) so it stays legible over any photograph, including
  high-contrast ones like louvres or bright sky.
*/
export function AssetCaption({ t, index }: { t: Dictionary; index: number }) {
  const a = t.assets.items[index];
  const n = t.assets.items.length;
  const details = [
    { label: t.assets.labels.type, value: a.type },
    { label: t.assets.labels.role, value: a.role },
  ];

  return (
    <div className="bg-linear-to-t from-basalt/95 from-35% via-basalt/70 to-transparent pt-[22vh] text-paper [text-shadow:0_1px_14px_rgb(0_0_0/0.35)]">
      <div className="shell grid grid-cols-12 gap-x-6 gap-y-8 pb-[8vh]">
        <div className="col-span-12 lg:col-span-7">
          <p className="mb-4 text-sm tabular-nums text-sand">
            {String(index + 1).padStart(2, "0")} {t.assets.of} {String(n).padStart(2, "0")}
          </p>
          <h3 className="font-display text-[clamp(2.6rem,7vw,7rem)] leading-[0.95]">{a.title}</h3>
        </div>
        <dl className="col-span-12 grid gap-x-6 gap-y-5 self-end sm:grid-cols-2 lg:col-span-5">
          {details.map((d) => (
            <div key={d.label} className="border-s border-bronze/70 ps-4">
              <dt className="text-[0.8rem] text-sand">{d.label}</dt>
              <dd className="mt-1 text-[1rem] font-medium leading-snug text-paper">{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
