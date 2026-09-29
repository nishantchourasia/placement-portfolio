import { href } from "../lib/router";
import { useTheme } from "../lib/hooks";
import { profile } from "../data/profile";

const NAV = [
  { label: "Projects", target: href.section("projects") },
  { label: "Focus", target: href.section("focus") },
  { label: "Research", target: href.section("research") },
  { label: "About", target: href.section("about") },
  { label: "Contact", target: href.section("contact") },
];

/**
 * A bare anchor such as `#projects` is treated by the router as "the home
 * route, scrolled to that section". So these links need no special case on a
 * project page: the router sends the visitor home and App performs the scroll,
 * because the target element does not exist at the moment the hash changes.
 */
export function Header() {
  const { isDark, toggle } = useTheme();

  return (
    <header className="header">
      <div className="shell header__inner">
        <a className="header__mark" href={href.home}>
          {profile.name}
        </a>
        <nav aria-label="Sections">
          <ul className="header__nav">
            {NAV.map((item) => (
              <li key={item.label}>
                <a href={item.target}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggle}
          aria-pressed={isDark}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDark ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
}
