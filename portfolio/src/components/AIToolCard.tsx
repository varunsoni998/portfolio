import { Link } from "react-router-dom";
import type { AiLabTool } from "@/data/aiLabTools";

/**
 * A large editorial module, not a generic SaaS card — numbered, minimal,
 * matching the same visual language as ProjectRow. `available` (never
 * "AVAILABLE" unless the backend is actually working) is shown alongside
 * the infra badge so a visitor always knows what they're about to try.
 */
export default function AIToolCard({ tool, index, total }: { tool: AiLabTool; index: number; total: number }) {
  return (
    <article className="border-t border-border py-10 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-4">
        <span className="micro-label">
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="rounded-full border border-border-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          {tool.infra}
        </span>
        {!tool.available && (
          <span className="rounded-full border border-border-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-2">
            Coming Soon
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-2xl font-semibold text-text md:text-3xl">{tool.title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{tool.shortDescription}</p>

      <div className="mt-6">
        <Link
          to={tool.path}
          className="font-mono text-xs uppercase tracking-[0.1em] text-text underline decoration-border-2 underline-offset-4 hover:decoration-accent hover:text-accent"
        >
          Try →
        </Link>
      </div>
    </article>
  );
}
