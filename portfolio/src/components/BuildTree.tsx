import { projects } from "@/data/projects";

/**
 * The hero's signature visual: a build tree — BUILD at the root, the three
 * real projects as branches, converging on AI + SOFTWARE. A restrained nod
 * to the reference's warm light bloom sits behind it (a soft blurred
 * accent glow, not a literal 3D render) — cinematic without tipping into
 * decoration.
 */
export default function BuildTree() {
  return (
    <div
      className="relative mx-auto flex w-full max-w-md flex-col items-center gap-0"
      role="img"
      aria-label={`Build tree: BUILD branches into ${projects.map((p) => p.name).join(", ")}, converging into AI + Software`}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full">
        <Node label="BUILD" root />
        <Stem />

        <div className="grid w-full grid-cols-3 gap-3">
          {projects.map((p, i) => (
            <div key={p.slug} className="flex flex-col items-center">
              <div className="h-5 w-px bg-border-2" aria-hidden="true" />
              <div
                className="w-full animate-fade-up rounded-2xl border border-border bg-surface-2 px-2 py-3 text-center shadow-sm"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <p className="font-display text-[13px] font-medium leading-tight text-text">{p.name}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative h-6 w-full" aria-hidden="true">
          <svg viewBox="0 0 300 24" className="h-full w-full" preserveAspectRatio="none">
            <path d="M50 0 L150 24 M150 24 L250 0" className="stroke-border-2" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <Node label="AI + SOFTWARE" />
      </div>
    </div>
  );
}

function Node({ label, root = false }: { label: string; root?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface-2 px-5 py-3">
      <span
        className={`h-1.5 w-1.5 rounded-full bg-accent ${root ? "animate-pulse-node" : ""}`}
        aria-hidden="true"
      />
      <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-text">{label}</span>
    </div>
  );
}

function Stem() {
  return (
    <div className="flex justify-center">
      <div className="h-6 w-px bg-border-2" aria-hidden="true" />
    </div>
  );
}
