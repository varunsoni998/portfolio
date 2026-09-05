import * as THREE from "three";
import RoomFrame from "@/world/RoomFrame";
import RoomInfoPanel from "@/world/RoomInfoPanel";
import { Desk, Monitor } from "@/world/RoomProps";
import { ProjectStatusBadge } from "@/components/StatusBadge";
import { projects } from "@/data/projects";

const STATIONS: [number, number, number][] = [
  [-1.9, 0, -1.3],
  [0, 0, -1.5],
  [1.9, 0, -1.3],
];

export default function ProjectsRoom({ center, yaw, onExit }: { center: THREE.Vector3; yaw: number; onExit: () => void }) {
  return (
    <RoomFrame center={center} yaw={yaw} tint="#e8e2cf" onExit={onExit}>
      {projects.map((project, i) => {
        const pos = STATIONS[i] ?? STATIONS[STATIONS.length - 1];
        return (
          <group key={project.slug}>
            <Desk position={pos} />
            <Monitor position={[pos[0], 0.72, pos[2] - 0.15]}>
              <RoomInfoPanel position={[0, 0, 0.01]} width={200}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-sm font-semibold text-text">{project.name}</p>
                  <ProjectStatusBadge status={project.status} />
                </div>
                <p className="mt-1 text-[11px] text-muted">{project.subtitle}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-muted">{project.summary}</p>
                <a
                  href={`/projects/${project.slug}`}
                  className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.1em] text-accent hover:underline"
                >
                  View Case Study →
                </a>
              </RoomInfoPanel>
            </Monitor>
          </group>
        );
      })}
    </RoomFrame>
  );
}
