import { profile } from "../data/profile";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <span>
          {profile.name} — {profile.education.institution}
        </span>
        <span>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </span>
      </div>
    </footer>
  );
}
