# Portfolio site

The site that presents five engineering projects, each of which lives in its own
repository. Cross-project documents are in [`docs/`](docs/).

```bash
npm ci
npm run dev                # http://localhost:5173
npm run build              # type-check, then bundle into dist/
npm run preview            # serve the built output
npm run typecheck          # type-check alone
```

---

## What this is

A static single-page site, art-directed dark, with one WebGL scene and a
hand-drawn figure for every project. No backend, no analytics, no tracking, no
forms, no third-party request of any kind. `npm run build` produces `dist/`,
which can be served by anything.

**Measured output, 2026-09-29:**

| Asset | Raw | Gzipped | When it loads |
|---|---:|---:|---|
| `index.html` | 4.89 kB | 2.05 kB | always |
| CSS | 41.57 kB | 8.66 kB | always |
| JS (entry) | 230.70 kB | 75.98 kB | always |
| Inter Variable, latin | 47.1 kB | — | always (preloaded) |
| Instrument Serif, latin | 20.5 kB | — | always (preloaded) |
| JetBrains Mono Variable, latin | 39.5 kB | — | always |
| `scene` chunk (three.js) | 478.45 kB | 121.10 kB | **desktop only, on demand** |

58 modules. Sizes above are from a fresh `npm ci` and build on 2026-09-29. The
transfer figures that follow were measured just before the final CSS adjustment
(about +0.2 kB gzipped) and were not re-measured. Measured cold, cache disabled: a phone transfers **192 kB over 6
requests** and never fetches the 3D chunk; a desktop transfers **310 kB over 7
requests**. First contentful paint over loopback is 136 ms on the phone profile
and 68 ms on the desktop one. Cumulative layout shift is 0 in both cases.

---

## Decisions

**React + TypeScript + Vite, plain CSS.** Unchanged, and for the same reason:
the stack matches CampusFlow and ResumeLens, so the repository has one frontend
toolchain rather than three. Styling is still hand-written CSS with custom
properties.

**A hand-written hash router, not a routing library.** Unchanged. Hash routing
needs no server rewrite rules, so `dist/` works on GitHub Pages, from a
subdirectory, or opened straight off disk.

**Three self-hosted web fonts — reversing an earlier decision.** The previous
version shipped none, arguing that a render-blocking request was not worth it
for a ~72 kB page. The redesign needs a real display face, so the decision is
reversed and paid for explicitly: latin subsets only (~107 kB total),
`font-display: swap` so text is never invisible, the two above-the-fold faces
preloaded by a small Vite plugin, and the `@font-face` rules written by hand
rather than importing the packages' CSS — which would have emitted cyrillic,
greek and latin-ext into `dist/` for an English page. Nothing is fetched from
Google Fonts or any other origin.

**Plain three.js, not React Three Fiber.** R3F is a react-reconciler and
roughly 35 kB gzipped on top of three.js, and it buys JSX syntax over about
forty lines of imperative setup for a single bespoke scene with no scene graph
to reconcile. This site already replaced a routing library with a thirty-line
router on that reasoning; importing a second renderer here would have
contradicted it.

**Dark is the default, not the OS preference.** The previous version followed
`prefers-color-scheme`. The design is art-directed dark — the graphite surface,
the grain and the lit hero *are* the design — so a visitor on a light desktop
should still see it as made. Light remains fully specified, passes AA on every
pairing, is one click away, and persists. An inline script in `index.html`
applies a stored choice before first paint, so nothing flashes.

**One WebGL context, five SVG figures.** The hero is the only canvas. Each
project's motif is procedural inline SVG drawing that project's actual subject
— shard lanes and an append-only log for SwiftKV, compacted cache lines for
CacheLab, a measured noise floor for SmartLab. Five live WebGL contexts on one
page would have been slower, louder and no more legible.

