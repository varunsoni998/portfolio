import { useEffect, useRef } from "react";

/**
 * The wireframe/ember orb from the video reference, rebuilt with
 * web-native techniques rather than the source asset itself (that's a
 * rendered 3D particle/fire simulation from a third-party template —
 * not something to extract and reuse; see the chat for why). This is
 * an original interpretation aiming for the same *feel* — a tangled
 * dark mesh wrapped around a flickering warm core, drifting embers,
 * the odd bright sparkle — built from:
 *
 * - a static SVG wireframe (generated once, ~200 short line segments —
 *   not a clean geometric sphere but a tangled mesh, opacity/color
 *   varying by distance from center)
 * - a <canvas> ember/spark layer, animated via requestAnimationFrame:
 *   soft glowing dots drifting slowly, four-point sparkle flares,
 *   colored across white/amber/red by distance from the core
 * - a few blurred CSS "smoke" blobs behind it all
 * - layered, staggered blurred core-glow shapes for a flicker instead
 *   of one smooth pulse
 *
 * Canvas animation is skipped entirely (one static frame drawn, no
 * rAF loop) when prefers-reduced-motion is set — same rule the rest
 * of the site follows, just handled explicitly here since a canvas
 * loop isn't reachable by the global CSS animation-duration override.
 */

interface Ember {
  angle: number;
  radius: number;
  size: number;
  speed: number;
  phase: number;
  driftPhase: number;
  isFlare: boolean;
}

function makeEmbers(count: number, flareCount: number): Ember[] {
  const embers: Ember[] = [];
  for (let i = 0; i < count; i++) {
    embers.push({
      angle: Math.random() * Math.PI * 2,
      radius: Math.pow(Math.random(), 1.6) * 105, // biased toward center
      size: 1 + Math.random() * 2.2,
      speed: 0.4 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      driftPhase: Math.random() * Math.PI * 2,
      isFlare: false,
    });
  }
  for (let i = 0; i < flareCount; i++) {
    embers.push({
      angle: Math.random() * Math.PI * 2,
      radius: 20 + Math.random() * 55,
      size: 5 + Math.random() * 4,
      speed: 0.3 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      driftPhase: Math.random() * Math.PI * 2,
      isFlare: true,
    });
  }
  return embers;
}

function emberColor(distanceRatio: number, alpha: number) {
  // distanceRatio 0 (core) -> 1 (edge): white-hot core fading to amber, then ember-red
  if (distanceRatio < 0.35) return `rgba(255, 244, 224, ${alpha})`;
  if (distanceRatio < 0.7) return `rgba(230, 168, 96, ${alpha})`;
  return `rgba(196, 92, 60, ${alpha})`;
}

