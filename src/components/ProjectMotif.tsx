/**
 * One procedural figure per project.
 *
 * Each draws the thing the project is actually about — shard lanes and an
 * append-only log for SwiftKV, compacted cache lines for CacheLab, a measured
 * noise floor for SmartLab — rather than a generic shape tinted five ways.
 * A reader who knows the domain should recognise the figure before reading
 * the title; a reader who does not loses nothing, because every fact is in
 * the text beside it.
 *
 * They are `aria-hidden` and carry no information of their own. They are
 * inline SVG on a 160x100 grid, inherit the theme through CSS custom
 * properties, cost no request, and animate only while their row is hovered,
 * focused or freshly revealed — see the `.motif__*` rules in global.css.
 *
 * Five WebGL canvases on one page was the alternative. It would have been
 * slower, louder, and no more legible.
 */

import type { CSSProperties } from "react";

const W = 160;
const H = 100;

interface MotifProps {
  slug: string;
  /**
   * Light the figure unconditionally. On the index the row's hover and reveal
   * states drive this; on a case-study page there is no row, so the figure is
   * simply shown in its resolved state.
   */
  active?: boolean;
}

/** A packet that travels a path. Degrades to a static dot without offset-path. */
function Packet({ d, index }: { d: string; index: number }) {
  return (
    <circle
      r={2.1}
      className="motif__accent motif__pulse"
      style={{ offsetPath: `path("${d}")`, animationDelay: `${index * 0.42}s` }}
    />
  );
}

/* ---------------------------------------------------------------------- *
 * SwiftKV — event loops, sharded store, append-only log
 * ---------------------------------------------------------------------- */

function SwiftKV() {
  const lanes = [22, 33, 44, 55, 66];
  const shardCols = 8;
  const shardRows = 4;
  // The lit shards are fixed rather than random: the figure should be the
  // same drawing every time it is seen.
  const hot = new Set([3, 9, 14, 22, 27]);

  return (
    <>
      {/* Clients arriving on the left */}
      {lanes.map((y, i) => (
        <g key={`lane-${y}`}>
          <rect x={6} y={y - 3} width={6} height={6} className="motif__fill" />
          <path
            d={`M 14 ${y} L 54 ${y}`}
            className={i % 2 === 0 ? "motif__line" : "motif__line motif__line--faint"}
          />
        </g>
      ))}

      {/* The acceptor fans connections into the shard array */}
      <path d="M 54 22 L 62 44 M 54 33 L 62 44 M 54 44 L 62 44 M 54 55 L 62 44 M 54 66 L 62 44"
        className="motif__line motif__line--faint" />

      {/* Sharded store: 8 x 4 independently locked cells */}
      {Array.from({ length: shardCols * shardRows }, (_, i) => {
        const cx = 70 + (i % shardCols) * 10;
        const cy = 26 + Math.floor(i / shardCols) * 10;
        return (
          <rect
            key={`shard-${i}`}
            x={cx}
            y={cy}
            width={7.5}
            height={7.5}
            className={`motif__cell ${hot.has(i) ? "motif__cell--hot" : ""}`}
          />
        );
      })}

      {/* Append-only log beneath the store */}
      <path d="M 70 80 L 150 80" className="motif__line" />
      {Array.from({ length: 11 }, (_, i) => (
        <rect
          key={`log-${i}`}
          x={70 + i * 7.3}
          y={76}
          width={5}
          height={8}
          className={i < 8 ? "motif__fill--faint" : "motif__fill"}
        />
      ))}
      <path d="M 62 44 L 62 80 L 70 80" className="motif__accent-line" />

      <Packet d="M 14 22 L 54 22 L 62 44 L 70 44" index={0} />
      <Packet d="M 14 55 L 54 55 L 62 44 L 70 36" index={1} />
      <Packet d="M 62 44 L 62 80 L 140 80" index={2} />

      <text x={6} y={92} className="motif__label">64 shards</text>
      <text x={104} y={95} className="motif__label">aof</text>
    </>
  );
}

/* ---------------------------------------------------------------------- *
 * CacheLab — cache lines before and after compression
 * ---------------------------------------------------------------------- */

