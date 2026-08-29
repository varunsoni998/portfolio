import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import ProjectRow from "@/components/ProjectRow";
import HeroOrbVideo from "@/components/HeroOrbVideo";
import AIToolCard from "@/components/AIToolCard";
import ContactForm from "@/components/ContactForm";
import CorridorGate from "@/corridor/CorridorGate";
import { projects, primaryProject } from "@/data/projects";
import { aiLabTools } from "@/data/aiLabTools";
import { site } from "@/data/site";
import { SKILLS, WHAT_I_BUILD, CURRENTLY_BUILDING_STAGES } from "@/data/homeContent";

const CORRIDOR_SEEN_KEY = "corridor-seen";

// Homepage preview shows a subset — the full gallery lives at /lab.
const HOME_LAB_PREVIEW = aiLabTools.filter((t) => t.featuredOnHome).slice(0, 6);

export default function Home() {
  const navigate = useNavigate();
  const [showCorridor, setShowCorridor] = useState(() => {
    try {
      return sessionStorage.getItem(CORRIDOR_SEEN_KEY) !== "true";
    } catch {
      return true;
    }
  });

  function handleCorridorExit(target: string | null) {
    try {
      sessionStorage.setItem(CORRIDOR_SEEN_KEY, "true");
    } catch {
      // sessionStorage unavailable (private browsing, etc.) — corridor
      // just replays next visit, not worth failing the exit over.
    }
    setShowCorridor(false);

    // Every door now leads to its own real route (/work, /lab, /about,
    // /contact) rather than a homepage anchor — null means the visitor
    // hit Skip, reached the far end, or used the main door, all of which
    // just drop back into this page.
    if (target) navigate(target);
  }

  return (
    <>
      {showCorridor && <CorridorGate onExit={handleCorridorExit} />}

      <Seo
        title="AI & Data Science Engineer"
        description="Portfolio of Varun Dhanak, an AI & Data Science student building AI-powered products, full-stack systems, generative AI workflows, and computer vision applications."
        path="/"
      />

      {/* HERO */}
      <section id="home" className="container-content grid gap-16 pb-24 pt-16 md:grid-cols-2 md:items-center md:pb-32 md:pt-24">
        <div>
          <p className="eyebrow">AI &amp; Data Science Engineer</p>
          <h1 className="mt-5 font-display text-display-xl font-semibold uppercase leading-[1.02] text-text">
            I build AI
            <br />
            from model
            <br />
            to product.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted">{site.tagline}</p>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <a href="#work" className="font-mono text-xs uppercase tracking-[0.12em] text-text underline decoration-border-2 underline-offset-4 hover:decoration-accent hover:text-accent">
              View Work →
            </a>
            <Link to="/lab" className="font-mono text-xs uppercase tracking-[0.12em] text-text underline decoration-border-2 underline-offset-4 hover:decoration-accent hover:text-accent">
              AI Lab →
            </Link>
          </div>

          <div className="mt-10 flex gap-6 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              GitHub
            </a>
            <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              LinkedIn
            </a>
            <a href={site.links.email} className="hover:text-accent">
              Email
            </a>
          </div>
        </div>

        <Reveal delay={150}>
          <HeroOrbVideo />
        </Reveal>
      </section>

      {/* SELECTED WORK — editorial case-study list, BusinessOS (01) gets the large treatment */}
      <section id="work" className="border-t border-border py-24">
        <div className="container-content">
          <Reveal>
            <p className="eyebrow">Selected Work</p>
            <h2 className="mt-3 font-display text-display-md font-semibold">What I've built</h2>
            <p className="mt-4 max-w-xl text-sm text-muted">
              Three projects, each treated as a real product with its own architecture — not a
              class assignment. Status is labeled honestly: implemented, in development, or
              planned.
            </p>
          </Reveal>

          <div className="mt-10">
            {projects.map((project, i) => (
              <Reveal key={project.slug} delay={i * 80}>
                <ProjectRow project={project} index={i + 1} total={projects.length} large={project.slug === primaryProject.slug} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI LAB PREVIEW — breadth + interactivity, deliberately smaller than Selected Work above */}
      <section id="ai-lab" className="border-t border-border py-24">
        <div className="container-content">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">AI Lab</p>
                <h2 className="mt-3 font-display text-display-md font-semibold">Interactive systems you can actually try.</h2>
              </div>
              <Link
                to="/lab"
                className="font-mono text-xs uppercase tracking-[0.1em] text-text underline decoration-border-2 underline-offset-4 hover:decoration-accent hover:text-accent"
              >
                Explore AI Lab →
              </Link>
            </div>
          </Reveal>

          <div className="mt-10">
            {HOME_LAB_PREVIEW.map((tool, i) => (
              <Reveal key={tool.slug} delay={i * 60}>
                <AIToolCard tool={tool} index={i + 1} total={HOME_LAB_PREVIEW.length} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT I BUILD */}
      <section id="what-i-build" className="border-t border-border py-24">
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
      <section id="currently-building" className="border-t border-border py-24">
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

      {/* ABOUT */}
      <section id="about" className="border-t border-border py-24">
        <div className="container-content grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="eyebrow">About</p>
            <h2 className="mt-3 font-display text-display-md font-semibold">Who I am</h2>
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

      {/* SKILLS */}
      <section id="skills" className="border-t border-border py-24">
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
      <section id="education" className="border-t border-border py-24">
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

      {/* OPEN TO OPPORTUNITIES */}
      <section id="opportunities" className="border-t border-border py-20">
        <div className="container-content">
          <Reveal className="rounded-2xl border border-accent/30 bg-accent/5 px-8 py-10 text-center">
            <p className="eyebrow">Open to Opportunities</p>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-text">
              I'm currently looking for opportunities in AI/ML, software engineering, and
              generative AI.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="border-t border-border py-24">
        <div className="container-content grid gap-10 md:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Contact</p>
            <h2 className="mt-3 font-display text-display-md font-semibold">Let's build something.</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Reachable by email, or find me on GitHub and LinkedIn.
            </p>
            <div className="mt-8 flex flex-col gap-3 font-mono text-sm">
              <a href={site.links.email} className="text-text hover:text-accent">
                {site.links.email.replace("mailto:", "")}
              </a>
              <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent">
                GitHub
              </a>
              <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent">
                LinkedIn
              </a>
              {site.hasResume ? (
                <a href={site.resumeUrl} download className="text-muted hover:text-accent">
                  Download Resume
                </a>
              ) : (
                <span className="text-muted-2" aria-disabled="true" title="Resume coming soon">
                  Download Resume — coming soon
                </span>
              )}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {!showCorridor && (
        <button
          type="button"
          onClick={() => setShowCorridor(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full border border-border-2 bg-surface/90 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text shadow-surface backdrop-blur hover:border-accent hover:text-accent"
        >
          Walk the Corridor
        </button>
      )}
    </>
  );
}
