"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

/*
  Reflection environment for the bronze: three soft light panels baked once
  into a PMREM cube. Same idea as a photographer's softboxes, with no HDR
  file and no loaders shipped.
*/
const PANELS: { pos: [number, number, number]; size: [number, number]; color: string; intensity: number }[] = [
  { pos: [0, 6, -8], size: [14, 4], color: "#fff6e8", intensity: 2.2 },
  { pos: [-8, 3, 4], size: [10, 3], color: "#f1ece2", intensity: 1.2 },
  { pos: [8, 2, 4], size: [10, 2], color: "#cd9a62", intensity: 0.8 },
];

function bake(gl: THREE.WebGLRenderer) {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color("#3a3832");
  const disposables: { dispose(): void }[] = [];
  for (const p of PANELS) {
    const geo = new THREE.PlaneGeometry(...p.size);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color).multiplyScalar(p.intensity), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...p.pos);
    mesh.lookAt(0, 0, 0);
    studio.add(mesh);
    disposables.push(geo, mat);
  }
  const pmrem = new THREE.PMREMGenerator(gl);
  const target = pmrem.fromScene(studio, 0.04);
  pmrem.dispose();
  disposables.forEach((d) => d.dispose());
  return target;
}

export function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const target = useMemo(() => bake(gl), [gl]);
  useEffect(() => () => target.dispose(), [target]);
  // Attaches to scene.environment.
  return <primitive object={target.texture} attach="environment" />;
}
