interface ProjectLinksRowProps {
  demo: string | null;
  github: string | null;
  /** "inline" — plain text links, used in editorial rows. "buttons" — pill
   * buttons, used on project detail pages where a stronger CTA is wanted. */
  variant?: "inline" | "buttons";
}

/**
 * Single source of truth for how demo/GitHub links render everywhere in
 * the app: a real URL becomes a link with an arrow, a missing one becomes
 * a plain "coming soon" label — never a fake or disabled button.
 */
export default function ProjectLinksRow({ demo, github, variant = "inline" }: ProjectLinksRowProps) {
  const isButtons = variant === "buttons";

  return (
    <div className={isButtons ? "flex flex-wrap gap-4" : "flex flex-wrap items-center gap-5"}>
      {demo ? (
        <a
          href={demo}
          target="_blank"
          rel="noopener noreferrer"
          className={
            isButtons
              ? "btn-primary"
              : "font-mono text-xs uppercase tracking-[0.1em] text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
          }
        >
          Live Demo <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-muted-2">Demo Coming Soon</span>
      )}

      {github ? (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className={
            isButtons
              ? "btn-secondary"
              : "font-mono text-xs uppercase tracking-[0.1em] text-muted hover:text-text"
          }
        >
          GitHub <span aria-hidden="true">↗</span>
        </a>
      ) : null}
    </div>
  );
}
