import { useState } from "react";
import type { Project } from "../data/projects";
import { mechanismVisuals } from "../data/caseStudies";
import { Tag } from "./Tag";

function MechanismVisual({ slug, step }: { slug: string; step: number }) {
  const visual = mechanismVisuals[slug]!;
  if (slug === "swiftkv") return (
    <div className="lab__server" aria-hidden="true">
      <div className="lab__terminal"><span>{visual.labels[0]}</span><code>{visual.command}</code><code className={step === 3 ? "lab__accent" : ""}>{visual.labels[step === 3 ? 2 : 1]}</code></div>
      <div><p className="lab__micro">{visual.labels[3]}</p><div className="lab__shards">{Array.from({ length: visual.shardCount! }, (_, i) => <span key={i} className={step >= 2 && i === 27 ? "is-hot" : ""} />)}</div></div>
    </div>
  );
  if (slug === "cachelab") return (
    <div className="lab__comparisons">
      <p className="lab__micro">{visual.labels[0]}</p>
      {visual.rows!.map((row, i) => <div key={row.label} className={`lab__comparison ${step === i ? "is-selected" : ""}`}>
        <span>{row.label}</span><div className="lab__bar" aria-hidden="true"><i style={{ width: `${row.ratio / 2 * 100}%` }} /></div><strong>{row.ratio.toFixed(3)}×</strong><span>{row.ipc} IPC</span>
      </div>)}
      <p className="lab__footnote">{visual.footnote}</p>
    </div>
  );
  if (slug === "resumelens") return (
    <div className="lab__boundary">
      <div className="lab__document"><span className="lab__micro">{visual.labels[0]}</span><span className="lab__paper-line" /><span className="lab__paper-line" /><span className="lab__paper-line" /><code>{visual.labels[1]}</code></div>
      <div className={`lab__contract ${step >= 2 ? "is-selected" : ""}`}><span className="lab__micro">{visual.labels[2]}</span><div className="lab__weights">{visual.weights!.map(weight => <span key={weight.label}><strong>{weight.value}</strong>{weight.label}</span>)}</div><p>{visual.labels[3]}</p></div>
      <div className={`lab__optional ${step === 3 ? "is-selected" : ""}`}><span className="lab__micro">{visual.labels[4]}</span><p>{visual.labels[5]}</p><span>{visual.labels[6]}</span></div>
    </div>
  );
  if (slug === "smartlab") return (
    <div className="lab__model-grid">
      {visual.panels!.map((panel, i) => <div key={panel.label} className={`${i === 0 ? "lab__floor" : "lab__model"} ${i === 2 && step === 3 ? "is-selected" : ""}`}><span className="lab__micro">{panel.label}</span><strong>{panel.value}</strong><span>{panel.detail}</span>{panel.note ? <span className={i === 1 ? "lab__rejected" : ""}>{panel.note}</span> : null}</div>)}
    </div>
  );
  if (slug === "campusflow") return (
    <div className="lab__transactions">
      {visual.lanes!.map((lane, i) => <div key={lane.label} className="lab__transaction-group"><div className="lab__lane"><span className="lab__micro">{lane.label}</span><strong>{lane.states[step]}</strong><code>{lane.queries[step]}</code></div>{i === 0 ? <div className="lab__lock" aria-hidden="true">{visual.labels[step]}</div> : null}</div>)}
    </div>
  );
  return (
    <div className="lab__access">
      <p className="lab__micro">{visual.labels[0]}</p>
      <div className="lab__addresses" aria-hidden="true">{visual.addresses!.map((label, i) => <span key={label} className={i === 4 ? (step >= 1 ? "is-hot" : "is-pending") : ""}>{label}</span>)}</div>
      <div className="lab__prediction">{visual.sequence!.map(label => <span key={label}>{label}</span>)}</div>
      <p className="lab__footnote">{visual.footnote}</p>
    </div>
  );
}

export function Mechanism({ project }: { project: Project }) {
  const [step, setStep] = useState(0);
  const mechanism = project.caseStudy.mechanism;
  const current = mechanism.steps[step]!;
  return (
    <div className={`lab lab--${project.slug}`}>
      <div className="lab__head"><h3>{mechanism.title}</h3>{project.slug === "cachelab" || project.slug === "smartlab" ? <Tag evidence={project.slug === "cachelab" ? "Simulated" : "Measured"} /> : <span className="lab__micro">{project.slug === "hardware-prefetcher" ? "Conceptual" : "Implemented structure"}</span>}</div>
      <p className="lab__caption">{mechanism.caption}</p>
      <div className="lab__controls" role="group" aria-label="Explore the mechanism">
        {mechanism.steps.map((item, index) => <button type="button" key={item.label} onClick={() => setStep(index)} aria-pressed={index === step} aria-controls={`${project.slug}-mechanism`}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{item.label}</button>)}
      </div>
      <MechanismVisual slug={project.slug} step={step} />
      <div className="lab__explanation" id={`${project.slug}-mechanism`} aria-live="polite" aria-atomic="true">
        <span className="lab__signal">{current.signal}</span><h4>{current.title}</h4><p>{current.body}</p>
      </div>
    </div>
  );
}
