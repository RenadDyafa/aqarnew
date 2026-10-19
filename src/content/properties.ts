import type { Locale } from "@/i18n/config";
import { media, type MediaKey } from "@/content/media";

/*
  Assets shown on the homepage property map. Add only confirmed assets that
  Aqar Dyafa manages; nothing here is invented. Each entry needs:
    - id: a short unique slug, e.g. "khobar-residence-1"
    - name / location: Arabic and English text
    - type: "residential" | "commercial" | "hospitality" (the asset types in the brand reference)
    - service: "management" | "leasing" (what Aqar Dyafa does for it)
    - lat / lng: map coordinates (right-click the spot in Google Maps to copy them)
    - image: optional photo URL (Unsplash is already allowed; add other hosts in next.config.ts)
  The type filters appear on the map automatically once there is at least one asset.
*/
export type AssetType = "residential" | "commercial" | "hospitality";
export type AssetService = "management" | "leasing";

export type MappedAsset = {
  id: string;
  name: Record<Locale, string>;
  location: Record<Locale, string>;
  type: AssetType;
  service: AssetService;
  lat: number;
  lng: number;
  image?: string;
};

const photo = (key: MediaKey) => `${media[key].src}?w=900&q=70&auto=format&fit=crop`;

/*
  EXAMPLES ONLY, added at the marketing team's request (2026-10-19) to show how
  the map works. They are not real Aqar Dyafa assets: replace them with the
  confirmed list before launch.
*/
export const mappedAssets: MappedAsset[] = [
  {
    id: "example-khobar-residential",
    name: { ar: "مجمع سكني", en: "Residential community" },
    location: { ar: "الخبر", en: "Al Khobar" },
    type: "residential",
    service: "management",
    lat: 26.2794,
    lng: 50.2083,
    image: photo("palmResidences"),
  },
  {
    id: "example-riyadh-commercial",
    name: { ar: "مبنى تجاري", en: "Commercial building" },
    location: { ar: "الرياض", en: "Riyadh" },
    type: "commercial",
    service: "leasing",
    lat: 24.7136,
    lng: 46.6753,
    image: photo("faisaliahTower"),
  },
  {
    id: "example-jeddah-hospitality",
    name: { ar: "أصل مرتبط بالضيافة", en: "Hospitality-linked asset" },
    location: { ar: "جدة", en: "Jeddah" },
    type: "hospitality",
    service: "management",
    lat: 21.5433,
    lng: 39.1728,
    image: photo("courtyardPool"),
  },
  {
    id: "example-abha-residential",
    name: { ar: "وحدات سكنية للتأجير", en: "Residential units for lease" },
    location: { ar: "أبها", en: "Abha" },
    type: "residential",
    service: "leasing",
    lat: 18.2164,
    lng: 42.5053,
    image: photo("apartmentsDusk"),
  },
];

