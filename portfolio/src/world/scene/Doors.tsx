import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ArtBox, ArtPlane, PaintGroup, usePaintBehaviour } from "../sketch/Paintable";
import { makePaintMaterial } from "../sketch/art";
import { DOOR_THEME, doorBackArt, exitDoorArt, exitSignArt, plateArt, roomDoorArt, trimArt } from "../drawings/corridor";
import { C, edgeArt } from "../drawings/common";
import { CORRIDOR_END_Z, DOOR_HEIGHT, DOOR_WIDTH, sideYaw, wallX, type RoomDef } from "../worldConfig";

/** Door casing: two jambs and a head, drawn as trim. */
function Casing({ width, height }: { width: number; height: number }) {
  const trim = useMemo(() => trimArt(), []);
  const edge = useMemo(() => edgeArt("#efe7d6", "casing"), []);
  const t = 0.1;
  return (
    <group>
      <ArtBox size={[t, height + t, 0.12]} position={[-width / 2 - t / 2, (height + t) / 2, 0]} front={trim} side={edge} />
      <ArtBox size={[t, height + t, 0.12]} position={[width / 2 + t / 2, (height + t) / 2, 0]} front={trim} side={edge} />
      <ArtBox size={[width + 2 * t, t, 0.12]} position={[0, height + t / 2, 0]} front={edge} side={edge} />
    </group>
  );
}

export interface DoorHandle {
  hinge: THREE.Group | null;
}

/**
 * A room door set into a side wall. The hinge group is handed up to the
 * experience controller, which swings it open in step with the camera.
 */
export function SideDoor({
  room,
  visited,
  disabled,
  onOpen,
  registerRef,
}: {
  room: RoomDef;
  visited: boolean;
  disabled: boolean;
  onOpen: (room: RoomDef) => void;
  registerRef: (id: string, h: DoorHandle) => void;
}) {
  const theme = DOOR_THEME[room.id];
  const front = useMemo(() => roomDoorArt(room.id), [room.id]);
  const back = useMemo(() => doorBackArt(room.id), [room.id]);
  const edge = useMemo(() => edgeArt(theme.color, `door-${room.id}`), [room.id, theme.color]);
  const plate = useMemo(() => plateArt(room.label, theme.color), [room.label, theme.color]);
  const group = useMemo(() => new PaintGroup(), []);

  const mats = useMemo(() => {
    const f = makePaintMaterial(front);
    const b = makePaintMaterial(back);
    const e = makePaintMaterial(edge);
    return { list: [e, e, e, e, f, b], f, b, e };
  }, [front, back, edge]);
  const ref = useRef<THREE.Mesh>(null);
  const behaviour = {
    paint: "hover" as const,
    group,
    painted: visited,
    disabled,
  };
  const handlers = usePaintBehaviour(mats.f, ref as React.RefObject<THREE.Object3D>, {
    ...behaviour,
    label: `${room.label} — click to go in`,
    onClick: () => onOpen(room),
  });
  usePaintBehaviour(mats.b, ref as React.RefObject<THREE.Object3D>, behaviour);
  usePaintBehaviour(mats.e, ref as React.RefObject<THREE.Object3D>, behaviour);

  const x = wallX(room.side);
  return (
    <group position={[x, 0, room.z]} rotation={[0, sideYaw(room.side), 0]}>
      <Casing width={DOOR_WIDTH + 0.06} height={DOOR_HEIGHT + 0.02} />
      <group
        position={[-DOOR_WIDTH / 2, 0, 0]}
        ref={(g) => registerRef(room.id, { hinge: g })}
      >
        <mesh ref={ref} material={mats.list} position={[DOOR_WIDTH / 2, DOOR_HEIGHT / 2 + 0.01, 0]} {...handlers}>
          <boxGeometry args={[DOOR_WIDTH, DOOR_HEIGHT, 0.06]} />
        </mesh>
      </group>
      <ArtPlane art={plate} width={1.25} position={[0, DOOR_HEIGHT + 0.42, 0.04]} painted={visited} paint="near" radius={6} />
    </group>
  );
}

/** Double door at the far end of the corridor — leads out to the classic site. */
export function EndDoor({ onOpen, registerRef, disabled }: { onOpen: () => void; registerRef: (h: { left: THREE.Group | null; right: THREE.Group | null }) => void; disabled: boolean }) {
  const left = useMemo(() => exitDoorArt("left"), []);
  const right = useMemo(() => exitDoorArt("right"), []);
  const sign = useMemo(() => exitSignArt(), []);
  const edge = useMemo(() => edgeArt(C.leafDark, "exit"), []);
  const group = useMemo(() => new PaintGroup(), []);
  const handles = useRef<{ left: THREE.Group | null; right: THREE.Group | null }>({ left: null, right: null });
  const leafW = 1.15;
  const leafH = 2.7;
  return (
    <group position={[0, 0, CORRIDOR_END_Z + 0.03]}>
      <Casing width={leafW * 2 + 0.04} height={leafH + 0.02} />
      <group
        position={[-leafW, 0, 0]}
        ref={(g) => {
          handles.current.left = g;
          registerRef(handles.current);
        }}
      >
        <ArtBoxLeaf art={left} edge={edge} group={group} x={leafW / 2} w={leafW} h={leafH} onOpen={onOpen} disabled={disabled} />
      </group>
      <group
        position={[leafW, 0, 0]}
        ref={(g) => {
          handles.current.right = g;
          registerRef(handles.current);
        }}
      >
        <ArtBoxLeaf art={right} edge={edge} group={group} x={-leafW / 2} w={leafW} h={leafH} onOpen={onOpen} disabled={disabled} />
      </group>
      <ArtPlane art={sign} width={1.9} position={[0, leafH + 0.62, 0.05]} paint="near" radius={10} />
    </group>
  );
}

function ArtBoxLeaf({
  art,
  edge,
  group,
  x,
  w,
  h,
  onOpen,
  disabled,
}: {
  art: ReturnType<typeof exitDoorArt>;
  edge: ReturnType<typeof edgeArt>;
  group: PaintGroup;
  x: number;
  w: number;
  h: number;
  onOpen: () => void;
  disabled: boolean;
}) {
  return (
    <ArtBox
      size={[w, h, 0.06]}
      position={[x, h / 2 + 0.01, 0]}
      front={art}
      side={edge}
      paint="hover"
      group={group}
      label="Exit to the classic site"
      onClick={onOpen}
      disabled={disabled}
    />
  );
}
