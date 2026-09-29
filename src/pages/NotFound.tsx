import { href } from "../lib/router";

export function NotFound({ path }: { path: string }) {
  return (
    <section className="notfound">
      <div className="shell">
        <p className="eyebrow">404</p>
        <h1 className="detail__title">Nothing at that address</h1>
        <p className="section__lede">
          <code>#{path}</code> does not match a page on this site.
        </p>
        <p style={{ marginTop: "2rem" }}>
          <a className="btn" href={href.home}>
            Back to the start
          </a>
        </p>
      </div>
    </section>
  );
}
