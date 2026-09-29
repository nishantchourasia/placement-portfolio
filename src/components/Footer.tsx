import { profile } from "../data/profile";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", width: "100%" }}>
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
