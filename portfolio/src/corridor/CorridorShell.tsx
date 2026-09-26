import { useMemo } from "react";
import * as THREE from "three";
import { CORRIDOR_LENGTH, CORRIDOR_WIDTH, CORRIDOR_HEIGHT } from "./corridorConfig";
import { makePaperTexture } from "./paperTexture";

/** One flat panel (floor/wall/ceiling segment) with a sketched edge outline. */
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
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height);
    return geo;
  }, [width, height]);

  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
      </mesh>
      {/* hand-drawn-style outline instead of a real 3D model's crisp edge */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#2a2621" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

/**
 * The corridor shell — floor, two walls, ceiling — built from flat panels
 * rather than a modeled hallway (there's no 3D asset pipeline here). The
 * paper-grain texture plus faint dark edge lines are what stand in for
 * ITom's hand-drawn pencil textures: a technique, not a copy of his
 * specific artwork.
 */
export default function CorridorShell() {
  const floorTexture = useMemo(() => makePaperTexture(512, "#e4ddc9"), []);
  const wallTexture = useMemo(() => makePaperTexture(512, "#efebe1"), []);
  const ceilingTexture = useMemo(() => makePaperTexture(512, "#e9e4d6"), []);

  useMemo(() => {
    [floorTexture, wallTexture, ceilingTexture].forEach((t) => {
      t.repeat.set(CORRIDOR_LENGTH / 6, 1);
    });
  }, [floorTexture, wallTexture, ceilingTexture]);

  const centerZ = -CORRIDOR_LENGTH / 2;

  return (
    <group>
      {/* Floor */}
      <Panel
        position={[0, 0, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={CORRIDOR_WIDTH}
        height={CORRIDOR_LENGTH}
        texture={floorTexture}
      />
      {/* Ceiling */}
      <Panel
        position={[0, CORRIDOR_HEIGHT, centerZ]}
        rotation={[Math.PI / 2, 0, 0]}
        width={CORRIDOR_WIDTH}
        height={CORRIDOR_LENGTH}
        texture={ceilingTexture}
      />
      {/* Left wall */}
      <Panel
        position={[-CORRIDOR_WIDTH / 2, CORRIDOR_HEIGHT / 2, centerZ]}
        rotation={[0, Math.PI / 2, 0]}
        width={CORRIDOR_LENGTH}
        height={CORRIDOR_HEIGHT}
        texture={wallTexture}
      />
      {/* Right wall */}
      <Panel
        position={[CORRIDOR_WIDTH / 2, CORRIDOR_HEIGHT / 2, centerZ]}
        rotation={[0, -Math.PI / 2, 0]}
        width={CORRIDOR_LENGTH}
        height={CORRIDOR_HEIGHT}
        texture={wallTexture}
      />
    </group>
  );
}
