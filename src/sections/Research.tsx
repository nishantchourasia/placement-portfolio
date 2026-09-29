import { research } from "../data/content";
import { Section, Note } from "../components/Section";
import { useReveal } from "../lib/hooks";

function ResearchItem({ item, index }: { item: { title: string; body: string }; index: number }) {
  const ref = useReveal<HTMLElement>();
  return (
    <article className="research__item" ref={ref}>
      <span className="research__index" aria-hidden="true">
        R{String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <h3>{item.title}</h3>
        <p>{item.body}</p>
      </div>
    </article>
  );
}

export function Research() {
  return (
    <Section
      id="research"
      index="03"
      eyebrow="Research"
      title="Experimental work"
      lede={research.intro}
    >
      <div className="research">
        {research.items.map((item, index) => (
          <ResearchItem key={item.title} item={item} index={index} />
        ))}
      </div>
      <div style={{ marginTop: "2rem", maxWidth: "78ch" }}>
        <Note>{research.note}</Note>
      </div>
    </Section>
  );
}
