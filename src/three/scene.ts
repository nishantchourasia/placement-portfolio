/**
 * The hero scene: an abstract computational architecture.
 *
 * WHAT IT IS
 * Four stacked layers, read top to bottom as compute → data → memory →
 * substrate. Each layer is a lattice of cells at a different pitch: coarse and
 * tall where work happens, fine and flat where storage does. Vertical traces
 * connect cells across layers, and packets travel those traces. A handful of
 * cells are lit at any moment; the light source drifts between the layers, so
 * the stack is revealed rather than uniformly flood-lit.
 *
 * It is not a model of any particular machine and does not claim to be. It is
 * the one idea the five projects on this site share — that a system is layers
 * with traffic between them — drawn so it can be looked into rather than at.
 *
 * WHY PLAIN THREE.JS AND NOT REACT THREE FIBER
 * The brief suggested R3F. For one bespoke scene with no scene graph to
 * reconcile, R3F is a react-reconciler and ~35 kB gzipped to gain JSX syntax
 * over about forty lines of imperative setup, and it would still be three.js
 * doing all the work. This site already replaced a routing library with a
 * thirty-line hash router on the same reasoning, so importing a second
 * renderer here would have been inconsistent with its own decision record.
 *
 * EVERYTHING HERE IS OPTIONAL
 * This module is dynamically imported and never enters the initial bundle. It
 * is not loaded at all when the visitor prefers reduced motion, when WebGL is
 * unavailable, or when the device looks too small or too weak to be worth it —
 * see HeroScene.tsx, which decides, and HeroFallback.tsx, which draws the
 * static composition instead.
 */

