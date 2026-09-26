import { useMemo, useRef } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { makePaintMaterial, makeSketchMaterial, tiledPlane } from "../../sketch/art";
import { ArtPlane, usePaintBehaviour } from "../../sketch/Paintable";
import { roomFloorArt, roomTitleArt, roomWallArt } from "../../drawings/rooms";
import { ceilingArt, pendantLampArt } from "../../drawings/corridor";
import { ROOM_DEPTH as D, ROOM_HEIGHT as H, ROOM_WIDTH as W, roomCenter, sideYaw, type RoomDef } from "../../worldConfig";

function PaintedSurface({
  geometry,
  art,
  position,
  rotation,
  painted,
  origin,
}: {
  geometry: THREE.BufferGeometry;
  art: ReturnType<typeof roomWallArt>;
  position: [number, number, number];
  rotation: [number, number, number];
  painted: boolean;
  origin: [number, number];
}) {
  const material = useMemo(() => makePaintMaterial(art, { side: THREE.DoubleSide }), [art]);
  const ref = useRef<THREE.Mesh>(null);
  usePaintBehaviour(material, ref as React.RefObject<THREE.Object3D>, { painted, paintDuration: 2.4, paintOrigin: origin });
  return <mesh ref={ref} geometry={geometry} material={material} position={position} rotation={rotation} />;
}

/**
 * A room's walls, floor, ceiling and title. Children are placed in the
 * room's local frame: back wall at z = -D/2, doorway at z = +D/2,
 * x = -W/2 … W/2 (left … right as you stand in the doorway).
 */
export default function RoomShell({ room, title, painted, children }: { room: RoomDef; title: string; painted: boolean; children: ReactNode }) {
  const wall = useMemo(() => roomWallArt(room.id), [room.id]);
  const floor = useMemo(() => roomFloorArt(), []);
  const ceil = useMemo(() => ceilingArt(), []);
  const titleArt = useMemo(() => roomTitleArt(title, room.id), [title, room.id]);
  const lamp = useMemo(() => pendantLampArt(), []);
  const geo = useMemo(
    () => ({
      back: tiledPlane(W, H, 4, 4),
      side: tiledPlane(D, H, 4, 4),
      floor: tiledPlane(W, D, 4, 4),
      ceil: tiledPlane(W, D, 2, 2),
    }),
    [],
  );
  const ceilMat = useMemo(() => makeSketchMaterial(ceil.sketch, { side: THREE.DoubleSide }), [ceil]);
  const [cx, , cz] = roomCenter(room);

  return (
    <group position={[cx, 0, cz]} rotation={[0, sideYaw(room.side), 0]}>
      <PaintedSurface geometry={geo.back} art={wall} position={[0, H / 2, -D / 2]} rotation={[0, 0, 0]} painted={painted} origin={[0.9, 0.4]} />
      <PaintedSurface geometry={geo.side} art={wall} position={[-W / 2, H / 2, 0]} rotation={[0, Math.PI / 2, 0]} painted={painted} origin={[1.2, 0.4]} />
      <PaintedSurface geometry={geo.side} art={wall} position={[W / 2, H / 2, 0]} rotation={[0, -Math.PI / 2, 0]} painted={painted} origin={[0.4, 0.4]} />
      <PaintedSurface geometry={geo.floor} art={floor} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} painted={painted} origin={[0.9, 1.4]} />
      <mesh geometry={geo.ceil} material={ceilMat} position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <ArtPlane art={titleArt} width={2.6} position={[0, H - 0.5, -D / 2 + 0.03]} paint="always" />
      {[-2.4, 2.4].map((x) => (
        <Billboard key={x} position={[x, H - 0.85, -1.9]} lockX lockZ>
          <ArtPlane art={lamp} width={0.7} painted={painted} />
        </Billboard>
      ))}
      {children}
    </group>
  );
}