function CacheLab() {
  // Widths are illustrative of compaction, not of any measured ratio.
  const uncompressed = [30, 30, 30, 30];
  const compressed = [17, 22, 13, 26];

  return (
    <>
      <text x={8} y={16} className="motif__label">uncompressed</text>
      {uncompressed.map((w, i) => (
        <rect
          key={`u-${i}`}
          x={8 + i * 34}
          y={22}
          width={w}
          height={13}
          className="motif__fill--faint"
        />
      ))}
      {uncompressed.map((w, i) => (
        <rect
          key={`ub-${i}`}
          x={8 + i * 34}
          y={22}
          width={w}
          height={13}
          className="motif__line"
          fill="none"
        />
      ))}

      {/* The compression step */}
      <path d="M 78 40 L 78 52" className="motif__accent-line" />
      <path d="M 74 48 L 78 52 L 82 48" className="motif__accent-line" />

      <text x={8} y={68} className="motif__label">compressed</text>
      {compressed.map((w, i) => {
        const x = 8 + i * 34;
        return (
          <g key={`c-${i}`}>
            <rect
              x={x}
              y={74}
              width={w}
              height={13}
              className={`motif__cell ${i === 1 ? "motif__cell--hot" : "motif__cell--warm"}`}
            />
            {/* Reclaimed capacity, drawn as the space it frees */}
            <rect
              x={x + w}
              y={74}
              width={30 - w}
              height={13}
              className="motif__line--faint"
              fill="none"
              stroke="currentColor"
              strokeDasharray="2 2"
              strokeWidth={0.75}
              style={{ color: "var(--rule-strong)" }}
            />
          </g>
        );
      })}

      <path
        d="M 8 94 L 152 94"
        className="motif__accent-line motif__draw"
        style={{ "--len": "150" } as CSSProperties}
      />
    </>
  );
}

/* ---------------------------------------------------------------------- *
 * ResumeLens — document structure matched against a specification
 * ---------------------------------------------------------------------- */

function ResumeLens() {
  const rows = [26, 38, 50, 62, 74];
  // Which resume rows match which spec rows. Two of five, deliberately: the
  // figure should not imply a perfect match.
  const matches: [number, number][] = [
    [0, 1],
    [2, 0],
    [3, 3],
  ];

  return (
    <>
      {/* Resume, left */}
      <rect x={8} y={16} width={44} height={70} className="motif__line" fill="none" />
      {rows.map((y, i) => (
        <rect
          key={`l-${y}`}
          x={14}
          y={y - 2}
          width={i === 1 ? 24 : 32}
          height={4}
          className="motif__fill--faint"
        />
      ))}
      <text x={8} y={94} className="motif__label">resume</text>

      {/* Specification, right */}
      <rect x={108} y={16} width={44} height={70} className="motif__line" fill="none" />
      {rows.map((y, i) => (
        <rect
          key={`r-${y}`}
          x={114}
          y={y - 2}
          width={i === 3 ? 22 : 32}
          height={4}
          className="motif__fill--faint"
        />
      ))}
      <text x={120} y={94} className="motif__label">role</text>

      {/* Deterministic matcher between them */}
      <rect x={68} y={40} width={24} height={22} className="motif__line" fill="none" />
      <path d="M 74 51 L 80 57 L 88 45" className="motif__accent-line motif__draw"
        style={{ "--len": "24" } as CSSProperties} />

      {matches.map(([from], i) => {
        const y0 = rows[from] ?? 26;
        return (
          <path
            key={`m-${i}`}
            d={`M 52 ${y0} C 62 ${y0}, 58 51, 68 51`}
            className="motif__line--faint"
            fill="none"
            stroke="currentColor"
            strokeWidth={0.75}
            style={{ color: "var(--rule-strong)" }}
          />
        );
      })}
      {matches.map(([, to], i) => {
        const y1 = rows[to] ?? 26;
        return (
          <path
            key={`m2-${i}`}
            d={`M 92 51 C 102 51, 98 ${y1}, 108 ${y1}`}
            className="motif__line--faint"
            fill="none"
            stroke="currentColor"
            strokeWidth={0.75}
            style={{ color: "var(--rule-strong)" }}
          />
        );
      })}

      <Packet d="M 52 26 C 62 26, 58 51, 68 51" index={0} />
      <Packet d="M 92 51 C 102 51, 98 62, 108 62" index={1} />
    </>
  );
}

/* ---------------------------------------------------------------------- *
 * SmartLab — a model, and the measured floor it cannot go below
 * ---------------------------------------------------------------------- */

