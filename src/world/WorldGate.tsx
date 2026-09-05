import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import WorldExperience from "./WorldExperience";
import { setMuted, isMuted } from "./audio";

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

interface WorldGateProps {
  onExit: () => void;
}

export default function WorldGate({ onExit }: WorldGateProps) {
  const [webglOk] = useState(supportsWebGL);
  const [reducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [muted, setMutedState] = useState(isMuted);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    if (!webglOk) onExit();
  }, [webglOk, onExit]);

  if (!webglOk) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "low-power" }}
        camera={{ fov: 62, near: 0.1, far: 100, position: [0, 1.6, 10] }}
      >
        <color attach="background" args={["#dcd6c6"]} />
        <fog attach="fog" args={["#dcd6c6", 6, 30]} />
        <WorldExperience reducedMotion={reducedMotion} onExitToSite={onExit} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-6 md:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-text/70">Varun Dhanak</p>
        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !muted;
              setMuted(next);
              setMutedState(next);
            }}
            className="rounded-full border border-border-2 bg-surface/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text backdrop-blur hover:border-accent hover:text-accent"
          >
            {muted ? "Sound Off" : "Sound On"}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border border-border-2 bg-surface/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text backdrop-blur hover:border-accent hover:text-accent"
          >
            Skip
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center px-6 text-center">
        <p className="rounded-full border border-border-2 bg-surface/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text/70 backdrop-blur">
          {reducedMotion ? "Tap Skip to enter the site" : "Click the door to enter · scroll to walk · click doors to explore"}
        </p>
      </div>
    </div>
  );
}
