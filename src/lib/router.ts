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
  | { kind: "project"; slug: string; anchor?: string }
  | { kind: "notfound"; path: string };

export function parse(hash: string): Route {
  const raw = hash.replace(/^#/, "");

  /*
   * The leading slash is the whole distinction and has to be read before it is
   * stripped.
   *
   *   #about            a section on the home page
   *   #/about           a path, and there is no page there
   *
   * An earlier version stripped the slashes first and then tested the
   * remainder against /^[a-z-]+$/, which cannot tell those two apart. The
   * result was that every mistyped path made of letters and hyphens —
   * `#/does-not-exist` among them — silently rendered the home page instead of
   * the 404, so the 404 route was effectively unreachable.
   */
  const isPath = raw.startsWith("/");
  const path = raw.replace(/^\/+|\/+$/g, "");
  if (path === "" || path.startsWith("#")) return { kind: "home" };

  const project = /^projects\/([a-z0-9-]+)(?:\/([a-z-]+))?$/.exec(path);
  if (project && project[1]) return {
    kind: "project",
    slug: project[1] === "cache-compression" ? "cachelab" : project[1],
    ...(project[2] ? { anchor: project[2] } : {}),
  };

  // Resolving a bare anchor here is what lets the header nav work from a
  // project page, where the target section is not in the DOM to scroll to.
  if (!isPath && /^[a-z-]+$/.test(path)) return { kind: "home", anchor: path };

  return { kind: "notfound", path };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));

  useEffect(() => {
    // Native fragment links to mounted content (e.g. the skip link) must not
    // be interpreted as a request to unmount the current project.
    const onChange = () => {
      const hash = window.location.hash;
      const id = hash.replace(/^#/, "");
      if (!hash.startsWith("#/") && id && document.getElementById(id)) return;
      setRoute(parse(hash));
    };
    const onClick = (event: MouseEvent) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      const target = link?.getAttribute("href");
      if (target?.startsWith("#/") && target === window.location.hash) {
        event.preventDefault();
        setRoute(parse(target));
      }
    };
    window.addEventListener("hashchange", onChange);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onChange);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return route;
}

export const href = {
  home: "#/",
  section: (id: string) => `#${id}`,
  project: (slug: string, anchor?: string) =>
    `#/projects/${slug === "cachelab" ? "cache-compression" : slug}${anchor ? `/${anchor}` : ""}`,
};
