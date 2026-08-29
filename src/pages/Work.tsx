import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import ProjectRow from "@/components/ProjectRow";
import { projects, primaryProject } from "@/data/projects";

export default function Work() {
  return (
    <>
      <Seo
        title="Work"
        description="Selected work by Varun Dhanak — BusinessOS, Fraud PAN Card Detection, and MechaGO, each treated as a real product with its own architecture."
        path="/work"
      />

      <section className="border-b border-border py-16 md:py-20">
        <div className="container-content">
          <p className="eyebrow">Selected Work</p>
          <h1 className="mt-4 font-display text-display-lg font-semibold text-text">What I've built</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            Three projects, each treated as a real product with its own architecture — not a
            class assignment. Status is labeled honestly: implemented, in development, or
            planned.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container-content">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 80}>
              <ProjectRow
                project={project}
                index={i + 1}
                total={projects.length}
                large={project.slug === primaryProject.slug}
              />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
