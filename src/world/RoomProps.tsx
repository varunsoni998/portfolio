import { useMemo } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";

const WOOD = "#a9895f";
const METAL = "#3a3630";
const SCREEN_OFF = "#2a2621";

export function Desk({ position = [0, 0, 0] as [number, number, number] }) {
  const topGeo = useMemo(() => new THREE.BoxGeometry(1.6, 0.06, 0.7), []);
  const legGeo = useMemo(() => new THREE.BoxGeometry(0.06, 0.72, 0.06), []);
  return (
    <group position={position}>
      <mesh position={[0, 0.72, 0]} geometry={topGeo}>
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      {[
        [-0.75, 0.36, -0.3],
        [0.75, 0.36, -0.3],
        [-0.75, 0.36, 0.3],
        [0.75, 0.36, 0.3],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} geometry={legGeo}>
          <meshStandardMaterial color={METAL} roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** A simple monitor — a box body with a flat "screen" plane you can put drei <Html> or a texture on. */
export function Monitor({ position = [0, 0, 0] as [number, number, number], children }: { position?: [number, number, number]; children?: ReactNode }) {
  const bodyGeo = useMemo(() => new THREE.BoxGeometry(0.62, 0.4, 0.04), []);
  const standGeo = useMemo(() => new THREE.BoxGeometry(0.05, 0.16, 0.05), []);
  const baseGeo = useMemo(() => new THREE.BoxGeometry(0.22, 0.02, 0.14), []);
  return (
    <group position={position}>
      <mesh position={[0, 0.16, 0]} geometry={standGeo}>
        <meshStandardMaterial color={METAL} roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 0]} geometry={baseGeo}>
        <meshStandardMaterial color={METAL} roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.4, 0]} geometry={bodyGeo}>
        <meshStandardMaterial color={SCREEN_OFF} roughness={0.4} />
      </mesh>
      <group position={[0, 0.4, 0.025]}>{children}</group>
    </group>
  );
}

export function PaperStack({ position = [0, 0, 0] as [number, number, number], count = 4 }) {
  const geo = useMemo(() => new THREE.BoxGeometry(0.24, 0.006, 0.32), []);
  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[i * 0.01, i * 0.006, i * 0.008]} rotation={[0, i * 0.06, 0]} geometry={geo}>
          <meshStandardMaterial color="#efebe1" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/** A wall-mounted frame — for photos/diagrams represented as flat rectangles. */
export function WallFrame({
  position = [0, 0, 0] as [number, number, number],
  rotation = [0, 0, 0] as [number, number, number],
  width = 0.5,
  height = 0.35,
  tone = "#d8d2c4",
}) {
  const geo = useMemo(() => new THREE.BoxGeometry(width, height, 0.03), [width, height]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={tone} roughness={0.85} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#2a2621" transparent opacity={0.5} />
      </lineSegments>
    </group>
  );
}