function SmartLab() {
  const random = (() => {
    let s = 0x51ab;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  })();

  // A learning curve that flattens — the shape the project actually measured.
  const curve: [number, number][] = Array.from({ length: 24 }, (_, i) => {
    const t = i / 23;
    const x = 14 + t * 134;
    const y = 30 + 44 * Math.exp(-3.1 * t);
    return [x, y];
  });
  const path = curve
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  return (
    <>
      {/* Axes */}
      <path d="M 14 12 L 14 82 L 152 82" className="motif__line" />

      {/* Scattered measurements around the curve */}
      {curve.map(([x, y], i) => (
        <circle
          key={`p-${i}`}
          cx={x}
          cy={y + (random() - 0.5) * 7}
          r={1.5}
          className="motif__fill--faint"
        />
      ))}

      {/* The model */}
      <path
        d={path}
        className="motif__accent-line motif__draw"
        style={{ "--len": "190" } as CSSProperties}
      />

      {/* The measured noise floor: no model can go below it */}
      <path
        d="M 14 74 L 152 74"
        stroke="currentColor"
        strokeDasharray="3 3"
        strokeWidth={0.9}
        fill="none"
        style={{ color: "var(--ev-measured)" }}
      />
      <text x={18} y={71} className="motif__label" style={{ fill: "var(--ev-measured)" }}>
        noise floor
      </text>

      {/* The gap between the two is the project's headline finding */}
      <path d="M 132 30 L 132 74" className="motif__line--faint" />
      <path d="M 129 33 L 132 30 L 135 33" className="motif__line--faint" />
      <path d="M 129 71 L 132 74 L 135 71" className="motif__line--faint" />

      <text x={16} y={94} className="motif__label">training set size</text>
    </>
  );
}

/* ---------------------------------------------------------------------- *
 * CampusFlow — concurrent requests arbitrated by a row lock
 * ---------------------------------------------------------------------- */

function CampusFlow() {
  const lanes = [20, 32, 44, 56, 68];
  // Two admitted, three refused: the shape of the capacity test, not its
  // numbers (those are in the metrics beside this figure).
  const admitted = new Set([1, 3]);

  return (
    <>
      {lanes.map((y) => (
        <g key={`req-${y}`}>
          <rect x={6} y={y - 3.5} width={7} height={7} className="motif__fill--faint" />
          <path d={`M 15 ${y} L 58 ${y}`} className="motif__line--faint" />
        </g>
      ))}

      {/* FOR UPDATE on the course row — one at a time through the gate */}
      <path d="M 62 10 L 62 78" className="motif__accent-line" />
      <path d="M 70 10 L 70 78" className="motif__accent-line" />
      <rect x={62} y={38} width={8} height={12} className="motif__accent" />
      <text x={56} y={92} className="motif__label">for update</text>

      {lanes.map((y, i) =>
        admitted.has(i) ? (
          <path
            key={`ok-${y}`}
            d={`M 70 ${y} L 96 ${y} L 112 ${34 + i * 6}`}
            className="motif__accent-line"
          />
        ) : (
          <path
            key={`no-${y}`}
            d={`M 58 ${y} L 50 ${y + (i < 2 ? -8 : 8)}`}
            className="motif__line--faint"
          />
        ),
      )}

      {/* Seats taken */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect
          key={`seat-${i}`}
          x={116 + (i % 3) * 12}
          y={30 + Math.floor(i / 3) * 12}
          width={9}
          height={9}
          className={`motif__cell ${i < 2 ? "motif__cell--hot" : ""}`}
        />
      ))}
      <text x={116} y={62} className="motif__label">seats</text>

      {/* Transactional outbox, drained by workers */}
      <path d="M 6 84 L 152 84" className="motif__line--faint" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect
          key={`job-${i}`}
          x={90 + i * 7}
          y={80}
          width={5}
          height={8}
          className={i < 3 ? "motif__fill" : "motif__fill--faint"}
        />
      ))}

      <Packet d="M 15 32 L 58 32 L 70 32 L 96 32 L 112 40" index={0} />
      <Packet d="M 15 56 L 58 56 L 70 56 L 96 56 L 112 52" index={1} />
    </>
  );
}

const MOTIFS: Record<string, () => JSX.Element> = {
  swiftkv: SwiftKV,
  cachelab: CacheLab,
  resumelens: ResumeLens,
  smartlab: SmartLab,
  campusflow: CampusFlow,
};

export function ProjectMotif({ slug, active }: MotifProps) {
  const Figure = MOTIFS[slug];
  if (!Figure) return null;

  return (
    <svg
      className="motif"
      data-active={active ? "true" : undefined}
      viewBox={`0 0 ${W} ${H}`}
      role="presentation"
      focusable="false"
      aria-hidden="true"
    >
      <Figure />
    </svg>
  );
}
