import type { Stage } from "../data/projects";

const BOX_W = 168;
const BOX_H = 56;
const GAP = 30;
const PAD = 2;

/**
 * A pipeline diagram, drawn as inline SVG from the project's stage list.
 *
 * Inline SVG rather than an image file: it costs no extra request, scales
 * without artefacts, inherits the theme's colours through CSS custom
 * properties (so it is correct in dark mode for free), and carries a real text
 * alternative for screen readers. A PNG would fail all four.
 */
export function Diagram({ stages, caption }: { stages: Stage[]; caption: string }) {
  const width = stages.length * BOX_W + (stages.length - 1) * GAP + PAD * 2;
  const height = BOX_H + PAD * 2;
  const description = stages
    .map((stage) => (stage.sub ? `${stage.label} (${stage.sub})` : stage.label))
    .join(" → ");

  return (
    <figure className="diagram">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${caption}: ${description}`}
      >
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 z" className="diagram__arrowhead" />
          </marker>
        </defs>

        {stages.map((stage, index) => {
          const x = PAD + index * (BOX_W + GAP);
          const centre = x + BOX_W / 2;
          return (
            <g key={stage.label}>
              <rect
                x={x}
                y={PAD}
                width={BOX_W}
                height={BOX_H}
                rx="3"
                className="diagram__box"
              />
              <text
                x={centre}
                y={stage.sub ? PAD + 24 : PAD + 32}
                textAnchor="middle"
                className="diagram__label"
              >
                {stage.label}
              </text>
              {stage.sub ? (
                <text
                  x={centre}
                  y={PAD + 40}
                  textAnchor="middle"
                  className="diagram__sub"
                >
                  {stage.sub}
                </text>
              ) : null}
              {index < stages.length - 1 ? (
                <line
                  x1={x + BOX_W + 5}
                  y1={PAD + BOX_H / 2}
                  x2={x + BOX_W + GAP - 7}
                  y2={PAD + BOX_H / 2}
                  className="diagram__arrow"
                  markerEnd="url(#arrowhead)"
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      <figcaption className="metric__label" style={{ marginTop: "0.75rem" }}>
        {caption}
      </figcaption>
    </figure>
  );
}
