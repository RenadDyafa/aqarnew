import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Aqar Dyafa: real estate managed with hospitality discipline";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const mark = `data:image/svg+xml;base64,${(await readFile(join(process.cwd(), "public/aqar-mark.svg"))).toString("base64")}`;

// Latin-only text: the default OG font has no Arabic glyphs, so both locales share this card.
export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "#f7f5f0", padding: "0 96px", gap: 72 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mark} width={300} height={389} alt="" />
        <div style={{ display: "flex", flexDirection: "column", color: "#232224" }}>
          <div style={{ fontSize: 132, letterSpacing: -4, lineHeight: 1 }}>AQAR</div>
          <div style={{ fontSize: 44, marginTop: 28, color: "#6d6d61", lineHeight: 1.2, maxWidth: 640 }}>
            Real estate managed with hospitality discipline.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
