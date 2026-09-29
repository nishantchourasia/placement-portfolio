import type { Evidence } from "../data/projects";

const CLASS: Record<Evidence, string> = {
  Measured: "tag tag--measured",
  Simulated: "tag tag--simulated",
  Predicted: "tag tag--simulated",
  "Not yet measured": "tag tag--pending",
};

const TITLE: Record<Evidence, string> = {
  Measured: "Produced by a real run on real hardware; raw output is committed in the repository.",
  Simulated: "Produced by gem5 — real output, but of a model rather than silicon.",
  Predicted: "Output of a machine-learning model, never presented as a measurement.",
  "Not yet measured": "The test exists or is planned, but has not been run.",
};

/**
 * The evidence label attached to every figure on this site. The repository
 * labels its own numbers this way, and reproducing that here is the difference
 * between quoting results and asserting them.
 *
 * The three labels are separated by hue, by the dot before them, and by the
 * border style — "Not yet measured" is dashed and unhued, because it marks the
 * absence of a result rather than a third kind of result. Colour is therefore
 * never the only thing carrying the distinction.
 */
export function Tag({ evidence }: { evidence: Evidence }) {
  return (
    <span className={CLASS[evidence]} title={TITLE[evidence]}>
      {evidence}
    </span>
  );
}

export function Chips({ items, label }: { items: string[]; label: string }) {
  return (
    <ul className="chips" aria-label={label}>
      {items.map((item) => (
        <li key={item} className="chip">
          {item}
        </li>
      ))}
    </ul>
  );
}
