import { useEffect, useRef } from "react";

interface UseVirtualScrollOptions {
  onProgress: (progress: number) => void;
  /** How much one wheel "tick" or drag pixel moves progress. */
  sensitivity?: number;
}

/**
 * Drives a 0-1 progress value from wheel, touch drag, and arrow/space key
 * input — deliberately not tied to the page's real scroll position, since
 * the corridor is a full-viewport takeover with page scroll locked while
 * it's active (see Corridor.tsx).
 */
export function useVirtualScroll({ onProgress, sensitivity = 0.00065 }: UseVirtualScrollOptions) {
  const progressRef = useRef(0);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    function clamp(v: number) {
      return Math.max(0, Math.min(1, v));
    }

    function apply(delta: number) {
      progressRef.current = clamp(progressRef.current + delta * sensitivity);
      onProgress(progressRef.current);
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      apply(e.deltaY);
    }

    function onTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0]?.clientY ?? null;
    }

    function onTouchMove(e: TouchEvent) {
      if (touchStartY.current === null) return;
      e.preventDefault();
      const y = e.touches[0]?.clientY ?? touchStartY.current;
      const delta = touchStartY.current - y;
      touchStartY.current = y;
      apply(delta * 2.2);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        apply(120);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        apply(-120);
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onProgress, sensitivity]);

  return progressRef;
}
