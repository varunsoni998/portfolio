import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pointAt, tangentAt } from "./worldPath";

/**
 * A small original guide figure — not a copy of anyone's specific
 * character design. Built entirely from primitives (sphere head, box
 * torso, capsule limbs) with the same paper-tone flat material and dark
 * sketch-outline treatment as the corridor shell and doors, so it reads
 * as part of the same drawn world. Walks a fixed distance ahead of the
 * camera with a walk-cycle swing on the limbs, a bob, and a slight sway.
 */
export default function Character({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const t = useRef(0);

  const headGeometry = useMemo(() => new THREE.SphereGeometry(0.15, 12, 12), []);
  const torsoGeometry = useMemo(() => new THREE.CapsuleGeometry(0.16, 0.4, 4, 8), []);
  const limbGeometry = useMemo(() => new THREE.CapsuleGeometry(0.055, 0.32, 4, 6), []);

  const headEdges = useMemo(() => new THREE.EdgesGeometry(headGeometry, 20), [headGeometry]);
  const torsoEdges = useMemo(() => new THREE.EdgesGeometry(torsoGeometry, 20), [torsoGeometry]);
  const limbEdges = useMemo(() => new THREE.EdgesGeometry(limbGeometry, 20), [limbGeometry]);

  const paperMaterialProps = { color: "#efebe1", roughness: 0.9 } as const;
  const outlineProps = { color: "#2a2621", transparent: true, opacity: 0.55 } as const;

  useFrame((_, delta) => {
    if (!group.current) return;
    t.current += delta;

    const leadDistance = 0.045; // stays this far ahead of the camera, in path-progress units
    const aheadProgress = Math.min(0.995, (progressRef.current ?? 0) + leadDistance);
    const position = pointAt(aheadProgress);
    const tangent = tangentAt(aheadProgress);

    const walkCycle = t.current * 6;
    const bob = Math.abs(Math.sin(walkCycle)) * 0.035;
    group.current.position.set(position.x, position.y - 1.2 + bob, position.z);

    const yaw = Math.atan2(tangent.x, tangent.z);
    const sway = Math.sin(walkCycle * 0.5) * 0.03;
    group.current.rotation.set(0, yaw + Math.PI, sway);

    const swing = Math.sin(walkCycle) * 0.5;
    if (leftArm.current) leftArm.current.rotation.x = swing;
    if (rightArm.current) rightArm.current.rotation.x = -swing;
    if (leftLeg.current) leftLeg.current.rotation.x = -swing;
    if (rightLeg.current) rightLeg.current.rotation.x = swing;
  });

  return (
    <group ref={group}>
      {/* head */}
      <mesh geometry={headGeometry} position={[0, 0.92, 0]}>
        <meshStandardMaterial {...paperMaterialProps} />
      </mesh>
      <lineSegments geometry={headEdges} position={[0, 0.92, 0]}>
        <lineBasicMaterial {...outlineProps} />
      </lineSegments>

      {/* torso */}
      <mesh geometry={torsoGeometry} position={[0, 0.6, 0]}>
        <meshStandardMaterial {...paperMaterialProps} />
      </mesh>
      <lineSegments geometry={torsoEdges} position={[0, 0.6, 0]}>
        <lineBasicMaterial {...outlineProps} />
      </lineSegments>

      {/* arms — each is a pivot group at the shoulder so rotation swings naturally */}
      <group ref={leftArm} position={[-0.22, 0.78, 0]}>
        <mesh geometry={limbGeometry} position={[0, -0.16, 0]}>
          <meshStandardMaterial {...paperMaterialProps} />
        </mesh>
        <lineSegments geometry={limbEdges} position={[0, -0.16, 0]}>
          <lineBasicMaterial {...outlineProps} />
        </lineSegments>
      </group>
      <group ref={rightArm} position={[0.22, 0.78, 0]}>
        <mesh geometry={limbGeometry} position={[0, -0.16, 0]}>
          <meshStandardMaterial {...paperMaterialProps} />
        </mesh>
        <lineSegments geometry={limbEdges} position={[0, -0.16, 0]}>
          <lineBasicMaterial {...outlineProps} />
        </lineSegments>
      </group>

      {/* legs — pivot at the hip */}
      <group ref={leftLeg} position={[-0.09, 0.38, 0]}>
        <mesh geometry={limbGeometry} position={[0, -0.16, 0]}>
          <meshStandardMaterial {...paperMaterialProps} />
        </mesh>
        <lineSegments geometry={limbEdges} position={[0, -0.16, 0]}>
          <lineBasicMaterial {...outlineProps} />
        </lineSegments>
      </group>
      <group ref={rightLeg} position={[0.09, 0.38, 0]}>
        <mesh geometry={limbGeometry} position={[0, -0.16, 0]}>
          <meshStandardMaterial {...paperMaterialProps} />
        </mesh>
        <lineSegments geometry={limbEdges} position={[0, -0.16, 0]}>
          <lineBasicMaterial {...outlineProps} />
        </lineSegments>
      </group>
    </group>
  );
}
