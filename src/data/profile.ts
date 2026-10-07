/** Identity and contact links supplied by Nishant Chourasia. */

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
  email: "m25cse020@iitj.ac.in",
  personalEmail: "nishantchourasia33@gmail.com",
} as const;

export const links: ProfileLink[] = [
  { label: "Email", href: "mailto:m25cse020@iitj.ac.in" },
  { label: "GitHub", href: "https://github.com/nishantchourasia" },
  { label: "LinkedIn", href: "https://linkedin.com/in/nishant-chourasia-5ab996173" },
  { label: "Resume", href: "https://drive.google.com/file/d/1HM_WSw93RUGYu38w-sZ3_rYsF3xryFAF/view?usp=sharing" },
];

/** The principle the whole repository is built on, quoted on the site. */
export const evidencePolicy =
  "Nothing is claimed unless it was run. Every number below is labelled " +
  "Measured, Simulated, Predicted or Not yet measured, and the raw output is " +
  "committed next to the code that produced it.";
