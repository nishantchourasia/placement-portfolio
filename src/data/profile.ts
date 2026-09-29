/**
 * Identity and contact details.
 *
 * Only verified facts belong in this file. The repository this site documents
 * has no configured git remote, no LinkedIn reference and no committed resume
 * PDF, so those links are `null` rather than guessed. Every link-rendering
 * component skips a `null` href instead of emitting a dead button — a broken
 * link on a portfolio is worse than an absent one.
 *
 * To publish them, fill in the values below; the UI picks them up with no other
 * change.
 */

export interface ProfileLink {
  label: string;
  href: string | null;
  /** Shown in place of the link when href is null, on the contact page only. */
  pending?: string;
}

export const profile = {
  name: "Nishant Chourasia",
  headline: "Systems · Computer Architecture · AI/ML · Software Engineering",
  summary:
    "M.Tech CSE at IIT Jodhpur. I build across the stack that most people pick one layer of: " +
    "low-level infrastructure in C++, computer-architecture experiments in gem5, " +
    "machine-learning systems evaluated properly, and production-style backends with " +
    "authorization and concurrency that hold up under test.",
  education: {
    degree: "M.Tech, Computer Science & Engineering",
    institution: "Indian Institute of Technology Jodhpur",
  },
  email: "m25cse026@iitj.ac.in",
} as const;

export const links: ProfileLink[] = [
  { label: "Email", href: "mailto:m25cse026@iitj.ac.in" },
  { label: "GitHub", href: null, pending: "Repository is local; no remote configured yet" },
  { label: "LinkedIn", href: null, pending: "Not recorded in the repository" },
  { label: "Resume", href: null, pending: "No resume PDF committed yet" },
];

/** The principle the whole repository is built on, quoted on the site. */
export const evidencePolicy =
  "Nothing is claimed unless it was run. Every number below is labelled " +
  "Measured, Simulated, Predicted or Not yet measured, and the raw output is " +
  "committed next to the code that produced it.";
