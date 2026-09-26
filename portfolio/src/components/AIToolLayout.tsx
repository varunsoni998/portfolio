import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { AiLabTool } from "@/data/aiLabTools";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";
import Seo from "@/components/Seo";

interface AIToolLayoutProps {
  tool: AiLabTool;
  /** Small status indicator specific to this tool instance (e.g. GPU status, idle/generating). */
  statusSlot?: ReactNode;
  children: ReactNode;
}

export default function AIToolLayout({ tool, statusSlot, children }: AIToolLayoutProps) {
  return (
    <>
      <Seo title={tool.title} description={tool.shortDescription} path={tool.path} />

      <section className="border-b border-border py-16 md:py-20">
        <div className="container-content">
          <Link to="/lab" className="font-mono text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-accent">
            ← Back to AI Lab
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="rounded-full border border-border-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              {tool.infra}
            </span>
            {!tool.available && (
              <span className="rounded-full border border-border-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-2">
                Coming Soon
              </span>
            )}
            {statusSlot}
          </div>

          <h1 className="mt-4 font-display text-display-lg font-semibold text-text">{tool.title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{tool.description}</p>
        </div>
      </section>

      <section className="border-b border-border py-16">
        <div className="container-content">{children}</div>
      </section>

      <section className="py-16">
        <div className="container-content">
          <p className="eyebrow">How It Works</p>
          <h2 className="mt-3 font-display text-display-md font-semibold">Architecture</h2>
          <div className="mt-8 max-w-xl">
            <ArchitectureDiagram stages={tool.architecture} ariaLabel={`${tool.title} architecture`} />
          </div>
        </div>
      </section>
    </>
  );
}
