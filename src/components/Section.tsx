import type { ReactNode } from "react";
import { useReveal } from "../lib/hooks";

interface SectionProps {
  id: string;
  /** Two-digit index shown before the eyebrow, e.g. "01". */
  index: string;
  eyebrow: string;
  title: string;
  lede?: string;
  children: ReactNode;
}

/**
 * Every top-level section of the home page. The numbered eyebrow is what turns
 * a scrolling page into an index — the same device the project detail pages
 * use for their eight parts, so the two read as one document.
 */
export function Section({ id, index, eyebrow, title, lede, children }: SectionProps) {
  const ref = useReveal<HTMLElement>();

  return (
    <section id={id} ref={ref} className="section" aria-labelledby={`${id}-title`}>
      <div className="shell">
        <header className="section__head">
          <p className="eyebrow">
            <span className="eyebrow__index">{index}</span>
            {eyebrow}
          </p>
          <h2 className="section__title" id={`${id}-title`}>
            {title}
          </h2>
          {lede ? <p className="section__lede">{lede}</p> : null}
        </header>
        {children}
      </div>
    </section>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="note">
      <span className="note__mark" aria-hidden="true">
        [!]
      </span>
      <span>{children}</span>
    </p>
  );
}
