import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { makePaintMaterial } from "../sketch/art";
import { characterArt, CHAR_FRAMES, CHAR_FRAME_H, CHAR_FRAME_W } from "../drawings/character";
import { CORRIDOR_END_Z, progressToZ } from "../worldConfig";

const LEAD = 4.6; // metres ahead of the camera
const STRIDE = 1.5; // metres per full walk cycle
const HEIGHT = 1.45;

/**
 * The guide: a hand-drawn flip-book sprite that walks a few steps ahead
 * of you down the corridor, turns round and waves when you stop.
 */
export default function Character({ progressRef, visible }: { progressRef: MutableRefObject<number>; visible: boolean }) {
  const a = useMemo(() => characterArt(), []);
  const material = useMemo(() => {
    // own texture instances so the atlas offset doesn't leak into other users of the art
    const sk = a.sketch.clone();
    const pa = a.paint.clone();
    [sk, pa].forEach((t) => {
      t.repeat.set(1 / (CHAR_FRAMES + 1), 1);
      t.needsUpdate = true;
    });
    const m = makePaintMaterial({ ...a, sketch: sk, paint: pa }, { reveal: 1 });
    return { m, sk, pa };
  }, [a]);
  const ref = useRef<THREE.Group>(null);
  const state = useRef({ z: progressToZ(0) - LEAD, dist: 0, idle: 0, frame: -1 });

  useFrame(({ camera }, delta) => {
    const g = ref.current;
    if (!g) return;
    g.visible = visible;
    const s = state.current;
    const targetZ = Math.max(CORRIDOR_END_Z + 2.2, Math.min(progressToZ(progressRef.current), camera.position.z) - LEAD);
    const prev = s.z;
    s.z += (targetZ - s.z) * Math.min(1, delta * 2.2);
    const moved = Math.abs(s.z - prev);
    s.dist += moved;
    s.idle = moved > 0.002 ? 0 : s.idle + delta;
    const bob = moved > 0.002 ? Math.abs(Math.sin((s.dist / STRIDE) * Math.PI * 2)) * 0.03 : 0;
    g.position.set(0.7, HEIGHT / 2 + bob, s.z);
    // billboard around Y towards the camera
    g.rotation.y = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z);
    const frame = s.idle > 0.6 ? CHAR_FRAMES : Math.floor(((s.dist / STRIDE) % 1) * CHAR_FRAMES);
    if (frame !== s.frame) {
      s.frame = frame;
      const off = frame / (CHAR_FRAMES + 1);
      material.sk.offset.x = off;
      material.pa.offset.x = off;
    }
  });

  return (
    <group ref={ref}>
      <mesh material={material.m}>
        <planeGeometry args={[(HEIGHT * CHAR_FRAME_W) / CHAR_FRAME_H, HEIGHT]} />
      </mesh>
    </group>
  );
}
