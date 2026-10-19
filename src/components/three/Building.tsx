"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/*
  The AQAR mark, built as an architectural model.
  An open-top block whose two front walls are notched into the "M",
  holding a finned tower and a taller louvred tower, as in the logo.
  All geometry is procedural: no model download, a few hundred triangles
  plus two instanced meshes.
*/

export const BLOCK = { W: 4, H: 2.2, T: 0.12, GAP: 0.07 };
// Tower B carries the louvre facade the camera dives into.
export const TOWER_B = { x: -0.25, z: -1.0, w: 0.9, d: 1.6, h: 7 };
const TOWER_A = { x: -0.56, z: 0.32, w: 1.0, d: 1.0, h: 5 };
export const LOUVRE = { pitch: 0.16, depth: 0.2, thick: 0.035, tilt: 0.42 };

export type Quality = "high" | "low";

const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const p = new THREE.Vector3();
const s = new THREE.Vector3(1, 1, 1);

function mWallShape(L: number, H: number) {
  // Face-local outline: an outer leg to the ground, then the bottom edge
  // lifted to just over half height up to the centre corner. Two of these
  // meeting at the corner read as the M.
  const leg = L * 0.47;
  const lift = H * 0.53;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(leg, 0);
  shape.lineTo(leg, lift);
  shape.lineTo(L, lift);
  shape.lineTo(L, H);
  shape.lineTo(0, H);
  shape.closePath();
  return shape;
}

