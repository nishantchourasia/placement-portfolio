import type { Project } from "../data/projects";
import { projects } from "../data/projects";
import { Diagram } from "../components/Diagram";
import { MetricList } from "../components/Metric";
import { Chips } from "../components/Tag";
import { Note } from "../components/Section";
import { href } from "../lib/router";

export function ProjectDetail({ project }: { project: Project }) {
  const index = projects.findIndex((candidate) => candidate.slug === project.slug);
  const previous = index > 0 ? projects[index - 1] : undefined;
  const next = index < projects.length - 1 ? projects[index + 1] : undefined;

  return (
    <article className="detail">
      <div className="shell">
        <a className="backlink" href={href.section("projects")}>
          <span aria-hidden="true">←</span> All projects
        </a>

        <p className="eyebrow" style={{ marginTop: "2rem" }}>
          {project.domain}
        </p>
        <h1 className="detail__title">{project.name}</h1>
        <p className="section__lede" style={{ marginTop: 0 }}>
          {project.tagline}
        </p>
        <p className="detail__question">{project.question}</p>

        {project.statusNote ? (
          <div style={{ marginTop: "2rem", maxWidth: "68ch" }}>
            <Note>{project.statusNote}</Note>
          </div>
        ) : null}

        <section className="detail__block" aria-labelledby="problem">
          <h2 id="problem">Problem</h2>
          <div className="prose">
            <p>{project.detail.problem}</p>
          </div>
        </section>

        <section className="detail__block" aria-labelledby="approach">
          <h2 id="approach">Approach</h2>
          <div className="prose">
            <p>{project.detail.approach}</p>
          </div>
        </section>

        <section className="detail__block" aria-labelledby="architecture">
          <h2 id="architecture">Architecture</h2>
          <Diagram
            stages={project.detail.stages}
            caption={`${project.name} — request and data flow`}
          />
        </section>

        <section className="detail__block" aria-labelledby="decisions">
          <h2 id="decisions">Technical decisions</h2>
          <ol className="decisions">
            {project.detail.decisions.map((decision) => (
              <li className="decision" key={decision.title}>
                <h3>{decision.title}</h3>
                <p>{decision.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="detail__block" aria-labelledby="results">
          <h2 id="results">Results</h2>
          <MetricList metrics={project.detail.results} label={`${project.name} results`} />
        </section>

        <section className="detail__block" aria-labelledby="challenges">
          <h2 id="challenges">Engineering challenges</h2>
          <ol className="decisions">
            {project.detail.challenges.map((challenge) => (
              <li className="decision" key={challenge.title}>
                <h3>{challenge.title}</h3>
                <p>{challenge.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="detail__block" aria-labelledby="limitations">
          <h2 id="limitations">Limitations</h2>
          <ul className="limits">
            {project.detail.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </section>

        <section className="detail__block" aria-labelledby="stack">
          <h2 id="stack">Stack</h2>
          <Chips items={project.stack} label={`${project.name} full stack`} />
        </section>

        <section className="detail__block" aria-labelledby="links">
          <h2 id="links">Links</h2>
          <Note>
            No public repository link yet — this portfolio has no git remote
            configured, so there is nothing to point at. The source, its
            documentation and the raw results live in the{" "}
            <code>{project.slug}/</code> directory of the portfolio repository.
          </Note>
        </section>

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
    </article>
  );
}
