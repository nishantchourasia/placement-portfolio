import { profile, evidencePolicy, links } from "../data/profile";
import { href } from "../lib/router";
import { Tag } from "../components/Tag";

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

export function Hero() {
  const email = links.find((link) => link.label === "Email");

  return (
    <section className="hero section--flush" aria-labelledby="hero-name">
      <div className="shell">
        <h1 className="hero__name" id="hero-name">
          {profile.name}
        </h1>

        <p className="hero__headline">{profile.headline}</p>

        <p className="hero__summary">{profile.summary}</p>

        <div className="hero__actions">
          <a className="btn" href={href.section("projects")}>
            View projects
          </a>
          {email?.href ? (
            <a className="btn btn--ghost" href={email.href}>
              {profile.email}
            </a>
          ) : null}
        </div>

        <ul className="hero__stats" style={{ listStyle: "none" }}>
          {STATS.map((stat) => (
            <li key={stat.label}>
              <span className="stat__value">{stat.value}</span>
              <span className="stat__label">
                {stat.label}
                <br />
                {stat.note}
              </span>
            </li>
          ))}
        </ul>

        <p className="hero__policy">
          <strong>How to read every number on this site.</strong> {evidencePolicy}{" "}
          <Tag evidence="Measured" /> <Tag evidence="Simulated" />{" "}
          <Tag evidence="Not yet measured" />
        </p>
      </div>
    </section>
  );
}
