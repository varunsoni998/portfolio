import { useSyncExternalStore } from "react";
import type { RoomId } from "./worldConfig";

/**
 * A tiny shared store bridging the 3D scene (inside <Canvas>) and the DOM
 * HUD around it (minimap, tooltips, content sheets) — they live in
 * different React renderers, so plain context doesn't cross between them.
 */
export type Phase = "intro" | "entrance" | "transition" | "corridor" | "room";

export type SheetId =
  | { kind: "about" }
  | { kind: "project"; slug: string }
  | { kind: "projects" }
  | { kind: "tool"; slug: string }
  | { kind: "lab" }
  | { kind: "skills" }
  | { kind: "experience" }
  | { kind: "contact" };

export interface WorldState {
  phase: Phase;
  activeRoom: RoomId | null;
  visited: RoomId[];
  hoverLabel: string | null;
  sheet: SheetId | null;
  /** 0-1 corridor walk progress (mirrored for the minimap; updated ~10x/s). */
  progress: number;
  /** Set by the minimap: walk to this room and open it. */
  travelTo: RoomId | null;
  exitRequested: boolean;
}

let state: WorldState = {
  phase: "intro",
  activeRoom: null,
  visited: [],
  hoverLabel: null,
  sheet: null,
  progress: 0,
  travelTo: null,
  exitRequested: false,
};

const listeners = new Set<() => void>();

export const world = {
  get: () => state,
  set(patch: Partial<WorldState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  reset() {
    state = { ...state, phase: "intro", activeRoom: null, hoverLabel: null, sheet: null, progress: 0, travelTo: null, exitRequested: false };
    listeners.forEach((l) => l());
  },
};

export function useWorld<T>(select: (s: WorldState) => T): T {
  return useSyncExternalStore(world.subscribe, () => select(state), () => select(state));
}
