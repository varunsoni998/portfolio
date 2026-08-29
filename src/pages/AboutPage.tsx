import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import { site } from "@/data/site";
import { SKILLS, WHAT_I_BUILD, CURRENTLY_BUILDING_STAGES } from "@/data/homeContent";

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About"
        description="Varun Dhanak — fourth-year AI & Data Science student building practical AI systems and full-stack products."
        path="/about"
      />

      {/* ABOUT */}
      <section className="border-b border-border py-16 md:py-20">
        <div className="container-content grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="eyebrow">About</p>
            <h1 className="mt-3 font-display text-display-lg font-semibold">Who I am</h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-lg leading-relaxed text-muted">
              I'm a fourth-year AI &amp; Data Science student focused on building practical AI
              systems and full-stack products. I enjoy taking ideas from architecture and data
              models to working applications.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted-2">
              I'm particularly interested in AI systems, generative AI, RAG, computer vision,
              backend engineering, automation, and product development — the through-line across
              my projects is turning a working prototype into something structured enough to
              extend.
            </p>
          </Reveal>
        </div>
      </section>

      {/* WHAT I BUILD */}
      <section className="border-b border-border py-16 md:py-20">
        <div className="container-content">
          <Reveal>
            <p className="eyebrow">What I Build</p>
            <h2 className="mt-3 font-display text-display-md font-semibold">Where I spend my time</h2>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {WHAT_I_BUILD.map((item, i) => (
              <Reveal key={item.title} delay={i * 70} className="bg-surface p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-accent">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CURRENTLY BUILDING */}
      <section className="border-b border-border py-16 md:py-20">
        <div className="container-content">
          <Reveal>
            <p className="eyebrow">Currently Building</p>
            <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-border bg-surface-2 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-text">BusinessOS</h3>
                <p className="mt-1 text-sm text-muted">Self-hosted AI business operations platform</p>
              </div>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-amber">In Development</span>
            </div>
          </Reveal>

          <Reveal delay={100} className="mt-8 flex flex-wrap items-center gap-3">
            {CURRENTLY_BUILDING_STAGES.map((stage, i) => (
              <div key={stage.label} className="flex items-center gap-3">
                <span
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] ${
                    stage.done ? "border-accent/40 text-accent" : "border-border-2 text-muted-2"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${stage.done ? "bg-accent" : "bg-border-2"}`}
                    aria-hidden="true"
                  />
                  {stage.label}
                </span>
                {i < CURRENTLY_BUILDING_STAGES.length - 1 && (
                  <span className="text-muted-2" aria-hidden="true">
                    →
                  </span>
                )}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* SKILLS */}
      <section className="border-b border-border py-16 md:py-20">
        <div className="container-content">
          <Reveal>
            <p className="eyebrow">Technical Skills</p>
            <h2 className="mt-3 font-display text-display-md font-semibold">Stack</h2>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {SKILLS.map((group, i) => (
              <Reveal key={group.category} delay={i * 80} className="bg-surface p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-accent">{group.category}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <li key={skill} className="rounded-full border border-border-2 px-2.5 py-1 text-xs text-muted">
                      {skill}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section className="py-16 md:py-20">
        <div className="container-content">
          <Reveal>
            <p className="eyebrow">Education</p>
            <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-border bg-surface-2 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-text">{site.education.degree}</h3>
                <p className="mt-1 text-sm text-muted">{site.education.institution}</p>
              </div>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                {site.education.year}
              </span>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
