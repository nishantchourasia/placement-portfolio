import { useEffect, useState } from "react";

/**
 * A ~30-line hash router, in place of a routing library.
 *
 * Two reasons. A router dependency is larger than every component on this site
 * put together, for two routes. More practically, hash routes need no server
 * rewrite rules, so the built site works unchanged on GitHub Pages, from a
 * docs/ folder, behind any static host, or opened directly from disk — a
 * history-API router would 404 on a project page in most of those.
 */

export type Route =
  /** `anchor` is set when the visitor asked for a specific section. */
  | { kind: "home"; anchor?: string }
  | { kind: "project"; slug: string }
  | { kind: "notfound"; path: string };

export function parse(hash: string): Route {
  const path = hash.replace(/^#/, "").replace(/^\/+|\/+$/g, "");
  if (path === "" || path.startsWith("#")) return { kind: "home" };

  const project = /^projects\/([a-z0-9-]+)$/.exec(path);
  if (project && project[1]) return { kind: "project", slug: project[1] };

  // A bare "#about" means the home route, scrolled to that section. Resolving
  // it here is what lets the header nav work from a project page as well.
  if (/^[a-z-]+$/.test(path)) return { kind: "home", anchor: path };

  return { kind: "notfound", path };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}

export const href = {
  home: "#/",
  section: (id: string) => `#${id}`,
  project: (slug: string) => `#/projects/${slug}`,
};
