import Reveal from "@/components/Reveal";
import Seo from "@/components/Seo";
import ContactForm from "@/components/ContactForm";
import { site } from "@/data/site";

export default function ContactPage() {
  return (
    <>
      <Seo
        title="Contact"
        description="Get in touch with Varun Dhanak — email, GitHub, or LinkedIn."
        path="/contact"
      />

      <section className="border-b border-border py-20">
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

      <section className="py-16 md:py-20">
        <div className="container-content grid gap-10 md:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Contact</p>
            <h1 className="mt-3 font-display text-display-lg font-semibold">Let's build something.</h1>
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
    </>
  );
}
