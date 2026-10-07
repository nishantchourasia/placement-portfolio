import type { ReactNode } from "react";
import type { Evidence, Project } from "../data/projects";
import { projects } from "../data/projects";
import { Diagram } from "../components/Diagram";
import { MetricList } from "../components/Metric";
import { Chips, Tag } from "../components/Tag";
import { Note } from "../components/Section";
import { CaseFigure } from "../components/CaseFigure";
import { ProjectMotif } from "../components/ProjectMotif";
import { Mechanism } from "../components/Mechanism";
import { EvidenceChart } from "../components/EvidenceChart";
import { href } from "../lib/router";
import { useReveal, useActiveSection } from "../lib/hooks";

const PARTS = [
  { id: "problem", label: "The problem" },
  { id: "approach", label: "The idea" },
  { id: "mechanism", label: "How it works" },
  { id: "architecture", label: "Architecture" },
  { id: "decisions", label: "Engineering decisions" },
  { id: "implementation", label: "Implementation" },
  { id: "results", label: "Results & evidence" },
  { id: "limitations", label: "Limitations" },
  { id: "lessons", label: "What I learned" },
  { id: "stack", label: "Tech stack" },
  { id: "source", label: "Repository & source" },
] as const;

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const ref = useReveal<HTMLElement>();
  const index = PARTS.findIndex(part => part.id === id);
  return <section className="detail__block" id={id} ref={ref} aria-labelledby={`${id}-h`}>
    <h2 id={`${id}-h`}><span className="detail__num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{title}</h2>
    {children}
  </section>;
}

