import { site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="rounded-b-surface border-t border-border">
      <div className="container-content flex flex-col gap-4 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p className="micro-label">
          © {new Date().getFullYear()} {site.name}. Built with React, TypeScript, Vite, and Tailwind CSS.
        </p>
        <div className="flex gap-6 font-mono text-[11px] uppercase tracking-[0.14em]">
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
    </footer>
  );
}
