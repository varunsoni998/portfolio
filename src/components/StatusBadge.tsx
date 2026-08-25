import type { ProjectStatus, FeatureStatus } from "@/data/projects";

const PROJECT_STYLES: Record<ProjectStatus, string> = {
  LIVE: "border-accent/40 text-accent",
  "IN DEVELOPMENT": "border-amber/40 text-amber",
  EXPERIMENTAL: "border-border-2 text-muted",
};

const FEATURE_STYLES: Record<FeatureStatus, { label: string; className: string }> = {
  implemented: { label: "Implemented", className: "border-accent/40 text-accent" },
  "in-development": { label: "In Development", className: "border-amber/40 text-amber" },
  planned: { label: "Planned", className: "border-border-2 text-muted-2" },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${PROJECT_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export function FeatureStatusBadge({ status }: { status: FeatureStatus }) {
  const s = FEATURE_STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${s.className}`}>
      {s.label}
    </span>
  );
}
