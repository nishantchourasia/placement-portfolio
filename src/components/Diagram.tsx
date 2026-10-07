import type { Stage } from "../data/projects";

/** Text-first architecture nodes reflow instead of shrinking SVG labels. */
export function Diagram({ stages, caption }: { stages: Stage[]; caption: string }) {
  return (
    <figure className="diagram pipeline">
      <ol className="pipeline__nodes" aria-label={caption}>
        {stages.map((stage, index) => (
          <li className="pipeline__node" key={stage.label} style={{ "--node-index": index } as React.CSSProperties}>
            <span className="pipeline__ordinal" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <span className="pipeline__label">{stage.label}</span>
            {stage.sub ? <span className="pipeline__sub">{stage.sub}</span> : null}
          </li>
        ))}
      </ol>
      <figcaption className="diagram__caption">{caption}</figcaption>
    </figure>
  );
}
