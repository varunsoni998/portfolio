import * as THREE from "three";
import RoomFrame from "@/world/RoomFrame";
import RoomInfoPanel from "@/world/RoomInfoPanel";
import { Desk, Monitor, PaperStack } from "@/world/RoomProps";
import { WHAT_I_BUILD, CURRENTLY_BUILDING_STAGES } from "@/data/homeContent";

export default function ExperienceRoom({ center, yaw, onExit }: { center: THREE.Vector3; yaw: number; onExit: () => void }) {
  return (
    <RoomFrame center={center} yaw={yaw} tint="#e9e3d1" onExit={onExit}>
      <Desk position={[-1, 0, -1.5]} />
      <Monitor position={[-1, 0.72, -1.65]}>
        <RoomInfoPanel position={[0, 0, 0.01]} width={190}>
          <p className="eyebrow">Currently Building</p>
          <p className="mt-1 text-xs font-medium text-text">BusinessOS</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {CURRENTLY_BUILDING_STAGES.map((stage) => (
              <span
                key={stage.label}
                className={`rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase ${
                  stage.done ? "border-accent/50 text-accent" : "border-border-2 text-muted-2"
                }`}
              >
                {stage.label}
              </span>
            ))}
          </div>
        </RoomInfoPanel>
      </Monitor>

      <PaperStack position={[1.4, 0.72, -1.3]} />
      <RoomInfoPanel position={[1.4, 1.05, -1.3]} width={190}>
        <p className="eyebrow">What I Build</p>
        <ul className="mt-1.5 flex flex-col gap-1.5">
          {WHAT_I_BUILD.map((item) => (
            <li key={item.title}>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-accent">{item.title}</p>
              <p className="text-[10px] leading-snug text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </RoomInfoPanel>
    </RoomFrame>
  );
}
