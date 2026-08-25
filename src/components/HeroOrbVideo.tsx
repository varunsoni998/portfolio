import { useEffect, useRef } from "react";

/**
 * The real thing — an AI-generated video (LTX 2.3) of the wireframe/
 * ember orb, replacing the canvas-built approximation in HeroOrb.tsx.
 * That component is kept in the repo (unused) as a zero-dependency
 * fallback in case the video ever needs to come out.
 *
 * The clip's background isn't transparent — it's a flat gray/beige
 * studio vignette baked into the render, not a color match for the
 * site's off-white surface. A CSS radial mask fades the video to
 * transparent, but that first version fully showed the video up to
 * 52% of the box radius — which is much bigger than the orb itself
 * (measured directly from the source frame: the dark material only
 * extends to roughly 35–40% of the frame), so most of what was fully
 * opaque was the flat background, not the orb. That's what read as
 * "sitting on a plate" — plus two decorative ring borders drawn on
 * top made it look boxed in on purpose. Both are gone now: no ring
 * borders, and the mask's opaque radius is pulled in tight to the
 * orb's actual measured extent (via `closest-side` sizing, so the
 * percentages below are simple fractions of the box's half-width),
 * so almost none of the flat background survives the fade — just the
 * orb's dark tendrils dissolving into the page.
 */
export default function HeroOrbVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Respect prefers-reduced-motion explicitly: an autoplaying looped
    // video isn't reachable by the site's global CSS animation-duration
    // override, so pause it manually and leave the first frame showing.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
    }
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden="true">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          maskImage: "radial-gradient(circle closest-side, black 30%, transparent 58%)",
          WebkitMaskImage: "radial-gradient(circle closest-side, black 30%, transparent 58%)",
        }}
        src="/hero/orb.mp4"
        poster="/hero/orb-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
      />
    </div>
  );
}
