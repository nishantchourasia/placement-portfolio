/**
 * Technical focus, research and about content.
 *
 * Each technology listed here is used by at least one project in the
 * repository. Nothing is listed on the strength of familiarity alone, which is
 * why the groups are short.
 */

export interface FocusGroup {
  title: string;
  items: string[];
  /** Which projects evidence this group. */
  evidence: string[];
}

export const focusGroups: FocusGroup[] = [
  {
    title: "Systems",
    items: ["C++20", "epoll / event-driven I/O", "POSIX sockets", "Concurrency", "ThreadSanitizer", "Linux", "CMake"],
    evidence: ["SwiftKV"],
  },
  {
    title: "Computer Architecture",
    items: ["gem5", "SPEC CPU2017", "Cache hierarchy", "LLC compression", "Experimental method"],
    evidence: ["CacheLab", "SmartLab"],
  },
  {
    title: "AI / ML",
    items: ["Python", "scikit-learn", "Feature engineering", "Model evaluation", "Error analysis", "Reproducibility"],
    evidence: ["SmartLab", "ResumeLens"],
  },
  {
    title: "Backend",
    items: ["FastAPI", "PostgreSQL", "REST API design", "Authentication", "Authorization / RBAC", "Transactions", "Redis"],
    evidence: ["CampusFlow", "ResumeLens"],
  },
  {
    title: "Frontend",
    items: ["React", "TypeScript", "Vite", "Tailwind"],
    evidence: ["CampusFlow", "ResumeLens"],
  },
  {
    title: "Testing & Measurement",
    items: ["pytest", "Catch2", "k6", "Sanitizers", "Load testing", "Negative controls"],
    evidence: ["All five"],
  },
];

export interface ResearchItem {
  title: string;
  body: string;
}

export const research = {
  intro:
    "I do not only build applications. Part of my work is investigating computer systems experimentally — running simulations, deciding which results are admissible, and reporting what the data supports rather than what would read better.",
  items: [
    {
      title: "Last-level-cache compression on SPEC CPU2017",
      body:
        "Eight compression schemes — including a brute-force optimality reference — compared across four SPEC CPU2017 benchmarks and 2/4/8-core configurations on a 4 MiB 16-way SRAM L3 in gem5. 82 runs ingested, 72 admitted after validity classification. Every number is Simulated: it is a model of a machine, not silicon.",
    },
    {
      title: "Compression ratio is a poor proxy for performance",
      body:
        "In the validated dataset the largest effective-capacity gain (1.972x, FP-H on 2-core 519.lbm_r) delivers -0.09% IPC, while the best IPC change anywhere is +1.40%. On these workloads at this cache size the metric usually quoted is close to uncorrelated with the one that matters.",
    },
    {
      title: "HyComp's adaptive predictor, against an exhaustive search",
      body:
        "How often the adaptive scheme picks the compressor that a brute-force search of all candidates would have picked: between 45.78% and 83.81% across nine benchmark and core-count groups, over decision counts ranging from ninety thousand to twenty-three million.",
    },
    {
      title: "Admissibility decided from the raw statistics",
      body:
        "Ten of 82 runs are excluded and each exclusion is published. Eight are 2-core 505.mcf_r, whose region of interest measured exactly 20,000,000 instructions — precisely the sampling-window size — against a 250,000,000 target. Compression is not applied during sampling, so those ratios are artefacts of measurement. This reproduces an earlier analysis's conclusion, reached independently from the raw stats.",
    },
    {
      title: "A negative result on evaluation method",
      body:
        "On a small gem5 dataset, random 5-fold cross-validation reported R² = 0.9999. Predicting each workload's mean with no configuration features at all scores the same. Holding out a whole benchmark gives R² = -1.2874 — worse than predicting a constant. The model had learned which benchmark a row came from. It is kept as a worked example of a high score that means nothing.",
    },
  ] as ResearchItem[],
  note:
    "No publications. This is coursework-adjacent and self-directed research built on an existing gem5 sweep, and it is described as that.",
};

export const about = {
  paragraphs: [
    "I am an M.Tech CSE student at IIT Jodhpur. My work sits deliberately across four layers that are usually separate specialisms: systems code in C++, architecture experiments in gem5, machine-learning systems evaluated against their own noise floor, and production-style backends whose security and concurrency properties are tested rather than asserted.",
    "What connects them is method. Each of these five projects keeps a status file recording what is finished and what is not, labels every number with how it was obtained, and states its limitations in its own README. Three of the five contain a bug or a wrong claim that testing exposed — a use-after-free in a shutdown path, a compression bomb that cost seconds of CPU, a SQL constraint that let whitespace through — and each is written up rather than quietly fixed.",
    "The direction I want to keep working in is systems and infrastructure engineering, with enough architecture and ML background to reason about the layers above and below.",
  ],
  interests: [
    "Systems and infrastructure engineering",
    "Memory hierarchy and cache architecture",
    "Applied ML evaluation and reproducibility",
    "Backend security, authorization and concurrency",
  ],
};
