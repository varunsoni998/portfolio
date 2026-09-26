import type { Metric } from "@/data/projects";

/** Renders nothing when there are no metrics — never pads the page with placeholders. */
export default function MetricsRow({ metrics }: { metrics?: Metric[] }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.label} className="rounded-2xl border border-border bg-surface px-5 py-4">
          <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-2">{m.label}</dt>
          <dd className="mt-1 font-display text-2xl font-semibold text-text">{m.value}</dd>
        </div>
      ))}
    </dl>
  );
}
