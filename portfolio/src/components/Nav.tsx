import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { site } from "@/data/site";

const NAV_ITEMS = [
  { label: "Work", href: "/#work" },
  { label: "AI Lab", href: "/lab" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/lab") return location.pathname.startsWith("/lab");
    return href === "/#work" ? location.hash === "#work" || location.pathname.startsWith("/projects") : false;
  };

  return (
    <header
      className={`sticky top-0 z-50 rounded-t-surface border-b transition-colors duration-300 ${
        scrolled ? "border-border bg-surface/90 backdrop-blur" : "border-transparent bg-transparent"
      }`}
    >
      <div className="container-content flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="font-display text-sm font-semibold uppercase tracking-[0.1em] text-text">
          {site.name}
        </Link>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`relative pb-1 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                isActive(item.href) ? "text-text" : "text-muted hover:text-text"
              }`}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute -bottom-0.5 left-0 h-px w-full bg-accent" aria-hidden="true" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          {site.hasResume ? (
            <a href={site.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              View Resume
            </a>
          ) : (
            <span className="btn-secondary cursor-not-allowed opacity-50" aria-disabled="true" title="Resume coming soon">
              Resume Coming Soon
            </span>
          )}
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border-2 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <div className="flex flex-col gap-[5px]">
            <span
              className={`block h-px w-4 bg-text transition-transform duration-200 ${open ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`block h-px w-4 bg-text transition-transform duration-200 ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </div>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border bg-surface px-6 pb-6 md:hidden">
          <ul className="flex flex-col gap-1 pt-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-mono text-xs uppercase tracking-[0.14em] text-muted hover:text-text"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              {site.hasResume ? (
                <a
                  href={site.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center"
                  onClick={() => setOpen(false)}
                >
                  View Resume
                </a>
              ) : (
                <span className="btn-primary w-full cursor-not-allowed justify-center opacity-50" aria-disabled="true">
                  Resume Coming Soon
                </span>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
