/*
  Shared, mutable state read by the WebGL scene every frame.
  DOM sections write scroll progress here; the R3F render loop reads it.
  Kept outside React so scrolling never triggers re-renders.
*/
export type SceneChapter = "hero" | "dive" | "contact";

type SceneState = {
  /** 0..1 progress through each 3D chapter's scroll track */
  progress: Record<SceneChapter, number>;
  /** Which chapter currently owns the camera */
  chapter: SceneChapter;
  /** Pointer in normalised device coords, -1..1 */
  pointer: { x: number; y: number };
  /** True when any transparent 3D window is on screen */
  visible: boolean;
  reducedMotion: boolean;
  /** +1 for LTR, -1 for RTL: mirrors the composition */
  side: 1 | -1;
  /** Louvre spacing on screen, in vh, once the facade fills the view */
  pitchVh: number;
};

export const scene: SceneState = {
  progress: { hero: 0, dive: 0, contact: 0 },
  chapter: "hero",
  pointer: { x: 0, y: 0 },
  visible: true,
  reducedMotion: false,
  side: 1,
  pitchVh: 18,
};

type Listener = () => void;
const listeners = new Set<Listener>();
export const onSceneVisibility = (fn: Listener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export const setSceneVisible = (v: boolean) => {
  if (scene.visible === v) return;
  scene.visible = v;
  listeners.forEach((fn) => fn());
};
