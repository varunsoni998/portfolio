import type { EngineeringDecision } from "@/data/projects";

export default function EngineeringDecisions({ decisions }: { decisions?: EngineeringDecision[] }) {
  if (!decisions || decisions.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {decisions.map((d) => (
        <div key={d.title} className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="font-display text-base font-semibold text-text">{d.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{d.description}</p>
        </div>
      ))}
    </div>
  );
}
