/*
  Placeholder photography (Unsplash licence) chosen to match the AQAR brief:
  real architectural detail, natural light, straight lines, warm tone.
  Replace each `src` with AQAR's own photography of managed assets before launch.
*/
const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const media = {
  louvres: { src: u("1785735758311-8001dc5f5424"), credit: "boris misevic" },
  threshold: { src: u("1785404042615-6b5ae99a98f0"), credit: "Unsplash" },
  riyadhTwinTowers: { src: u("1775144463375-bc6b2913fd54"), credit: "MO B.H" },
  courtyardDusk: { src: u("1760260864042-bdf1a0443aaf"), credit: "Agnieszka Stankiewicz" },
  courtyardPool: { src: u("1760261799672-2469a6c4c6f3"), credit: "Agnieszka Stankiewicz" },
  slatResidence: { src: u("1790214120456-b29088d82600"), credit: "nad Assa" },
  whitePalms: { src: u("1708118816156-9a5d2c816fe7"), credit: "Abdelrahman Sarayreh" },
  apartmentsDusk: { src: u("1610286986642-057ece0c3656"), credit: "Alexandre Lallemand" },
  palmResidences: { src: u("1534655610770-dd69616f05ff"), credit: "Unsplash" },
  balconies: { src: u("1766350204825-29d9a282edb6"), credit: "Antoine Pouligny" },
  stepped: { src: u("1765774946888-4452749feb79"), credit: "Dean Zhang" },
  ceiling: { src: u("1782216703062-698ac15e317a"), credit: "Unsplash" },
  lobby: { src: u("1758194190679-198a77cba84f"), credit: "Aalo Lens" },
  faisaliahTower: { src: u("1669101564304-1da32c23f8ec"), credit: "Omar Al-Ghosson" },
} as const;

export type MediaKey = keyof typeof media;
