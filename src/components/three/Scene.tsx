"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { StudioEnvironment } from "./StudioEnvironment";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Building, louvreFace, LOUVRE, TOWER_B, type Quality } from "./Building";
import { onSceneVisibility, scene } from "@/lib/scene-store";
import { range, smooth } from "@/lib/motion";
import { useMedia } from "@/lib/use-media";

const PAPER = "#f7f5f0";
const FOV = 32;

type Pose = { pos: THREE.Vector3; target: THREE.Vector3 };
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Hero and contact poses keep the building on the side opposite the text.
const HERO_A: Pose = { pos: v(9.5, 6.2, 19.5), target: v(-4.3, 3.0, 0) };
const HERO_B: Pose = { pos: v(-3.4, 2.2, 15), target: v(-3.0, 4.0, 0) };
const DIVE_A: Pose = { pos: v(12, 7.5, 11), target: v(-1.6, 3.8, 0) };
const CONTACT_A: Pose = { pos: v(-9, 2.2, 19), target: v(-3.6, 3.2, 0) };
const CONTACT_B: Pose = { pos: v(-6, 3.2, 17), target: v(-3.4, 3.5, 0) };
// Portrait screens stack text under the model, so the model sits centred and high.
const HERO_A_P: Pose = { pos: v(9, 9.5, 25), target: v(0.2, 1.4, 0) };
const HERO_B_P: Pose = { pos: v(-4.5, 4.2, 21.5), target: v(0, 1.9, 0) };
const CONTACT_A_P: Pose = { pos: v(-9.5, 4.5, 25), target: v(0.2, 1.2, 0) };
const CONTACT_B_P: Pose = { pos: v(-6.5, 5.5, 23), target: v(0.2, 1.5, 0) };

const tmpPos = new THREE.Vector3();
const tmpTarget = new THREE.Vector3();
const tmpMid = new THREE.Vector3();
const tmpEnd = new THREE.Vector3();
const tmpSun = new THREE.Vector3();
const FACE = louvreFace(3.9);
const LIFT = v(0, 1.2, 0);

function mirror(p: THREE.Vector3, side: number) {
  p.x *= side;
  return p;
}

function lerpPose(a: Pose, b: Pose, t: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) {
  outPos.lerpVectors(a.pos, b.pos, t);
  outTarget.lerpVectors(a.target, b.target, t);
}

/** Distance at which the louvre face exactly fills the viewport width. */
function fillDistance(aspect: number) {
  const face = TOWER_B.d * 0.94;
  const viewH = Math.min(face / aspect, 5);
  return { d: viewH / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2))), viewH };
}

function Rig() {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3().copy(HERO_A.target));
  const sun = useRef<THREE.DirectionalLight>(null);
  const warm = useMemo(() => new THREE.Color("#fff0d8"), []);
  const dusk = useMemo(() => new THREE.Color("#ffb26b"), []);

  useFrame((_, dt) => {
    const side = scene.side;
    const aspect = size.width / size.height;
    const pointerAmt = scene.reducedMotion ? 0 : 1;

    let sunAz = 0.6;
    let sunEl = 0.9;
    let sunTint = 0;

    if (scene.chapter === "hero") {
      const t = smooth(scene.progress.hero);
      if (aspect < 0.9) lerpPose(HERO_A_P, HERO_B_P, t, tmpPos, tmpTarget);
      else lerpPose(HERO_A, HERO_B, t, tmpPos, tmpTarget);
      mirror(tmpPos, side);
      mirror(tmpTarget, side);
      sunAz = 0.4 + t * 0.9;
      sunEl = 0.95 - t * 0.25;
    } else if (scene.chapter === "dive") {
      const t = smooth(range(scene.progress.dive, 0, 0.62));
      const { d, viewH } = fillDistance(aspect);
      tmpEnd.copy(FACE.center).addScaledVector(FACE.normal, d);
      // Arc through a raised midpoint so the approach reads as a camera move, not a zoom.
      tmpMid.copy(DIVE_A.pos).lerp(tmpEnd, 0.55).add(LIFT);
      const a = 1 - t;
      tmpPos.set(0, 0, 0)
        .addScaledVector(DIVE_A.pos, a * a)
        .addScaledVector(tmpMid, 2 * a * t)
        .addScaledVector(tmpEnd, t * t);
      tmpTarget.lerpVectors(DIVE_A.target, FACE.center, smooth(range(t, 0, 0.8)));
      scene.pitchVh = (100 * LOUVRE.pitch) / viewH;
      sunAz = 1.2;
      sunEl = 0.75;
    } else {
      const t = smooth(scene.progress.contact);
      if (aspect < 0.9) lerpPose(CONTACT_A_P, CONTACT_B_P, t, tmpPos, tmpTarget);
      else lerpPose(CONTACT_A, CONTACT_B, t, tmpPos, tmpTarget);
      mirror(tmpPos, side);
      mirror(tmpTarget, side);
      sunAz = -0.9 * side;
      sunEl = 0.28;
      sunTint = 1;
    }

    // Pointer parallax: a slight lean, strongest in the hero.
    const lean = scene.chapter === "dive" ? 0.15 : 0.7;
    tmpPos.x += scene.pointer.x * lean * pointerAmt;
    tmpPos.y += scene.pointer.y * lean * 0.5 * pointerAmt;

    const k = scene.reducedMotion ? 1 : 1 - Math.exp(-dt * 3.2);
    camera.position.lerp(tmpPos, k);
    look.current.lerp(tmpTarget, k);
    camera.lookAt(look.current);

    if (sun.current) {
      const r = 18;
      tmpSun.set(r * Math.cos(sunEl) * Math.sin(sunAz), r * Math.sin(sunEl), r * Math.cos(sunEl) * Math.cos(sunAz));
      sun.current.position.lerp(tmpSun, k);
      sun.current.color.lerpColors(warm, dusk, sunTint);
      sun.current.intensity = THREE.MathUtils.lerp(sun.current.intensity, sunTint ? 1.7 : 2.6, k);
    }
  });

  return (
    <directionalLight
      ref={sun}
      castShadow
      position={[8, 14, 10]}
      intensity={2.6}
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
      shadow-camera-left={-9}
      shadow-camera-right={9}
      shadow-camera-top={11}
      shadow-camera-bottom={-4}
      shadow-camera-near={1}
      shadow-camera-far={45}
    />
  );
}

