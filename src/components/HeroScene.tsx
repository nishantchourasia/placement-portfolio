import { useEffect, useRef, useState } from "react";
import type { SceneHandle } from "../three/scene";
import { HeroFallback } from "./HeroFallback";

/**
 * Decides whether the WebGL hero runs at all, and owns its lifecycle.
 *
 * The scene is a progressive enhancement over HeroFallback, which is real
 * content rather than a placeholder — it is what ships when any of the
 * following is true:
 *
 *   - the visitor prefers reduced motion (the scene is never mounted, not
 *     merely paused: a slowly orbiting camera is exactly what that preference
 *     is asking not to see);
 *   - the device reports few cores, a narrow viewport, or Save-Data;
 *   - WebGL cannot produce a context;
 *   - the dynamic import fails, for any reason including being offline.
 *
 * When it does run it is throttled hard: the render loop is driven by an
 * IntersectionObserver and by document visibility, so nothing is drawn while
 * the hero is off-screen or the tab is in the background.
 */

const MIN_WIDTH = 820;

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** A conservative guess at whether this device should be asked to do this. */
function deviceCanAfford(): boolean {
  if (window.innerWidth < MIN_WIDTH) return false;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData === true) return false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return false;
  if (
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency > 0 &&
    navigator.hardwareConcurrency < 4
  ) {
    return false;
  }
  // Coarse pointer with no hover is a phone or a TV; the parallax that
  // justifies the scene does not exist there.
  if (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches
  ) {
    return false;
  }
  return true;
}

function webglAvailable(): boolean {
  try {
    const probe = document.createElement("canvas");
    const gl =
      probe.getContext("webgl2") ??
      probe.getContext("webgl") ??
      probe.getContext("experimental-webgl");
    if (!gl) return false;
    // Release the probe context immediately; browsers cap how many exist.
    const lose = (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function HeroScene() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  /*
   * True once the scene is actually drawing.
   *
   * The canvas is created with `alpha: true` and a zero clear alpha, so
   * anywhere it has not drawn geometry the fallback behind it shows through.
   * With both visible the hero was compositing two different drawings of the
   * same structure on top of each other — measured, the SVG was supplying
   * most of the visible luminance and the lit canvas was the fainter of the
   * two. The fallback is real content until the scene arrives, and must get
   * out of the way the moment it does.
   */
  const [sceneReady, setSceneReady] = useState(false);

  // Decided once, on the client, after mount — none of these signals exist
  // during render and several of them would differ under SSR.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!deviceCanAfford()) return;
    if (!webglAvailable()) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    let handle: SceneHandle | null = null;
    let cancelled = false;
    const cleanups: (() => void)[] = [];

    void (async () => {
      let createScene: typeof import("../three/scene").createScene;
      try {
        ({ createScene } = await import("../three/scene"));
      } catch {
        // Offline, blocked, or a chunk that failed to load. The fallback is
        // already in the DOM behind this canvas, so there is nothing to do.
        return;
      }
      if (cancelled) return;

      try {
        handle = createScene(canvas, {
          maxDpr: window.innerWidth > 1600 ? 1.6 : 1.85,
        });
      } catch {
        return;
      }
      if (cancelled) {
        handle.dispose();
        handle = null;
        return;
      }

      /* ---- Visibility: the render loop only runs when it is worth it ---- */

      let onScreen = false;
      let tabVisible = document.visibilityState !== "hidden";

      const sync = () => {
        if (!handle) return;
        if (onScreen && tabVisible) handle.start();
        else handle.stop();
      };

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) onScreen = entry.isIntersecting;
          sync();
        },
        { threshold: 0 },
      );
      observer.observe(host);
      cleanups.push(() => observer.disconnect());

      const onVisibility = () => {
        tabVisible = document.visibilityState !== "hidden";
        sync();
      };
      document.addEventListener("visibilitychange", onVisibility);
      cleanups.push(() =>
        document.removeEventListener("visibilitychange", onVisibility),
      );

      /* ---- Input ------------------------------------------------------- */

      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        handle?.setPointer(
          (event.clientX / window.innerWidth) * 2 - 1,
          (event.clientY / window.innerHeight) * 2 - 1,
        );
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      cleanups.push(() =>
        window.removeEventListener("pointermove", onPointerMove),
      );

      // Scroll is read inside the existing rAF loop rather than in the scroll
      // handler, so this listener only ever stores a number.
      const onScroll = () => {
        const rect = host.getBoundingClientRect();
        const travelled = -rect.top;
        handle?.setProgress(travelled / Math.max(1, rect.height));
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
      onScroll();

      /* ---- Size and theme ---------------------------------------------- */

      const resizeObserver = new ResizeObserver(() => handle?.resize());
      resizeObserver.observe(host);
      cleanups.push(() => resizeObserver.disconnect());

      // The toggle sets data-theme on <html>; the scene re-reads its colours
      // from the custom properties when it changes.
      const themeObserver = new MutationObserver(() => handle?.refreshTheme());
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      cleanups.push(() => themeObserver.disconnect());

      sync();
      setSceneReady(true);
    })();

    return () => {
      cancelled = true;
      setSceneReady(false);
      for (const fn of cleanups) fn();
      handle?.dispose();
      handle = null;
    };
  }, [enabled]);

  return (
    <div className="hero__scene" ref={hostRef} aria-hidden="true">
      {/*
        The fallback stays mounted underneath. If the chunk never arrives the
        hero still has a composition, and there is no frame in which the area
        is empty.
      */}
      <div className="hero__fallback" data-retired={sceneReady ? "true" : "false"}>
        <HeroFallback />
      </div>
      {enabled ? <canvas ref={canvasRef} className="hero__canvas" /> : null}
    </div>
  );
}
