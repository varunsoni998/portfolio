import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pointAt, tangentAt } from "./corridorPath";

/**
 * A small original guide figure, not a copy of anyone's specific character
 * design — built from primitive geometry (capsule body, sphere head) with
 * the same paper-tone flat material and dark sketch-outline treatment as
 * the corridor shell and doors, so it reads as part of the same drawn
 * world rather than a dropped-in 3D asset. It walks a fixed distance
 * ahead of the camera along the same path, with a light bob and sway so
 * it feels alive rather than towed.
 */
export default function Character({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);

  const bodyGeometry = useMemo(() => new THREE.CapsuleGeometry(0.22, 0.55, 4, 8), []);
  const headGeometry = useMemo(() => new THREE.SphereGeometry(0.16, 12, 12), []);
  const bodyEdges = useMemo(() => new THREE.EdgesGeometry(bodyGeometry, 20), [bodyGeometry]);
  const headEdges = useMemo(() => new THREE.EdgesGeometry(headGeometry, 20), [headGeometry]);

  useFrame((_, delta) => {
    if (!group.current) return;
    t.current += delta;

    const leadDistance = 0.045; // stays this far ahead of the camera, in path-progress units
    const aheadProgress = Math.min(0.995, (progressRef.current ?? 0) + leadDistance);
    const position = pointAt(aheadProgress);
    const tangent = tangentAt(aheadProgress);

    const bob = Math.sin(t.current * 4) * 0.03;
    group.current.position.set(position.x, position.y - 1.2 + bob, position.z);

    const yaw = Math.atan2(tangent.x, tangent.z);
    const sway = Math.sin(t.current * 4) * 0.05;
    group.current.rotation.set(0, yaw + Math.PI, sway * 0.4);
  });

  return (
    <group ref={group}>
      <mesh geometry={bodyGeometry} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#efebe1" roughness={0.9} />
      </mesh>
      <lineSegments geometry={bodyEdges} position={[0, 0.5, 0]}>
        <lineBasicMaterial color="#2a2621" transparent opacity={0.55} />
      </lineSegments>

      <mesh geometry={headGeometry} position={[0, 0.95, 0]}>
        <meshStandardMaterial color="#efebe1" roughness={0.9} />
      </mesh>
      <lineSegments geometry={headEdges} position={[0, 0.95, 0]}>
        <lineBasicMaterial color="#2a2621" transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}
