import type { ReactNode } from "react";
import type { Evidence, Project } from "../data/projects";
import { projects } from "../data/projects";
import { Diagram } from "../components/Diagram";
import { MetricList } from "../components/Metric";
import { Chips, Tag } from "../components/Tag";
import { Note } from "../components/Section";
import { CaseFigure } from "../components/CaseFigure";
import { href } from "../lib/router";
import { useReveal, useActiveSection } from "../lib/hooks";

/**
 * The eight parts every case study is told in, in order. Keeping them in one
 * array rather than spread through the markup is what guarantees the contents
 * rail and the page can never disagree about what is on it.
 */
const PARTS = [
  { id: "problem", label: "Problem" },
  { id: "approach", label: "Approach" },
  { id: "architecture", label: "Architecture" },
  { id: "decisions", label: "Technical decisions" },
  { id: "results", label: "Results" },
  { id: "challenges", label: "Engineering challenges" },
  { id: "limitations", label: "Limitations" },
  { id: "stack", label: "Stack" },
] as const;

function partNumber(id: string): string {
  const index = PARTS.findIndex((part) => part.id === id);
  return String(index + 1).padStart(2, "0");
}

function Block({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="detail__block" id={id} ref={ref} aria-labelledby={`${id}-h`}>
      {/*
        The number is decorative and aria-hidden, so the heading's accessible
        name is just "Problem" rather than "01 Problem" — the rail already
        carries the ordinal for anyone navigating by it.
      */}
      <h2 id={`${id}-h`}>
        <span className="detail__num" aria-hidden="true">
          {partNumber(id)}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const index = projects.findIndex((candidate) => candidate.slug === project.slug);
  const previous = index > 0 ? projects[index - 1] : undefined;
  const next = index < projects.length - 1 ? projects[index + 1] : undefined;
  const active = useActiveSection(PARTS.map((part) => part.id));

  // Preserve the order the labels are defined in rather than the order they
  // happen to appear, so two projects with the same mix look the same.
  const ORDER: Evidence[] = ["Measured", "Simulated", "Predicted", "Not yet measured"];
  const present = new Set(project.detail.results.map((metric) => metric.evidence));
  const evidenceKinds = ORDER.filter((kind) => present.has(kind));

  return (
    <article className="detail">
      <div className="shell">
        <a className="backlink" href={href.section("projects")}>
          <span aria-hidden="true">←</span> All projects
        </a>

        <header className="detail__masthead">
          <p className="eyebrow eyebrow--bare">
            <span className="eyebrow__index">{String(index + 1).padStart(2, "0")}</span>
            {project.domain}
          </p>

          <h1 className="detail__title">{project.name}</h1>

          <p className="detail__tagline">{project.tagline}</p>

          <p className="detail__question">{project.question}</p>

          {/*
            One tag per *distinct* kind of evidence on the page, not one per
            headline metric. Three identical "Measured" badges in a row told
            the reader nothing; "Measured + Simulated" tells them the page
            mixes hardware runs with simulator output, which is the thing
            worth knowing before reading the numbers.
          */}
          <div className="detail__meta">
            {evidenceKinds.map((kind) => (
              <Tag key={kind} evidence={kind} />
            ))}
            <span className="project__domain">
              {project.complete ? "Complete" : "In progress"}
            </span>
          </div>

          {project.statusNote ? (
            <div style={{ maxWidth: "70ch" }}>
              <Note>{project.statusNote}</Note>
            </div>
          ) : null}
        </header>

        <div className="detail__layout">
          <nav className="toc" aria-label="Sections of this case study">
            <p className="toc__title">Contents</p>
            {PARTS.map((part, i) => (
              <a
                key={part.id}
                href={`#${part.id}`}
                aria-current={active === part.id ? "true" : undefined}
              >
                <em>{String(i + 1).padStart(2, "0")}</em>
                <span>{part.label}</span>
              </a>
            ))}
          </nav>

          <div className="detail__body">
            <Block id="problem" title="Problem">
              <div className="prose">
                <p>{project.detail.problem}</p>
              </div>
            </Block>

            <Block id="approach" title="Approach">
              <div className="prose">
                <p>{project.detail.approach}</p>
              </div>
              {/*
                The case study's own figure, not the index motif enlarged.
                The small motif is a signature for a list; this is a drawing
                of how the project is actually assembled.
              */}
              <div className="detail__figure">
                <CaseFigure slug={project.slug} />
              </div>
            </Block>

            <Block id="architecture" title="Architecture">
              <Diagram
                stages={project.detail.stages}
                caption={`${project.name} — request and data flow`}
              />
            </Block>

            <Block id="decisions" title="Technical decisions">
              <ol className="decisions">
                {project.detail.decisions.map((decision) => (
                  <li className="decision" key={decision.title}>
                    <div>
                      <h3>{decision.title}</h3>
                      <p>{decision.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Block>

            <Block id="results" title="Results">
              <MetricList metrics={project.detail.results} label={`${project.name} results`} />
            </Block>

            <Block id="challenges" title="Engineering challenges">
              <ol className="decisions">
                {project.detail.challenges.map((challenge) => (
                  <li className="decision" key={challenge.title}>
                    <div>
                      <h3>{challenge.title}</h3>
                      <p>{challenge.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Block>

            <Block id="limitations" title="Limitations">
              <ul className="limits">
                {project.detail.limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            </Block>

            <Block id="stack" title="Stack">
              <Chips items={project.stack} label={`${project.name} full stack`} />
              <div style={{ marginTop: "1.6rem", maxWidth: "70ch" }}>
                <Note>
                  No public repository link yet — this portfolio has no git
                  remote configured, so there is nothing to point at. The
                  source, its documentation and the raw results live in the{" "}
                  <code>{project.slug}/</code> directory of the portfolio
                  repository.
                </Note>
              </div>
            </Block>

            <nav className="pager" aria-label="Other projects">
              {previous ? (
                <a href={href.project(previous.slug)}>
                  <span aria-hidden="true">←</span> {previous.name}
                </a>
              ) : (
                <span />
              )}
              {next ? (
                <a href={href.project(next.slug)}>
                  {next.name} <span aria-hidden="true">→</span>
                </a>
              ) : (
                <span />
              )}
            </nav>
          </div>
        </div>
      </div>
    </article>
  );
}
