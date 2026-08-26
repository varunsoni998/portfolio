import * as THREE from "three";

export interface CorridorDoor {
  id: string;
  label: string;
  /** 0-1 position along the corridor path where this door sits. */
  progress: number;
  /** Which side of the corridor the door is set into. */
  side: "left" | "right";
  /** Section id on the homepage this door leads to, or "/lab" for a real route. */
  target: string;
}

export const CORRIDOR_LENGTH = 60; // world units, one unit per progress-segment feel
export const CORRIDOR_WIDTH = 6;
export const CORRIDOR_HEIGHT = 5;

// Camera path — a straight-ish corridor with a couple of gentle bends so it
// doesn't feel like a static dolly-zoom. Points are in world space (x, y, z),
// walked from z=0 (entrance) to z=-CORRIDOR_LENGTH (far end).
export const PATH_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(0, 1.6, 0),
  new THREE.Vector3(0.4, 1.6, -14),
  new THREE.Vector3(-0.3, 1.6, -28),
  new THREE.Vector3(0.3, 1.6, -42),
  new THREE.Vector3(0, 1.6, -CORRIDOR_LENGTH),
];

export const CORRIDOR_DOORS: CorridorDoor[] = [
  { id: "work", label: "WORK", progress: 0.22, side: "left", target: "work" },
  { id: "ai-lab", label: "AI LAB", progress: 0.45, side: "right", target: "/lab" },
  { id: "about", label: "ABOUT", progress: 0.68, side: "left", target: "about" },
  { id: "contact", label: "CONTACT", progress: 0.9, side: "right", target: "contact" },
];
