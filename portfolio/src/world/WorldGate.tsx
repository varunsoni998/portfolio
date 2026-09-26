import { useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import "@fontsource/caveat/700.css";
import "@fontsource/patrick-hand/400.css";
import "./hud/world.css";
import WorldExperience from "./WorldExperience";
import PaperIntro from "./hud/PaperIntro";
import Minimap from "./hud/Minimap";
import Sheets from "./hud/Sheets";
import { setMuted, isMuted } from "./audio";
import { setArtResolution, setMaxAnisotropy } from "./sketch/art";
import { world, useWorld } from "./store";
import { ROOMS } from "./worldConfig";
import { site } from "@/data/site";
import { gsap } from "gsap";

const PAPER = "#f6f3ea";

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function isLowPower() {
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  return Math.min(window.innerWidth, window.innerHeight) < 700 || (mem !== undefined && mem <= 4);
}

/** Flags the scene as ready once the first frame (and all the texture drawing) has happened. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const { gl } = useThree();
  const [done, setDone] = useState(false);
  useEffect(() => setMaxAnisotropy(gl.capabilities.getMaxAnisotropy()), [gl]);
  useFrame(() => {
    if (!done) {
      setDone(true);
      requestAnimationFrame(onReady);
    }
  });
  return null;
}

function Tooltip() {
  const label = useWorld((s) => s.hoverLabel);
  const [pos, setPos] = useState({ x: -999, y: -999 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  if (!label) return null;
  return (
    <div className="wg-tip" style={{ left: pos.x, top: pos.y }}>
      {label}
    </div>
  );
}

function Hint() {
  const phase = useWorld((s) => s.phase);
  const sheet = useWorld((s) => s.sheet);
  const progress = useWorld((s) => s.progress);
  let text: React.ReactNode = null;
  if (phase === "entrance") text = "click the door to come in";
  if (phase === "corridor")
    text =
      progress > 0.985 ? (
        "keep scrolling (or click the green door) for the classic site"
      ) : (
        <>
          <span className="mouse" aria-hidden="true" />
          scroll or drag to walk · click a door to go in
        </>
      );
  if (phase === "room") text = "click things to read more · Esc to go back";
  if (!text || sheet) return null;
  return (
    <div className="wg-hint" aria-live="polite">
      {text}
    </div>
  );
}

function RoomTag() {
  const phase = useWorld((s) => s.phase);
  const active = useWorld((s) => s.activeRoom);
  if (phase !== "room" || !active) return null;
  return (
    <div className="wg-room-tag">
      <button type="button" className="wg-btn" onClick={() => world.set({ exitRequested: true })}>
        ← back to the corridor
      </button>
    </div>
  );
}

interface WorldGateProps {
  onExit: () => void;
}

/**
 * Full-screen, hand-drawn 3D front door to the portfolio: a paper intro
 * that tears open, a brick facade with a double door, a corridor with a
 * themed door per section, and a room behind each one. Falls back to the
 * classic site when WebGL isn't available.
 */
export default function WorldGate({ onExit }: WorldGateProps) {
  const [webglOk] = useState(supportsWebGL);
  const [reducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [muted, setMutedState] = useState(isMuted);
  const [fontsReady, setFontsReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const phase = useWorld((s) => s.phase);

  useEffect(() => {
    world.reset();
    if (new URLSearchParams(window.location.search).has("worlddebug")) {
      (window as unknown as { __world: typeof world }).__world = world;
      gsap.ticker.lagSmoothing(0);
    }
    setArtResolution(isLowPower() ? 0.6 : 1);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.cursor = "auto";
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => alive && setFontsReady(true), 2500);
    Promise.all([document.fonts.load("700 40px Caveat"), document.fonts.load("400 40px 'Patrick Hand'")])
      .catch(() => undefined)
      .finally(() => {
        clearTimeout(t);
        if (alive) setFontsReady(true);
      });
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!webglOk) onExit();
  }, [webglOk, onExit]);

  if (!webglOk) return null;

  return (
    <div className="wg-root">
      <div className="wg-canvas">
        {fontsReady && (
          <Canvas
            dpr={[1, 1.75]}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            camera={{ fov: 55, near: 0.05, far: 120, position: [0, 1.65, 7.6] }}
            flat
          >
            <color attach="background" args={[PAPER]} />
            <fog attach="fog" args={[PAPER, 16, 58]} />
            <WorldExperience reducedMotion={reducedMotion} onExitToSite={onExit} />
            <ReadySignal onReady={() => setSceneReady(true)} />
          </Canvas>
        )}
      </div>
      <div className="wg-grain" />
      <div className="wg-vignette" />

      {phase !== "intro" && (
        <>
          <div className="wg-top">
            <a
              className="wg-brand"
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onExit();
              }}
            >
              <b>{site.name}</b>
              <span>{site.role}</span>
            </a>
            <div className="wg-actions">
              <button
                type="button"
                className="wg-btn small"
                aria-pressed={!muted}
                onClick={() => {
                  const next = !muted;
                  setMuted(next);
                  setMutedState(next);
                }}
              >
                {muted ? "♪ sound off" : "♪ sound on"}
              </button>
              <button type="button" className="wg-btn small" onClick={onExit}>
                skip to classic site →
              </button>
            </div>
          </div>
          <RoomTag />
          <Minimap />
          <Hint />
          <Tooltip />
          <Sheets />
          {/* screen-reader / keyboard shortcut list of the rooms */}
          <nav className="sr-only" aria-label="Rooms">
            {ROOMS.map((r) => (
              <button key={r.id} type="button" onClick={() => world.set({ travelTo: r.id })}>
                Go to {r.label}
              </button>
            ))}
          </nav>
        </>
      )}

      {phase === "intro" && (
        <PaperIntro
          ready={sceneReady}
          reducedMotion={reducedMotion}
          onDone={() => world.set({ phase: "entrance" })}
        />
      )}
    </div>
  );
}
