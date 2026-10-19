"use client";

import { useEffect, type RefObject } from "react";
import { useMotionValueEvent, useScroll, type MotionValue } from "motion/react";
import { scene, setSceneVisible, type SceneChapter } from "./scene-store";

const onScreen = new Set<SceneChapter>();

/**
 * Registers a transparent section as a window onto the 3D scene.
 * Writes its scroll progress into the scene store and hands camera
 * ownership to whichever window is on screen.
 */
export function useSceneChapter(ref: RefObject<HTMLElement | null>, chapter: SceneChapter): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (scene.chapter === chapter) scene.progress[chapter] = v;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onScreen.add(chapter);
          scene.chapter = chapter;
          scene.progress[chapter] = scrollYProgress.get();
        } else {
          onScreen.delete(chapter);
        }
        setSceneVisible(onScreen.size > 0);
      },
      { rootMargin: "10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      onScreen.delete(chapter);
    };
  }, [ref, chapter, scrollYProgress]);

  return scrollYProgress;
}
