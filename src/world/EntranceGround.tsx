import { useMemo } from "react";
import * as THREE from "three";
import { makePaperTexture } from "./paperTexture";

/**
 * The ground outside the entrance.
 *
 * Fixed after seeing it rendered: the plane was only 30 units wide while
 * the camera can see much further, so it visibly *ended* mid-view and
 * produced that hard horizon seam where ground met background. It's now
 * large enough to always reach past the fog's far distance, so the ground
 * fades into atmosphere instead of stopping at an edge. A tiled texture
 * repeat keeps the grain from smearing at that size.
 */
export default function EntranceGround() {
  const groundTexture = useMemo(() => {
    const tex = makePaperTexture(512, "#d5cdb6");
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(24, 24);
    return tex;
  }, []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(220, 220), []);

  return (
    <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geometry} receiveShadow>
      <meshStandardMaterial map={groundTexture} roughness={1} />
    </mesh>
  );
}
