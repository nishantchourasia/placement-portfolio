import type { ReactNode } from "react";
import { useReveal } from "../lib/hooks";

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  lede?: string;
  children: ReactNode;
  flush?: boolean;
}

export function Section({ id, eyebrow, title, lede, children, flush }: SectionProps) {
  const ref = useReveal<HTMLElement>();
  return (
    <section
      id={id}
      ref={ref}
      className={flush ? "section section--flush" : "section"}
      aria-labelledby={`${id}-title`}
    >
      <div className="shell">
        <header className="section__head">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section__title" id={`${id}-title`}>
            {title}
          </h2>
        </header>
        {lede ? <p className="section__lede" style={{ marginBottom: "2rem" }}>{lede}</p> : null}
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
