import { useMemo } from "react";
import * as THREE from "three";
import { ROOM_WIDTH, ROOM_DEPTH, ROOM_HEIGHT } from "./worldConfig";
import { makePaperTexture } from "./paperTexture";

function Panel({
  position,
  rotation,
  width,
  height,
  texture,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  texture: THREE.CanvasTexture;
}) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(width, height), [width, height]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry}>
        <meshStandardMaterial map={texture} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#2a2621" transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
}

/**
 * Room walls only — floor, ceiling, and three walls (the wall with the
 * doorway gap is intentionally omitted). Expected to be rendered as a
 * child of a `<group position rotation>` set by the room's own component
 * (see rooms/*.tsx), alongside that room's furniture, in the same local
 * coordinate space — that's what lets furniture positions stay simple
 * ([-1, 0.72, -1] etc.) regardless of where the room actually sits in
 * world space.
 */
export default function RoomShell({ tint = "#efebe1" }: { tint?: string }) {
  const floorTexture = useMemo(() => makePaperTexture(512, "#e4ddc9"), []);
  const wallTexture = useMemo(() => makePaperTexture(512, tint), [tint]);
  const ceilingTexture = useMemo(() => makePaperTexture(512, "#e9e4d6"), []);

  return (
    <group>
      <Panel
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={ROOM_WIDTH}
        height={ROOM_DEPTH}
        texture={floorTexture}
      />
      <Panel
        position={[0, ROOM_HEIGHT, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        width={ROOM_WIDTH}
        height={ROOM_DEPTH}
        texture={ceilingTexture}
      />
      <Panel
        position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]}
        rotation={[0, Math.PI, 0]}
        width={ROOM_WIDTH}
        height={ROOM_HEIGHT}
        texture={wallTexture}
      />
      <Panel
        position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={ROOM_DEPTH}
        height={ROOM_HEIGHT}
        texture={wallTexture}
      />
      <Panel
        position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        width={ROOM_DEPTH}
        height={ROOM_HEIGHT}
        texture={wallTexture}
      />
      {/* front wall intentionally omitted — that's the doorway back to the corridor */}
    </group>
  );
}
