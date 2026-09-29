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

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "portfolio-theme";

function readStored(): Theme {
  // localStorage throws in a private window with site data blocked, so every
  // access is guarded; the site must render correctly when it is unavailable.
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark") return value;
  } catch {
    /* ignore */
  }
  return "system";
}

/** Theme preference: follows the OS unless the visitor overrides it. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readStored);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);

    try {
      if (theme === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* preference simply does not persist */
    }
  }, [theme]);

  const systemPrefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark);

  return {
    isDark,
    toggle: () => setTheme(isDark ? "light" : "dark"),
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
