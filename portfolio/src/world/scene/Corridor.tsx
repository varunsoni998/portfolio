import { useMemo } from "react";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { makeSketchMaterial, tiledPlane, type Art } from "../sketch/art";
import { ArtBox, ArtPlane } from "../sketch/Paintable";
import {
  arrowSignArt,
  benchArt,
  bookshelfArt,
  cabinetArt,
  ceilingArt,
  clockArt,
  floorArt,
  framedPictureArt,
  paperBallArt,
  pendantLampArt,
  smallPlantArt,
  tallPlantArt,
  ventArt,
  wallArt,
  whiteboardArt,
} from "../drawings/corridor";
import { C, edgeArt } from "../drawings/common";
import {
  CORRIDOR_END_Z,
  CORRIDOR_HEIGHT as H,
  CORRIDOR_WIDTH as W,
  DOOR_HEIGHT,
  DOOR_OPENING,
  ROOMS,
  sideYaw,
  wallX,
} from "../worldConfig";

const TILE = 4;
const HEADER_Y = DOOR_HEIGHT + 0.12;

type Side = "left" | "right";

function Walls({ art }: { art: Art }) {
  const material = useMemo(() => makeSketchMaterial(art.sketch, { side: THREE.DoubleSide }), [art]);
  const pieces = useMemo(() => {
    const out: { key: string; geometry: THREE.BufferGeometry; position: [number, number, number]; yaw: number }[] = [];
    (["left", "right"] as Side[]).forEach((side) => {
      const doors = ROOMS.filter((r) => r.side === side)
        .map((r) => r.z)
        .sort((a, b) => b - a);
      let cursor = 0;
      const x = wallX(side);
      const yaw = sideYaw(side);
      const addSeg = (z0: number, z1: number) => {
        const len = z0 - z1;
        if (len < 0.01) return;
        const u = side === "left" ? -z0 / TILE : z1 / TILE;
        out.push({
          key: `${side}-${z0}`,
          geometry: tiledPlane(len, H, TILE, TILE, u),
          position: [x, H / 2, (z0 + z1) / 2],
          yaw,
        });
      };
      doors.forEach((dz) => {
        addSeg(cursor, dz + DOOR_OPENING / 2);
        // header above the opening
        const hh = H - HEADER_Y;
        const u = side === "left" ? -(dz + DOOR_OPENING / 2) / TILE : (dz - DOOR_OPENING / 2) / TILE;
        out.push({
          key: `${side}-h-${dz}`,
          geometry: tiledPlane(DOOR_OPENING, hh, TILE, TILE, u, HEADER_Y / TILE),
          position: [x, HEADER_Y + hh / 2, dz],
          yaw,
        });
        cursor = dz - DOOR_OPENING / 2;
      });
      addSeg(cursor, CORRIDOR_END_Z);
    });
    // end wall
    out.push({ key: "end", geometry: tiledPlane(W, H, TILE, TILE), position: [0, H / 2, CORRIDOR_END_Z], yaw: 0 });
    return out;
  }, []);
  return (
    <group>
      {pieces.map((p) => (
        <mesh key={p.key} geometry={p.geometry} material={material} position={p.position} rotation={[0, p.yaw, 0]} />
      ))}
    </group>
  );
}

function FloorAndCeiling() {
  const floor = useMemo(() => floorArt(), []);
  const ceil = useMemo(() => ceilingArt(), []);
  const len = -CORRIDOR_END_Z;
  const floorGeo = useMemo(() => tiledPlane(W, len, TILE, TILE), [len]);
  const ceilGeo = useMemo(() => tiledPlane(W, len, 2, 2), [len]);
  const floorMat = useMemo(() => makeSketchMaterial(floor.sketch), [floor]);
  const ceilMat = useMemo(() => makeSketchMaterial(ceil.sketch), [ceil]);
  return (
    <group>
      <mesh geometry={floorGeo} material={floorMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -len / 2]} />
      <mesh geometry={ceilGeo} material={ceilMat} rotation={[Math.PI / 2, 0, 0]} position={[0, H, -len / 2]} />
    </group>
  );
}

/** Something hung flat on a side wall. */
function OnWall({ side, z, y, children }: { side: Side; z: number; y: number; children: React.ReactNode }) {
  const x = wallX(side) + (side === "left" ? 0.03 : -0.03);
  return (
    <group position={[x, y, z]} rotation={[0, sideYaw(side), 0]}>
      {children}
    </group>
  );
}

/** Furniture standing on the floor against a side wall; local +z faces the corridor. */
function AgainstWall({ side, z, depth, children }: { side: Side; z: number; depth: number; children: React.ReactNode }) {
  const x = wallX(side) + (side === "left" ? depth / 2 + 0.02 : -depth / 2 - 0.02);
  return (
    <group position={[x, 0, z]} rotation={[0, sideYaw(side), 0]}>
      {children}
    </group>
  );
}

function Lamps({ art }: { art: Art }) {
  const zs: number[] = [];
  for (let z = -4; z > CORRIDOR_END_Z + 5; z -= 7.5) zs.push(z);
  return (
    <group>
      {zs.map((z) => (
        <Billboard key={z} position={[0, H - 0.85, z]} lockX lockZ>
          <ArtPlane art={art} width={0.85} paint="near" radius={9} />
        </Billboard>
      ))}
    </group>
  );
}

function FloorPlant({ side, z, v }: { side: Side; z: number; v: number }) {
  const a = useMemo(() => tallPlantArt(v), [v]);
  const x = wallX(side) + (side === "left" ? 0.55 : -0.55);
  return (
    <Billboard position={[x, 0.86, z]} lockX lockZ>
      <ArtPlane art={a} width={0.8} paint="near" radius={8} />
    </Billboard>
  );
}

