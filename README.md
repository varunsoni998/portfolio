# Varun Dhanak — Portfolio

React + TypeScript + Vite + Tailwind CSS + React Router. No CMS — content
lives in `src/data/`. No backend of its own — the AI Lab talks to a
backend you control, or simulates one in mock mode (see below).

## Run it

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build   # outputs to dist/, also generates sitemap.xml
npm run preview
```

This was built without network access in the sandbox that generated it,
so `npm install`/`build` has not been run or verified here — do that
first.

## What this revision changed

Two things, together: a visual redesign (dark editorial → light editorial,
based on a provided reference) and a new AI Lab section. The existing
architecture — React Router, the `src/data/` content model, the `Seo`
component, `Reveal`, `ArchitectureDiagram` (generalized from inline
project-detail markup) — was kept and extended rather than replaced.

### Visual system

Everything traces back to six CSS custom properties in `src/index.css`
(`:root`), exposed as Tailwind utilities in `tailwind.config.ts`:

- `--background` — the outer page, visible as the margin around the
  floating surface
- `--surface` / `--surface-2` — the floating portfolio surface itself,
  and a slightly raised panel tone (cards, the nav on scroll)
- `--text` / `--muted` / `--muted-2` — primary, secondary, and micro-label
  text
- `--border` / `--border-2` — hairline borders, and a slightly stronger
  one for hover/active states
- `--accent` — the one accent color (a muted clay tone), used sparingly:
  active nav underline, link hovers, status dots
- `--amber` / `--danger` — status-only colors (in-development badges,
  errors)

No component hardcodes a hex value — everything is a Tailwind utility
resolving to one of these. Retuning the whole palette is a one-file
change.

### The floating surface

`src/App.tsx` wraps the whole app in a single rounded, bordered,
shadowed `<div>` (`rounded-surface`, `shadow-surface`) with responsive
margins — large on desktop, smaller on tablet, ~full-bleed on mobile.
It's deliberately **not** `overflow-hidden`: clipping to the rounded
corners would also break `position: sticky` on the nav inside it (any
ancestor with `overflow` set other than `visible` breaks sticky
descendants). Full-bleed media inside gets its own rounded corners
instead of relying on the shell to clip them.

### The hero orb and morphing glow

- `src/components/HeroOrbVideo.tsx` — the actual hero visual now. An
  AI-generated video (LTX 2.3) of the wireframe/ember orb, at
  `public/hero/orb.mp4` (audio stripped since it's muted anyway,
  re-encoded smaller for web delivery) with `public/hero/orb-poster.jpg`
  as the poster frame for instant paint before the video loads. Its
  background is a flat gray/beige studio vignette baked into the
  render, not a color match for the site's off-white surface — first
  attempt masked it to transparent past 52% of the box, which sounds
  tight but is much bigger than the orb itself (measured directly from
  the source frame: the dark material only extends to roughly 35–40%
  of the frame), so most of what stayed fully opaque was flat
  background, not orb — that's what read as "sitting on a plate," on
  top of two decorative ring borders that doubled down on the boxed-in
  look. Fixed by removing the rings entirely and pulling the mask's
  opaque radius in tight to the orb's actual measured extent (`radial-
  gradient(circle closest-side, black 30%, transparent 58%)` — closest-
  side sizing makes those percentages simple fractions of the box's
  half-width, easier to reason about than the default farthest-corner
  sizing). Pauses itself on mount if `prefers-reduced-motion` is set (a
  looping `<video>` isn't reachable by the site's global CSS animation-
  duration override, so this is handled explicitly here, same as the
  canvas layer in `HeroOrb.tsx` below).
- `src/components/HeroOrb.tsx` — the earlier canvas/SVG-built
  approximation (tangled wireframe mesh + animated ember particles).
  No longer used on the homepage, kept in the repo as a zero-dependency
  fallback if the video ever needs to come out (no video file to
  manage, no mask-blend-with-background problem).
- `src/components/MorphingGlow.tsx` — a separate, softer ambient glow
  bleeding through the card's margins near the top of the page,
  independent of the hero visual itself. Its first version used
  `position: fixed` (viewport-relative), which mostly hid it behind the
  opaque card for the whole scroll — fixed by switching to
  `position: absolute` inside the page-relative outer wrapper, so it's
  anchored to one spot on the *page* (behind the hero) instead of
  chasing the viewport.

`src/components/BuildTree.tsx` (the original hero visual — a tree of
the three real projects) is also unused now but still in the repo.
Nothing has been deleted across any of these swaps — pick whichever
hero visual fits best and delete the others whenever you're sure.

### Editorial project presentation

`src/components/ProjectRow.tsx` replaces the old identical-card grid —
one numbered case-study row per project ("01 / 03"), with BusinessOS
(`primary: true` in `src/data/projects.ts`) getting a `large` variant:
bigger type, its own pillars (CRM / RAG / AI / AUTOMATION /
SELF-HOSTED), one continuous "Selected Work" section rather than a
separate featured block. `ArchitectureDiagram.tsx` is now shared between
project detail pages and every AI Lab tool page, instead of being
duplicated inline.

## AI Lab

### Structure

- `src/data/aiLabTools.ts` — one entry per tool: title, description,
  infra badge (`LOCAL GPU` / `API POWERED`), architecture stages, and an
  `available` flag. This is the single source of truth for the `/lab`
  grid, the homepage preview, and each tool's own page.
- `src/services/aiLab.ts` — **every** AI Lab network call lives here.
  Components never call `fetch` directly. Two things this buys: (1) the
  frontend only ever talks to `${VITE_AI_LAB_API_BASE}/api/ai/...` — a
  backend you control — never ComfyUI or OpenRouter directly, and never
  holds a secret; (2) flipping mock mode off is a one-line env change,
  since every function already has its real-request shape ready.
- `src/components/AIToolLayout.tsx` — shared page shell (back link,
  header, status badges, "How It Works" + architecture diagram) for
  every tool page.
- `src/components/AIToolCard.tsx` — the editorial module used in the
  `/lab` grid and the homepage preview (`AIToolCard`, not a generic SaaS
  card — same numbered-row language as `ProjectRow`).
- `src/data/aiLabConfig.ts` — centralized limits (`MAX_PDF_SIZE_MB`,
  `MAX_IMAGE_SIZE_MB`, `MAX_VIDEO_DURATION_SECONDS`,
  `MAX_PROMPT_LENGTH`) and the mock-mode / API-base flags. Nothing is
  duplicated inline in a component.

### Routes

`/lab`, `/lab/image`, `/lab/video`, `/lab/chat`, `/lab/pdf`,
`/lab/business-card`, `/lab/content` — all real routes (see
`src/App.tsx`), not modals or external links, each with its own SEO
title/description via the existing `Seo` component.

To add the optional 7th tool (Resume Analyzer) later: add an entry to
`aiLabTools.ts`, create `src/pages/lab/ResumeAnalyzer.tsx` following the
pattern of the other tool pages, add its route in `App.tsx`, and add its
functions to `services/aiLab.ts`. The grid and homepage preview pick it
up automatically.

### Mock mode

`VITE_AI_LAB_MOCK` (default `true` if unset — see `.env.example`).
When on, every service function simulates its response instead of
calling a real backend, and every mock result is visibly labeled
**Demo** in the UI (`DemoBadge.tsx`) — never presented as a real
production result.

**Chat With PDF is the one exception, on purpose.** Its service
functions (`uploadPdf`, `askPdf`) throw "Backend integration coming
soon" even in mock mode, and the tool page shows that state instead of
a chat interface. Faking a RAG answer would misrepresent a pipeline
that doesn't exist yet — the honesty requirement here outranks the
general mock-mode convenience. Flip it on for real once
extraction → chunking → embeddings → vector search → LLM is actually
wired up on the backend.

Image, Video, Chat, Business Card, and Content generation all have
working, clearly-labeled demo flows — including the video tool's
async job pattern (submit → poll `getVideoStatus` until `COMPLETED`,
never a long blocking request) and the image tool's/video tool's live
`getGenerationServerStatus()` badge (`GPU ONLINE` / `GPU OFFLINE` /
`CHECKING` — never guessed without a real health check; mock mode
reports online after a short simulated delay).

### Security

No secret ever reaches the frontend. `.env.example` documents this
directly: `VITE_` variables are bundled into client JS and are public,
so only a public backend base URL belongs there. `OPENROUTER_API_KEY`,
ComfyUI credentials, database passwords, and any other secret belong
only on the backend, as plain (non-`VITE_`) server environment
variables the frontend never sees. `src/services/aiLab.ts` never
constructs a URL pointing at ComfyUI or OpenRouter directly — only at
your own backend.

### Error handling

`src/services/aiLab.ts` maps HTTP failure codes to visitor-safe
messages (429 → "Usage limit reached...", 413 → "File is too large.",
408/500 → generic retry messages) — a raw server error never reaches
the UI.

## Content model — implemented vs. in development vs. planned

`src/data/projects.ts` tracks each project's overall `status` and each
individual **feature's** status (`implemented` / `in-development` /
`planned`), plus optional `engineeringDecisions`, `metrics` (hidden
entirely when empty — see `MetricsRow.tsx`), and `screenshots` slots
(each renders a real image once given a `src`, or a clean "coming soon"
placeholder otherwise — see `ProjectGallery.tsx`).

## Before you ship — quick checklist

- [ ] Resume PDF added at `public/resume/Varun-Dhanak-Resume.pdf` +
      `hasResume: true` in `src/data/site.ts`
- [ ] Project GitHub URLs added where public (`src/data/projects.ts`)
- [ ] Real screenshots added, at least for BusinessOS
- [ ] AI Lab backend deployed; `VITE_AI_LAB_API_BASE` set and
      `VITE_AI_LAB_MOCK=false`
- [ ] Chat With PDF's `available` flag flipped to `true` only once real
      retrieval is wired up (`src/data/aiLabTools.ts`)
- [ ] `SITE_URL` / canonical domain updated (`vite.config.ts`,
      `index.html`, `Seo.tsx`)
- [ ] `npm run build` runs clean, `npm run preview` checked in a real
      browser
- [ ] Keyboard-only pass: Tab through nav, project rows, AI Lab tools
      (including file uploads and the chat input), confirm visible
      focus rings throughout
- [ ] Resize down to 320px and confirm no horizontal scroll anywhere —
      especially the floating surface margins, the hero orb video, and
      architecture diagrams
- [ ] Check the hero orb video's mask blend against the real browser
      background — the fade radius was tuned by simulating it in
      Python, not by eyeballing it rendered; if the seam shows, adjust
      the two percentages in `HeroOrbVideo.tsx`'s `maskImage`

## SEO tradeoff: CSR vs. SSR/SSG

Unchanged from the previous revision, extended to the new `/lab` routes:
this site is client-side rendered — `Seo.tsx` updates `document.title`
and meta tags per route after mount. Fine for the actual audience
(recruiters clicking through in a browser, and JS-executing crawlers
like Google); the real limitation is link unfurling for non-JS
crawlers, which only see `index.html`'s tags. Not worth a framework
change for an 11-route portfolio — if it matters later, prerender the
known routes at build time (`vite-plugin-ssg` or similar) rather than
switching to Next.js.

## Deployment

Static output from `npm run build` (the `dist/` folder) works on
Vercel, Render, Netlify, GitHub Pages, or Cloudflare Pages. Since this
is a client-side router, the host needs to rewrite every path to
`index.html` (SPA fallback) — without it, a hard refresh on e.g.
`/lab/image` 404s, because the host looks for a literal file at that
path instead of serving your app and letting React Router take over.
Both configs below are already in this repo and set that up.

### Vercel

`vercel.json` is already in the repo root — Vercel picks it up
automatically.

1. Push this project to a GitHub/GitLab/Bitbucket repo (or run
   `npx vercel` from this folder to deploy directly from your machine).
2. In the Vercel dashboard: **Add New → Project**, import the repo.
3. Framework preset: **Vite** (auto-detected). Build command
   `npm run build`, output directory `dist` — `vercel.json` sets these
   explicitly too, so it works even if auto-detection guesses wrong.
4. Deploy. Every push to your default branch redeploys automatically;
   PRs get their own preview URL.
5. Once you have a real domain, update `SITE_URL` in `vite.config.ts`
   and the canonical/OG URLs in `index.html` + `src/components/Seo.tsx`
   to match — those still say `varundhanak.dev`.

### Render

`render.yaml` is already in the repo root — Render's **Blueprint**
deploy reads it automatically and sets up the rewrite rule for you.

1. Push this project to a GitHub/GitLab repo.
2. In the Render dashboard: **New → Blueprint**, connect the repo.
   Render finds `render.yaml` and proposes the `varun-dhanak-portfolio`
   static site from it — confirm and deploy.
3. Alternative without Blueprints: **New → Static Site**, connect the
   repo, set build command `npm install && npm run build` and publish
   directory `dist`, then add the rewrite rule manually under
   **Redirects/Rewrites**: source `/*`, destination `/index.html`, type
   **Rewrite**.
4. Same domain note as above once you have a real one.

### Environment variables (either host)

If you connect a real AI Lab backend, set these in the host's
dashboard (Vercel: Project → Settings → Environment Variables; Render:
service → Environment) — not in a committed `.env` file:

- `VITE_AI_LAB_MOCK=false`
- `VITE_AI_LAB_API_BASE=https://your-backend-url`

Both are safe to expose (see `.env.example` — no secret ever belongs in
a `VITE_` variable). Leave `VITE_AI_LAB_MOCK` unset or `true` to keep
the Lab in demo mode on a preview deploy.
