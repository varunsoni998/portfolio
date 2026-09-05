import * as THREE from "three";

export const CORRIDOR_WIDTH = 6;
export const CORRIDOR_HEIGHT = 5;
export const CORRIDOR_LENGTH = 78;

export const ROOM_WIDTH = 7;
export const ROOM_DEPTH = 6;
export const ROOM_HEIGHT = 4.6;

// The corridor path, walked from the entrance threshold (z=0) to the exit
// door at the far end. A couple of gentle bends so it doesn't feel like a
// static dolly-zoom.
export const PATH_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(0, 1.6, 0),
  new THREE.Vector3(0.4, 1.6, -16),
  new THREE.Vector3(-0.3, 1.6, -34),
  new THREE.Vector3(0.3, 1.6, -52),
  new THREE.Vector3(0, 1.6, -CORRIDOR_LENGTH),
];

export type RoomId = "about" | "projects" | "ai-lab" | "skills" | "experience" | "contact";

export interface RoomDef {
  id: RoomId;
  label: string;
  progress: number; // 0-1 position along the corridor where this door sits
  side: "left" | "right";
}

// Six real rooms, real content (see src/world/rooms/*.tsx) — no invented
// facts. "Experience" maps to the same "What I've Been Building /
// Currently Building" content used elsewhere in the site, since there's
// no separate employment history to draw from — the earlier, flat version
// of this portfolio made that same call deliberately rather than invent one.
export const ROOMS: RoomDef[] = [
  { id: "about", label: "ABOUT", progress: 0.1, side: "left" },
  { id: "projects", label: "PROJECTS", progress: 0.24, side: "right" },
  { id: "ai-lab", label: "AI LAB", progress: 0.4, side: "left" },
  { id: "skills", label: "SKILLS", progress: 0.56, side: "right" },
  { id: "experience", label: "EXPERIENCE", progress: 0.72, side: "left" },
  { id: "contact", label: "CONTACT", progress: 0.88, side: "right" },
];

export const EXIT_DOOR_PROGRESS = 0.97;
