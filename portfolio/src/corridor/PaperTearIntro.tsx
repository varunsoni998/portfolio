import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const TORN_EDGE_TOP =
  "polygon(0% 0%, 100% 0%, 100% 82%, 92% 88%, 84% 80%, 76% 90%, 68% 84%, 60% 92%, 52% 82%, 44% 90%, 36% 84%, 28% 92%, 20% 80%, 12% 88%, 4% 82%, 0% 90%)";
const TORN_EDGE_BOTTOM =
  "polygon(0% 10%, 4% 18%, 12% 12%, 20% 20%, 28% 8%, 36% 16%, 44% 10%, 52% 18%, 60% 8%, 68% 16%, 76% 10%, 84% 20%, 92% 12%, 100% 18%, 100% 100%, 0% 100%)";

export default function PaperTearIntro({ onComplete }: { onComplete: () => void }) {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      onComplete();
      return;
    }

    const tl = gsap.timeline({ onComplete });
    tl.set([topRef.current, bottomRef.current], { opacity: 1 })
      .to(topRef.current, { yPercent: -105, duration: 0.9, ease: "power3.inOut" }, 0.4)
      .to(bottomRef.current, { yPercent: 105, duration: 0.9, ease: "power3.inOut" }, 0.4)
      .to(containerRef.current, { opacity: 0, duration: 0.2 }, ">-0.1");

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-50">
      <div
        ref={topRef}
        className="absolute inset-x-0 top-0 h-1/2 bg-surface"
        style={{ clipPath: TORN_EDGE_TOP }}
      />
      <div
        ref={bottomRef}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-surface"
        style={{ clipPath: TORN_EDGE_BOTTOM }}
      />
    </div>
  );
}
