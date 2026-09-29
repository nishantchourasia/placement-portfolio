import { focusGroups } from "../data/content";
import { Section } from "../components/Section";

export function Focus() {
  return (
    <Section
      id="focus"
      eyebrow="Technical focus"
      title="What I work with"
      lede="Every item here is used by at least one project in this portfolio. Nothing is listed on the strength of familiarity alone, which is why the groups are short."
    >
      <div className="focus">
        {focusGroups.map((group) => (
          <div className="focus__group" key={group.title}>
            <h3>{group.title}</h3>
            <ul style={{ listStyle: "none", display: "grid", gap: "0.35rem" }}>
              {group.items.map((item) => (
                <li key={item} style={{ color: "var(--ink-2)", fontSize: "var(--step--1)" }}>
                  {item}
                </li>
              ))}
            </ul>
            <p className="focus__evidence">
              evidence: {group.evidence.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
