import { useEffect, useRef, useState } from "react";
import PaperTearIntro from "./PaperTearIntro";
import CorridorScene from "./CorridorScene";
import { useVirtualScroll } from "./useVirtualScroll";
import type { CorridorDoor } from "./corridorConfig";

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

interface CorridorGateProps {
  /** Called once the corridor should be dismissed — either a door was picked or the visitor skipped. */
  onExit: (target: string | null) => void;
}

/**
 * The corridor is a full-viewport takeover that gates entry into the real
 * site (see Home.tsx) — not a rebuild of every page in 3D. Reusing the
 * fully-built Selected Work / AI Lab / About / Contact content as the
 * "rooms" behind each door was a deliberate scope decision: modeling four
 * separate room interiors would multiply the risk (and the asset problem)
 * for a portfolio that already has real content built and working.
 */
export default function CorridorGate({ onExit }: CorridorGateProps) {
  const [introDone, setIntroDone] = useState(false);
  const [webglOk] = useState(supportsWebGL);
  const [reducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const progressDisplay = useRef(0);

  useEffect(() => {
    // Lock real page scroll while the corridor owns input.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const progressRef = useVirtualScroll({
    onProgress: (p) => {
      progressDisplay.current = p;
      if (p >= 0.995) onExit(null); // reached the far end — drop straight into the site
    },
  });

  // No WebGL, or the visitor asked for reduced motion — skip straight to
  // the real site instead of showing a broken canvas or forcing motion on
  // someone who opted out of it.
  useEffect(() => {
    if (!webglOk) onExit(null);
  }, [webglOk, onExit]);

  if (!webglOk) return null;

  function handleSelectDoor(door: CorridorDoor) {
    onExit(door.target);
  }

  return (
    <div className="fixed inset-0 z-40 bg-background">
      {!introDone && <PaperTearIntro onComplete={() => setIntroDone(true)} />}

      <CorridorScene progressRef={progressRef} reducedMotion={reducedMotion} onSelectDoor={handleSelectDoor} />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-6 md:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-text/70">Varun Dhanak</p>
        <button
          type="button"
          onClick={() => onExit(null)}
          className="pointer-events-auto rounded-full border border-border-2 bg-surface/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text backdrop-blur hover:border-accent hover:text-accent"
        >
          Skip
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
        <p className="rounded-full border border-border-2 bg-surface/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text/70 backdrop-blur">
          {reducedMotion ? "Tap Skip to enter the site" : "Scroll to walk · click a door to enter"}
        </p>
      </div>
    </div>
  );
}
