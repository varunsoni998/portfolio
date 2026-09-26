import type { ReactNode } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import { getProjectBySlug, projects } from "@/data/projects";
import { ProjectStatusBadge, FeatureStatusBadge } from "@/components/StatusBadge";
import ProjectGallery from "@/components/ProjectGallery";
import ProjectLinksRow from "@/components/ProjectLinksRow";
import MetricsRow from "@/components/MetricsRow";
import EngineeringDecisions from "@/components/EngineeringDecisions";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);

  if (!project) return <Navigate to="/404" replace />;

  const projectIndex = projects.findIndex((p) => p.slug === project.slug) + 1;

  return (
    <>
      <Seo title={project.name} description={project.summary} path={`/projects/${project.slug}`} />

      {/* 1. PROJECT HERO */}
      <section className="border-b border-border py-20">
        <div className="container-content">
          <Link to="/#work" className="font-mono text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-accent">
            ← All Projects
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="micro-label">
              {String(projectIndex).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
            </span>
            <p className="eyebrow">{project.category}</p>
            <ProjectStatusBadge status={project.status} />
          </div>
          <h1 className="mt-3 font-display text-display-lg font-semibold text-text">{project.name}</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted">{project.subtitle}</p>

          <div className="mt-8 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span key={t} className="rounded-full border border-border-2 px-2.5 py-1 font-mono text-[11px] text-muted">
                {t}
              </span>
            ))}
          </div>

          <div className="mt-8">
            <ProjectLinksRow demo={project.links.demo} github={project.links.github} variant="buttons" />
          </div>
        </div>
      </section>

      {/* 2. PRODUCT SCREENSHOT / DEMO */}
      <DetailSection eyebrow="Product" title="Product views">
        <ProjectGallery slots={project.screenshots} projectName={project.name} />
      </DetailSection>

      {/* 3. OVERVIEW */}
      <DetailSection eyebrow="Overview" title="What this is">
        <p className="max-w-3xl text-base leading-relaxed text-muted">{project.overview}</p>
      </DetailSection>

      {/* 4 + 5. PROBLEM + SOLUTION */}
      <DetailSection eyebrow="Why I Built It" title="Problem & solution">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.12em] text-muted-2">Problem</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{project.problem}</p>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.12em] text-muted-2">Solution</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{project.solution}</p>
          </div>
        </div>
      </DetailSection>

      {/* 6. ARCHITECTURE */}
      <DetailSection eyebrow="Architecture" title="How it's structured">
        <div className="max-w-xl">
          <ArchitectureDiagram stages={project.architecture} ariaLabel={`${project.name} architecture`} />
        </div>
      </DetailSection>

      {/* 7. TECHNICAL IMPLEMENTATION */}
      <DetailSection eyebrow="Technical Implementation" title="Built with">
        <div className="flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span key={t} className="rounded-full border border-border-2 bg-surface-2 px-3 py-1.5 font-mono text-xs text-muted">
              {t}
            </span>
          ))}
        </div>
      </DetailSection>

      {/* 8. KEY ENGINEERING DECISIONS (only where provided) */}
      {project.engineeringDecisions && project.engineeringDecisions.length > 0 && (
        <DetailSection eyebrow="Key Engineering Decisions" title="Why it's built this way">
          <EngineeringDecisions decisions={project.engineeringDecisions} />
        </DetailSection>
      )}

      {/* FEATURES: implemented / in development / planned */}
      <DetailSection eyebrow="Features" title="Implemented vs. planned">
        <ul className="grid gap-3 sm:grid-cols-2">
          {project.features.map((f) => (
            <li
              key={f.label}
              className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3"
            >
              <span className="text-sm text-text">{f.label}</span>
              <FeatureStatusBadge status={f.status} />
            </li>
          ))}
        </ul>
      </DetailSection>

      {/* 9. ENGINEERING CHALLENGES */}
      {project.challenges && project.challenges.length > 0 && (
        <DetailSection eyebrow="Engineering Challenges" title="What was hard">
          <ul className="flex flex-col gap-4">
            {project.challenges.map((c) => (
              <li key={c} className="flex gap-4 text-sm leading-relaxed text-muted">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {/* 10. RESULTS / METRICS */}
      <DetailSection eyebrow="Results" title="Where it stands">
        <MetricsRow metrics={project.metrics} />
        {project.results && (
          <p className={project.metrics && project.metrics.length > 0 ? "mt-6 text-sm leading-relaxed text-muted" : "text-sm leading-relaxed text-muted"}>
            {project.results}
          </p>
        )}
        {project.limitations && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-2">{project.limitations}</p>
        )}
      </DetailSection>

      {/* 11. FUTURE IMPROVEMENTS */}
      <DetailSection eyebrow="Future Improvements" title="What's next">
        <ul className="flex flex-col gap-3">
          {project.future.map((item) => (
            <li key={item} className="flex gap-4 text-sm leading-relaxed text-muted">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-border-2" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </DetailSection>

      {/* 12. LINKS */}
      <section className="border-t border-border py-16">
        <div className="container-content flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <ProjectLinksRow demo={project.links.demo} github={project.links.github} variant="buttons" />
          <Link to="/#work" className="font-mono text-xs uppercase tracking-[0.12em] text-accent hover:underline">
            ← Back to all projects
          </Link>
        </div>
      </section>
    </>
  );
}

function DetailSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border py-16">
      <div className="container-content">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-3 font-display text-display-md font-semibold">{title}</h2>
          <div className="mt-8">{children}</div>
        </Reveal>
      </div>
    </section>
  );
}
