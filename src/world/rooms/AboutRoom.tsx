import * as THREE from "three";
import RoomFrame from "@/world/RoomFrame";
import RoomInfoPanel from "@/world/RoomInfoPanel";
import { Desk, Monitor, WallFrame } from "@/world/RoomProps";
import { site } from "@/data/site";

export default function AboutRoom({ center, yaw, onExit }: { center: THREE.Vector3; yaw: number; onExit: () => void }) {
  return (
    <RoomFrame center={center} yaw={yaw} tint="#efe7d6" onExit={onExit}>
      <Desk position={[0, 0, -1.4]} />
      <Monitor position={[0, 0.72, -1.55]}>
        <RoomInfoPanel position={[0, 0, 0.01]} width={190}>
          <p className="eyebrow">About</p>
          <p className="mt-1 font-display text-sm font-semibold text-text">{site.name}</p>
          <p className="text-xs text-muted">{site.role}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">{site.tagline}</p>
        </RoomInfoPanel>
      </Monitor>

      <WallFrame position={[-2.4, 2.1, 0]} rotation={[0, Math.PI / 2, 0]} width={0.7} height={0.5} />
      <RoomInfoPanel position={[-2.35, 2.1, 0]} rotation={[0, Math.PI / 2, 0]} width={140}>
        <p className="eyebrow">Education</p>
        <p className="mt-1 text-xs font-medium text-text">{site.education.degree}</p>
        <p className="text-[11px] text-muted">{site.education.institution}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-accent">{site.education.year}</p>
      </RoomInfoPanel>

      <WallFrame position={[2.4, 1.6, 0.6]} rotation={[0, -Math.PI / 2, 0]} width={0.5} height={0.35} tone="#c9b998" />
      <WallFrame position={[2.4, 2.15, -0.2]} rotation={[0, -Math.PI / 2, 0]} width={0.4} height={0.28} tone="#c9b998" />
    </RoomFrame>
  );
}
