/**
 * The large technical figure at the head of each case study.
 *
 * This is deliberately NOT the index motif scaled up. The small motif is a
 * signature — something to recognise a project by in a list. This is a
 * drawing of how the thing is actually put together, with the stages named
 * and the one structural idea that makes each project interesting drawn
 * explicitly rather than described:
 *
 *   SwiftKV     the log is written before the reply is sent
 *   CacheLab    the capacity a scheme gains and the speed it buys are separate
 *   ResumeLens  the model sits outside the boundary the score is computed in
 *   SmartLab    the measured floor beneath every model
 *   CampusFlow  one writer holds the row; the rest are refused
 *
 * Every label here is structural or is a figure that already appears in
 * `src/data/projects.ts` for that project. Nothing is invented, and nothing
 * is rounded.
 *
 * Inline SVG on a 760x260 grid, themed through custom properties, `img` role
 * with a written-out alternative. It costs no request and no WebGL context.
 */

interface Props {
  slug: string;
}

/* ---------------------------------------------------------------------- *
 * Shared primitives — so five figures share one drawing language
 * ---------------------------------------------------------------------- */

function Stage({
  x,
  y,
  w,
  h,
  label,
  sub,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  sub?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2} className="cf__panel" />
      <rect x={x} y={y} width={2} height={h} className="cf__panel-tick" />
      {label ? (
        <text x={x} y={y - 9} className="cf__label">
          {label}
        </text>
      ) : null}
      {sub ? (
        <text x={x} y={y + h + 14} className="cf__sub">
          {sub}
        </text>
      ) : null}
    </g>
  );
}

function Flow({ d, accent, dashed }: { d: string; accent?: boolean; dashed?: boolean }) {
  return (
    <path
      d={d}
      className={accent ? "cf__flow cf__flow--accent" : "cf__flow"}
      strokeDasharray={dashed ? "3 3" : undefined}
      markerEnd="url(#cf-arrow)"
    />
  );
}

/** A horizontal run of small cells — the shared unit for arrays and logs. */
function Cells({
  x,
  y,
  n,
  size,
  gap,
  hot = [],
  rows = 1,
}: {
  x: number;
  y: number;
  n: number;
  size: number;
  gap: number;
  hot?: number[];
  rows?: number;
}) {
  const set = new Set(hot);
  return (
    <g>
      {Array.from({ length: n * rows }, (_, i) => (
        <rect
          key={i}
          x={x + (i % n) * (size + gap)}
          y={y + Math.floor(i / n) * (size + gap)}
          width={size}
          height={size}
          className={set.has(i) ? "cf__cell cf__cell--hot" : "cf__cell"}
        />
      ))}
    </g>
  );
}

/* ---------------------------------------------------------------------- *
 * SwiftKV — request, event loop, shard, log, reply
 * ---------------------------------------------------------------------- */

function SwiftKV() {
  const lanes = [74, 96, 118, 140];
  return (
    <>
      <Stage x={24} y={68} w={70} h={78} label="clients" sub="RESP / redis-cli" />
      <Cells x={36} y={80} n={1} size={12} gap={6} rows={4} />

      <Flow d="M 100 107 L 140 107" />
      <Stage x={146} y={84} w={74} h={46} label="acceptor" sub="round-robin" />

      {lanes.map((y, i) => (
        <g key={y}>
          <Flow d={`M 226 107 L 264 ${y + 7}`} />
          <rect x={268} y={y} width={92} height={14} rx={2} className="cf__lane" />
          <text x={274} y={y + 10} className="cf__inline">
            epoll {i}
          </text>
        </g>
      ))}
      <text x={268} y={62} className="cf__label">
        event loops
      </text>
      <text x={268} y={174} className="cf__sub">
        N threads, own epoll set
      </text>

      {lanes.map((y) => (
        <Flow key={`f${y}`} d={`M 366 ${y + 7} L 408 107`} />
      ))}

      <Stage x={414} y={62} w={150} h={90} label="sharded store" sub="64 shards, one mutex each" />
      <Cells x={424} y={72} n={8} size={14} gap={3} rows={4} hot={[2, 11, 19, 28]} />

      {/* The structural point: the log is appended before the reply leaves. */}
      <Flow d="M 489 158 L 489 196" accent />
      <Stage x={414} y={200} w={150} h={30} />
      <Cells x={420} y={207} n={17} size={8} gap={0.6} hot={[14, 15, 16]} />
      <text x={414} y={248} className="cf__sub">
        append-only log — written before the reply
      </text>

      <Flow d="M 570 107 L 614 107" accent />
      <Stage x={620} y={84} w={116} h={46} label="reply" sub="only after the append" />
      <Cells x={630} y={98} n={5} size={11} gap={4} hot={[0, 1]} />
      <path d="M 700 103 L 726 103" className="cf__flow cf__flow--accent" markerEnd="url(#cf-arrow)" />

      <text x={620} y={170} className="cf__note">
        sync=never · everysec
      </text>
      <text x={620} y={184} className="cf__note">
        sync=always — 102× slower
      </text>
    </>
  );
}

