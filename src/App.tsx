import { useEffect } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { ProjectDetail } from "./pages/ProjectDetail";
import { NotFound } from "./pages/NotFound";
import { projects } from "./data/projects";
import { profile } from "./data/profile";
import { useRoute } from "./lib/router";
import { useDocumentMeta, useActiveSection } from "./lib/hooks";

const HOME_TITLE = `${profile.name} — ${profile.headline}`;
const HOME_DESCRIPTION =
  "M.Tech CSE at IIT Jodhpur. Five engineering projects across systems (C++20), " +
  "computer architecture (gem5), machine learning, and production backends — with " +
  "every claim labelled by how it was measured.";

/** The home page sections, in order, for the header's active state. */
const HOME_SECTIONS = ["projects", "focus", "research", "about", "contact"];

export function App() {
  const route = useRoute();
  const project =
    route.kind === "project"
      ? projects.find((candidate) => candidate.slug === route.slug)
      : undefined;

  /**
   * One owner for the document title. An earlier version let each page set its
   * own and had App fall back to `document.title`, which read a stale value
   * during render and then overwrote the child's title in a later effect —
   * every project page ended up labelled with the previously visited one.
   */
  const meta =
    project !== undefined
      ? {
          title: `${project.name} — ${profile.name}`,
          description: `${project.name}: ${project.tagline}`,
        }
      : route.kind === "home"
        ? { title: HOME_TITLE, description: HOME_DESCRIPTION }
        : { title: `Not found — ${profile.name}`, description: HOME_DESCRIPTION };

  useDocumentMeta(meta.title, meta.description);

  // Only the home page has sections to be inside; elsewhere the correct
  // answer is "none", so the hook is given an empty list rather than being
  // called conditionally.
  const activeSection = useActiveSection(
    route.kind === "home" ? HOME_SECTIONS : [],
  );

  /**
   * Scroll is managed here rather than left to the browser. A hash change into
   * a section that is not mounted yet cannot be resolved natively, which is
   * exactly what happens when the header nav is used from a project page.
   */
  useEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";

    if (route.kind === "home" && route.anchor) {
      // One frame, so the section exists before we look for it.
      const id = route.anchor;
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
      });
      return;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [route]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header active={activeSection} />
      <main id="main">
        {route.kind === "home" ? <Home /> : null}
        {route.kind === "project" && project ? <ProjectDetail project={project} /> : null}
        {route.kind === "project" && !project ? (
          <NotFound path={`/projects/${route.slug}`} />
        ) : null}
        {route.kind === "notfound" ? <NotFound path={`/${route.path}`} /> : null}
      </main>
      <Footer />
    </>
  );
}
