interface ArchitectureDiagramProps {
  stages: { label: string; detail?: string }[];
  ariaLabel?: string;
}

/** Minimal, monochrome, vertical — thin lines and whitespace, no color-coding. */
export default function ArchitectureDiagram({ stages, ariaLabel }: ArchitectureDiagramProps) {
  return (
    <div
      className="flex flex-col"
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
    >
      {stages.map((stage, i) => (
        <div key={stage.label} className="flex flex-col">
          <div className="flex items-baseline gap-4 border-b border-border py-4">
            <span className="font-mono text-[11px] text-muted-2">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="font-display text-sm font-medium text-text">{stage.label}</p>
              {stage.detail && <p className="mt-0.5 text-xs text-muted">{stage.detail}</p>}
            </div>
          </div>
          {i < stages.length - 1 && (
            <div className="flex justify-start pl-[1px]">
              <span className="my-1 h-4 w-px bg-border-2" aria-hidden="true" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
