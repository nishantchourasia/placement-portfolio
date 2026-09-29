import { links, profile } from "../data/profile";
import { Section } from "../components/Section";

/**
 * Links with no verified URL are not rendered as buttons. A dead "GitHub"
 * button on a portfolio costs more than an absent one, so the unavailable
 * entries are listed below with the reason instead.
 */
export function Contact() {
  const available = links.filter((link) => link.href !== null);
  const pending = links.filter((link) => link.href === null);

  return (
    <Section id="contact" eyebrow="Contact" title="Get in touch">
      <p className="section__lede" style={{ marginBottom: 0 }}>
        The fastest route is email. I am happy to walk through any of these
        projects, including the parts that are unfinished.
      </p>

      <div className="contact__links">
        {available.map((link) => (
          <a className="btn" key={link.label} href={link.href as string}>
            {link.label === "Email" ? profile.email : link.label}
          </a>
        ))}
      </div>

      {pending.length > 0 ? (
        <ul className="contact__pending">
          {pending.map((link) => (
            <li key={link.label}>
              {link.label} — {link.pending}.
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}