export default function HeroOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const embersRef = useRef<Ember[]>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 400;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    if (!embersRef.current) embersRef.current = makeEmbers(46, 5);
    const embers = embersRef.current!;
    const cx = size / 2;
    const cy = size / 2;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function draw(t: number) {
      ctx!.clearRect(0, 0, size, size);
      for (const e of embers) {
        const drift = reduceMotion ? 0 : Math.sin(t * 0.0002 * e.speed + e.driftPhase) * 6;
        const r = e.radius + drift;
        const x = cx + Math.cos(e.angle) * r;
        const y = cy + Math.sin(e.angle) * r * 0.94;
        const twinkle = reduceMotion ? 0.75 : 0.5 + 0.5 * Math.sin(t * 0.0016 * e.speed + e.phase);
        const distanceRatio = Math.min(1, r / 130);
        const alpha = (e.isFlare ? 0.55 : 0.75) * twinkle;

        if (e.isFlare) {
          const grad = ctx!.createRadialGradient(x, y, 0, x, y, e.size * 3);
          grad.addColorStop(0, emberColor(distanceRatio, alpha));
          grad.addColorStop(1, "rgba(255,255,255,0)");
          ctx!.fillStyle = grad;
          ctx!.beginPath();
          ctx!.arc(x, y, e.size * 3, 0, Math.PI * 2);
          ctx!.fill();

          // four-point sparkle cross
          ctx!.strokeStyle = emberColor(distanceRatio, alpha * 0.9);
          ctx!.lineWidth = 0.8;
          ctx!.beginPath();
          ctx!.moveTo(x - e.size * 2, y);
          ctx!.lineTo(x + e.size * 2, y);
          ctx!.moveTo(x, y - e.size * 2);
          ctx!.lineTo(x, y + e.size * 2);
          ctx!.stroke();
        } else {
          const grad = ctx!.createRadialGradient(x, y, 0, x, y, e.size * 2.4);
          grad.addColorStop(0, emberColor(distanceRatio, alpha));
          grad.addColorStop(1, "rgba(255,255,255,0)");
          ctx!.fillStyle = grad;
          ctx!.beginPath();
          ctx!.arc(x, y, e.size * 2.4, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      if (!reduceMotion) rafRef.current = requestAnimationFrame(draw);
    }

    const rafRef = { current: 0 };
    if (reduceMotion) {
      draw(0);
    } else {
      rafRef.current = requestAnimationFrame(draw);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden="true">
      {/* faint orbit rings */}
      <div className="absolute inset-0 rounded-full border border-border" />
      <div className="absolute inset-[8%] rounded-full border border-border" />

      {/* smoke wisps, behind everything */}
      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 animate-core-drift rounded-full bg-muted-2/10 blur-3xl" />
      <div
        className="absolute left-[38%] top-[46%] h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-morph rounded-full bg-muted-2/10 blur-2xl"
        style={{ animationDuration: "23s" }}
      />

      {/* flickering fire-toned core — layered, staggered for a flicker rather than a smooth pulse */}
      <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-morph rounded-full bg-danger/50 blur-2xl" />
      <div
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-morph rounded-full bg-amber/70 blur-xl"
        style={{ animationDuration: "9s", animationDirection: "reverse" }}
      />
      <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-pulse-node rounded-full bg-[#fff4e0] blur-md" />

      {/* ember/spark canvas layer */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ width: "100%", height: "100%" }} />

      {/* tangled wireframe mesh, slow rotation */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full animate-orbit-spin" style={{ animationDuration: "140s" }}>
        <g strokeWidth="0.6" fill="none">
          <line x1="260.1" y1="251.7" x2="240.1" y2="240.6" className="stroke-muted-2/70" style={{ opacity: 0.60 }} />
          <line x1="222.0" y1="252.9" x2="216.5" y2="234.6" className="stroke-muted-2/70" style={{ opacity: 0.75 }} />
          <line x1="273.0" y1="164.6" x2="298.2" y2="178.8" className="stroke-muted-2/70" style={{ opacity: 0.43 }} />
          <line x1="235.0" y1="148.3" x2="214.0" y2="108.1" className="stroke-muted-2/70" style={{ opacity: 0.54 }} />
          <line x1="112.6" y1="112.6" x2="169.8" y2="158.8" className="stroke-muted-2/70" style={{ opacity: 0.45 }} />
          <line x1="273.0" y1="164.6" x2="293.2" y2="183.8" className="stroke-muted-2/70" style={{ opacity: 0.46 }} />
          <line x1="181.9" y1="256.6" x2="197.7" y2="252.1" className="stroke-muted-2/70" style={{ opacity: 0.69 }} />
          <line x1="163.8" y1="242.6" x2="174.0" y2="256.2" className="stroke-muted-2/70" style={{ opacity: 0.67 }} />
          <line x1="126.4" y1="237.2" x2="163.8" y2="242.6" className="stroke-muted-2/70" style={{ opacity: 0.60 }} />
          <line x1="261.5" y1="184.4" x2="248.1" y2="188.1" className="stroke-muted-2/70" style={{ opacity: 0.68 }} />
          <line x1="273.0" y1="164.6" x2="293.2" y2="120.0" className="stroke-muted-2/70" style={{ opacity: 0.35 }} />
          <line x1="318.4" y1="187.5" x2="362.6" y2="197.7" className="stroke-muted-2/70" style={{ opacity: 0.15 }} />
          <line x1="217.1" y1="207.9" x2="191.2" y2="203.1" className="stroke-muted-2/70" style={{ opacity: 0.85 }} />
          <line x1="258.0" y1="121.5" x2="225.4" y2="121.4" className="stroke-muted-2/70" style={{ opacity: 0.44 }} />
          <line x1="136.0" y1="218.6" x2="78.0" y2="245.0" className="stroke-muted-2/70" style={{ opacity: 0.37 }} />
          <line x1="78.4" y1="194.4" x2="133.5" y2="188.7" className="stroke-muted-2/70" style={{ opacity: 0.40 }} />
          <line x1="176.2" y1="251.5" x2="181.9" y2="256.6" className="stroke-muted-2/70" style={{ opacity: 0.67 }} />
          <line x1="258.0" y1="121.5" x2="274.5" y2="109.0" className="stroke-muted-2/70" style={{ opacity: 0.30 }} />
          <line x1="253.6" y1="233.8" x2="240.1" y2="240.6" className="stroke-muted-2/70" style={{ opacity: 0.66 }} />
          <line x1="243.9" y1="294.8" x2="204.3" y2="291.1" className="stroke-muted-2/70" style={{ opacity: 0.39 }} />
          <line x1="273.0" y1="164.6" x2="261.5" y2="184.4" className="stroke-muted-2/70" style={{ opacity: 0.57 }} />
          <line x1="261.5" y1="184.4" x2="241.2" y2="175.5" className="stroke-muted-2/70" style={{ opacity: 0.69 }} />
          <line x1="187.6" y1="246.7" x2="163.8" y2="242.6" className="stroke-muted-2/70" style={{ opacity: 0.72 }} />
          <line x1="216.5" y1="234.6" x2="211.9" y2="223.8" className="stroke-amber/70" style={{ opacity: 0.85 }} />
          <line x1="183.7" y1="185.7" x2="191.2" y2="203.1" className="stroke-muted-2/70" style={{ opacity: 0.85 }} />
          <line x1="237.9" y1="221.7" x2="244.3" y2="226.5" className="stroke-muted-2/70" style={{ opacity: 0.75 }} />
          <line x1="222.0" y1="252.9" x2="220.9" y2="241.3" className="stroke-muted-2/70" style={{ opacity: 0.72 }} />
          <line x1="181.9" y1="256.6" x2="163.8" y2="242.6" className="stroke-muted-2/70" style={{ opacity: 0.68 }} />
          <line x1="212.8" y1="133.7" x2="225.4" y2="121.4" className="stroke-muted-2/70" style={{ opacity: 0.55 }} />
          <line x1="298.2" y1="178.8" x2="293.2" y2="183.8" className="stroke-muted-2/70" style={{ opacity: 0.38 }} />
          <line x1="234.0" y1="281.0" x2="222.0" y2="252.9" className="stroke-muted-2/70" style={{ opacity: 0.56 }} />
          <line x1="136.0" y1="218.6" x2="132.0" y2="200.1" className="stroke-muted-2/70" style={{ opacity: 0.61 }} />
          <line x1="133.5" y1="188.7" x2="132.0" y2="200.1" className="stroke-muted-2/70" style={{ opacity: 0.60 }} />
          <line x1="205.1" y1="153.3" x2="214.0" y2="108.1" className="stroke-muted-2/70" style={{ opacity: 0.58 }} />
          <line x1="136.0" y1="218.6" x2="153.4" y2="205.2" className="stroke-muted-2/70" style={{ opacity: 0.68 }} />
          <line x1="176.4" y1="262.6" x2="174.0" y2="256.2" className="stroke-muted-2/70" style={{ opacity: 0.62 }} />
          <line x1="273.0" y1="164.6" x2="318.4" y2="187.5" className="stroke-muted-2/70" style={{ opacity: 0.37 }} />
          <line x1="204.3" y1="291.1" x2="200.3" y2="286.8" className="stroke-muted-2/70" style={{ opacity: 0.44 }} />
          <line x1="298.2" y1="178.8" x2="293.2" y2="120.0" className="stroke-muted-2/70" style={{ opacity: 0.30 }} />
          <line x1="261.5" y1="184.4" x2="242.5" y2="194.8" className="stroke-muted-2/70" style={{ opacity: 0.71 }} />
          <line x1="150.0" y1="180.4" x2="153.4" y2="205.2" className="stroke-muted-2/70" style={{ opacity: 0.74 }} />
          <line x1="138.5" y1="193.0" x2="132.0" y2="200.1" className="stroke-muted-2/70" style={{ opacity: 0.62 }} />
          <line x1="187.9" y1="169.3" x2="183.7" y2="185.7" className="stroke-muted-2/70" style={{ opacity: 0.85 }} />
          <line x1="138.5" y1="193.0" x2="153.4" y2="205.2" className="stroke-muted-2/70" style={{ opacity: 0.70 }} />
          <line x1="273.0" y1="164.6" x2="241.2" y2="175.5" className="stroke-muted-2/70" style={{ opacity: 0.62 }} />
          <line x1="216.5" y1="234.6" x2="220.9" y2="241.3" className="stroke-amber/70" style={{ opacity: 0.79 }} />
          <line x1="217.9" y1="225.6" x2="234.9" y2="229.5" className="stroke-muted-2/70" style={{ opacity: 0.82 }} />
          <line x1="216.1" y1="260.2" x2="203.3" y2="245.3" className="stroke-muted-2/70" style={{ opacity: 0.70 }} />
          <line x1="189.9" y1="57.0" x2="181.8" y2="142.9" className="stroke-muted-2/70" style={{ opacity: 0.35 }} />
          <line x1="78.4" y1="194.4" x2="63.9" y2="135.3" className="stroke-muted-2/70" style={{ opacity: 0.15 }} />
          <line x1="157.6" y1="210.9" x2="153.4" y2="205.2" className="stroke-muted-2/70" style={{ opacity: 0.76 }} />
          <line x1="234.9" y1="229.5" x2="244.3" y2="226.5" className="stroke-muted-2/70" style={{ opacity: 0.74 }} />
          <line x1="242.5" y1="194.8" x2="256.6" y2="206.4" className="stroke-muted-2/70" style={{ opacity: 0.73 }} />
          <line x1="187.6" y1="246.7" x2="176.4" y2="262.6" className="stroke-muted-2/70" style={{ opacity: 0.67 }} />
          <line x1="204.3" y1="291.1" x2="251.5" y2="338.8" className="stroke-muted-2/70" style={{ opacity: 0.22 }} />
          <line x1="253.6" y1="233.8" x2="260.1" y2="251.7" className="stroke-muted-2/70" style={{ opacity: 0.57 }} />
          <line x1="258.0" y1="121.5" x2="189.9" y2="57.0" className="stroke-muted-2/70" style={{ opacity: 0.26 }} />
          <line x1="112.6" y1="112.6" x2="63.9" y2="135.3" className="stroke-muted-2/70" style={{ opacity: 0.15 }} />
          <line x1="235.0" y1="148.3" x2="225.4" y2="121.4" className="stroke-muted-2/70" style={{ opacity: 0.57 }} />
          <line x1="212.5" y1="250.0" x2="216.5" y2="234.6" className="stroke-amber/70" style={{ opacity: 0.77 }} />
          <line x1="187.9" y1="169.3" x2="181.8" y2="142.9" className="stroke-muted-2/70" style={{ opacity: 0.76 }} />
          <line x1="216.1" y1="260.2" x2="212.5" y2="250.0" className="stroke-muted-2/70" style={{ opacity: 0.68 }} />
          <line x1="212.5" y1="250.0" x2="197.7" y2="252.1" className="stroke-muted-2/70" style={{ opacity: 0.72 }} />
          <line x1="176.2" y1="251.5" x2="174.0" y2="256.2" className="stroke-muted-2/70" style={{ opacity: 0.66 }} />
          <line x1="205.1" y1="153.3" x2="181.8" y2="142.9" className="stroke-muted-2/70" style={{ opacity: 0.71 }} />
          <line x1="133.5" y1="188.7" x2="150.0" y2="180.4" className="stroke-muted-2/70" style={{ opacity: 0.65 }} />
          <line x1="169.8" y1="158.8" x2="181.8" y2="142.9" className="stroke-muted-2/70" style={{ opacity: 0.69 }} />
          <line x1="266.3" y1="211.9" x2="258.1" y2="214.4" className="stroke-muted-2/70" style={{ opacity: 0.63 }} />
          <line x1="242.5" y1="194.8" x2="241.3" y2="205.5" className="stroke-amber/70" style={{ opacity: 0.79 }} />
          <line x1="212.8" y1="133.7" x2="189.9" y2="57.0" className="stroke-muted-2/70" style={{ opacity: 0.32 }} />
          <line x1="186.0" y1="163.9" x2="181.8" y2="142.9" className="stroke-muted-2/70" style={{ opacity: 0.73 }} />
          <line x1="234.0" y1="281.0" x2="204.3" y2="291.1" className="stroke-muted-2/70" style={{ opacity: 0.45 }} />
          <line x1="138.5" y1="193.0" x2="150.0" y2="180.4" className="stroke-muted-2/70" style={{ opacity: 0.68 }} />
          <line x1="302.8" y1="188.0" x2="298.2" y2="178.8" className="stroke-muted-2/70" style={{ opacity: 0.35 }} />
          <line x1="318.4" y1="187.5" x2="302.8" y2="188.0" className="stroke-muted-2/70" style={{ opacity: 0.28 }} />
          <line x1="187.6" y1="246.7" x2="203.3" y2="245.3" className="stroke-muted-2/70" style={{ opacity: 0.76 }} />
          <line x1="239.8" y1="200.1" x2="256.6" y2="206.4" className="stroke-muted-2/70" style={{ opacity: 0.74 }} />
          <line x1="302.8" y1="188.0" x2="293.2" y2="183.8" className="stroke-muted-2/70" style={{ opacity: 0.37 }} />
          <line x1="225.4" y1="121.4" x2="214.0" y2="108.1" className="stroke-muted-2/70" style={{ opacity: 0.45 }} />
          <line x1="181.6" y1="187.2" x2="191.2" y2="203.1" className="stroke-amber/70" style={{ opacity: 0.85 }} />
          <line x1="212.5" y1="250.0" x2="220.9" y2="241.3" className="stroke-muted-2/70" style={{ opacity: 0.74 }} />
          <line x1="222.0" y1="252.9" x2="203.3" y2="245.3" className="stroke-muted-2/70" style={{ opacity: 0.72 }} />
          <line x1="259.5" y1="241.2" x2="329.1" y2="288.5" className="stroke-muted-2/70" style={{ opacity: 0.25 }} />
          <line x1="235.0" y1="148.3" x2="255.4" y2="166.2" className="stroke-muted-2/70" style={{ opacity: 0.64 }} />
          <line x1="243.9" y1="294.8" x2="234.0" y2="281.0" className="stroke-muted-2/70" style={{ opacity: 0.39 }} />
          <line x1="260.1" y1="251.7" x2="244.3" y2="226.5" className="stroke-muted-2/70" style={{ opacity: 0.62 }} />
          <line x1="136.0" y1="218.6" x2="126.4" y2="237.2" className="stroke-muted-2/70" style={{ opacity: 0.55 }} />
          <line x1="221.0" y1="202.2" x2="205.1" y2="206.1" className="stroke-amber/70" style={{ opacity: 0.85 }} />
          <line x1="214.0" y1="108.1" x2="189.9" y2="57.0" className="stroke-muted-2/70" style={{ opacity: 0.23 }} />
          <line x1="124.5" y1="273.9" x2="174.0" y2="256.2" className="stroke-muted-2/70" style={{ opacity: 0.49 }} />
          <line x1="234.0" y1="281.0" x2="216.1" y2="260.2" className="stroke-muted-2/70" style={{ opacity: 0.55 }} />
          <line x1="300.0" y1="246.5" x2="260.1" y2="251.7" className="stroke-muted-2/70" style={{ opacity: 0.40 }} />
          <line x1="235.0" y1="148.3" x2="212.8" y2="133.7" className="stroke-muted-2/70" style={{ opacity: 0.63 }} />
          <line x1="187.9" y1="169.3" x2="169.8" y2="158.8" className="stroke-muted-2/70" style={{ opacity: 0.79 }} />
          <line x1="239.8" y1="200.1" x2="241.3" y2="205.5" className="stroke-amber/70" style={{ opacity: 0.80 }} />
          <line x1="222.0" y1="252.9" x2="212.5" y2="250.0" className="stroke-muted-2/70" style={{ opacity: 0.70 }} />
          <line x1="216.5" y1="234.6" x2="203.3" y2="245.3" className="stroke-amber/70" style={{ opacity: 0.80 }} />
          <line x1="237.9" y1="221.7" x2="234.9" y2="229.5" className="stroke-amber/70" style={{ opacity: 0.77 }} />
          <line x1="259.5" y1="241.2" x2="240.1" y2="240.6" className="stroke-muted-2/70" style={{ opacity: 0.62 }} />
          <line x1="211.9" y1="223.8" x2="205.1" y2="206.1" className="stroke-muted-2/70" style={{ opacity: 0.85 }} />
          <line x1="181.6" y1="187.2" x2="188.0" y2="194.1" className="stroke-amber/70" style={{ opacity: 0.85 }} />
          <line x1="253.6" y1="233.8" x2="244.3" y2="226.5" className="stroke-muted-2/70" style={{ opacity: 0.67 }} />
          <line x1="216.1" y1="260.2" x2="204.3" y2="291.1" className="stroke-muted-2/70" style={{ opacity: 0.53 }} />
          <line x1="176.2" y1="251.5" x2="187.6" y2="246.7" className="stroke-muted-2/70" style={{ opacity: 0.71 }} />
          <line x1="248.1" y1="188.1" x2="255.4" y2="166.2" className="stroke-muted-2/70" style={{ opacity: 0.68 }} />
          <line x1="133.5" y1="188.7" x2="63.9" y2="135.3" className="stroke-muted-2/70" style={{ opacity: 0.30 }} />
          <line x1="183.7" y1="185.7" x2="188.0" y2="194.1" className="stroke-muted-2/70" style={{ opacity: 0.85 }} />
          <line x1="217.9" y1="225.6" x2="217.1" y2="207.9" className="stroke-muted-2/70" style={{ opacity: 0.85 }} />
          <line x1="187.6" y1="246.7" x2="181.9" y2="256.6" className="stroke-muted-2/70" style={{ opacity: 0.70 }} />
          <line x1="235.0" y1="148.3" x2="205.1" y2="153.3" className="stroke-muted-2/70" style={{ opacity: 0.71 }} />
          <line x1="223.7" y1="293.6" x2="200.3" y2="286.8" className="stroke-muted-2/70" style={{ opacity: 0.43 }} />
          <line x1="318.4" y1="187.5" x2="298.2" y2="178.8" className="stroke-muted-2/70" style={{ opacity: 0.29 }} />
          <line x1="187.9" y1="169.3" x2="186.0" y2="163.9" className="stroke-muted-2/70" style={{ opacity: 0.83 }} />
          <line x1="318.4" y1="187.5" x2="293.2" y2="183.8" className="stroke-muted-2/70" style={{ opacity: 0.31 }} />
          <line x1="239.8" y1="200.1" x2="241.2" y2="175.5" className="stroke-muted-2/70" style={{ opacity: 0.79 }} />
          <line x1="240.1" y1="240.6" x2="220.9" y2="241.3" className="stroke-muted-2/70" style={{ opacity: 0.72 }} />
          <line x1="205.1" y1="153.3" x2="186.0" y2="163.9" className="stroke-muted-2/70" style={{ opacity: 0.79 }} />
          <line x1="176.4" y1="262.6" x2="200.3" y2="286.8" className="stroke-muted-2/70" style={{ opacity: 0.54 }} />
          <line x1="299.6" y1="260.0" x2="259.5" y2="241.2" className="stroke-muted-2/70" style={{ opacity: 0.40 }} />
          <line x1="253.6" y1="233.8" x2="266.3" y2="211.9" className="stroke-muted-2/70" style={{ opacity: 0.62 }} />
          <line x1="78.0" y1="245.0" x2="132.0" y2="200.1" className="stroke-muted-2/70" style={{ opacity: 0.38 }} />
          <line x1="258.1" y1="214.4" x2="256.6" y2="206.4" className="stroke-muted-2/70" style={{ opacity: 0.67 }} />
          <line x1="248.1" y1="188.1" x2="242.5" y2="194.8" className="stroke-muted-2/70" style={{ opacity: 0.76 }} />
          <line x1="241.2" y1="175.5" x2="255.4" y2="166.2" className="stroke-muted-2/70" style={{ opacity: 0.68 }} />
          <line x1="176.4" y1="262.6" x2="163.8" y2="242.6" className="stroke-muted-2/70" style={{ opacity: 0.65 }} />
          <line x1="237.9" y1="221.7" x2="241.3" y2="205.5" className="stroke-amber/70" style={{ opacity: 0.79 }} />
          <line x1="225.4" y1="121.4" x2="274.5" y2="109.0" className="stroke-muted-2/70" style={{ opacity: 0.37 }} />
          <line x1="223.7" y1="293.6" x2="251.5" y2="338.8" className="stroke-muted-2/70" style={{ opacity: 0.20 }} />
          <line x1="239.8" y1="200.1" x2="242.5" y2="194.8" className="stroke-amber/70" style={{ opacity: 0.79 }} />
          <line x1="244.3" y1="226.5" x2="258.1" y2="214.4" className="stroke-muted-2/70" style={{ opacity: 0.69 }} />
          <line x1="217.1" y1="207.9" x2="205.1" y2="206.1" className="stroke-amber/70" style={{ opacity: 0.85 }} />
          <line x1="240.1" y1="240.6" x2="244.3" y2="226.5" className="stroke-muted-2/70" style={{ opacity: 0.70 }} />
          <line x1="181.6" y1="187.2" x2="183.7" y2="185.7" className="stroke-amber/70" style={{ opacity: 0.85 }} />
          <line x1="212.5" y1="250.0" x2="203.3" y2="245.3" className="stroke-muted-2/70" style={{ opacity: 0.74 }} />
          <line x1="258.0" y1="121.5" x2="293.2" y2="120.0" className="stroke-muted-2/70" style={{ opacity: 0.29 }} />
          <line x1="78.4" y1="194.4" x2="90.2" y2="159.7" className="stroke-muted-2/70" style={{ opacity: 0.23 }} />
          <line x1="191.2" y1="203.1" x2="188.0" y2="194.1" className="stroke-amber/70" style={{ opacity: 0.85 }} />
          <line x1="299.6" y1="260.0" x2="329.1" y2="288.5" className="stroke-muted-2/70" style={{ opacity: 0.15 }} />
          <line x1="258.1" y1="214.4" x2="241.3" y2="205.5" className="stroke-muted-2/70" style={{ opacity: 0.72 }} />
          <line x1="112.6" y1="112.6" x2="90.2" y2="159.7" className="stroke-muted-2/70" style={{ opacity: 0.23 }} />
          <line x1="217.1" y1="207.9" x2="221.0" y2="202.2" className="stroke-muted-2/70" style={{ opacity: 0.85 }} />
          <line x1="235.0" y1="148.3" x2="241.2" y2="175.5" className="stroke-muted-2/70" style={{ opacity: 0.70 }} />
          <line x1="222.0" y1="252.9" x2="216.1" y2="260.2" className="stroke-muted-2/70" style={{ opacity: 0.66 }} />
          <line x1="243.9" y1="294.8" x2="223.7" y2="293.6" className="stroke-muted-2/70" style={{ opacity: 0.36 }} />
          <line x1="243.9" y1="294.8" x2="251.5" y2="338.8" className="stroke-muted-2/70" style={{ opacity: 0.17 }} />
          <line x1="176.2" y1="251.5" x2="163.8" y2="242.6" className="stroke-muted-2/70" style={{ opacity: 0.69 }} />
          <line x1="260.1" y1="251.7" x2="234.9" y2="229.5" className="stroke-muted-2/70" style={{ opacity: 0.64 }} />
          <line x1="176.4" y1="262.6" x2="124.5" y2="273.9" className="stroke-muted-2/70" style={{ opacity: 0.48 }} />
          <line x1="299.6" y1="260.0" x2="300.0" y2="246.5" className="stroke-muted-2/70" style={{ opacity: 0.26 }} />
          <line x1="187.6" y1="246.7" x2="174.0" y2="256.2" className="stroke-muted-2/70" style={{ opacity: 0.69 }} />
          <line x1="362.6" y1="197.7" x2="302.8" y2="188.0" className="stroke-muted-2/70" style={{ opacity: 0.15 }} />
          <line x1="203.3" y1="245.3" x2="197.7" y2="252.1" className="stroke-muted-2/70" style={{ opacity: 0.74 }} />
          <line x1="256.6" y1="206.4" x2="241.3" y2="205.5" className="stroke-muted-2/70" style={{ opacity: 0.73 }} />
          <line x1="217.9" y1="225.6" x2="216.5" y2="234.6" className="stroke-amber/70" style={{ opacity: 0.84 }} />
          <line x1="90.2" y1="159.7" x2="63.9" y2="135.3" className="stroke-muted-2/70" style={{ opacity: 0.15 }} />
          <line x1="239.8" y1="200.1" x2="248.1" y2="188.1" className="stroke-amber/70" style={{ opacity: 0.77 }} />
          <line x1="181.9" y1="256.6" x2="174.0" y2="256.2" className="stroke-muted-2/70" style={{ opacity: 0.65 }} />
          <line x1="217.9" y1="225.6" x2="211.9" y2="223.8" className="stroke-amber/70" style={{ opacity: 0.85 }} />
          <line x1="217.1" y1="207.9" x2="211.9" y2="223.8" className="stroke-muted-2/70" style={{ opacity: 0.85 }} />
          <line x1="239.8" y1="200.1" x2="221.0" y2="202.2" className="stroke-muted-2/70" style={{ opacity: 0.85 }} />
          <line x1="133.5" y1="188.7" x2="138.5" y2="193.0" className="stroke-muted-2/70" style={{ opacity: 0.62 }} />
          <line x1="136.0" y1="218.6" x2="138.5" y2="193.0" className="stroke-muted-2/70" style={{ opacity: 0.63 }} />
          <line x1="132.0" y1="200.1" x2="150.0" y2="180.4" className="stroke-muted-2/70" style={{ opacity: 0.66 }} />
          <line x1="215.1" y1="191.4" x2="205.1" y2="206.1" className="stroke-muted-2/70" style={{ opacity: 0.85 }} />
          <line x1="237.9" y1="221.7" x2="240.1" y2="240.6" className="stroke-muted-2/70" style={{ opacity: 0.73 }} />
          <line x1="225.4" y1="121.4" x2="189.9" y2="57.0" className="stroke-muted-2/70" style={{ opacity: 0.28 }} />
          <line x1="78.0" y1="245.0" x2="124.5" y2="273.9" className="stroke-muted-2/70" style={{ opacity: 0.25 }} />
          <line x1="78.0" y1="245.0" x2="126.4" y2="237.2" className="stroke-muted-2/70" style={{ opacity: 0.31 }} />
          <line x1="261.5" y1="184.4" x2="302.8" y2="188.0" className="stroke-muted-2/70" style={{ opacity: 0.48 }} />
          <line x1="188.0" y1="194.1" x2="205.1" y2="206.1" className="stroke-muted-2/70" style={{ opacity: 0.85 }} />
          <line x1="273.0" y1="164.6" x2="274.5" y2="109.0" className="stroke-muted-2/70" style={{ opacity: 0.38 }} />
          <line x1="274.5" y1="109.0" x2="293.2" y2="120.0" className="stroke-muted-2/70" style={{ opacity: 0.21 }} />
          <line x1="191.2" y1="203.1" x2="205.1" y2="206.1" className="stroke-amber/70" style={{ opacity: 0.85 }} />
          <line x1="261.5" y1="184.4" x2="255.4" y2="166.2" className="stroke-muted-2/70" style={{ opacity: 0.63 }} />
          <line x1="241.2" y1="175.5" x2="248.1" y2="188.1" className="stroke-muted-2/70" style={{ opacity: 0.74 }} />
          <line x1="124.5" y1="273.9" x2="163.8" y2="242.6" className="stroke-muted-2/70" style={{ opacity: 0.50 }} />
          <line x1="217.9" y1="225.6" x2="220.9" y2="241.3" className="stroke-muted-2/70" style={{ opacity: 0.81 }} />
          <line x1="205.1" y1="153.3" x2="212.8" y2="133.7" className="stroke-muted-2/70" style={{ opacity: 0.68 }} />
          <line x1="132.0" y1="200.1" x2="126.4" y2="237.2" className="stroke-muted-2/70" style={{ opacity: 0.56 }} />
          <line x1="176.2" y1="251.5" x2="176.4" y2="262.6" className="stroke-muted-2/70" style={{ opacity: 0.64 }} />
          <line x1="169.8" y1="158.8" x2="186.0" y2="163.9" className="stroke-muted-2/70" style={{ opacity: 0.77 }} />
          <line x1="136.0" y1="218.6" x2="157.6" y2="210.9" className="stroke-muted-2/70" style={{ opacity: 0.69 }} />
          <line x1="78.4" y1="194.4" x2="78.0" y2="245.0" className="stroke-muted-2/70" style={{ opacity: 0.19 }} />
          <line x1="300.0" y1="246.5" x2="259.5" y2="241.2" className="stroke-muted-2/70" style={{ opacity: 0.43 }} />
          <line x1="215.1" y1="191.4" x2="221.0" y2="202.2" className="stroke-amber/70" style={{ opacity: 0.85 }} />
          <line x1="258.0" y1="121.5" x2="214.0" y2="108.1" className="stroke-muted-2/70" style={{ opacity: 0.41 }} />
          <line x1="138.5" y1="193.0" x2="157.6" y2="210.9" className="stroke-muted-2/70" style={{ opacity: 0.71 }} />
          <line x1="260.1" y1="251.7" x2="259.5" y2="241.2" className="stroke-muted-2/70" style={{ opacity: 0.54 }} />
          <line x1="273.0" y1="164.6" x2="302.8" y2="188.0" className="stroke-muted-2/70" style={{ opacity: 0.43 }} />
          <line x1="187.9" y1="169.3" x2="205.1" y2="153.3" className="stroke-muted-2/70" style={{ opacity: 0.81 }} />
          <line x1="299.6" y1="260.0" x2="260.1" y2="251.7" className="stroke-muted-2/70" style={{ opacity: 0.38 }} />
          <line x1="362.6" y1="197.7" x2="298.2" y2="178.8" className="stroke-muted-2/70" style={{ opacity: 0.15 }} />
          <line x1="112.6" y1="112.6" x2="181.8" y2="142.9" className="stroke-muted-2/70" style={{ opacity: 0.44 }} />
          <line x1="216.1" y1="260.2" x2="197.7" y2="252.1" className="stroke-muted-2/70" style={{ opacity: 0.68 }} />
          <line x1="221.0" y1="202.2" x2="241.3" y2="205.5" className="stroke-muted-2/70" style={{ opacity: 0.85 }} />
          <line x1="273.0" y1="164.6" x2="255.4" y2="166.2" className="stroke-muted-2/70" style={{ opacity: 0.56 }} />
          <line x1="212.8" y1="133.7" x2="214.0" y2="108.1" className="stroke-muted-2/70" style={{ opacity: 0.51 }} />
          <line x1="235.0" y1="148.3" x2="258.0" y2="121.5" className="stroke-muted-2/70" style={{ opacity: 0.51 }} />
          <line x1="234.0" y1="281.0" x2="223.7" y2="293.6" className="stroke-muted-2/70" style={{ opacity: 0.42 }} />
          <line x1="240.1" y1="240.6" x2="234.9" y2="229.5" className="stroke-muted-2/70" style={{ opacity: 0.72 }} />
          <line x1="78.4" y1="194.4" x2="132.0" y2="200.1" className="stroke-muted-2/70" style={{ opacity: 0.40 }} />
          <line x1="253.6" y1="233.8" x2="259.5" y2="241.2" className="stroke-muted-2/70" style={{ opacity: 0.60 }} />
          <line x1="300.0" y1="246.5" x2="329.1" y2="288.5" className="stroke-muted-2/70" style={{ opacity: 0.15 }} />
          <line x1="266.3" y1="211.9" x2="256.6" y2="206.4" className="stroke-muted-2/70" style={{ opacity: 0.64 }} />
          <line x1="261.5" y1="184.4" x2="256.6" y2="206.4" className="stroke-muted-2/70" style={{ opacity: 0.66 }} />
          <line x1="241.2" y1="175.5" x2="242.5" y2="194.8" className="stroke-amber/70" style={{ opacity: 0.77 }} />
          <line x1="234.0" y1="281.0" x2="251.5" y2="338.8" className="stroke-muted-2/70" style={{ opacity: 0.23 }} />
          <line x1="176.4" y1="262.6" x2="181.9" y2="256.6" className="stroke-muted-2/70" style={{ opacity: 0.63 }} />
          <line x1="260.1" y1="251.7" x2="329.1" y2="288.5" className="stroke-muted-2/70" style={{ opacity: 0.23 }} />
          <line x1="124.5" y1="273.9" x2="126.4" y2="237.2" className="stroke-muted-2/70" style={{ opacity: 0.41 }} />
          <line x1="183.7" y1="185.7" x2="186.0" y2="163.9" className="stroke-amber/70" style={{ opacity: 0.85 }} />
          <line x1="216.1" y1="260.2" x2="200.3" y2="286.8" className="stroke-muted-2/70" style={{ opacity: 0.55 }} />
          <line x1="216.1" y1="260.2" x2="220.9" y2="241.3" className="stroke-muted-2/70" style={{ opacity: 0.70 }} />
          <line x1="223.7" y1="293.6" x2="204.3" y2="291.1" className="stroke-muted-2/70" style={{ opacity: 0.41 }} />
          <line x1="217.1" y1="207.9" x2="215.1" y2="191.4" className="stroke-muted-2/70" style={{ opacity: 0.85 }} />
          <line x1="187.9" y1="169.3" x2="181.6" y2="187.2" className="stroke-muted-2/70" style={{ opacity: 0.85 }} />
          <line x1="187.6" y1="246.7" x2="197.7" y2="252.1" className="stroke-muted-2/70" style={{ opacity: 0.73 }} />
        </g>
      </svg>
    </div>
  );
}
