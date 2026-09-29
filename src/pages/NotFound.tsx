import { href } from "../lib/router";

export function NotFound({ path }: { path: string }) {
  return (
    <section className="notfound">
      <div className="shell">
        <p className="eyebrow eyebrow--bare">
          <span className="eyebrow__index">404</span>
          Not found
        </p>
        <h1 className="notfound__title">Nothing at that address</h1>
        <p className="section__lede">
          <code>#{path}</code> does not match a page on this site.
        </p>
        <p style={{ marginTop: "2rem" }}>
          <a className="btn" href={href.home}>
            Back to the start
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </a>
        </p>
      </div>
    </section>
  );
}