/* ---------------------------------------------------------------------- *
 * CacheLab — CPU, cache hierarchy, compressed line, memory
 * ---------------------------------------------------------------------- */

function CacheLab() {
  // Illustrative compaction, not a measured per-line ratio.
  const lines: [number, number][] = [
    [96, 52],
    [96, 74],
    [96, 38],
    [96, 66],
  ];
  return (
    <>
      <Stage x={24} y={78} w={64} h={58} label="cores" sub="2 / 4 / 8" />
      <Cells x={36} y={90} n={2} size={16} gap={6} rows={2} hot={[0]} />

      <Flow d="M 94 107 L 122 107" />
      <Stage x={128} y={86} w={34} h={42} label="L1" />
      <Flow d="M 168 107 L 188 107" />
      <Stage x={194} y={78} w={44} h={58} label="L2" />
      <Flow d="M 244 107 L 264 107" />
      <Stage x={270} y={62} w={62} h={90} label="L3" sub="4 MiB, 16-way, SRAM" />
      <Cells x={278} y={72} n={3} size={14} gap={3} rows={5} hot={[4, 10]} />

      <Flow d="M 338 107 L 372 107" accent />

      {/* The compression step, drawn as what it reclaims. */}
      <text x={380} y={53} className="cf__label">
        line compression
      </text>
      {lines.map(([full, comp], i) => {
        const y = 62 + i * 24;
        return (
          <g key={i}>
            <rect x={380} y={y} width={comp} height={14} rx={1.5}
              className={i === 1 ? "cf__cell cf__cell--hot" : "cf__cell cf__cell--warm"} />
            <rect x={380 + comp} y={y} width={full - comp} height={14} rx={1.5}
              className="cf__reclaimed" />
          </g>
        );
      })}
      <text x={380} y={176} className="cf__sub">
        8 schemes compared
      </text>
      <text x={380} y={188} className="cf__sub">
        reclaimed capacity dashed
      </text>

      <Flow d="M 486 107 L 520 107" />
      <Stage x={526} y={78} w={70} h={58} label="DRAM" />
      <Cells x={534} y={90} n={3} size={14} gap={4} rows={2} />

      {/*
        The finding, as two bars on one baseline: the largest capacity gain in
        the dataset sits next to the IPC it delivered. Both figures are the
        ones already quoted in the project's results.
      */}
      <line x1={632} y1={62} x2={632} y2={196} className="cf__rule" />
      <text x={652} y={70} className="cf__label">
        best in dataset
      </text>
      <rect x={652} y={84} width={84} height={12} className="cf__bar cf__bar--accent" />
      <text x={652} y={110} className="cf__note">
        1.972× capacity
      </text>
      <rect x={652} y={122} width={4} height={12} className="cf__bar" />
      <text x={652} y={148} className="cf__note">
        −0.09% IPC
      </text>
      <text x={652} y={176} className="cf__sub">
        ratio is a poor
      </text>
      <text x={652} y={188} className="cf__sub">
        proxy for speed
      </text>
    </>
  );
}

