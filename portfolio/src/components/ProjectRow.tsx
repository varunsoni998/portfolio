import { Link } from "react-router-dom";
import type { Project } from "@/data/projects";
import { ProjectStatusBadge } from "@/components/StatusBadge";
import ProjectGallery from "@/components/ProjectGallery";
import ProjectLinksRow from "@/components/ProjectLinksRow";

const BUSINESSOS_PILLARS = ["CRM", "RAG", "AI", "AUTOMATION", "SELF-HOSTED"];

interface ProjectRowProps {
  project: Project;
  index: number;
  total: number;
  large?: boolean;
}

/**
 * Editorial case-study row: micro pagination ("01 / 03"), a large heading,
 * a big visual, tag metadata, and a case-study link — not a grid of
 * identical cards. `large` gives the flagship project (BusinessOS) extra
 * visual weight: bigger type, its core pillars, and a stronger CTA.
 */
export default function ProjectRow({ project, index, total, large = false }: ProjectRowProps) {
  return (
    <article className="border-t border-border py-12 first:border-t-0 first:pt-0 md:py-16">
      <div className="flex flex-wrap items-center gap-4">
        <span className="micro-label">
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        {large && <span className="eyebrow">Featured Project</span>}
        <ProjectStatusBadge status={project.status} />
      </div>

      <h3 className={`mt-4 font-display font-semibold text-text ${large ? "text-display-lg" : "text-display-md"}`}>
        {project.name}
      </h3>
      <p className="mt-2 max-w-2xl text-base text-muted">{project.subtitle}</p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{project.summary}</p>

      <div className="mt-8">
        <ProjectGallery slots={project.screenshots} projectName={project.name} />
      </div>

      <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${project.name} technologies`}>
        {project.tech.map((t) => (
          <li key={t} className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted">
            {t}
          </li>
        ))}
      </ul>

      {large && (
        <ul className="mt-4 flex flex-wrap gap-3" aria-label="Core pillars">
          {BUSINESSOS_PILLARS.map((p) => (
            <li
              key={p}
              className="rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-accent"
            >
              {p}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-6">
        <Link
          to={`/projects/${project.slug}`}
          className="font-mono text-xs uppercase tracking-[0.1em] text-text underline decoration-border-2 underline-offset-4 hover:decoration-accent hover:text-accent"
        >
          View Case Study →
        </Link>
        <ProjectLinksRow demo={project.links.demo} github={project.links.github} />
      </div>
    </article>
  );
}