function Cabinet({ side, z, topPlant = true }: { side: Side; z: number; topPlant?: boolean }) {
  const front = useMemo(() => cabinetArt(), []);
  const edge = useMemo(() => edgeArt(C.wood, "cabinet"), []);
  const plant = useMemo(() => smallPlantArt(), []);
  return (
    <AgainstWall side={side} z={z} depth={0.5}>
      <ArtBox size={[1.3, 1.0, 0.5]} position={[0, 0.5, 0]} front={front} side={edge} paint="near" radius={8} />
      {topPlant && <ArtPlane art={plant} width={0.4} position={[0.35, 1.23, 0]} paint="near" radius={8} />}
    </AgainstWall>
  );
}

function Shelf({ side, z, tag }: { side: Side; z: number; tag: string }) {
  const front = useMemo(() => bookshelfArt(tag), [tag]);
  const edge = useMemo(() => edgeArt(C.woodDark, "shelf"), []);
  return (
    <AgainstWall side={side} z={z} depth={0.4}>
      <ArtBox size={[1.2, 1.9, 0.4]} position={[0, 0.95, 0]} front={front} side={edge} paint="near" radius={8} />
    </AgainstWall>
  );
}

function Bench({ side, z }: { side: Side; z: number }) {
  const a = useMemo(() => benchArt(), []);
  return (
    <AgainstWall side={side} z={z} depth={0.5}>
      <ArtPlane art={a} width={2.0} position={[0, 0.39, 0]} paint="near" radius={8} />
    </AgainstWall>
  );
}

function Frame({ side, z, y, kind, width }: { side: Side; z: number; y: number; kind: Parameters<typeof framedPictureArt>[0]; width: number }) {
  const a = useMemo(() => framedPictureArt(kind), [kind]);
  return (
    <OnWall side={side} z={z} y={y}>
      <ArtPlane art={a} width={width} paint="near" radius={9} />
    </OnWall>
  );
}

function Flat({ side, z, y, art, width, near = true }: { side: Side; z: number; y: number; art: Art; width: number; near?: boolean }) {
  return (
    <OnWall side={side} z={z} y={y}>
      <ArtPlane art={art} width={width} paint={near ? "near" : "none"} radius={9} />
    </OnWall>
  );
}

function PaperBalls() {
  const a = useMemo(() => paperBallArt(), []);
  return (
    <group>
      {[
        [0.9, -12.5],
        [-1.1, -33.3],
        [1.3, -52.2],
        [-0.6, -65],
      ].map(([x, z]) => (
        <Billboard key={z} position={[x, 0.12, z]} lockX lockZ>
          <ArtPlane art={a} width={0.28} />
        </Billboard>
      ))}
    </group>
  );
}

/** The whole hallway shell plus its furniture (doors live in SideDoor / EndDoor). */
export default function Corridor() {
  const wall = useMemo(() => wallArt(), []);
  const lamp = useMemo(() => pendantLampArt(), []);
  const clock = useMemo(() => clockArt(), []);
  const vent = useMemo(() => ventArt(), []);
  const board = useMemo(() => whiteboardArt(), []);
  // Arrows point down the corridor: on the left wall that's the drawing's "right".
  const arrowR = useMemo(() => arrowSignArt("keep walking", "left"), []);
  const arrowL = useMemo(() => arrowSignArt("almost there", "right"), []);

  return (
    <group>
      <Walls art={wall} />
      <FloorAndCeiling />
      <Lamps art={lamp} />
      <PaperBalls />

      {/* near the entrance */}
      <FloorPlant side="left" z={-3.4} v={0} />
      <Frame side="right" z={-4.2} y={2.1} kind="mountains" width={1.4} />
      <Cabinet side="right" z={-9} />
      <Frame side="right" z={-9} y={2.35} kind="sun" width={1.2} />

      <Frame side="left" z={-14} y={2.1} kind="graph" width={1.6} />
      <Flat side="right" z={-14} y={2.2} art={arrowR} width={1.5} />
      <Bench side="left" z={-19} />
      <Frame side="left" z={-19} y={2.2} kind="city" width={1.5} />

      <FloorPlant side="right" z={-23.6} v={1} />
      <Flat side="right" z={-24.5} y={3.3} art={vent} width={0.7} near={false} />
      <Flat side="left" z={-24} y={1.95} art={board} width={2.1} />
      <Shelf side="right" z={-29} tag="a" />
      <Flat side="right" z={-29} y={2.7} art={clock} width={0.55} />

      <Frame side="left" z={-34} y={2.1} kind="neural" width={1.5} />
      <Frame side="right" z={-34} y={2.05} kind="portrait" width={1.2} />
      <Cabinet side="left" z={-39} />
      <Frame side="left" z={-39} y={2.35} kind="sea" width={1.2} />

      <FloorPlant side="right" z={-44} v={0} />
      <Flat side="left" z={-44} y={2.2} art={arrowL} width={1.5} />
      <Shelf side="right" z={-49} tag="b" />
      <Frame side="right" z={-49} y={2.75} kind="mountains" width={0.9} />

      <FloorPlant side="left" z={-54} v={1} />
      <Frame side="right" z={-54} y={2.1} kind="sun" width={1.3} />
      <Cabinet side="left" z={-59} />
      <Frame side="left" z={-59} y={2.35} kind="portrait" width={1.1} />

      <Frame side="left" z={-65} y={2.1} kind="city" width={1.4} />
      <Frame side="right" z={-65} y={2.1} kind="neural" width={1.3} />
      <Bench side="right" z={-70} />
      <FloorPlant side="left" z={-71} v={0} />
    </group>
  );
}