**Two figure systems, deliberately different.** `ProjectMotif` is a signature
— something to recognise a project by in a list, 160x100, five of them on one
page. `CaseFigure` is a drawing of how the project is actually assembled, 760
units wide, one per case study, with the structural idea that makes each
project interesting drawn explicitly: the log written before the reply, the
model sitting outside the boundary the score is computed in, the measured floor
beneath every model, one writer holding the row. The case study does not simply
enlarge the index motif, because a signature and an explanation are not the
same drawing. Every label in them is structural or is a figure that already
appears in `src/data/projects.ts`.

**Diagrams are inline SVG built from data.** Unchanged. Each project's pipeline
is an array of stages in `src/data/projects.ts`; `Diagram.tsx` lays it out.

**Content is separated from presentation.** Unchanged, and load-bearing for
this redesign: `src/data/` was not edited at all. No component contains a
project claim, so the entire visual language could be replaced without any
figure moving.

---

## The 3D system

`src/three/scene.ts` builds four stacked lattices — compute, data, memory,
substrate — at descending pitch, with vertical traces between them and packets
travelling those traces. It is not a model of any particular machine. It is the
one idea the five projects share, that a system is layers with traffic between
them, drawn so it can be looked into.

It is a progressive enhancement over `HeroFallback.tsx`, an isometric line
drawing of the same structure that ships in the main bundle and is what every
visitor sees first. `HeroScene.tsx` decides whether to upgrade, and **does not
even fetch the chunk** unless all of these hold:

- no `prefers-reduced-motion` (the scene is never mounted, not merely paused —
  a slowly orbiting camera is what that preference is asking not to see);
- viewport at least 820 px, fine pointer with hover, ≥ 4 cores, ≥ 4 GB memory,
  Save-Data off;
- WebGL produces a context.

While it runs it is throttled: an IntersectionObserver and `visibilitychange`
drive the render loop, device pixel ratio is capped at 1.6–1.85, geometry is
instanced (one draw call per layer), and there is no post-processing. Verified
below: **0 animation frames while the hero is off-screen.**

---

## The content rule

Every figure on this site was copied from this repository's own generated
results or from `PROJECT_STATUS.md`, which is the source of truth for what is
finished. Where the two disagreed, `PROJECT_STATUS.md` won.

**The redesign changed no content.** `src/data/` is byte-identical to the
previous version. Each number still carries the evidence label the repository
uses for it — **Measured**, **Simulated**, **Predicted** or **Not yet
measured** — rendered next to the number rather than dropped, and the three
labels are now distinguished by border style and a leading dot as well as by
hue, so colour is never the only thing carrying the distinction. "Not yet
measured" is deliberately unhued and dashed, because it marks the absence of a
result rather than a third kind of result.

Three things follow from the content rule and are worth knowing before editing:

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

When the site was built this repository had no git remote, and there is still
no LinkedIn reference and no committed resume PDF. Rather than guess at URLs, `src/data/profile.ts` holds
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
                                                      (untouched by the redesign)
  components/  Header, Footer, Section, Diagram, Metric, Tag,
               HeroScene (lifecycle + capability gate),
               HeroFallback (isometric no-WebGL figure),
               ProjectMotif (five small project signatures),
               CaseFigure (five large per-project technical figures)
  sections/    Hero, Projects, Focus, Research, About, Contact
  pages/       Home, ProjectDetail (eight-part case study), NotFound
  three/       scene.ts — the hero scene, dynamically imported
  lib/         router.ts (hash router)
               hooks.ts (reveal, theme, meta, scrolled, active section)
  styles/      tokens.css (design tokens), fonts.css, global.css