/* ---------------------------------------------------------------------- *
 * ResumeLens — document, parsing, analysis, authorization, result
 * ---------------------------------------------------------------------- */

function ResumeLens() {
  return (
    <>
      <Stage x={24} y={70} w={62} h={74} label="upload" sub="PDF" />
      {[80, 92, 104, 116, 128].map((y, i) => (
        <rect key={y} x={32} y={y} width={i === 2 ? 30 : 46} height={4} className="cf__cell" />
      ))}

      <Flow d="M 92 107 L 118 107" />
      <Stage x={124} y={78} w={72} h={58} label="validate" sub="MIME · magic · size" />
      <path d="M 136 96 L 148 96 M 136 104 L 160 104 M 136 112 L 152 112" className="cf__hair" />
      <text x={124} y={166} className="cf__note">
        decompressed size first
      </text>

      <Flow d="M 202 107 L 228 107" />
      <Stage x={234} y={70} w={76} h={74} label="parse" sub="structured" />
      <Cells x={244} y={80} n={2} size={22} gap={5} rows={2} hot={[0, 3]} />

      <Flow d="M 316 107 L 342 107" />
      <Stage x={348} y={78} w={78} h={58} label="skills" sub="alias vocabulary" />
      <Cells x={356} y={92} n={4} size={12} gap={4} rows={2} hot={[1, 6]} />

      <Flow d="M 432 107 L 458 107" accent />
      <Stage x={464} y={62} w={104} h={90} label="score" sub="fixed rules + evidence" />
      <Cells x={474} y={74} n={4} size={14} gap={4} rows={3} hot={[0, 5, 9]} />
      <text x={464} y={176} className="cf__note cf__note--accent">
        persisted before any model runs
      </text>

      <Flow d="M 574 107 L 600 107" />
      <Stage x={606} y={78} w={62} h={58} label="read" sub="owner id in WHERE" />
      <Flow d="M 674 107 L 700 107" />
      <Stage x={706} y={86} w={30} h={42} label="result" />

      {/*
        The model is drawn outside the boundary the score is computed in, with
        a one-way dashed arrow. That placement is the project's argument.
      */}
      <rect x={456} y={196} width={280} height={44} rx={3} className="cf__outside" />
      <text x={466} y={214} className="cf__label">
        LLM — optional
      </text>
      <text x={466} y={230} className="cf__sub">
        writes commentary · cannot change the score
      </text>
      <Flow d="M 516 158 L 516 192" dashed />
    </>
  );
}

/* ---------------------------------------------------------------------- *
 * SmartLab — dataset, features, model, evaluation
 * ---------------------------------------------------------------------- */

function SmartLab() {
  const curve = Array.from({ length: 22 }, (_, i) => {
    const t = i / 21;
    return [548 + t * 166, 72 + 62 * Math.exp(-3.0 * t)] as [number, number];
  });
  const path = curve
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  return (
    <>
      <Stage x={24} y={68} w={82} h={78} label="dataset" sub="241,600 configs" />
      <Cells x={34} y={80} n={4} size={13} gap={3} rows={4} hot={[5]} />
      <text x={24} y={176} className="cf__note">
        4 repeats each → a floor
      </text>

      <Flow d="M 112 107 L 140 107" />

      {/* 14 raw parameters widened to 40 derived features. */}
      <text x={146} y={62} className="cf__label">
        features
      </text>
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={146} y={70 + i * 11} width={26 + i * 6} height={7} className="cf__cell" />
      ))}
      <text x={146} y={168} className="cf__sub">
        14 raw → 40
      </text>

      <Flow d="M 224 107 L 252 107" />

      {/* Five candidates; one deployed, one rejected on artifact size. */}
      <text x={258} y={62} className="cf__label">
        candidates
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={258} y={70 + i * 18} width={96} height={13} rx={2}
            className={i === 3 ? "cf__cell cf__cell--hot" : "cf__cell"} />
          {i === 1 ? (
            <line x1={258} y1={95} x2={354} y2={82} className="cf__strike" />
          ) : null}
        </g>
      ))}
      <text x={258} y={176} className="cf__note">
        rejected: 184 MB, over budget
      </text>
      <text x={258} y={190} className="cf__note cf__note--accent">
        deployed: 9.1 MB
      </text>

      <Flow d="M 360 107 L 388 107" />
      <Stage x={394} y={78} w={74} h={58} label="tuning" sub="3-fold CV" />
      <Cells x={404} y={92} n={4} size={12} gap={3} rows={2} hot={[2]} />

      <Flow d="M 474 107 L 500 107" accent />

      {/* Evaluation: the model, and the measured floor it sits above. */}
      <text x={532} y={54} className="cf__label">
        evaluation
      </text>
      <path d="M 540 60 L 540 150 L 726 150" className="cf__axis" />
      {curve.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y + (((i * 37) % 11) - 5) * 0.9} r={1.6} className="cf__dot" />
      ))}
      <path d={path} className="cf__flow cf__flow--accent" />
      <line x1={540} y1={138} x2={726} y2={138} className="cf__floor" />
      <text x={546} y={134} className="cf__note cf__note--measured">
        measured noise floor
      </text>
      <path d="M 694 82 L 694 136" className="cf__gap" />
      <text x={588} y={172} className="cf__sub">
        3.8× above the floor
      </text>
    </>
  );
}

