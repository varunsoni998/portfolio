import type { ReactNode } from "react";
import * as THREE from "three";
import RoomShell from "./RoomShell";
import RoomInfoPanel from "./RoomInfoPanel";
import { ROOM_DEPTH } from "./worldConfig";

/**
 * Every room shares this wrapper: it positions/rotates the room into
 * world space (so individual room files only ever deal in simple local
 * coordinates), renders the shell, and places the exit trigger near the
 * doorway. The exit is a real, clickable, physically-placed sign rather
 * than a floating "Back" button pinned to the corner of the screen — the
 * primary way out of a room is the same doorway you walked in through.
 */
export default function RoomFrame({
  center,
  yaw,
  tint,
  onExit,
  children,
}: {
  center: THREE.Vector3;
  yaw: number;
  tint?: string;
  onExit: () => void;
  children: ReactNode;
}) {
  return (
    <group position={[center.x, 0, center.z]} rotation={[0, yaw, 0]}>
      <RoomShell tint={tint} />
      {children}

      <RoomInfoPanel position={[0, 1.9, ROOM_DEPTH / 2 - 0.4]} width={110}>
        <button
          type="button"
          onClick={onExit}
          className="w-full rounded-full border border-border-2 bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-text hover:border-accent hover:text-accent"
        >
          ← Exit to corridor
        </button>
      </RoomInfoPanel>
    </group>
  );
}
