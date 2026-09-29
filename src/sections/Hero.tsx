import { profile, evidencePolicy, links } from "../data/profile";
import { href } from "../lib/router";
import { Tag } from "../components/Tag";
import { HeroScene } from "../components/HeroScene";
import { useReveal } from "../lib/hooks";

/**
 * Four aggregate figures, each summed only from counts of the same kind so the
 * total means something. The test count keeps C++ cases and Python tests
 * separate in its note rather than presenting them as one unit.
 */
const STATS = [
  { value: "746", label: "automated tests, all executed", note: "212 C++ cases + 534 Python tests" },
  { value: "1,635,084", label: "ops/s peak throughput", note: "SwiftKV, 64 event loops" },
  { value: "241,600", label: "measured configurations", note: "SmartLab dataset" },
  { value: "82 → 72", label: "gem5 runs ingested → admitted", note: "10 excluded, reasons published" },
];

/** The name is split so the two lines can stagger against each other. */
const NAME_LINES = profile.name.split(" ");

export function Hero() {
  const email = links.find((link) => link.label === "Email");
  const statsRef = useReveal<HTMLUListElement>();

  return (
    <section className="hero" aria-labelledby="hero-name">
      <HeroScene />

      <div className="shell">
        <p className="eyebrow eyebrow--bare hero__top">
          <span className="eyebrow__index">M.Tech CSE</span>
          {profile.education.institution}
        </p>

        <h1 className="hero__name" id="hero-name">
          {NAME_LINES.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>

        <div className="hero__rule" />

        <p className="hero__headline">{profile.headline}</p>

        <div className="hero__body">
          <p className="hero__summary">{profile.summary}</p>

          <div className="hero__actions">
            <a className="btn" href={href.section("projects")}>
              View the work
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </a>
            {email?.href ? (
              <a className="btn btn--ghost" href={email.href}>
                {profile.email}
              </a>
            ) : null}
          </div>
        </div>

        <ul className="hero__stats" ref={statsRef}>
          {STATS.map((stat) => (
            <li key={stat.label}>
              <span className="stat__value">{stat.value}</span>
              <span className="stat__label">
                <b>{stat.label}</b>
                {stat.note}
              </span>
            </li>
          ))}
        </ul>

        <p className="hero__policy">
          <strong>How to read every number on this site.</strong> {evidencePolicy}
          <span className="tag-row">
            <Tag evidence="Measured" /> <Tag evidence="Simulated" />{" "}
            <Tag evidence="Not yet measured" />
          </span>
        </p>
      </div>
    </section>
  );
}
