import * as THREE from "three";
import RoomFrame from "@/world/RoomFrame";
import RoomInfoPanel from "@/world/RoomInfoPanel";
import { WallFrame, Desk, Monitor } from "@/world/RoomProps";
import { SKILLS } from "@/data/homeContent";

const WALL_SLOTS: { position: [number, number, number]; rotation: [number, number, number] }[] = [
  { position: [-2.4, 2.0, -1], rotation: [0, Math.PI / 2, 0] },
  { position: [-2.4, 2.0, 1], rotation: [0, Math.PI / 2, 0] },
  { position: [2.4, 2.0, -1], rotation: [0, -Math.PI / 2, 0] },
  { position: [2.4, 2.0, 1], rotation: [0, -Math.PI / 2, 0] },
];

export default function SkillsRoom({ center, yaw, onExit }: { center: THREE.Vector3; yaw: number; onExit: () => void }) {
  return (
    <RoomFrame center={center} yaw={yaw} tint="#e6e0cc" onExit={onExit}>
      <Desk position={[0, 0, -1.5]} />
      <Monitor position={[0, 0.72, -1.65]}>
        <RoomInfoPanel position={[0, 0, 0.01]} width={150}>
          <p className="eyebrow">Stack</p>
          <p className="mt-1 text-[11px] text-muted">Real technologies, grouped by area — see the panels on the walls.</p>
        </RoomInfoPanel>
      </Monitor>

      {SKILLS.slice(0, 4).map((group, i) => {
        const slot = WALL_SLOTS[i];
        return (
          <group key={group.category}>
            <WallFrame position={slot.position} rotation={slot.rotation} width={0.9} height={0.6} />
            <RoomInfoPanel position={slot.position} rotation={slot.rotation} width={170}>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent">{group.category}</p>
              <ul className="mt-1.5 flex flex-wrap gap-1">
                {group.items.map((item) => (
                  <li key={item} className="rounded-full border border-border-2 px-1.5 py-0.5 text-[10px] text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </RoomInfoPanel>
          </group>
        );
      })}
    </RoomFrame>
  );
}
