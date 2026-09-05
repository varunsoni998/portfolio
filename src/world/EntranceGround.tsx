import { useMemo } from "react";
import * as THREE from "three";
import { makePaperTexture } from "./paperTexture";

/**
 * The outside area is deliberately minimal — a ground plane and an
 * ambient sky tone, not a fully modeled exterior. The point of this scene
 * is the door and the name beside it, not the surrounding architecture.
 */
export default function EntranceGround() {
  const groundTexture = useMemo(() => makePaperTexture(512, "#cfc7ae"), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(30, 30), []);

  return (
    <mesh position={[0, 0, 6]} rotation={[-Math.PI / 2, 0, 0]} geometry={geometry}>
      <meshStandardMaterial map={groundTexture} roughness={1} />
    </mesh>
  );
}
