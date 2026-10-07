import { projects } from "../data/projects";
import { Section, Note } from "../components/Section";
import { Metric } from "../components/Metric";
import { Chips } from "../components/Tag";
import { ProjectMotif } from "../components/ProjectMotif";
import { href } from "../lib/router";
import { useReveal } from "../lib/hooks";

/**
 * The project index, as an index rather than a card grid.
 *
 * Each row is one link — the title anchor, stretched over the whole row by a
 * pseudo-element — so the accessible tree has exactly one entry per project
 * and the visitor has a target the size of the row. The "in depth" affordance
 * at the bottom is a span for that reason: a second anchor to the same place
 * would read as a duplicate link to a screen reader for no gain.
 */
function ProjectRow({ project, index }: { project: (typeof projects)[number]; index: number }) {
  const ref = useReveal<HTMLLIElement>();

  return (
    <li className="project" ref={ref}>
      <span className="project__index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div>
        <div className="project__head">
          <h3 className="project__name">
            <a href={href.project(project.slug)} aria-label={`Explore ${project.name} case study`}>{project.name}</a>
          </h3>
          <span className="project__domain">{project.domain}</span>
        </div>

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
          <div className="project__note">
            <Note>{project.statusNote}</Note>
          </div>
        ) : null}

        <p className="project__foot" aria-hidden="true">
          Explore project <span>→</span>
        </p>
      </div>

      <div className="project__aside">
        <ProjectMotif slug={project.slug} />
        <div className="project__metrics">
          {project.headline.map((metric) => (
            <Metric key={metric.label} metric={metric} />
          ))}
        </div>
      </div>
    </li>
  );
}

export function Projects() {
  return (
    <Section
      id="projects"
      index="01"
      eyebrow="Selected work"
      title="Six case studies"
      lede="Five source-backed projects and one research brief. Each explores a different engineering question, with recorded evidence and unfinished work stated explicitly."
    >
      <ol className="projects">
        {projects.map((project, index) => (
          <ProjectRow key={project.slug} project={project} index={index} />
        ))}
      </ol>
    </Section>
  );
}
