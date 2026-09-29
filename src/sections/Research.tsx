import { research } from "../data/content";
import { Section, Note } from "../components/Section";

export function Research() {
  return (
    <Section id="research" eyebrow="Research" title="Experimental work" lede={research.intro}>
      <div className="research">
        {research.items.map((item) => (
          <article className="research__item" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
      <div style={{ marginTop: "2rem", maxWidth: "78ch" }}>
        <Note>{research.note}</Note>
      </div>
    </Section>
  );
}