export function ProjectDetail({ project }: { project: Project }) {
  const index = projects.findIndex(candidate => candidate.slug === project.slug);
  const previous = projects[(index + projects.length - 1) % projects.length]!;
  const next = projects[(index + 1) % projects.length]!;
  const study = project.caseStudy;
  const active = useActiveSection(PARTS.map(part => part.id));
  const order: Evidence[] = ["Measured", "Simulated", "Predicted", "Not yet measured"];
  const kinds = new Set(project.detail.results.map(metric => metric.evidence));
  const status = project.slug === "hardware-prefetcher" ? "Research brief" : project.complete ? "Documented implementation" : "Ongoing";
  const sources = study.sources;

  return (
    <article className={`detail case-study case-study--${project.slug}`}>
      <div className="shell">
        <div className="case-study__topline"><a className="backlink" href={href.section("projects")}><span aria-hidden="true">←</span> All projects</a><span className="case-study__edition">Case study {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span></div>
        <header className="detail__masthead case-study__masthead">
          <div className="case-study__intro">
            <p className="eyebrow eyebrow--bare">{study.role}</p>
            <h1 className="detail__title" tabIndex={-1}>{study.title}</h1>
            <p className="case-study__thesis">{study.thesis}</p>
            <div className="detail__meta">{order.filter(kind => kinds.has(kind)).map(kind => <Tag key={kind} evidence={kind} />)}<span className="case-study__status"><i aria-hidden="true" />{status}</span></div>
            <p className="case-study__overview">{study.overview}</p>
            <div className="case-study__actions"><a className="btn" href={href.project(project.slug, "mechanism")}>Explore the mechanism <span aria-hidden="true">↓</span></a>{study.repository ? <a className="btn btn--ghost" href={study.repository} target="_blank" rel="noopener noreferrer">View source <span aria-hidden="true">↗</span></a> : null}</div>
          </div>
          <aside className="case-study__finding" aria-label="The central engineering question">
            <span className="lab__micro">The engineering lens</span>
            {project.slug === "hardware-prefetcher" ? <div className="case-study__prefetch-mark" aria-hidden="true"><span>A</span><span>B</span><span>C</span><span>?</span></div> : <ProjectMotif slug={project.slug} active />}
            <p>{study.takeaway}</p>
            <span className="case-study__finding-note">{project.question}</span>
          </aside>
        </header>
        {project.statusNote ? <div className="case-study__scope"><Note>{project.statusNote}</Note></div> : null}
        <div className="case-study__headline"><MetricList metrics={project.headline} label={`${project.name} recorded headline evidence`} /></div>
        <div className="detail__layout">
          <nav className="toc case-study__toc" aria-label="Sections of this case study">
            <p className="toc__title">Read the case study</p>
            {PARTS.map((part, i) => <a key={part.id} href={href.project(project.slug, part.id)} aria-current={active === part.id ? "true" : undefined}><em>{String(i + 1).padStart(2, "0")}</em><span>{part.label}</span></a>)}
          </nav>
          <div className="detail__body">
            <Block id="problem" title="The problem"><div className="prose"><p>{project.detail.problem}</p></div></Block>
            <Block id="approach" title="The idea"><div className="prose"><p>{project.detail.approach}</p></div><p className="case-study__pullquote">{study.takeaway}</p></Block>
            <Block id="mechanism" title="How it works"><Mechanism project={project} /></Block>
            <Block id="architecture" title={project.slug === "hardware-prefetcher" ? "Planned experimental architecture" : "System & architecture"}>
              <p className="case-study__section-intro">{study.architectureNote}</p>
              {project.slug !== "hardware-prefetcher" ? <div className="case-study__schematic"><CaseFigure slug={project.slug} /><p className="case-study__figure-note">Structural schematic. {project.slug === "smartlab" ? "The curve is illustrative; recorded model values are in Results & evidence." : "Flow positions illustrate the design, not measured timing."}</p></div> : null}
              <div className="case-study__mobile-schematic"><Diagram stages={study.mobileFigure} caption={project.slug === "hardware-prefetcher" ? "Conceptual prefetch flow · not a verified predictor" : "Structure at a glance"} /></div>
              <Diagram stages={project.detail.stages} caption={project.slug === "cachelab" ? "Implemented CacheLab analysis pipeline" : project.slug === "hardware-prefetcher" ? "Planned evaluation pipeline · not yet measured" : "Implemented request and data pipeline"} />
            </Block>
            <Block id="decisions" title="Engineering decisions"><ol className="case-decisions">{study.decisions.map(decision => <li key={decision.title}><h3>{decision.title}</h3><dl><div><dt>Why</dt><dd>{decision.why}</dd></div><div><dt>Trade-off</dt><dd>{decision.tradeoff}</dd></div></dl></li>)}</ol></Block>
            <Block id="implementation" title="Implementation">
              <div className="implementation-grid">{study.implementation.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.body}</p>{item.snippet ? <pre><code>{item.snippet}</code></pre> : null}{item.path && study.repository ? <a className="case-source-link" href={`${study.repository}/blob/main/${item.path}`} target="_blank" rel="noopener noreferrer">{item.path} <span aria-hidden="true">↗</span></a> : null}</article>)}</div>
              {project.detail.challenges.length ? <details className="case-study__details"><summary>Debugging notes & engineering challenges <span>{project.detail.challenges.length} records</span></summary><ol className="decisions">{project.detail.challenges.map(challenge => <li className="decision" key={challenge.title}><div><h3>{challenge.title}</h3><p>{challenge.body}</p></div></li>)}</ol></details> : null}
            </Block>
            <Block id="results" title="Results & evidence"><p className="case-study__section-intro">{study.sourceNote}</p><EvidenceChart project={project} /><MetricList metrics={project.detail.results.slice(0, 4)} label={`${project.name} key results`} />{project.detail.results.length > 4 ? <details className="case-study__details"><summary>All recorded measurements <span>{project.detail.results.length - 4} more</span></summary><MetricList metrics={project.detail.results.slice(4)} label={`${project.name} further recorded evidence`} /></details> : null}</Block>
            <Block id="limitations" title="Limitations & open work"><ul className="limits">{project.detail.limitations.map(limitation => <li key={limitation}>{limitation}</li>)}</ul></Block>
            <Block id="lessons" title={project.slug === "hardware-prefetcher" ? "Research questions to resolve" : "What I learned"}><ol className="case-lessons">{study.lessons.map((lesson, i) => <li key={lesson}><span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><p>{lesson}</p></li>)}</ol></Block>
            <Block id="stack" title="Tech stack">{project.stack.length ? <Chips items={project.stack} label={`${project.name} documented technologies`} /> : <p className="case-study__section-intro">The research brief names ChampSim, C++, and Linux. Their implementation and configuration are unverified here, so no implemented stack is claimed.</p>}</Block>
            <Block id="source" title="Repository & source">
              <div className="case-study__source"><p className="lab__micro">Inspect the work</p><h3>{study.repository ? "Read the code. Follow the evidence." : "Source not supplied yet."}</h3><p>{study.sourceNote}</p>{study.repository ? <a className="btn" href={study.repository} target="_blank" rel="noopener noreferrer">View source <span aria-hidden="true">↗</span></a> : <Tag evidence="Not yet measured" />}</div>
              {study.repository && sources.length ? <ul className="case-study__sources">{sources.map(source => <li key={source.path}><a href={`${study.repository}/blob/main/${source.path}`} target="_blank" rel="noopener noreferrer"><span>{source.label}</span><code>{source.path} ↗</code></a></li>)}</ul> : null}
            </Block>
          </div>
        </div>
        <nav className="pager case-study__pager" aria-label="Other projects"><a href={href.project(previous.slug)}><span>← Previous project</span><strong>{previous.name}</strong><small>{previous.domain}</small></a><a href={href.project(next.slug)}><span>Next project →</span><strong>{next.name}</strong><small>{next.domain}</small></a></nav>
      </div>
    </article>
  );
}