/* A few drafting elements drifting around the model: thin slabs and frames. */
function Floaters({ quality }: { quality: Quality }) {
  const group = useRef<THREE.Group>(null);
  const items = useMemo(
    () =>
      [
        { p: [5.2, 4.8, -5.5], s: [1.4, 0.03, 0.6], r: 0.4 },
        { p: [-1.2, 6.6, -7.5], s: [0.8, 0.03, 1.9], r: 0.9 },
        { p: [7.2, 2.2, -2.5], s: [0.7, 0.03, 0.7], r: 0.2 },
        { p: [2.4, 7.4, -9], s: [1.8, 0.03, 0.4], r: 1.2 },
      ].slice(0, quality === "high" ? 4 : 2),
    [quality],
  );
  // Slight emissive keeps the undersides from reading as dark planks.
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ece8df", emissive: "#d9d4c8", emissiveIntensity: 0.55, roughness: 0.9 }), []);
  const bronze = useMemo(() => new THREE.MeshStandardMaterial({ color: "#b98a5a", roughness: 0.4, metalness: 0.7 }), []);

  useFrame((state) => {
    if (!group.current) return;
    group.current.scale.x = scene.side;
    if (scene.reducedMotion) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((c, i) => {
      c.position.y = items[i].p[1] + Math.sin(t * 0.35 + i * 1.7) * 0.18;
      c.rotation.y = items[i].r + Math.sin(t * 0.12 + i) * 0.12;
    });
  });

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <group key={i} position={it.p as [number, number, number]} rotation={[0, it.r, 0]}>
          <mesh material={mat} castShadow={quality === "high"}>
            <boxGeometry args={it.s as [number, number, number]} />
          </mesh>
          {i % 2 === 0 && (
            <mesh material={bronze} position={[0, 0.03, 0]}>
              <boxGeometry args={[it.s[0], 0.012, 0.02]} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#f4f1ea" roughness={1} />
    </mesh>
  );
}

export default function Scene({ onReady }: { onReady?: () => void }) {
  // Device-aware quality: phones and low-core machines get fewer instances,
  // no shadow maps and a lower pixel ratio. PerformanceMonitor drops further.
  const coarse = useMedia("(max-width: 767px), (pointer: coarse)");
  const weak = typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4;
  const quality: Quality = coarse || weak ? "low" : "high";
  const [declined, setDeclined] = useState(false);
  const dpr: [number, number] = declined ? [1, 1] : quality === "low" ? [1, 1.5] : [1, 1.75];
  const [active, setActive] = useState(true);

  useEffect(() => onSceneVisibility(() => setActive(scene.visible)), []);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={dpr}
      shadows={quality === "high"}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: FOV, near: 0.1, far: 120, position: HERO_A.pos.toArray() }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        onReady?.();
      }}
    >
      <color attach="background" args={[PAPER]} />
      <fog attach="fog" args={[PAPER, 20, 44]} />
      <PerformanceMonitor onDecline={() => setDeclined(true)} flipflops={2} />
      <hemisphereLight args={["#fbf8f1", "#d6d2c4", 1.05]} />
      <Rig />
      <Building quality={quality} />
      <Floaters quality={quality} />
      <Ground />
      <StudioEnvironment />
    </Canvas>
  );
}
