import * as THREE from "three";
import { PATH_POINTS, CORRIDOR_WIDTH, ROOM_DEPTH } from "./worldConfig";

export const corridorCurve = new THREE.CatmullRomCurve3(PATH_POINTS, false, "catmullrom", 0.2);

export function pointAt(progress: number): THREE.Vector3 {
  return corridorCurve.getPointAt(Math.max(0, Math.min(1, progress)));
}

export function tangentAt(progress: number): THREE.Vector3 {
  return corridorCurve.getTangentAt(Math.max(0.001, Math.min(0.999, progress)));
}

function rightVectorAt(progress: number): THREE.Vector3 {
  const tangent = tangentAt(progress);
  const up = new THREE.Vector3(0, 1, 0);
  return new THREE.Vector3().crossVectors(tangent, up).normalize();
}

/** World position of a door set into the corridor wall at a given progress/side. */
export function doorPosition(progress: number, side: "left" | "right"): THREE.Vector3 {
  const center = pointAt(progress);
  const right = rightVectorAt(progress);
  const offset = right.clone().multiplyScalar(side === "right" ? CORRIDOR_WIDTH / 2 - 0.02 : -(CORRIDOR_WIDTH / 2 - 0.02));
  return center.clone().add(offset).setY(1.4);
}

/** Yaw (radians) a door on the given side should face to sit flush in the wall, facing back into the corridor. */
export function doorYaw(progress: number, side: "left" | "right"): number {
  const right = rightVectorAt(progress);
  const facing = side === "right" ? right.clone().negate() : right.clone();
  return Math.atan2(facing.x, facing.z);
}

/** Center of the room attached to a given door — pushed straight out through the wall from the door. */
export function roomCenter(progress: number, side: "left" | "right"): THREE.Vector3 {
  const doorPos = doorPosition(progress, side);
  const right = rightVectorAt(progress);
  const outward = side === "right" ? right : right.clone().negate();
  return doorPos.clone().add(outward.multiplyScalar(ROOM_DEPTH / 2)).setY(0);
}

/** Yaw a room's contents should use so "into the room" matches the door's facing direction. */
export function roomYaw(progress: number, side: "left" | "right"): number {
  return doorYaw(progress, side);
}

export interface RoomEntryPath {
  doorPos: THREE.Vector3; // at the threshold
  settlePos: THREE.Vector3; // where the camera comes to rest inside the room
  lookPos: THREE.Vector3; // a point further into the room, to look toward
}

/**
 * The three key points for a door traversal: the threshold (where the
 * camera crosses as the door opens), where it settles once inside, and a
 * point further in for it to look toward while settling — reused for both
 * the entry animation and, reversed, the exit animation, so the room
 * approach math only has to be figured out in one place.
 */
export function roomEntryPath(progress: number, side: "left" | "right"): RoomEntryPath {
  const doorPos = doorPosition(progress, side);
  const right = rightVectorAt(progress);
  const outward = (side === "right" ? right : right.clone().negate()).normalize();
  return {
    doorPos: doorPos.clone().setY(1.6),
    settlePos: doorPos.clone().add(outward.clone().multiplyScalar(1.8)).setY(1.6),
    lookPos: doorPos.clone().add(outward.clone().multiplyScalar(4)).setY(1.5),
  };
}
