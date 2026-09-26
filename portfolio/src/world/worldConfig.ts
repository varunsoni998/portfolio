/**
 * World layout, in metres. The corridor runs straight down -z from the
 * front door (z = 0); rooms hang off both walls.
 */
export const EYE_HEIGHT = 1.65;

export const CORRIDOR_WIDTH = 5;
export const CORRIDOR_HEIGHT = 4;
export const CORRIDOR_END_Z = -74;

/** The walk is driven by a 0-1 progress value mapped onto this z range. */
export const WALK_START_Z = -1.6;
export const WALK_END_Z = -69;

export const ROOM_WIDTH = 7; // along the corridor
export const ROOM_DEPTH = 6.5; // away from the corridor
export const ROOM_HEIGHT = 4;

export const DOOR_WIDTH = 1.4;
export const DOOR_HEIGHT = 2.6;
export const DOOR_OPENING = 1.6; // gap left in the wall (door + casing)

export type RoomId = "about" | "projects" | "ai-lab" | "skills" | "experience" | "contact";

export interface RoomDef {
  id: RoomId;
  label: string;
  z: number;
  side: "left" | "right";
}

export const ROOMS: RoomDef[] = [
  { id: "about", label: "About me", z: -9, side: "left" },
  { id: "projects", label: "Projects", z: -19, side: "right" },
  { id: "ai-lab", label: "AI Lab", z: -29, side: "left" },
  { id: "skills", label: "Skills", z: -39, side: "right" },
  { id: "experience", label: "Experience", z: -49, side: "left" },
  { id: "contact", label: "Contact", z: -59, side: "right" },
];

export function zToProgress(z: number) {
  return Math.max(0, Math.min(1, (z - WALK_START_Z) / (WALK_END_Z - WALK_START_Z)));
}

export function progressToZ(p: number) {
  return WALK_START_Z + (WALK_END_Z - WALK_START_Z) * Math.max(0, Math.min(1, p));
}

/** x of the wall plane on a given side. */
export function wallX(side: "left" | "right") {
  return side === "left" ? -CORRIDOR_WIDTH / 2 : CORRIDOR_WIDTH / 2;
}

/**
 * Yaw for anything mounted on a side wall so its front (+z local) faces
 * into the corridor. Rooms reuse it: their local -z points away from
 * the corridor, deeper into the room.
 */
export function sideYaw(side: "left" | "right") {
  return side === "left" ? Math.PI / 2 : -Math.PI / 2;
}

/** Room centre in world space. */
export function roomCenter(room: RoomDef): [number, number, number] {
  const dir = room.side === "left" ? -1 : 1;
  return [wallX(room.side) + dir * (ROOM_DEPTH / 2), 0, room.z];
}
