import { useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { pointAt, tangentAt } from "./corridorPath";

interface CorridorCameraProps {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}

export default function CorridorCamera({ progressRef, reducedMotion }: CorridorCameraProps) {
  const { camera, mouse } = useThree();
  const smoothed = useRef(0);
  const lookTarget = useRef(new THREE.Vector3());

  useFrame(() => {
    // Ease toward the real progress rather than snapping — reads as a
    // gentle glide even though the input (wheel/touch) is stepped.
    const ease = reducedMotion ? 1 : 0.08;
    smoothed.current += (progressRef.current - smoothed.current) * ease;

    const position = pointAt(smoothed.current);
    const tangent = tangentAt(smoothed.current);

    camera.position.set(position.x, position.y, position.z);

    lookTarget.current.copy(position).add(tangent);
    // Subtle parallax: mouse nudges the look target sideways/vertically,
    // never enough to feel like free-look — this is a guided walk, not a
    // free camera.
    if (!reducedMotion) {
      lookTarget.current.x += mouse.x * 0.6;
      lookTarget.current.y += mouse.y * 0.3;
    }
    camera.lookAt(lookTarget.current);
  });

  return null;
}
