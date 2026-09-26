import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { site } from "@/data/site";
import { playTearSound, startAmbient } from "../audio";

/** Jagged tear line from top to bottom, in % of the viewport. */
function tearLine(): [number, number][] {
  const pts: [number, number][] = [];
  let x = 52;
  for (let y = 0; y <= 100; y += 2.5) {
    x += (Math.random() - 0.5) * 3.2 - 0.06;
    x = Math.max(40, Math.min(60, x));
    pts.push([x + (Math.random() - 0.5) * 1.2, y]);
  }
  return pts;
}

function SheetContent({ ready }: { ready: boolean }) {
  return (
    <div className="wg-intro-sheet">
      <h1>{site.name}</h1>
      <p>{site.role}</p>
      <svg className="wg-intro-doodle" viewBox="0 0 320 90" aria-hidden="true">
        {/* a little doorway doodle with a path leading to it */}
        <path d="M130 80 L130 22 Q160 4 190 22 L190 80" fill="none" stroke="#1c1a17" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M140 80 L140 30 Q160 16 180 30 L180 80" fill="none" stroke="#1c1a17" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="173" cy="56" r="2.5" fill="#1c1a17" />
        <path d="M10 84 Q70 70 128 82 M192 82 Q250 70 310 84" fill="none" stroke="#1c1a17" strokeWidth="2" strokeLinecap="round" className="wg-dash" />
        <path d="M60 40 q8 -10 16 0 q8 -10 16 0" fill="none" stroke="#1c1a17" strokeWidth="1.6" />
        <path d="M232 30 q6 -8 12 0 q6 -8 12 0" fill="none" stroke="#1c1a17" strokeWidth="1.6" />
      </svg>
      {ready ? (
        <div className="wg-intro-cta">
          <span className="scissors" aria-hidden="true">
            ✂
          </span>
          click to tear it open
        </div>
      ) : (
        <div className="wg-intro-cta wg-intro-loading">sharpening pencils…</div>
      )}
    </div>
  );
}

/**
 * The opening beat: the whole screen is a sheet of notebook paper that
 * rips down the middle and falls away, revealing the drawn world behind.
 * Also doubles as the user gesture that unlocks Web Audio.
 */
export default function PaperIntro({ ready, reducedMotion, onDone }: { ready: boolean; reducedMotion: boolean; onDone: () => void }) {
  const line = useMemo(tearLine, []);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [torn, setTorn] = useState(false);

  const leftClip = `polygon(0% 0%, ${line.map(([x, y]) => `${x}% ${y}%`).join(", ")}, 0% 100%)`;
  const rightClip = `polygon(100% 0%, ${line.map(([x, y]) => `${x}% ${y}%`).join(", ")}, 100% 100%)`;

  const tear = () => {
    if (!ready || torn) return;
    setTorn(true);
    startAmbient();
    playTearSound();
    if (reducedMotion) {
      onDone();
      return;
    }
    const tl = gsap.timeline({ onComplete: onDone });
    tl.to(leftRef.current, { xPercent: -8, rotation: -2, duration: 0.25, ease: "power2.out", transformOrigin: "0% 100%" }, 0)
      .to(rightRef.current, { xPercent: 8, rotation: 2, duration: 0.25, ease: "power2.out", transformOrigin: "100% 100%" }, 0)
      .to(leftRef.current, { xPercent: -80, yPercent: 60, rotation: -24, duration: 1.1, ease: "power2.in" }, 0.25)
      .to(rightRef.current, { xPercent: 80, yPercent: 70, rotation: 28, duration: 1.15, ease: "power2.in" }, 0.3);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") tear();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="wg-intro" onClick={tear} role="button" tabIndex={0} aria-label="Tear open the page to enter the portfolio">
      <div ref={leftRef} className="wg-intro-half">
        <div className="wg-intro-clip" style={{ clipPath: leftClip }}>
          <SheetContent ready={ready} />
        </div>
      </div>
      <div ref={rightRef} className="wg-intro-half">
        <div className="wg-intro-clip" style={{ clipPath: rightClip }}>
          <SheetContent ready={ready} />
        </div>
      </div>
    </div>
  );
}
