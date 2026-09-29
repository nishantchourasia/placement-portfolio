import { projects } from "../data/projects";
import { Section, Note } from "../components/Section";
import { Metric } from "../components/Metric";
import { Chips } from "../components/Tag";
import { href } from "../lib/router";

export function Projects() {
  return (
    <Section
      id="projects"
      eyebrow="Selected work"
      title="Five projects"
      lede="Each answers one question about what I can build. Every figure below carries its evidence label, and each project's own repository states what is unfinished."
    >
      <ol className="projects">
        {projects.map((project, index) => (
          <li className="project" key={project.slug}>
            <span className="project__index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div>
              <h3 className="project__name">
                <a href={href.project(project.slug)}>{project.name}</a>
                <span className="project__domain">{project.domain}</span>
              </h3>

              <p className="project__tagline">{project.tagline}</p>

              <ul className="project__highlights">
                {project.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>

              <div className="project__stack">
                <Chips items={project.stack.slice(0, 6)} label={`${project.name} technologies`} />
              </div>

              {project.statusNote ? (
                <div style={{ marginTop: "1.25rem" }}>
                  <Note>{project.statusNote}</Note>
                </div>
              ) : null}

              <p className="project__foot">
                <a href={href.project(project.slug)}>
                  {project.name} in depth <span aria-hidden="true">→</span>
                </a>
              </p>
            </div>

            <div className="project__metrics">
              {project.headline.map((metric) => (
                <Metric key={metric.label} metric={metric} />
              ))}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
