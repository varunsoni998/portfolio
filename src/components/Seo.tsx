import { useEffect } from "react";

interface SeoProps {
  title: string;
  description: string;
  path: string; // e.g. "/projects/businessos"
}

const SITE_URL = "https://varundhanak.dev";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Updates document head per route. This is a client-side-only implementation —
 * fine for browsers and for recruiters clicking through the live site, but
 * crawlers that don't execute JS (some social-media link unfurlers) will only
 * see the tags from index.html. If pixel-perfect per-project link previews
 * become a priority, that's the point where prerendering (or a move to
 * Next.js/Astro) pays for itself — see README "SEO tradeoffs".
 */
export default function Seo({ title, description, path }: SeoProps) {
  useEffect(() => {
    const fullTitle = `${title} — Varun Dhanak`;
    const url = `${SITE_URL}${path}`;

    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setCanonical(url);
  }, [title, description, path]);

  return null;
}