/* ---------------------------------------------------------------------- *
 * CampusFlow — request, authorization, transaction, lock, database, reply
 * ---------------------------------------------------------------------- */

function CampusFlow() {
  const reqs = [66, 88, 110, 132, 154];
  return (
    <>
      <text x={24} y={47} className="cf__label">
        requests
      </text>
      {reqs.map((y) => (
        <g key={y}>
          <rect x={24} y={y - 6} width={14} height={12} rx={1.5} className="cf__cell" />
          <path d={`M 42 ${y} L 78 ${y}`} className="cf__hair" />
        </g>
      ))}

      <Stage x={84} y={56} w={74} h={108} label="authz" sub="matrix + scope" />
      <path d="M 96 84 L 146 84" className="cf__hair" />
      <text x={96} y={104} className="cf__inline">
        role?
      </text>
      <path d="M 96 116 L 146 116" className="cf__hair" />
      <text x={96} y={136} className="cf__inline">
        this record?
      </text>

      {reqs.map((y) => (
        <Flow key={`a${y}`} d={`M 164 ${y} L 196 110`} />
      ))}

      {/* One transaction envelope; one writer holds the row. */}
      <rect x={202} y={44} width={216} height={168} rx={3} className="cf__envelope" />
      <text x={212} y={62} className="cf__label">
        transaction
      </text>

      <Stage x={216} y={74} w={86} h={46} label="" sub="" />
      <text x={224} y={94} className="cf__inline">
        SELECT …
      </text>
      <text x={224} y={108} className="cf__inline cf__inline--accent">
        FOR UPDATE
      </text>

      <Flow d="M 308 97 L 330 97" accent />
      <Stage x={336} y={74} w={70} h={46} label="" sub="" />
      <text x={344} y={94} className="cf__inline">
        capacity
      </text>
      <text x={344} y={108} className="cf__inline">
        check
      </text>

      {/* Admitted versus refused. */}
      <path d="M 260 126 L 260 168" className="cf__flow cf__flow--accent" markerEnd="url(#cf-arrow)" />
      <text x={214} y={186} className="cf__note cf__note--accent">
        1 writer holds the row
      </text>
      <text x={214} y={200} className="cf__note">
        the rest wait, then 409
      </text>

      <Flow d="M 424 110 L 452 110" />
      <Stage x={458} y={56} w={104} h={108} label="PostgreSQL" sub="triggers · constraints" />
      <Cells x={468} y={70} n={4} size={15} gap={4} rows={3} hot={[1, 6]} />
      <text x={458} y={190} className="cf__note">
        invariants in the database
      </text>

      <Flow d="M 568 110 L 596 110" />
      <Stage x={602} y={72} w={82} h={44} label="outbox" sub="SKIP LOCKED" />
      <Cells x={610} y={84} n={6} size={9} gap={2} hot={[0, 1]} />

      <Stage x={694} y={132} w={42} h={34} />
      <text x={694} y={126} className="cf__label">
        workers
      </text>
      <Cells x={700} y={142} n={3} size={9} gap={3} hot={[0]} />
      <Flow d="M 643 120 L 643 149 L 688 149" />
    </>
  );
}

