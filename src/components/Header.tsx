import { href } from "../lib/router";
import { useTheme, useScrolled } from "../lib/hooks";
import { profile } from "../data/profile";

const NAV = [
  { label: "Work", id: "projects" },
  { label: "Focus", id: "focus" },
  { label: "Research", id: "research" },
  { label: "About", id: "about" },
  { label: "Contact", id: "contact" },
];

/**
 * A bare anchor such as `#projects` is treated by the router as "the home
 * route, scrolled to that section". So these links need no special case on a
 * project page: the router sends the visitor home and App performs the scroll,
 * because the target element does not exist at the moment the hash changes.
 *
 * `active` is passed in rather than computed here, because on a project page
 * there is no section to be inside and the correct answer is "none".
 */
export function Header({ active }: { active: string | null }) {
  const { isDark, toggle } = useTheme();
  const scrolled = useScrolled();

  return (
    <header className="header" data-scrolled={scrolled ? "true" : "false"}>
      <div className="shell header__inner">
        <a className="header__mark" href={href.home}>
          {profile.name}
        </a>

        <nav aria-label="Sections">
          <ul className="header__nav">
            {NAV.map((item) => (
              <li key={item.label}>
                <a
                  href={href.section(item.id)}
                  aria-current={active === item.id ? "true" : undefined}
                >
                  {item.label}
                </a>
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
          <span className="theme-toggle__dot" aria-hidden="true" />
          {isDark ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
}
