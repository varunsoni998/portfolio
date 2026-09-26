import * as THREE from "three";
import { PATH_POINTS, CORRIDOR_WIDTH } from "./corridorConfig";

export const corridorCurve = new THREE.CatmullRomCurve3(PATH_POINTS, false, "catmullrom", 0.2);

/** World position at a given 0-1 progress along the corridor. */
export function pointAt(progress: number): THREE.Vector3 {
  return corridorCurve.getPointAt(Math.max(0, Math.min(1, progress)));
}

/** Forward-facing tangent at a given 0-1 progress, used to orient the camera and doors. */
export function tangentAt(progress: number): THREE.Vector3 {
  return corridorCurve.getTangentAt(Math.max(0.001, Math.min(0.999, progress)));
}

/** World position for a door set into the left/right wall at a given progress. */
export function doorPosition(progress: number, side: "left" | "right"): THREE.Vector3 {
  const center = pointAt(progress);
  const tangent = tangentAt(progress);
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
  const offset = right.multiplyScalar(side === "right" ? CORRIDOR_WIDTH / 2 - 0.02 : -(CORRIDOR_WIDTH / 2 - 0.02));
  return center.clone().add(offset).setY(1.4);
}

/** Yaw angle (radians) a door on the given side should face to sit flush in the wall. */
export function doorYaw(progress: number, side: "left" | "right"): number {
  const tangent = tangentAt(progress);
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
  // The sign needs to face back toward the corridor's centerline (where
  // foot traffic actually is) — that's -right for a door on the right
  // wall, +right for a door on the left wall. Deriving yaw straight from
  // that target vector (rather than the tangent plus a guessed ±90°
  // offset) is what the previous version got backwards: it worked out to
  // the door facing away from the corridor, so the sign rendered as seen
  // from behind — mirrored.
  const facing = side === "right" ? right.clone().negate() : right.clone();
  return Math.atan2(facing.x, facing.z);
}
