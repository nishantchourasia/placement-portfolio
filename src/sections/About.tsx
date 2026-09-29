import { about } from "../data/content";
import { profile } from "../data/profile";
import { Section } from "../components/Section";

export function About() {
  return (
    <Section id="about" eyebrow="About" title="Background and direction">
      <div className="two-col">
        <div className="prose">
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>

        <dl className="deflist">
          <div>
            <dt>Education</dt>
            <dd>
              {profile.education.degree}
              <br />
              {profile.education.institution}
            </dd>
          </div>
          <div>
            <dt>Interests</dt>
            <dd>
              <ul style={{ listStyle: "none", display: "grid", gap: "0.35rem" }}>
                {about.interests.map((interest) => (
                  <li key={interest}>{interest}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </div>
    </Section>
  );
}
