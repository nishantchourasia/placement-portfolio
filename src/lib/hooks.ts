import { useEffect, useRef, useState } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

function motionAllowed(): boolean {
  return typeof window.matchMedia === "function"
    ? !window.matchMedia(REDUCED).matches
    : true;
}

/**
 * Reveal-on-scroll, applied only when motion is allowed.
 *
 * The element starts visible in CSS; this hook adds the `reveal` class, which
 * carries the hidden starting state, and then removes it via data-shown. So a
 * visitor with JavaScript disabled, a reduced-motion preference, or a browser
 * without IntersectionObserver sees the content immediately rather than a blank
 * page — the failure mode of the usual "hide in CSS, show in JS" pattern.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!motionAllowed() || typeof IntersectionObserver === "undefined") return;

    node.classList.add("reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.dataset.shown = "true";
            observer.unobserve(node);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export type Theme = "light" | "dark";

const STORAGE_KEY = "portfolio-theme";

/**
 * Dark is the default rather than the OS preference.
 *
 * This is a deliberate change from the previous version, which followed
 * `prefers-color-scheme`. The redesign is art-directed dark — the graphite
 * surface, the grain and the lit hero are the design, not a night mode of it —
 * so a visitor on a light desktop should still see the site as it was made.
 * Light is fully specified, meets AA on every pairing, and is one click away;
 * the choice persists. An inline script in index.html applies a stored choice
 * before first paint, so nothing flashes.
 */
function readStored(): Theme {
  // localStorage throws in a private window with site data blocked, so every
  // access is guarded; the site must render correctly when it is unavailable.
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark") return value;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readStored);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    // The browser chrome should match the page, and the two <meta> tags in
    // index.html are keyed to the OS preference, which no longer decides this.
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#0b0a09" : "#fbf9f5");
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* preference simply does not persist */
    }
  }, [theme]);

  return {
    isDark: theme === "dark",
    toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
}

/** Sets document title and meta description per route. */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (!description) return;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
  }, [title, description]);
}

/** True once the page has scrolled past `threshold` pixels. */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

/**
 * Which of `ids` is currently the reader's section, for the header nav and
 * the case-study contents rail.
 *
 * An IntersectionObserver alone reports "is visible", which is ambiguous when
 * three sections are on screen at once. This picks the last section whose top
 * has passed a line a third of the way down the viewport, which is what a
 * reader would call the one they are in. It runs off scroll rather than a
 * second observer because it has to compare candidates against each other.
 */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  // The array identity changes every render at call sites that build it
  // inline; the joined key is what keeps this effect from re-subscribing.
  const key = ids.join("|");

  useEffect(() => {
    const targets = key.split("|").filter(Boolean);
    if (targets.length === 0) return;

    let queued = false;

    const measure = () => {
      queued = false;
      const line = window.innerHeight * 0.33;
      let current: string | null = null;

      for (const id of targets) {
        const node = document.getElementById(id);
        if (!node) continue;
        if (node.getBoundingClientRect().top <= line) current = id;
      }

      // Past the bottom of the page the last section is the active one, even
      // if it is short enough never to cross the line.
      const atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atEnd) current = targets[targets.length - 1] ?? current;

      setActive(current);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key]);

  return active;
}
