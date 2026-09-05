import * as THREE from "three";
import RoomFrame from "@/world/RoomFrame";
import RoomInfoPanel from "@/world/RoomInfoPanel";
import { Desk, Monitor } from "@/world/RoomProps";
import { site } from "@/data/site";

export default function ContactRoom({ center, yaw, onExit }: { center: THREE.Vector3; yaw: number; onExit: () => void }) {
  return (
    <RoomFrame center={center} yaw={yaw} tint="#efe9d9" onExit={onExit}>
      <Desk position={[0, 0, -1.4]} />
      <Monitor position={[0, 0.72, -1.55]}>
        <RoomInfoPanel position={[0, 0, 0.01]} width={200}>
          <p className="eyebrow">Let's build something.</p>
          <div className="mt-2 flex flex-col gap-1.5 font-mono text-[11px]">
            <a href={site.links.email} className="text-text hover:text-accent">
              {site.links.email.replace("mailto:", "")}
            </a>
            <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent">
              GitHub
            </a>
            <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent">
              LinkedIn
            </a>
            {site.hasResume && (
              <a href={site.resumeUrl} download className="text-muted hover:text-accent">
                Resume
              </a>
            )}
          </div>
        </RoomInfoPanel>
      </Monitor>
    </RoomFrame>
  );
}