import {
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  Float32BufferAttribute,
  Fog,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";

export interface SceneHandle {
  /** Pointer position in −1..1, already smoothed by the caller if desired. */
  setPointer(x: number, y: number): void;
  /** 0 at the top of the hero, 1 when it has scrolled fully past. */
  setProgress(p: number): void;
  /** Re-read the theme colours from CSS custom properties. */
  refreshTheme(): void;
  resize(): void;
  start(): void;
  stop(): void;
  dispose(): void;
}

export interface SceneOptions {
  /** Upper bound on device pixel ratio. Lower on weak or small devices. */
  maxDpr?: number;
  /** Scales every lattice's cell count. 1 is desktop; 0.6 is a phone. */
  density?: number;
}

/** One layer of the stack: a lattice at its own pitch and height. */
interface LayerSpec {
  y: number;
  /** Cells per side. */
  n: number;
  cell: number;
  gap: number;
  height: number;
}

/*
 * Four plates, widening downwards, packed tightly.
 *
 * Two things make this read as a stack rather than as scattered shapes.
 * Density: the gaps are a small fraction of the cell, so each plate is an
 * array with a texture instead of confetti on a plane. And footprint: the
 * plates grow as you descend, so the silhouette from any angle is a stepped
 * solid — compute is a small hot die sitting on progressively larger
 * storage. An earlier version had loose gaps, equal footprints and 1.3 units
 * of air between layers, and read as four unrelated fields of diamonds.
 */
const LAYERS: LayerSpec[] = [
  { y: 0.0, n: 8, cell: 0.44, gap: 0.085, height: 0.17 },
  { y: -1.55, n: 12, cell: 0.36, gap: 0.07, height: 0.1 },
  { y: -3.05, n: 20, cell: 0.26, gap: 0.045, height: 0.06 },
  { y: -4.5, n: 5, cell: 1.3, gap: 0.1, height: 0.05 },
];

function cssColor(name: string, fallback: string): Color {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  try {
    return new Color(raw || fallback);
  } catch {
    return new Color(fallback);
  }
}

/** Deterministic PRNG, so the composition is identical on every load. */
function makeRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function createScene(
  canvas: HTMLCanvasElement,
  options: SceneOptions = {},
): SceneHandle {
  const maxDpr = options.maxDpr ?? 1.75;
  const density = options.density ?? 1;

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(34, 1, 0.1, 100);

  /* ---- Theme-driven colours ------------------------------------------ */

  let accent = cssColor("--accent", "#e9b872");
  /*
   * The cells take their value from --rule-strong, not from a background
   * token. Shaded at --bg-3 they were within a couple of percent of the page
   * behind them, so the arrays were invisible and all you saw were the four
   * or five lit cells — scattered highlights rather than a lattice. The
   * plates have to be a visible material for the light to model anything.
   */
  let surface = cssColor("--scene-plate", "#2e2a26");
  let background = cssColor("--bg-0", "#0b0a09");

  /*
   * Fog starts beyond the object, not across it.
   *
   * The camera orbits at about 18 units, so a fog range of 15 to 32 put the
   * entire stack between a third and a half faded toward the page colour —
   * which is why raising the material value and the key light changed almost
   * nothing. Fog is here to drop the ground plane away, and nothing else.
   */
  const fog = new Fog(background.getHex(), 28, 66);
  scene.fog = fog;

  /* ---- Lights --------------------------------------------------------- */

  const ambient = new AmbientLight(0xffffff, 0.62);
  scene.add(ambient);

  // Key light, high and to the left, so the lattice reads as relief.
  const key = new DirectionalLight(0xfdf8f2, 1.35);
  key.position.set(-5, 8, 4);
  scene.add(key);

  // A cool fill from behind separates the layer edges from the background.
  const fill = new DirectionalLight(0xaec4e0, 0.34);
  fill.position.set(5, -2, -6);
  scene.add(fill);

  // A low rim from behind and below catches the underside of each plate.
  // Without it the four layers merge into one scattered field of shapes
  // instead of reading as strata with space between them.
  const rim = new DirectionalLight(0xd9c3a0, 0.5);
  rim.position.set(-3, -6, -5);
  scene.add(rim);

  // The drifting accent light. This is what makes the stack feel lit from
  // within rather than from a studio.
  const travel = new PointLight(accent.getHex(), 3.0, 5.4, 2.4);
  travel.position.set(0, -1.2, 0);
  scene.add(travel);

  /* ---- Lattices -------------------------------------------------------- */

  const random = makeRandom(0x5eed);
  const matrix = new Matrix4();
  const disposables: { dispose(): void }[] = [];

  let cellColor = cssColor("--scene-cell", "#5c544c");
  const cellMaterial = new MeshStandardMaterial({
    color: cellColor,
    roughness: 0.78,
    metalness: 0.06,
    /*
     * A very low emissive floor. Measured against the built page, the plates
     * were rendering at a median luminance of 13/255 on an 11.8/255
     * background — a lattice nobody could see, whatever the key light did,
     * because most faces point away from it. This guarantees every face
     * reads as material without making any of them a light source.
     */
    emissive: new Color("#17130f"),
    emissiveIntensity: 1,
  });
  const hotMaterial = new MeshBasicMaterial({
    color: accent,
    toneMapped: false,
    transparent: true,
    opacity: 0.92,
  });
  disposables.push(cellMaterial, hotMaterial);

  /** Cells picked out as lit, kept so they can be animated. */
  const hotCells: { x: number; y: number; z: number; phase: number }[] = [];
  /** Endpoints of the vertical traces between layers. */
  const traces: { x: number; z: number; y0: number; y1: number }[] = [];

  const coldMeshes: InstancedMesh[] = [];
  /** Every lattice mesh with the layer it belongs to, for the entrance. */
  const layerMeshes: { mesh: InstancedMesh; layer: number }[] = [];
  /** Outline frames, one rectangle per layer, in one buffer. */
  const frameSegments: number[] = [];
  /** Each layer's substrate slab. */
  const plates: { half: number; y: number; layer: number }[] = [];
  const shade = new Color();

  for (let li = 0; li < LAYERS.length; li += 1) {
    const layer = LAYERS[li];
    if (!layer) continue;

    const n = Math.max(3, Math.round(layer.n * density));
    const pitch = layer.cell + layer.gap;
    const offset = ((n - 1) * pitch) / 2;

    const geometry = new BoxGeometry(layer.cell, layer.height, layer.cell);
    disposables.push(geometry);

    // Decide which cells are lit before allocating, so the two meshes get
    // exact counts and no instance is left at the origin.
    const lit: boolean[] = [];
    let litCount = 0;
    for (let i = 0; i < n * n; i += 1) {
      /*
       * Lit cells are where the work is, so they belong on the upper layers.
       * The memory lattice is the densest and gets fewer, because a fine grid
       * with many highlights reads as noise. The substrate gets none at all:
       * its cells are the largest in the scene, and a single lit one was a
       * slab of accent the size of the compute die.
       */
      const chance = li === 3 ? 0 : li === 2 ? 0.07 : 0.16;
      const on = random() < chance;
      lit.push(on);
      if (on) litCount += 1;
    }

    const cold = new InstancedMesh(geometry, cellMaterial, n * n - litCount);
    const hot =
      litCount > 0 ? new InstancedMesh(geometry, hotMaterial, litCount) : null;

    let ci = 0;
    let hi = 0;
    for (let ix = 0; ix < n; ix += 1) {
      for (let iz = 0; iz < n; iz += 1) {
        const i = ix * n + iz;
        const x = ix * pitch - offset;
        const z = iz * pitch - offset;

        // A little vertical jitter stops the lattice from reading as a
        // printed grid and gives the key light something to catch.
        const jitter = (random() - 0.5) * layer.height * 0.9;
        const y = layer.y + jitter;

        matrix.makeTranslation(x, y, z);

        if (lit[i] === true && hot) {
          hot.setMatrixAt(hi, matrix);
          hi += 1;
          hotCells.push({ x, y, z, phase: random() * Math.PI * 2 });
        } else {
          cold.setMatrixAt(ci, matrix);
          // A little per-cell value variation. A lattice of identically
          // shaded boxes reads as a printed texture; a few percent of
          // scatter is what makes it read as a surface with parts.
          shade.copy(cellColor).multiplyScalar(0.82 + random() * 0.38);
          cold.setColorAt(ci, shade);
          ci += 1;
        }
      }
    }

    cold.instanceMatrix.needsUpdate = true;
    if (cold.instanceColor) cold.instanceColor.needsUpdate = true;
    cold.frustumCulled = false;
    scene.add(cold);
    coldMeshes.push(cold);
    layerMeshes.push({ mesh: cold, layer: li });

    if (hot) {
      hot.instanceMatrix.needsUpdate = true;
      hot.frustumCulled = false;
      scene.add(hot);
      layerMeshes.push({ mesh: hot, layer: li });
    }

    // The plate's own boundary. Four hairlines at the layer's extent turn a
    // cloud of cells into a die with an edge, which is most of what makes
    // the stack legible as a stack.
    const half = ((n - 1) * pitch + layer.cell) / 2 + layer.gap * 0.7;
    plates.push({ half, y: layer.y - layer.height * 0.5 - 0.03, layer: li });
    const fy = layer.y - layer.height * 0.5;
    const corners: [number, number][] = [
      [-half, -half], [half, -half], [half, half], [-half, half],
    ];
    for (let k = 0; k < 4; k += 1) {
      const a = corners[k];
      const b = corners[(k + 1) % 4];
      if (!a || !b) continue;
      frameSegments.push(a[0], fy, a[1], b[0], fy, b[1]);
    }

    // Traces down to the next layer, from a sample of this layer's cells.
    const next = LAYERS[li + 1];
    if (next) {
      const wanted = Math.round(8 * density);
      for (let t = 0; t < wanted; t += 1) {
        const ix = Math.floor(random() * n);
        const iz = Math.floor(random() * n);
        traces.push({
          x: ix * pitch - offset,
          z: iz * pitch - offset,
          y0: layer.y,
          y1: next.y,
        });
      }
    }
  }

  /* ---- Substrate slabs -------------------------------------------------- */

  /*
   * A thin solid slab under each lattice.
   *
   * Measured on the built page, a layer drawn only as discrete cells sat at a
   * median luminance of 14 against a background of 12 — four clouds of
   * near-invisible boxes. A slab gives the light a continuous surface to fall
   * across, so each layer reads as one object with components standing on it,
   * and the four of them read as a stack. It is also what a die or a board
   * actually looks like, which is the point of the whole scene.
   */
  const plateMaterial = new MeshStandardMaterial({
    color: surface,
    roughness: 0.94,
    metalness: 0.02,
  });
  disposables.push(plateMaterial);
  const plateMeshes: Mesh[] = [];

  for (const plate of plates) {
    const geometry = new BoxGeometry(plate.half * 2, 0.045, plate.half * 2);
    disposables.push(geometry);
    const slab = new Mesh(geometry, plateMaterial);
    slab.position.set(0, plate.y, 0);
    scene.add(slab);
    plateMeshes.push(slab);
    layerMeshes.push({ mesh: slab as unknown as InstancedMesh, layer: plate.layer });
  }

  /* ---- Plate frames ----------------------------------------------------- */

  const frameGeometry = new BufferGeometry();
  frameGeometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(frameSegments), 3),
  );
  const frameMaterial = new LineBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.34,
  });
  const frames = new LineSegments(frameGeometry, frameMaterial);
  frames.frustumCulled = false;
  scene.add(frames);
  disposables.push(frameGeometry, frameMaterial);

  /* ---- Traces ---------------------------------------------------------- */

  const tracePositions = new Float32Array(traces.length * 6);
  for (let i = 0; i < traces.length; i += 1) {
    const t = traces[i];
    if (!t) continue;
    const o = i * 6;
    tracePositions[o] = t.x;
    tracePositions[o + 1] = t.y0;
    tracePositions[o + 2] = t.z;
    tracePositions[o + 3] = t.x;
    tracePositions[o + 4] = t.y1;
    tracePositions[o + 5] = t.z;
  }

  const traceGeometry = new BufferGeometry();
  traceGeometry.setAttribute("position", new BufferAttribute(tracePositions, 3));
  let traceBaseOpacity = 0.42;
  const traceMaterial = new LineBasicMaterial({
    color: accent,
    transparent: true,
    opacity: traceBaseOpacity,
  });
  const traceLines = new LineSegments(traceGeometry, traceMaterial);
  traceLines.frustumCulled = false;
  scene.add(traceLines);
  disposables.push(traceGeometry, traceMaterial);

  /* ---- Packets --------------------------------------------------------- */

  /** One travelling packet per trace, at its own speed and offset. */
  const packets = traces.map((t) => ({
    trace: t,
    offset: random(),
    speed: 0.1 + random() * 0.22,
  }));

  /*
   * A packet is a short bright segment, not a dot.
   *
   * A single point travelling a line reads as a bead on a wire. A segment
   * with length reads as something moving with direction — it is the
   * cheapest way to make the traffic look like traffic, and it costs two
   * vertices instead of one.
   */
  const PACKET_LEN = 0.22;
  const packetPositions = new Float32Array(packets.length * 6);
  const packetGeometry = new BufferGeometry();
  const packetAttribute = new Float32BufferAttribute(packetPositions, 3);
  packetAttribute.setUsage(DynamicDrawUsage);
  packetGeometry.setAttribute("position", packetAttribute);
  const packetMaterial = new LineBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.9,
    blending: AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const packetLines = new LineSegments(packetGeometry, packetMaterial);
  packetLines.frustumCulled = false;
  scene.add(packetLines);
  disposables.push(packetGeometry, packetMaterial);

  /* ---- Ground ---------------------------------------------------------- */

  // A dim plane far below closes the composition, so the lowest layer does
  // not float against nothing.
  const groundGeometry = new PlaneGeometry(40, 40);
  const groundMaterial = new MeshBasicMaterial({
    color: background,
    transparent: true,
    opacity: 0.55,
  });
  const ground = new Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -7.4;
  scene.add(ground);
  disposables.push(groundGeometry, groundMaterial);

  /* ---- Camera and interaction ----------------------------------------- */

  const target = new Vector3(0, -1.5, 0);
  let pointerX = 0;
  let pointerY = 0;
  let smoothX = 0;
  let smoothY = 0;
  let progress = 0;
  let smoothProgress = 0;

  let running = false;
  let frame = 0;
  let last = 0;
  let elapsed = 0;
  /*
   * Entrance. The stack assembles once: the plates settle down into place
   * from above, deepest first, over about a second and a half. It runs on
   * the first frames only and is then finished forever — there is no loop
   * to notice and nothing re-triggers on scroll.
   */
  let intro = 0;

  function render(now: number) {
    if (!running) return;
    frame = requestAnimationFrame(render);

    const dt = last === 0 ? 0.016 : Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;
    if (intro < 1) intro = Math.min(1, intro + dt / 1.5);

    // Critically damped-ish smoothing. Raw pointer values make the camera
    // twitch; this is what makes the parallax feel weighted.
    smoothX += (pointerX - smoothX) * Math.min(1, dt * 2.6);
    smoothY += (pointerY - smoothY) * Math.min(1, dt * 2.6);
    smoothProgress += (progress - smoothProgress) * Math.min(1, dt * 3.2);

    // A slow constant orbit, plus parallax, plus a scroll-linked descent
    // through the stack.
    const angle = 0.62 + elapsed * 0.026 + smoothX * 0.2;
    /*
     * Framing. The widest plate is about 7 units across, so its diagonal is
     * near 10; at a 34-degree vertical field of view that needs roughly 16
     * units of standoff to sit inside the frame with air around it. Closer
     * than that and the stack is cropped into an anonymous field of blocks,
     * which is exactly what it looked like at 11.
     */
    const radius = 19.4 - smoothProgress * 2.6;
    const height = 4.6 - smoothProgress * 6.8 - smoothY * 1.0;

    camera.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius,
    );
    target.y = -2.35 - smoothProgress * 1.5;
    camera.lookAt(target);

    // The accent light sweeps down through the layers and back.
    const sweep = (Math.sin(elapsed * 0.32) + 1) / 2;
    travel.position.set(
      Math.cos(elapsed * 0.45) * 1.9,
      0.35 - sweep * 3.2,
      Math.sin(elapsed * 0.45) * 1.9,
    );
    travel.intensity = 3.0 + Math.sin(elapsed * 1.1) * 1.1;

    // Packets fall along their traces, wrapping back to the top. Each is a
    // head and a tail a fixed distance behind it, clamped so the tail never
    // runs past the start of the trace.
    for (let i = 0; i < packets.length; i += 1) {
      const p = packets[i];
      if (!p) continue;
      p.offset = (p.offset + p.speed * dt) % 1;
      const span = p.trace.y1 - p.trace.y0;
      const head = p.trace.y0 + span * p.offset;
      const tail = p.trace.y0 + span * Math.max(0, p.offset - PACKET_LEN);
      const o = i * 6;
      packetPositions[o] = p.trace.x;
      packetPositions[o + 1] = head;
      packetPositions[o + 2] = p.trace.z;
      packetPositions[o + 3] = p.trace.x;
      packetPositions[o + 4] = tail;
      packetPositions[o + 5] = p.trace.z;
    }
    packetAttribute.needsUpdate = true;

    // The lit cells breathe together but out of phase.
    hotMaterial.opacity = 0.7 + Math.sin(elapsed * 0.9) * 0.22;

    if (intro < 1) {
      // Cubic ease-out, staggered per layer so the stack lands in sequence.
      for (const entry of layerMeshes) {
        const local = Math.max(0, Math.min(1, intro * 1.5 - entry.layer * 0.12));
        const eased = 1 - Math.pow(1 - local, 3);
        entry.mesh.position.y = (1 - eased) * (2.2 + entry.layer * 0.8);
      }
      const fade = Math.min(1, intro * 1.4);
      frameMaterial.opacity = 0.34 * fade;
      traceMaterial.opacity = traceBaseOpacity * fade;
      packetMaterial.opacity = 0.9 * fade;
      hotMaterial.opacity *= fade;
    } else {
      for (const entry of layerMeshes) entry.mesh.position.y = 0;
    }

    renderer.render(scene, camera);
  }

  function resize() {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (!running) renderer.render(scene, camera);
  }

  function refreshTheme() {
    accent = cssColor("--accent", "#e9b872");
    surface = cssColor("--scene-plate", "#2e2a26");
    background = cssColor("--bg-0", "#0b0a09");

    cellColor = cssColor("--scene-cell", "#5c544c");
    cellMaterial.color.copy(cellColor);
    plateMaterial.color.copy(surface);
    hotMaterial.color.copy(accent);
    traceMaterial.color.copy(accent);
    packetMaterial.color.copy(accent);
    groundMaterial.color.copy(background);
    travel.color.copy(accent);
    fog.color.copy(background);

    // In the light theme the lattice must read as dark objects on a bright
    // page, so the ambient term drops and the traces have to work harder.
    const light = document.documentElement.dataset["theme"] === "light";
    // On paper the plates are dark objects lit from outside, so the emissive
    // floor that rescues them on graphite would only make them muddy.
    cellMaterial.emissive.set(light ? "#000000" : "#17130f");
    ambient.intensity = light ? 0.8 : 0.62;
    key.intensity = light ? 1.6 : 1.35;
    traceBaseOpacity = light ? 0.4 : 0.42;
    traceMaterial.opacity = traceBaseOpacity;
    frameMaterial.opacity = light ? 0.42 : 0.34;
    groundMaterial.opacity = light ? 0.8 : 0.55;

    if (!running) renderer.render(scene, camera);
  }

  resize();
  refreshTheme();

  return {
    setPointer(x, y) {
      pointerX = x;
      pointerY = y;
    },
    setProgress(p) {
      progress = Math.max(0, Math.min(1, p));
    },
    refreshTheme,
    resize,
    start() {
      if (running) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(render);
    },
    stop() {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    },
    dispose() {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      for (const mesh of coldMeshes) mesh.dispose();
      scene.traverse((object) => {
        if (object instanceof InstancedMesh) object.dispose();
      });
      for (const d of disposables) d.dispose();
      renderer.dispose();
    },
  };
}
