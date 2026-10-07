import type { Project } from "../data/projects";
import { chartCopy, modelCandidates, swiftScaling } from "../data/evidenceCharts";
import { Tag } from "./Tag";

export function EvidenceChart({ project }: { project: Project }) {
  if (project.slug === "smartlab") return (
    <figure className="evidence-chart">
      <div className="evidence-chart__head"><h3>{chartCopy.smartlab.title}</h3><Tag evidence="Measured" /></div>
      <p>{chartCopy.smartlab.description}</p>
      <div className="evidence-chart__table-wrap"><table><caption>{chartCopy.smartlab.source}</caption><thead><tr><th scope="col">Candidate</th><th scope="col">MAE(log)</th><th scope="col">Artifact</th><th scope="col">Budget</th></tr></thead><tbody>{modelCandidates.map(row => <tr key={row.name}><th scope="row">{row.name}</th><td>{row.error.toFixed(4)}</td><td>{row.artifact < 0.01 ? "<0.01" : row.artifact.toFixed(1)} MB</td><td>{row.rejected ? "Over budget" : "Within budget"}</td></tr>)}</tbody></table></div>
    </figure>
  );
  if (project.slug === "swiftkv") {
    const max = Math.max(...swiftScaling.map(row => row.throughput));
    return <figure className="evidence-chart">
      <div className="evidence-chart__head"><h3>{chartCopy.swiftkv.title}</h3><Tag evidence="Measured" /></div>
      <p>{chartCopy.swiftkv.description}</p>
      <ol className="evidence-chart__bars" aria-label="Throughput per event-loop count">{swiftScaling.map(row => <li key={row.loops}><span>{row.loops} loops</span><span className="evidence-chart__track" aria-hidden="true"><i style={{ width: `${row.throughput / max * 100}%` }} /></span><strong>{Math.round(row.throughput).toLocaleString("en-IN")} <small>ops/s</small></strong><span className="evidence-chart__iqr">IQR {Math.round(row.iqr).toLocaleString("en-IN")}</span></li>)}</ol>
      <figcaption>{chartCopy.swiftkv.source}</figcaption>
    </figure>;
  }
  return null;
}