```

---

## Verification

Checked with headless Chrome over the DevTools Protocol against the built
output; the scripts are throwaway.

| Check | Result |
|---|---|
| `npm run build` | clean under `strict` TypeScript with `noUnusedLocals`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`; no chunk-size warning |
| Case figures | all five render, each with a 300–420 character text alternative and its own caption; none repeats the index motif |
| 7 routes rendered | no console errors or warnings, no exceptions |
| Routing | `#about` scrolls home; `#/does-not-exist`, `#/a/b/c`, `#/projects/nope` all 404; nav from a project page returns home and scrolls |
| Document titles | each route sets its own |
| Horizontal overflow | none, on all 7 routes, at 1920 / 1440 / 1280 / 1024 / 900 / 768 / 600 / 430 / 390 / 360 / 320 px |
| Reduced motion, figures | case-study flows fully drawn and lit cells visible rather than mid-transition |
| Heading structure | one `h1` per route, no skipped levels, every anchor has an accessible name |
| Keyboard | skip link focuses first and becomes visible; full Tab traversal reaches 17 elements on the home page and 19 on a case study, in logical order, **0 without a visible focus indicator** |
| Contrast | 174 distinct text styles per theme across all routes — **0 below WCAG AA in either theme** |
| Reduced motion | scene never mounts and its chunk is never fetched; 0 elements below full opacity; 0 running animations |
| Capability gate | at 700 px wide the 3D chunk is not fetched and the SVG figure is used |
| Render throttling | 101 frames / 2 s with the hero on screen, **0 frames / 2.5 s off screen**, resumes on return |
| Theme | toggle switches, rewrites `theme-color`, persists to `localStorage`, survives reload, applied before first paint |
| Layout shift | CLS 0 on desktop and phone |

Four real defects were found this way and fixed:

1. **The 404 route was unreachable.** `parse()` stripped the leading slash
   before testing the remainder against `/^[a-z-]+$/`, so `#/does-not-exist`
   was indistinguishable from the bare anchor `#about` and silently rendered
   the home page. The slash is now read before it is stripped.
2. **The case-study page overflowed horizontally below 620 px.** A grid item's
   default `min-width: auto` meant the architecture diagram — deliberately
   wider than a phone, and scrolling inside its own container — would not let
   its ancestors shrink, so it pushed the whole page sideways.
3. **The theme toggle wrapped to a third header row on phones.** The
   small-screen `order` and `width` were set on the `<ul>`, but the flex item
   is the `<nav>` wrapping it.
4. **The project number sat on top of the project title at 390 px.** A
   `grid-column: 2` left over from the 1080 px breakpoint created an implicit
   second column against a single-column grid and collapsed the explicit one
   to zero width.

A later polish pass found four more, all of them things that looked fine until
they were measured:

5. **The hero canvas was pinned to the wrong side of the page.** `.hero__canvas`
   set `inset: 0`, which also sets `left`. With a left, a right and a width all
   specified the box is over-constrained and CSS discards the right, so the
   WebGL canvas sat under the display type on the left while the SVG fallback
   was correctly placed on the right.
6. **Both drawings were visible at once.** The canvas is created with
   `alpha: true`, so the fallback behind it showed through everywhere the scene
   had not drawn geometry. Measured, the SVG was supplying most of the hero's
   luminance and the lit WebGL scene was the fainter of the two. The fallback
   now retires once the scene reports it is drawing.
7. **The scene was inside its own fog.** The camera orbits at about 18 units
   and the fog ran from 15 to 32, so the whole stack was between a third and a
   half faded toward the page colour. Raising the material value and the key
   light had almost no effect until this was found.
8. **The mobile figure sat on top of the body copy.** Once the columns collapse,
   a right-hand placement lands across the headline and the first lines of the
   summary. It now has a band of its own above the eyebrow.

**Not done:** no automated test suite, and no Lighthouse run. Load timings were
taken over loopback on a machine also running unrelated simulation jobs, with
software rasterisation (SwiftShader) rather than a GPU, so the frame rate of
the hero scene here is not representative of real hardware and no FPS figure is
quoted. Viewport checks are emulated, not real devices.

---

## License

No license has been selected for this repository yet, so no license file is
included. The fonts and libraries the site depends on remain under their own
licences.
