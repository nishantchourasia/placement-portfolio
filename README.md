# Portfolio site

The site that presents the five projects in this repository.

```bash
source ../tools/env.sh     # redirects the npm cache off the full root disk
npm install
npm run dev                # http://localhost:5173
npm run build              # type-check, then bundle into dist/
npm run preview            # serve the built output
```

---

## What this is

A static single-page site. No backend, no analytics, no tracking, no forms.
`npm run build` produces `dist/`, which can be served by anything.

**Measured output, 2026-09-29:**

| Asset | Raw | Gzipped |
|---|---:|---:|
| `index.html` | 3.69 kB | 1.55 kB |
| CSS | 13.90 kB | 3.44 kB |
| JS | 203.18 kB | 67.15 kB |
| **Total** | **~221 kB** | **~72 kB** |

Most of the JS is React itself. 51 modules, one chunk.

---

## Decisions

**React + TypeScript + Vite, plain CSS.** The stack matches CampusFlow and
ResumeLens, so the repository has one frontend toolchain rather than three.
Styling is hand-written CSS with custom properties: a utility framework would
be a larger dependency than everything else here combined, and the design is
specific enough that the utilities would mostly be overridden.

**No web font.** A variable font would add a render-blocking request and a
flash of unstyled text to a page whose whole payload is ~72 kB gzipped. The
platform sans stack carries the body text and a monospace carries the technical
labels, which is where the character comes from anyway.

**A hand-written hash router, not a routing library.** Two routes do not
justify a dependency larger than every component on this site. Hash routing
also needs no server rewrite rules, so `dist/` works unchanged on GitHub Pages,
from a subdirectory, or opened straight off disk — a history-API router would
404 on `/projects/swiftkv` in all three.

**Diagrams are inline SVG built from data.** Each project's pipeline is an
array of stages in `src/data/projects.ts`; `Diagram.tsx` lays it out. No image
files, no extra requests, correct in dark mode for free because it inherits the
theme's custom properties, and it carries a real text alternative.

**Content is separated from presentation.** Everything factual lives in
`src/data/`. No component contains a project claim, so a figure is corrected in
one place.

---

## The content rule

Every figure on this site was copied from this repository's own generated
results or from `PROJECT_STATUS.md`, which is the source of truth for what is
finished. Where the two disagreed, `PROJECT_STATUS.md` won.

Each number carries the evidence label the repository uses for it — **Measured**,
**Simulated**, **Predicted** or **Not yet measured** — and the label is rendered
next to the number rather than dropped. Three things follow from that rule and
are worth knowing before editing:

- **SwiftKV is described as single-node.** Its README opens by calling it
  "distributed", but clustering and replication are listed as not built, and
  the site says single node.
- **CacheLab makes no STT-RAM claim.** The gem5 configuration states the L3 is
  SRAM only, so the site describes the compression study that is actually in
  the data.
- **Nothing is marked complete because it was written.** Docker appears as
  configuration that was never built, because this machine has no Docker daemon.

---

## Links that do not exist yet

This repository has no configured git remote, no LinkedIn reference and no
committed resume PDF. Rather than guess at URLs, `src/data/profile.ts` holds
them as `null`, and the UI renders only the links that resolve — the contact
section lists the others with the reason they are missing.

To publish them, fill in the `href` values in that file. Nothing else changes.

At the same time, add to `index.html` the three tags that need a real domain:
`og:url`, `og:image` and a canonical `<link>`. A `Sitemap:` line can then go
into `public/robots.txt`.

---

## Layout

```
src/
  data/        profile.ts, projects.ts, content.ts  — every claim lives here
  components/  Header, Footer, Section, Diagram, Metric, Tag
  sections/    Hero, Projects, Focus, Research, About, Contact
  pages/       Home, ProjectDetail, NotFound
  lib/         router.ts (hash router), hooks.ts (reveal, theme, meta)
  styles/      tokens.css (design tokens), global.css
```

---

## Verification

Checked with headless Chrome over the DevTools Protocol against the built
output; the scripts are throwaway, the results are in the commit message.

| Check | Result |
|---|---|
| `npm run build` | clean under `strict` TypeScript with `noUnusedLocals`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| 7 routes rendered | no console errors or warnings, no exceptions |
| Document titles | each route sets its own; `#/does-not-exist` renders the 404 page |
| Horizontal overflow | none at 500 / 768 / 1024 / 1440 / 1920 px |
| Heading structure | one `h1` per route, no skipped levels |
| Links | every anchor has an accessible name; no dead in-page anchors |
| Keyboard | skip link focuses first and becomes visible; 9/9 tabbed elements show a focus ring under real key events |
| Contrast | 41 distinct text styles on home, 27 on a project page — 0 below WCAG AA in either theme |
| Reduced motion | no element sits below full opacity; reveal animation is never applied |
| Theme | toggle switches, persists to `localStorage`, survives reload, falls back to the OS setting |

Two real defects were found this way and fixed: `--ink-3` measured 4.02:1 in
light mode (a fail, and it looked fine), and the header nav would not shrink,
pushing the theme toggle off-screen below ~540 px.

**Not done:** no automated test suite, no Lighthouse run, no real-device
testing — the viewport checks are emulated, and this headless browser will not
open a window narrower than 500 px, so layouts below that width are verified by
CSS inspection rather than by rendering.
