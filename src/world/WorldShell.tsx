import { useMemo } from "react";
import * as THREE from "three";
import { CORRIDOR_LENGTH, CORRIDOR_WIDTH, CORRIDOR_HEIGHT, ROOMS } from "./worldConfig";
import { doorPosition, doorYaw } from "./worldPath";
import { makePaperTexture } from "./paperTexture";

// Half-width of a door opening, expressed as a progress delta — used to
// carve a real gap in the wall at each door instead of just placing a
// door mesh flush against a solid wall (which would block the room
// behind it from ever being visible, even once the door swings open).
const DOOR_PROGRESS_HALFWIDTH = 0.012;

interface Segment {
  position: [number, number, number];
  yaw: number;
  width: number;
}

/** Straight-line wall segments between doors, with a gap left at each door on this side. */
function buildWallSegments(side: "left" | "right"): Segment[] {
  const doorRanges = ROOMS.filter((r) => r.side === side)
    .map((r) => [r.progress - DOOR_PROGRESS_HALFWIDTH, r.progress + DOOR_PROGRESS_HALFWIDTH] as const)
    .sort((a, b) => a[0] - b[0]);

  const openRanges: [number, number][] = [];
  let cursor = 0;
  for (const [start, end] of doorRanges) {
    if (start > cursor) openRanges.push([cursor, start]);
    cursor = Math.max(cursor, end);
  }
  if (cursor < 1) openRanges.push([cursor, 1]);

  return openRanges
    .filter(([a, b]) => b - a > 0.002) // skip slivers too thin to matter
    .map(([a, b]) => {
      const mid = (a + b) / 2;
      const startPos = doorPosition(a, side);
      const endPos = doorPosition(b, side);
      const width = startPos.distanceTo(endPos);
      const midPos = doorPosition(mid, side);
      return {
        position: [midPos.x, CORRIDOR_HEIGHT / 2, midPos.z] as [number, number, number],
        yaw: doorYaw(mid, side),
        width,
      };
    });
}

function WallSegment({ segment, texture }: { segment: Segment; texture: THREE.CanvasTexture }) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(segment.width, CORRIDOR_HEIGHT), [segment.width]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  return (
    <group position={segment.position} rotation={[0, segment.yaw, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial map={texture} roughness={0.95} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#2a2621" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

function FlatPanel({
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
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#2a2621" transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
}

/**
 * The corridor shell — floor and ceiling as single long panels (the
 * corridor's bends are gentle enough that a straight panel reads fine),
 * but the side walls are built as separate straight segments between
 * doors, with a real gap left at each door's location. Punching an actual
 * opening (rather than just resting a door mesh against a solid wall) is
 * what lets the room behind become visible once that door swings open,
 * and lets the camera actually pass through instead of clipping a wall.
 */
export default function WorldShell() {
  const floorTexture = useMemo(() => makePaperTexture(512, "#e4ddc9"), []);
  const wallTexture = useMemo(() => makePaperTexture(512, "#efebe1"), []);
  const ceilingTexture = useMemo(() => makePaperTexture(512, "#e9e4d6"), []);

  useMemo(() => {
    [floorTexture, wallTexture, ceilingTexture].forEach((t) => t.repeat.set(CORRIDOR_LENGTH / 6, 1));
  }, [floorTexture, wallTexture, ceilingTexture]);

  const leftSegments = useMemo(() => buildWallSegments("left"), []);
  const rightSegments = useMemo(() => buildWallSegments("right"), []);

  const centerZ = -CORRIDOR_LENGTH / 2;

  return (
    <group>
      <FlatPanel
        position={[0, 0, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={CORRIDOR_WIDTH}
        height={CORRIDOR_LENGTH}
        texture={floorTexture}
      />
      <FlatPanel
        position={[0, CORRIDOR_HEIGHT, centerZ]}
        rotation={[Math.PI / 2, 0, 0]}
        width={CORRIDOR_WIDTH}
        height={CORRIDOR_LENGTH}
        texture={ceilingTexture}
      />
      {leftSegments.map((seg, i) => (
        <WallSegment key={`left-${i}`} segment={seg} texture={wallTexture} />
      ))}
      {rightSegments.map((seg, i) => (
        <WallSegment key={`right-${i}`} segment={seg} texture={wallTexture} />
      ))}
    </group>
  );
}
