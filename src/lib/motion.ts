// Motion system. Durations in seconds; mirrored as CSS variables in globals.css.
export const dur = {
  micro: 0.26, // hover, press, small state changes (200–400ms)
  ui: 0.56, // panels, menus, tab content (400–700ms)
  large: 1.1, // image reveals, section entrances (800–1400ms)
  cine: 1.6, // hero sequence, signature transitions (1200–2000ms)
} as const;

export const ease = {
  out: [0.22, 1, 0.36, 1] as const, // decelerate: things arriving
  inOut: [0.76, 0, 0.24, 1] as const, // curtains, masks
  drift: [0.45, 0, 0.2, 1] as const, // slow camera-like moves
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Map v from [a, b] to [0, 1], clamped. */
export const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
