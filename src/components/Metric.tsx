import type { Metric as MetricData } from "../data/projects";
import { Tag } from "./Tag";

export function Metric({ metric }: { metric: MetricData }) {
  return (
    <div className="metric">
      <div className="metric__head">
        <span className="metric__value">{metric.value}</span>
        <Tag evidence={metric.evidence} />
      </div>
      <span className="metric__label">{metric.label}</span>
      {metric.note ? <span className="metric__note">{metric.note}</span> : null}
    </div>
  );
}

export function MetricList({ metrics, label }: { metrics: MetricData[]; label: string }) {
  return (
    <ul className="results" aria-label={label}>
      {metrics.map((metric) => (
        <li key={metric.label}>
          <Metric metric={metric} />
        </li>
      ))}
    </ul>
  );
}
