import type { ReactNode } from "react";
import { Html } from "@react-three/drei";

/**
 * Places real HTML content at a point in 3D space, scaled/occluded so it
 * reads as a physical screen or noticeboard rather than a UI overlay
 * floating on top of the scene. This is a deliberate choice over baking
 * text into canvas textures: the content stays real, selectable, and
 * link-clickable (contact links, GitHub/demo links) instead of being a
 * flat picture of text.
 */
export default function RoomInfoPanel({
  position,
  rotation,
  width = 260,
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  children: ReactNode;
}) {
  return (
    <Html
      position={position}
      rotation={rotation}
      transform
      occlude
      distanceFactor={0.6}
      style={{ width, pointerEvents: "auto" }}
    >
      <div className="rounded-lg border border-border-2 bg-surface/95 p-3 font-body text-[13px] leading-snug text-text shadow-surface">
        {children}
      </div>
    </Html>
  );
}
