import * as THREE from "three";
import RoomFrame from "@/world/RoomFrame";
import RoomInfoPanel from "@/world/RoomInfoPanel";
import { Desk, Monitor, WallFrame } from "@/world/RoomProps";
import { ROOM_DEPTH } from "@/world/worldConfig";
import { aiLabTools } from "@/data/aiLabTools";

const STATIONS: [number, number, number][] = [
  [-1.9, 0, -1.3],
  [0, 0, -1.6],
  [1.9, 0, -1.3],
];

export default function AiLabRoom({ center, yaw, onExit }: { center: THREE.Vector3; yaw: number; onExit: () => void }) {
  const featured = aiLabTools.slice(0, 3);
  const backWallZ = ROOM_DEPTH / 2 - 0.02;

  return (
    <RoomFrame center={center} yaw={yaw} tint="#e2ddce" onExit={onExit}>
      {featured.map((tool, i) => {
        const pos = STATIONS[i];
        return (
          <group key={tool.slug}>
            <Desk position={pos} />
            <Monitor position={[pos[0], 0.72, pos[2] - 0.15]}>
              <RoomInfoPanel position={[0, 0, 0.01]} width={190}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-xs font-semibold text-text">{tool.title}</p>
                  <span className="rounded-full border border-border-2 px-1.5 py-0.5 font-mono text-[9px] uppercase text-muted">
                    {tool.infra}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">{tool.shortDescription}</p>
                <a
                  href={tool.path}
                  className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.1em] text-accent hover:underline"
                >
                  Try →
                </a>
              </RoomInfoPanel>
            </Monitor>
          </group>
        );
      })}

      <WallFrame position={[0, 2.6, backWallZ]} rotation={[0, Math.PI, 0]} width={1.4} height={0.4} tone="#2a2621" />
      <RoomInfoPanel position={[0, 2.6, backWallZ - 0.02]} rotation={[0, Math.PI, 0]} width={220}>
        <p className="eyebrow">AI Lab</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          Interactive systems I've built and deployed — see the full gallery at{" "}
          <a href="/lab" className="text-accent hover:underline">
            /lab
          </a>
          .
        </p>
      </RoomInfoPanel>
    </RoomFrame>
  );
}