export function Building({ quality }: { quality: Quality }) {
  const shadows = quality === "high";
  const { W, H, T, GAP } = BLOCK;
  const L = W - GAP;

  const materials = useMemo(
    () => ({
      stone: new THREE.MeshStandardMaterial({ color: "#d9d4c6", roughness: 0.86, metalness: 0 }),
      core: new THREE.MeshStandardMaterial({ color: "#8a8574", roughness: 0.74, metalness: 0.04 }),
      coreDark: new THREE.MeshStandardMaterial({ color: "#6d6d61", roughness: 0.8, metalness: 0.04 }),
      bronze: new THREE.MeshStandardMaterial({ color: "#b8966e", roughness: 0.4, metalness: 0.62, envMapIntensity: 1.25 }),
      plinth: new THREE.MeshStandardMaterial({ color: "#e6e2d8", roughness: 0.95 }),
    }),
    [],
  );

  const wallGeo = useMemo(
    () => new THREE.ExtrudeGeometry(mWallShape(L, H), { depth: T, bevelEnabled: false }),
    [L, H, T],
  );

  // Tower A: vertical bronze fins on its two street faces, stepping down
  // towards the outer edge like the logo's left tower.
  const finRef = useRef<THREE.InstancedMesh>(null);
  const finCount = quality === "high" ? 9 : 6;
  useLayoutEffect(() => {
    const mesh = finRef.current;
    if (!mesh) return;
    const { x, z, w, d, h } = TOWER_A;
    let i = 0;
    for (let face = 0; face < 2; face++) {
      for (let k = 0; k < finCount; k++) {
        const t = k / (finCount - 1);
        const fh = h * (0.86 + 0.14 * (face === 0 ? t : 1 - t));
        if (face === 0) {
          // +z face, fins run along x
          p.set(x - w / 2 + 0.06 + t * (w - 0.12), fh / 2, z + d / 2 + 0.06);
          e.set(0, 0, 0);
        } else {
          // +x face, fins run along z
          p.set(x + w / 2 + 0.06, fh / 2, z + d / 2 - 0.06 - t * (d - 0.12));
          e.set(0, Math.PI / 2, 0);
        }
        q.setFromEuler(e);
        s.set(1, fh, 1);
        m4.compose(p, q, s);
        mesh.setMatrixAt(i++, m4);
      }
    }
    mesh.count = i;
    mesh.instanceMatrix.needsUpdate = true;
  }, [finCount]);

  // Tower B: tilted horizontal louvres over its +x face.
  const louvreRef = useRef<THREE.InstancedMesh>(null);
  const pitch = quality === "high" ? LOUVRE.pitch : LOUVRE.pitch * 1.4;
  const louvreCount = Math.floor((TOWER_B.h - 0.3) / pitch);
  useLayoutEffect(() => {
    const mesh = louvreRef.current;
    if (!mesh) return;
    const { x, z, w } = TOWER_B;
    // Slat long axis runs along z; tilt around it so the blades read as louvres.
    q.setFromEuler(e.set(0, 0, -LOUVRE.tilt));
    s.set(1, 1, 1);
    for (let k = 0; k < louvreCount; k++) {
      p.set(x + w / 2 + LOUVRE.depth / 2 + 0.02, 0.3 + k * pitch, z);
      m4.compose(p, q, s);
      mesh.setMatrixAt(k, m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [louvreCount, pitch]);

  return (
    <group rotation={[0, -Math.PI / 4, 0]}>
      {/* Model plinth */}
      <mesh position={[0, -0.03, 0]} receiveShadow material={materials.plinth}>
        <boxGeometry args={[W + 1.6, 0.06, W + 1.6]} />
      </mesh>

      {/* Front walls with the M notch */}
      <mesh geometry={wallGeo} material={materials.stone} position={[-W / 2, 0, W / 2 - T]} castShadow={shadows} receiveShadow />
      <mesh
        geometry={wallGeo}
        material={materials.stone}
        position={[W / 2, 0, -W / 2]}
        rotation={[0, -Math.PI / 2, 0]}
        castShadow={shadows}
        receiveShadow
      />
      {/* Back walls */}
      <mesh position={[-GAP / 2, H / 2, -W / 2 + T / 2]} material={materials.stone} castShadow={shadows} receiveShadow>
        <boxGeometry args={[W - GAP, H, T]} />
      </mesh>
      <mesh position={[-W / 2 + T / 2, H / 2, GAP / 2]} material={materials.stone} castShadow={shadows} receiveShadow>
        <boxGeometry args={[T, H, W - GAP]} />
      </mesh>
      {/* Floor of the block, slightly sunk */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.plinth} receiveShadow>
        <planeGeometry args={[W - 0.2, W - 0.2]} />
      </mesh>

      {/* Tower A: core + fins */}
      <mesh position={[TOWER_A.x, (TOWER_A.h * 0.84) / 2, TOWER_A.z]} material={materials.coreDark} castShadow={shadows} receiveShadow>
        <boxGeometry args={[TOWER_A.w - 0.04, TOWER_A.h * 0.84, TOWER_A.d - 0.04]} />
      </mesh>
      <instancedMesh ref={finRef} args={[undefined, undefined, finCount * 2]} material={materials.bronze} castShadow={shadows} receiveShadow>
        <boxGeometry args={[0.035, 1, 0.12]} />
      </instancedMesh>

      {/* Tower B: core, crown and louvres */}
      <mesh position={[TOWER_B.x, TOWER_B.h / 2, TOWER_B.z]} material={materials.core} castShadow={shadows} receiveShadow>
        <boxGeometry args={[TOWER_B.w, TOWER_B.h, TOWER_B.d]} />
      </mesh>
      <mesh position={[TOWER_B.x + 0.06, TOWER_B.h + 0.03, TOWER_B.z]} material={materials.bronze} castShadow={shadows}>
        <boxGeometry args={[TOWER_B.w + 0.32, 0.06, TOWER_B.d + 0.08]} />
      </mesh>
      <instancedMesh ref={louvreRef} args={[undefined, undefined, louvreCount]} material={materials.bronze} castShadow={shadows} receiveShadow>
        <boxGeometry args={[LOUVRE.depth, LOUVRE.thick, TOWER_B.d + 0.04]} />
      </instancedMesh>
    </group>
  );
}

/** World-space centre and outward normal of tower B's louvre face. */
export function louvreFace(y: number) {
  const local = new THREE.Vector3(TOWER_B.x + TOWER_B.w / 2 + LOUVRE.depth, y, TOWER_B.z);
  const rot = new THREE.Matrix4().makeRotationY(-Math.PI / 4);
  const center = local.applyMatrix4(rot);
  const normal = new THREE.Vector3(1, 0, 0).applyMatrix4(rot).normalize();
  return { center, normal, width: TOWER_B.d };
}
