/**
 * The hero composition without WebGL.
 *
 * This is not a placeholder or a blurred screenshot. It is the same idea —
 * four stacked lattices with traces running between them — drawn as an
 * isometric line figure, which is arguably the more honest register for it:
 * an architectural drawing of a system rather than a render of one.
 *
 * It ships in the main bundle at a few kB of markup, is what every visitor
 * sees first, and is the whole hero for anyone who prefers reduced motion,
 * is on a phone, has Save-Data on, or has no WebGL. Because it inherits the
 * theme's custom properties it is correct in both themes for free.
 */

/** Isometric projection: world (x, y, z) to 2-D, y positive upwards. */
function iso(x: number, y: number, z: number): [number, number] {
  const COS = 0.866; // cos 30°
  const SIN = 0.5; // sin 30°
  return [(x - z) * COS, (x + z) * SIN - y];
}

function point(x: number, y: number, z: number): string {
  const [px, py] = iso(x, y, z);
  return `${px.toFixed(2)},${py.toFixed(2)}`;
}

/** Deterministic, so the figure is identical on every render and every load. */
function makeRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface Plate {
  /** Half-extent in world units. */
  half: number;
  y: number;
  /** Lattice divisions per side. */
  div: number;
  label: string;
}

const PLATES: Plate[] = [
  { half: 26, y: 62, div: 4, label: "compute" },
  { half: 34, y: 28, div: 6, label: "data" },
  { half: 42, y: -6, div: 9, label: "memory" },
  { half: 50, y: -40, div: 3, label: "substrate" },
];

export function HeroFallback() {
  const random = makeRandom(0x5eed);

  return (
    <svg
      className="hero__figure"
      viewBox="-150 -120 300 260"
      role="presentation"
      focusable="false"
    >
      {PLATES.map((plate, index) => {
        const { half, y, div } = plate;
        const step = (half * 2) / div;

        // Plate outline.
        const outline = [
          point(-half, y, -half),
          point(half, y, -half),
          point(half, y, half),
          point(-half, y, half),
        ].join(" ");

        // Lattice, drawn as two families of parallel lines rather than as
        // div² rectangles — same figure, a fraction of the nodes.
        const lines: string[] = [];
        for (let i = 1; i < div; i += 1) {
          const t = -half + i * step;
          lines.push(`M ${point(t, y, -half)} L ${point(t, y, half)}`);
          lines.push(`M ${point(-half, y, t)} L ${point(half, y, t)}`);
        }

        // A few filled cells per plate, denser where the lattice is finer.
        const cells: string[] = [];
        const wanted = index === 2 ? 5 : 3;
        for (let c = 0; c < wanted; c += 1) {
          const ix = Math.floor(random() * div);
          const iz = Math.floor(random() * div);
          const x0 = -half + ix * step;
          const z0 = -half + iz * step;
          cells.push(
            [
              point(x0, y, z0),
              point(x0 + step, y, z0),
              point(x0 + step, y, z0 + step),
              point(x0, y, z0 + step),
            ].join(" "),
          );
        }

        return (
          <g key={plate.label}>
            <polygon points={outline} className="hero__plate" />
            <path d={lines.join(" ")} className="hero__lattice" />
            {cells.map((points, ci) => (
              <polygon
                key={ci}
                points={points}
                className={ci === 0 ? "hero__cell--lit" : "hero__cell"}
              />
            ))}
            <polygon points={outline} className="hero__plate-edge" />
          </g>
        );
      })}

      {/* Vertical traces between consecutive plates. */}
      {PLATES.slice(0, -1).map((plate, index) => {
        const next = PLATES[index + 1];
        if (!next) return null;
        const segments: string[] = [];
        for (let t = 0; t < 4; t += 1) {
          const x = (random() - 0.5) * plate.half * 1.5;
          const z = (random() - 0.5) * plate.half * 1.5;
          segments.push(
            `M ${point(x, plate.y, z)} L ${point(x, next.y, z)}`,
          );
        }
        return (
          <path
            key={`trace-${plate.label}`}
            d={segments.join(" ")}
            className="hero__trace"
          />
        );
      })}
    </svg>
  );
}