/*
 * Each figure declares its own height. A single shared viewBox left the
 * shorter diagrams floating in a large void at the bottom of the panel,
 * which read as an unfinished drawing rather than as breathing room.
 */
const HEIGHT: Record<string, number> = {
  swiftkv: 256,
  cachelab: 204,
  resumelens: 250,
  smartlab: 200,
  campusflow: 218,
};

/*
 * The caption describes THIS drawing.
 *
 * It was briefly derived from `project.detail.stages`, which is the data
 * pipeline — correct for the Architecture diagram below, and wrong here:
 * CacheLab's figure draws the memory hierarchy, so the page claimed to show
 * "gem5 tree → export → parse" above a picture of caches.
 */
const CAPTION: Record<string, string> = {
  swiftkv: "request → acceptor → event loop → shard → append-only log → reply",
  cachelab: "cores → L1 → L2 → L3 compression → DRAM",
  resumelens: "document → validate → parse → skills → score → authorized read",
  smartlab: "dataset → features → candidates → tuning → evaluation",
  campusflow: "request → authorization → transaction → row lock → database → outbox",
};

const FIGURES: Record<string, () => JSX.Element> = {
  swiftkv: SwiftKV,
  cachelab: CacheLab,
  resumelens: ResumeLens,
  smartlab: SmartLab,
  campusflow: CampusFlow,
};

/** Written alternatives, so the figure is not lost to a screen reader. */
const ALT: Record<string, string> = {
  swiftkv:
    "Clients speaking RESP reach an acceptor, which hands connections round-robin to N epoll event loops. Those execute against a store of 64 independently locked shards. Every write is appended to the log before the reply is sent; the log offers three sync policies, of which sync=always is 102 times slower.",
  cachelab:
    "Cores at 2, 4 and 8 counts run through L1 and L2 into a 4 MiB 16-way SRAM L3, where 8 compression schemes compact cache lines and reclaim capacity, then out to DRAM. The largest capacity gain in the dataset, 1.972 times, delivered minus 0.09 percent IPC — compression ratio is a poor proxy for speed.",
  resumelens:
    "A PDF upload is validated on MIME type, magic bytes and size, with decompressed size checked before parsing. It is parsed to structured data, skills are normalised against an alias vocabulary, and a deterministic scorer emits evidence for every point. The score is persisted before any model runs. Reads carry the owner id in the WHERE clause. The optional LLM sits outside that boundary and can only write commentary.",
  smartlab:
    "241,600 measured configurations, each repeated four times, establish a noise floor. 14 raw parameters are expanded to 40 features, five candidates are trained, one is rejected at 184 MB for exceeding the artifact budget, and the deployed 9.1 MB model is tuned with 3-fold cross-validation. Evaluation shows the model sitting 3.8 times above the measured floor.",
  campusflow:
    "Concurrent requests pass a two-stage authorization check — first the role, then this specific record. Inside one transaction, SELECT FOR UPDATE takes the course row and the capacity check runs; one writer holds the row and the rest wait and then receive 409. Invariants live in PostgreSQL as triggers and constraints. Background work is claimed from an outbox with SKIP LOCKED by several workers.",
};

export function CaseFigure({ slug }: Props) {
  const Figure = FIGURES[slug];
  if (!Figure) return null;

  const height = HEIGHT[slug] ?? 250;

  return (
    <figure className="casefig">
      <svg viewBox={`0 0 760 ${height}`} role="img" aria-label={ALT[slug] ?? ""}>
        <defs>
          <marker
            id="cf-arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 z" className="cf__arrowhead" />
          </marker>
        </defs>
        <Figure />
      </svg>
      <figcaption className="casefig__caption">{CAPTION[slug] ?? ""}</figcaption>
    </figure>
  );
}
