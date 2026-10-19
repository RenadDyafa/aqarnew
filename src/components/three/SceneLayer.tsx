"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { scene } from "@/lib/scene-store";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

let webgl: boolean | undefined;
function hasWebGL() {
  if (webgl === undefined) {
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}
const noSubscribe = () => () => {};

/**
 * Fixed full-screen WebGL layer behind the page. Opaque sections cover it;
 * transparent "window" sections (hero, dive, contact) reveal it.
 */
export function SceneLayer({ dir }: { dir: "ltr" | "rtl" }) {
  const supported = useSyncExternalStore(noSubscribe, hasWebGL, () => null);
  const [ready, setReady] = useState(false);
  // Switching locale keeps the previous page in a hidden <Activity>. Hiding runs
  // effect cleanups: unmount the canvas then so only one WebGL context is live.
  const [live, setLive] = useState(true);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setLive(true));
    return () => {
      cancelAnimationFrame(raf);
      setLive(false);
      setReady(false);
    };
  }, []);

  useEffect(() => {
    scene.side = dir === "rtl" ? -1 : 1;
  }, [dir]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => (scene.reducedMotion = mq.matches);
    syncMotion();
    mq.addEventListener("change", syncMotion);

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      scene.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scene.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      mq.removeEventListener("change", syncMotion);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-paper">
      {supported && live && (
        <div
          className="absolute inset-0 transition-opacity ease-[var(--ease-out-quint)]"
          style={{ opacity: ready ? 1 : 0, transitionDuration: "var(--dur-cine)" }}
        >
          <Scene onReady={() => setReady(true)} />
        </div>
      )}
      {supported === false && <StaticModel />}
    </div>
  );
}

/* No-WebGL fallback: the mark, large and quiet, where the model would stand. */
function StaticModel() {
  return (
    <div className="absolute inset-0 flex items-center justify-end pe-[8vw] opacity-90">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/aqar-mark.svg" alt="" className="h-[62vh] w-auto" />
    </div>
  );
}
