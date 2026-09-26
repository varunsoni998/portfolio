import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { site } from "@/data/site";
import { projects } from "@/data/projects";
import { aiLabTools } from "@/data/aiLabTools";
import { SKILLS, WHAT_I_BUILD, CURRENTLY_BUILDING_STAGES } from "@/data/homeContent";
import { useWorld, world, type SheetId } from "../store";

const email = site.links.email.replace("mailto:", "");

function Links({ children }: { children: React.ReactNode }) {
  return <div className="wg-sheet-links">{children}</div>;
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="wg-btn small" href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
      {children}
    </a>
  );
}

function About() {
  return (
    <>
      <h2>Hi, I'm {site.name.split(" ")[0]}.</h2>
      <p className="sub">
        {site.role} · {site.location}
      </p>
      <p>{site.tagline}</p>
      <h3>Education</h3>
      <p>
        {site.education.degree}
        <br />
        {site.education.institution} — {site.education.year}
      </p>
      <Links>
        <ExtLink href={site.links.github}>GitHub ↗</ExtLink>
        <ExtLink href={site.links.linkedin}>LinkedIn ↗</ExtLink>
        <ExtLink href={site.links.email}>Email me</ExtLink>
        <Link className="wg-btn small" to="/about">
          Full story →
        </Link>
      </Links>
    </>
  );
}

function Project({ slug }: { slug: string }) {
  const p = projects.find((x) => x.slug === slug);
  if (!p) return null;
  const shown = p.features.slice(0, 6);
  return (
    <>
      <span className="wg-stamp">{p.status.toLowerCase()}</span>
      <h2>{p.name}</h2>
      <p className="sub">
        {p.subtitle} · {p.category}
      </p>
      <p>{p.summary}</p>
      <div className="wg-chips">
        {p.tech.map((t) => (
          <span key={t} className="wg-chip">
            {t}
          </span>
        ))}
      </div>
      <h3>What's in it</h3>
      <div className="wg-chips">
        {shown.map((f) => (
          <span key={f.label} className={`wg-chip ${f.status === "implemented" ? "done" : f.status === "planned" ? "todo" : ""}`} title={f.status}>
            {f.label}
          </span>
        ))}
      </div>
      <Links>
        <Link className="wg-btn small" to={`/projects/${p.slug}`}>
          Read the case study →
        </Link>
        {p.links.demo && <ExtLink href={p.links.demo}>Live demo ↗</ExtLink>}
        {p.links.github && <ExtLink href={p.links.github}>Code ↗</ExtLink>}
      </Links>
    </>
  );
}

function Tool({ slug }: { slug: string }) {
  const t = aiLabTools.find((x) => x.slug === slug);
  if (!t) return null;
  return (
    <>
      <span className="wg-stamp">{t.infra.toLowerCase()}</span>
      <h2>{t.title}</h2>
      <p>{t.description}</p>
      {!t.available && <p className="sub">Not switched on yet — coming soon.</p>}
      {t.architecture?.length > 0 && (
        <>
          <h3>How it works</h3>
          <div className="wg-chips">
            {t.architecture.map((a, i) => (
              <span key={a.label} className="wg-chip">
                {i + 1}. {a.label}
              </span>
            ))}
          </div>
        </>
      )}
      <Links>
        <Link className="wg-btn small" to={t.path}>
          {t.available ? "Try it →" : "See the page →"}
        </Link>
        <Link className="wg-btn small" to="/lab">
          All lab tools
        </Link>
      </Links>
    </>
  );
}

function Lab() {
  return (
    <>
      <h2>The AI Lab</h2>
      <p>Working AI tools I've built — some run on my own local GPU server, some call hosted model APIs.</p>
      <ul>
        {aiLabTools.map((t) => (
          <li key={t.slug}>
            <Link to={t.path}>{t.title}</Link> — {t.shortDescription}
          </li>
        ))}
      </ul>
      <Links>
        <Link className="wg-btn small" to="/lab">
          Open the lab →
        </Link>
      </Links>
    </>
  );
}

function Skills() {
  return (
    <>
      <h2>My toolbox</h2>
      {SKILLS.map((g) => (
        <div key={g.category}>
          <h3>{g.category}</h3>
          <div className="wg-chips">
            {g.items.map((i) => (
              <span key={i} className="wg-chip">
                {i}
              </span>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function Experience() {
  return (
    <>
      <h2>What I build</h2>
      <ul>
        {WHAT_I_BUILD.map((w) => (
          <li key={w.title}>
            <b>{w.title}</b> — {w.body}
          </li>
        ))}
      </ul>
      <h3>Currently building: BusinessOS</h3>
      <div className="wg-chips">
        {CURRENTLY_BUILDING_STAGES.map((s) => (
          <span key={s.label} className={`wg-chip ${s.done ? "done" : "todo"}`}>
            {s.done ? "✓ " : ""}
            {s.label}
          </span>
        ))}
      </div>
      <Links>
        <Link className="wg-btn small" to="/work">
          All work →
        </Link>
      </Links>
    </>
  );
}

function Contact() {
  return (
    <>
      <h2>Let's build something.</h2>
      <p>
        The quickest way to reach me is email: <a href={site.links.email}>{email}</a>
      </p>
      <Links>
        <ExtLink href={site.links.email}>Email me</ExtLink>
        <ExtLink href={site.links.github}>GitHub ↗</ExtLink>
        <ExtLink href={site.links.linkedin}>LinkedIn ↗</ExtLink>
        {site.hasResume && <ExtLink href={site.resumeUrl}>Resume ↓</ExtLink>}
        <Link className="wg-btn small" to="/contact">
          Contact form →
        </Link>
      </Links>
    </>
  );
}

function Body({ sheet }: { sheet: SheetId }) {
  switch (sheet.kind) {
    case "about":
      return <About />;
    case "project":
      return <Project slug={sheet.slug} />;
    case "projects":
      return <Project slug={projects[0].slug} />;
    case "tool":
      return <Tool slug={sheet.slug} />;
    case "lab":
      return <Lab />;
    case "skills":
      return <Skills />;
    case "experience":
      return <Experience />;
    case "contact":
      return <Contact />;
  }
}

/** Real content, on a sheet of paper that drops onto the scene. */
export default function Sheets() {
  const sheet = useWorld((s) => s.sheet);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (sheet) closeRef.current?.focus();
  }, [sheet]);
  if (!sheet) return null;
  const close = () => world.set({ sheet: null });
  return (
    <div className="wg-sheet-backdrop" onClick={close}>
      <div className="wg-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>
        <span className="tape" aria-hidden="true" />
        <button ref={closeRef} className="wg-close" onClick={close} aria-label="Close">
          ×
        </button>
        <Body sheet={sheet} />
      </div>
    </div>
  );
}
