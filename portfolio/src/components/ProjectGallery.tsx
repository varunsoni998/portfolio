import { useState } from "react";
import type { ScreenshotSlot } from "@/data/projects";

/**
 * Renders real screenshots where a slot has `src`, and a quiet placeholder
 * where it doesn't — so a project can ship partial screenshots without the
 * page looking broken or half-finished. Swap in real assets by adding
 * `src` to the matching slot in src/data/projects.ts; no component changes
 * needed.
 */
export default function ProjectGallery({ slots, projectName }: { slots: ScreenshotSlot[]; projectName: string }) {
  const hasAny = slots.some((s) => s.src);

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-2 bg-surface px-6 py-20 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-2">Product screenshots coming soon</p>
        <p className="max-w-sm text-xs text-muted-2">
          {slots.length} view{slots.length === 1 ? "" : "s"} planned: {slots.map((s) => s.label).join(", ")}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {slots.map((slot) =>
        slot.src ? (
          <Shot key={slot.id} slot={slot} projectName={projectName} />
        ) : (
          <div
            key={slot.id}
            className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border-2 bg-surface"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-2">{slot.label} — coming soon</p>
          </div>
        )
      )}
    </div>
  );
}

function Shot({ slot, projectName }: { slot: ScreenshotSlot; projectName: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative aspect-video">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-surface-2" aria-hidden="true" />}
        <img
          src={slot.src}
          alt={`${projectName} — ${slot.label}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>
      <figcaption className="border-t border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-2">
        {slot.label}
      </figcaption>
    </figure>
  );
}
