import type { Stage } from "./projects";

export interface EngineeringDecision { title: string; why: string; tradeoff: string }
export interface Implementation { title: string; body: string; path?: string; snippet?: string }
export interface MechanismStep { label: string; title: string; body: string; signal: string }
export interface CaseStudy {
  title: string;
  role: string;
  thesis: string;
  overview: string;
  takeaway: string;
  repository: string | null;
  sourceNote: string;
  sources: { label: string; path: string }[];
  decisions: EngineeringDecision[];
  implementation: Implementation[];
  lessons: string[];
  mechanism: { title: string; caption: string; steps: MechanismStep[] };
  architectureNote: string;
  mobileFigure: Stage[];
}

/** Content reconciled against the local source, tests, and generated reports.
 * Repository addresses are supplied in docs/README.md and the user's master notes.
 * Prefetching is the sole notes-only entry; no implementation or result is claimed.
 */
export const caseStudies: Record<string, CaseStudy> = {
  swiftkv: {
    title: "SwiftKV",
    role: "Systems engineering / C++20",
    thesis: "Many connections. Independent shards. One honest durability contract.",
    overview: "A single-node, Redis-protocol key-value store built from the socket upward. The work connects TCP framing, connection ownership, concurrent LRU storage, and append-only recovery into one server, then measures where that design stops scaling.",
    takeaway: "The interesting part is what happens before the reply.",
    repository: "https://github.com/nishantchourasia/swiftkv",
    sourceNote: "Recorded measurements come from the repository's benchmark and reliability reports. They are historical runs on a shared Linux host, not benchmarks executed by this website.",
    sources: [{ label: "Architecture & alternatives", path: "ARCHITECTURE.md" }, { label: "Benchmark medians & IQR", path: "docs/results/perf_summary.csv" }, { label: "Timing-sensitive test", path: "tests/test_server.cpp" }],
    decisions: [
      { title: "A few epoll loops, many connections", why: "Each connection belongs to one loop for its lifetime. Level-triggered epoll watches many sockets without allocating a thread to every idle client.", tradeoff: "Linux-specific I/O and explicit buffer management; a handler must preserve partial requests and partial writes." },
      { title: "64 independently locked shards", why: "Keys in different shards can proceed in parallel. Each shard owns its mutex and LRU accounting, rather than serializing the store behind one global lock.", tradeoff: "Hot keys can still contend, and partitioned capacity does not act like one global LRU." },
      { title: "Append before acknowledgement", why: "The mutation enters the append-only log before the response. Replay reconstructs state, while never / everysec / always let the operator choose a sync policy.", tradeoff: "Appending is not the same as surviving a power cut. Stronger sync policies add substantial latency, and device write caches still matter." },
    ],
    implementation: [
      { title: "TCP is a stream", body: "The RESP parser handles incomplete and pipelined requests. Event loops retain per-connection input and output state, including writes that the socket cannot accept all at once.", path: "src/protocol.cpp" },
      { title: "The shard is the locking boundary", body: "The store rounds the shard count to a power of two, mixes the key hash, and masks it to select a shard. Reads and mutations hold that shard's mutex while touching its cache.", path: "src/store.cpp", snippet: "Shard& shard = shard_for(key);\nstd::lock_guard<std::mutex> lock(shard.mutex);\nreturn shard.cache.get(key);" },
      { title: "Recovery before serving", body: "Startup replays the log before binding the listener, and refuses a corrupt log. Shutdown drains work and joins the acceptor before closing its listening descriptor.", path: "src/server.cpp" },
    ],
    lessons: ["A successful reply is a contract across networking, mutation, and persistence. Correctness depends on their ordering, not only on the speed of each component.", "Repeated runs overturned the earlier claim that writes were faster than reads. Medians and IQR are part of the engineering method, not decoration around a benchmark."],
    mechanism: {
      title: "Follow a write", caption: "Interactive architecture walkthrough. Structural illustration, not a live server or latency simulation.",
      steps: [
        { label: "Accept", title: "One owner per connection", body: "The acceptor distributes sockets round-robin. An event loop owns its connection state for the rest of that connection's life.", signal: "TCP → acceptor → epoll" },
        { label: "Parse", title: "Bytes become a command", body: "RESP framing separates commands even when reads split or combine them. A partial command stays buffered until enough bytes arrive.", signal: "buffer → RESP → command" },
        { label: "Mutate", title: "Lock the selected shard", body: "The key hash picks one of 64 shards. Other shards remain independent; concurrent access to this shard is protected by its mutex.", signal: "hash(key) → shard → LRU" },
        { label: "Persist", title: "Append before reply", body: "The log receives the write before the acknowledgement. The configured sync policy determines when those bytes are forced to storage.", signal: "mutation → AOF → reply" },
      ],
    },
    architectureNote: "A single process and a single node. The diagram contains no replication, cluster coordinator, or remote shard.",
    mobileFigure: [{ label: "RESP clients", sub: "TCP byte stream" }, { label: "Acceptor", sub: "round-robin socket handoff" }, { label: "epoll loops", sub: "one owner per connection" }, { label: "64 shards", sub: "mutex + LRU per shard" }, { label: "Append-only log", sub: "append before reply" }],
  },
  cachelab: {
    title: "Cache Compression in Memory Hierarchies",
    role: "M.Tech thesis / computer architecture",
    thesis: "Unused bits can buy capacity. Whether they buy speed is another question.",
    overview: "Ongoing LLC-compression research presented through CacheLab, its reproducible analysis harness. The analysis repository exports completed gem5 runs, parses the intended region of interest, gates comparisons on validity, and publishes both results and exclusions. It does not contain the simulator or compression implementations.",
    takeaway: "Effective capacity is a mechanism. IPC is an outcome.",
    repository: "https://github.com/nishantchourasia/cachelab",
    sourceNote: "The analysis repository is the source for the results shown here. gem5 and the compression implementations live in a separate research tree. All performance evidence is simulated; the thesis remains ongoing.",
    sources: [{ label: "Simulation results", path: "docs/RESULTS.md" }, { label: "Published exclusions", path: "docs/VALIDITY.md" }, { label: "Validity rules", path: "cachelab/validate.py" }],
    decisions: [
      { title: "Export once; keep the research tree read-only", why: "A one-way copy and SHA-256 manifest isolate analysis from a live simulator sweep. Downstream parsing reads the exported copy, not the source tree.", tradeoff: "The export consumes storage, and provenance does not replace a reproducible simulator setup. That setup is outside this repository." },
      { title: "Keep rejected runs visible", why: "A completed job can measure the sampling phase or lack a valid baseline. Flags explain why a row cannot support a comparison; excluded rows remain in the full dataset.", tradeoff: "Fewer usable comparisons and less impressive totals, in exchange for an auditable result." },
      { title: "Compare within a valid workload group", why: "IPC changes are relative to the uncompressed baseline at the same benchmark and core count. Compression ratio and IPC are reported separately.", tradeoff: "A high ratio cannot be marketed as a speedup, and missing baselines leave some groups without a defensible comparison." },
    ],
    implementation: [
      { title: "Provenance at the export boundary", body: "The exporter refuses output paths inside the source tree, records file hashes, and skips runs still being written. The live simulation is not rerun by the analysis tool.", path: "cachelab/export.py" },
      { title: "Read the ROI, not an arbitrary dump", body: "The stats parser targets the REFERENCE / ROI STATS dump. Typed records retain instruction counts, cycles, IPC, and compression statistics for downstream checks.", path: "cachelab/statsfile.py" },
      { title: "Validity is executable methodology", body: "Eight flags check ROI presence, completeness, size, sampling confusion, comparable windows, baselines, IPC, and physical compression-ratio bounds.", path: "cachelab/validate.py" },
    ],
    lessons: ["A simulator job that exits successfully is not yet an experiment result. Defining the admissible measurement window is part of the research.", "The largest capacity ratio in this dataset accompanies a slight IPC decrease. Reporting that tension is more useful than selecting the most flattering metric."],
    mechanism: {
      title: "Capacity ≠ performance", caption: "Explore an actual group from docs/RESULTS.md: 519.lbm_r, 2 cores, 250M-instruction ROI. These are gem5 results, not silicon measurements.",
      steps: [
        { label: "Baseline", title: "Start with a comparable baseline", body: "The uncompressed run records IPC 0.2396 and MPKI 61.60. Each scheme below is compared within this same workload and core-count group.", signal: "Baseline · IPC 0.2396" },
        { label: "FP-H", title: "More capacity, slightly less IPC", body: "FP-H reaches the group's largest capacity ratio, 1.972×. Its IPC change is −0.09%. The two outcomes do not move together.", signal: "1.972× capacity · −0.09% IPC" },
        { label: "HyComp", title: "Capacity remains a separate axis", body: "HyComp records 1.827× capacity and −0.10% IPC in this group. Predictor behavior and compression overhead cannot be inferred from ratio alone.", signal: "1.827× capacity · −0.10% IPC" },
      ],
    },
    architectureNote: "The memory hierarchy figure explains the experiment's subject. The pipeline below shows the code actually present in CacheLab: export, parse, validate, and report.",
    mobileFigure: [{ label: "CPU cores", sub: "2 / 4 / 8 in the sweep" }, { label: "L1 → L2", sub: "memory hierarchy context" }, { label: "SRAM L3", sub: "4 MiB · 16-way · 20 cycles" }, { label: "Compression", sub: "8 schemes evaluated externally" }, { label: "DRAM", sub: "capacity and IPC compared separately" }],
  },
  resumelens: {
    title: "ResumeLens",
    role: "AI product engineering / full-stack",
    thesis: "A score you can explain. An AI layer that cannot change it.",
    overview: "Explainable resume-to-job matching with a deterministic scoring contract and optional language-model commentary. A React frontend talks to a FastAPI backend that authenticates callers, validates PDF uploads, processes documents in memory, and keeps analysis history isolated by user.",
    takeaway: "The score is authoritative. The commentary is optional.",
    repository: "https://github.com/nishantchourasia/resumelens",
    sourceNote: "The scoring weights, ownership boundary, and session model are implemented in the backend. Provider behavior was tested with stubs; the live LLM-provider path remains unverified.",
    sources: [{ label: "Architecture & scoring contract", path: "ARCHITECTURE.md" }, { label: "Deterministic scorer", path: "backend/app/domain.py" }, { label: "User isolation tests", path: "tests/test_authorization.py" }, { label: "Commentary boundary tests", path: "tests/test_commentary.py" }],
    decisions: [
      { title: "Persist the score before commentary", why: "Pure rules compute the score and evidence. The result is stored before invoking the optional model, so commentary has no authority to rewrite the number.", tradeoff: "Rule-based matching is reproducible but cannot capture every nuance of a resume. Commentary can add context; it cannot repair scoring limitations." },
      { title: "Put ownership in the SQL predicate", why: "Reads filter by both analysis ID and user ID. Another user's row never enters the response path, and missing or forbidden records both return 404.", tradeoff: "Every user-owned query must preserve the predicate. The rule is reinforced by isolation tests rather than delegated to the frontend." },
      { title: "Opaque sessions with revocable tokens", why: "Logout must revoke access. Random tokens are stored as hashes in a session table; scrypt protects passwords.", tradeoff: "Authentication needs a database lookup. Bearer tokens in browser storage remain exposed to XSS, so this is not a claim of complete security." },
    ],
    implementation: [
      { title: "Validate before extraction", body: "Upload limits include MIME, PDF magic bytes, encryption, page count, and decompressed stream size. Extraction stops at an oversized page rather than assembling all text first.", path: "backend/app/pdf.py" },
      { title: "Normalize, then score", body: "Aliases map to a canonical skill vocabulary. Required skills, requested experience, and requested education have configured weights of 70 / 15 / 15. Missing categories are removed and the remaining weights normalized.", path: "backend/app/domain.py" },
      { title: "Retain derived data, not original PDFs", body: "Original documents and extracted text exist in memory during processing. Stored analyses contain structured results. Account deletion cascades to sessions and analyses; automatic retention expiry is absent.", path: "backend/app/repository.py", snippet: "SELECT … FROM analyses\nWHERE id = ? AND user_id = ?" },
    ],
    lessons: ["A model that ignores an injection is a weak test of a boundary. The meaningful test makes the model comply and still verifies that the stored score is unchanged.", "An upload-size cap does not bound decompression or extraction cost. The cheap resource check must happen before the expensive parser."],
    mechanism: {
      title: "Inside the scoring boundary", caption: "An interactive explanation of the implemented pipeline. No document is uploaded and no model is called from this portfolio.",
      steps: [
        { label: "Document", title: "Treat the PDF as untrusted", body: "An authenticated request passes upload and decompression budgets before extraction. PDF processing happens in memory.", signal: "validate → extract → structured resume" },
        { label: "Skills", title: "Canonical names, explicit requirements", body: "Resume skills and job requirements use the same aliases. Preferred skills are disclosed separately and carry no hidden score weight.", signal: "ReactJS → react · Postgres → postgresql" },
        { label: "Score", title: "Fixed rules produce evidence", body: "The active scoring categories are normalized to 100. Their configured weights are 70 for required skills, 15 for experience, and 15 for education.", signal: "70 / 15 / 15 · configured weights" },
        { label: "Commentary", title: "An optional layer outside the contract", body: "The score is already stored. With commentary enabled, a model may explain the evidence; without a provider, the deterministic report still works.", signal: "stored score → optional explanation" },
      ],
    },
    architectureNote: "Authentication and rate limiting precede document processing. The score feeds the report directly as well as through optional commentary; SQL ownership guards later reads.",
    mobileFigure: [{ label: "PDF upload", sub: "authenticated and rate-limited" }, { label: "Validate & extract", sub: "in-memory · stream budget" }, { label: "Parse & normalize", sub: "structured resume + job requirements" }, { label: "Score & persist", sub: "deterministic rules + evidence" }, { label: "Commentary", sub: "optional · cannot rewrite score" }, { label: "Read report", sub: "SQL ownership predicate" }],
  },
  smartlab: {
    title: "SmartLab",
    role: "Applied ML / reproducible experimentation",
    thesis: "The best regression score is not always the best engineering choice.",
    overview: "A GPU-kernel runtime predictor built around evaluation, not only training. The pipeline uses the UCI SGEMM dataset's 241,600 rows, derives features from kernel mechanics, compares five model candidates, and selects under an artifact budget using the downstream configuration-ranking task.",
    takeaway: "Measure the floor. Evaluate the decision. Then choose the model.",
    repository: "https://github.com/nishantchourasia/smartlab",
    sourceNote: "Dataset timings are inherited UCI measurements, not 241,600 new experiments by this project. Model evaluation numbers come from the recorded pipeline outputs. Prediction outputs are distinct from measured runtimes.",
    sources: [{ label: "Generated evaluation report", path: "reports/RESULTS.md" }, { label: "Raw evaluation output", path: "reports/results.json" }, { label: "Mechanistic features", path: "smartlab/features.py" }, { label: "Split integrity tests", path: "tests/test_splits.py" }],
    decisions: [
      { title: "Establish a noise floor first", why: "Four timings per configuration reveal repeatability. That gives model error a meaningful reference: the deployed model sits 3.8× above the measured floor.", tradeoff: "The floor depends on this dataset and timing protocol. It does not establish generalization to another GPU or kernel." },
      { title: "Select for ranking under a size budget", why: "The actual task is choosing fast configurations. A 184 MB forest exceeds the 50 MB artifact budget; boosting remains competitive on bootstrapped selection quality.", tradeoff: "The selected model gives up the forest's lower untuned validation error. The tuned artifact and test metrics are reported separately." },
      { title: "Test interpolation and extrapolation separately", why: "Random splits answer a different question from withholding tile geometries. Group holdouts expose failure outside the sampled configuration space.", tradeoff: "The headline becomes less universal. Error increases on unseen geometries, even while random-split regression looks excellent." },
    ],
    implementation: [
      { title: "14 knobs → 40 features", body: "Features encode work per thread, work-group geometry, vectorization, and local-memory implications. They have physical motivation rather than being a blind polynomial expansion.", path: "smartlab/features.py" },
      { title: "Separate training, validation, and test", body: "Fixed-seed splits are checked for overlap. Randomized tuning uses 3-fold cross-validation, and an ablation reruns the pipeline with raw features only.", path: "smartlab/train.py" },
      { title: "Evaluate the decision distribution", body: "Selection quality is bootstrapped over 300 candidate pools. Inference reports a global typical-error band, not a per-prediction confidence interval.", path: "smartlab/metrics.py" },
    ],
    lessons: ["A model can report an excellent R² while making mediocre top-ranked choices. The evaluation metric must match the action a user will take.", "Random folds on 72 gem5 rows mainly recovered workload identity. Holding out entire workloads exposed the failure that a headline score concealed."],
    mechanism: {
      title: "Choose a model, not a leaderboard winner", caption: "Recorded untuned validation candidates from reports/results.json. The tuned model's test error is a separate result, not another validation row.",
      steps: [
        { label: "Floor", title: "Know what error means", body: "Repeated UCI timings give MAE(log) 0.0053 as a noise-floor estimate. This is a reference, not an improvement claim.", signal: "4 repeats · measured noise floor" },
        { label: "Candidates", title: "Compare accuracy and cost", body: "Mean baseline, ridge, a tree, a forest, and histogram boosting are evaluated under the same pipeline. Artifacts and inference costs are measured too.", signal: "5 candidates · validation split" },
        { label: "Budget", title: "A 184 MB artifact misses the constraint", body: "The forest has lower untuned validation error but exceeds the 50 MB budget. The artifact constraint is part of selection, not an afterthought.", signal: "184 MB > 50 MB · rejected" },
        { label: "Tune", title: "Recheck the constraint after search", body: "The selected boosting artifact grows from 0.6 MB to 9.1 MB after tuning. Its held-out test MAE(log) is 0.0205, still 3.8× above the floor.", signal: "9.1 MB · test MAE(log) 0.0205" },
      ],
    },
    architectureNote: "This is a CLI evaluation and prediction pipeline. No prediction web service or deployed production endpoint is claimed.",
    mobileFigure: [{ label: "UCI SGEMM", sub: "241,600 dataset rows · 4 timings each" }, { label: "Noise floor", sub: "repeatability before training" }, { label: "Features", sub: "14 raw → 40 total" }, { label: "Candidates & tuning", sub: "5 candidates · 3-fold CV" }, { label: "Evaluate & select", sub: "300 pools · 50 MB budget" }],
  },
  campusflow: {
    title: "CampusFlow",
    role: "Backend engineering / security & concurrency",
    thesis: "A valid token is only the beginning of authorization.",
    overview: "A campus platform implemented as a FastAPI modular monolith with PostgreSQL and optional Redis. Enrollment, versioned submissions, grading, and announcements depend on record-level authorization, database invariants, and explicit transaction boundaries rather than trusting the client.",
    takeaway: "The database protects the invariant when requests overlap.",
    repository: "https://github.com/nishantchourasia/campusflow",
    sourceNote: "Concurrency and load figures are recorded repository evidence, measured against PostgreSQL and Redis on a shared host. The site's walkthrough illustrates ordering; it does not run a database or load test.",
    sources: [{ label: "Architecture & invariants", path: "ARCHITECTURE.md" }, { label: "Transactional services", path: "backend/app/services.py" }, { label: "Concurrency & negative controls", path: "tests/test_concurrency.py" }, { label: "Worker queue", path: "backend/app/worker.py" }],
    decisions: [
      { title: "Identity in the token; authority in PostgreSQL", why: "Each request reloads role and active status. Account disablement and demotion affect the next request even when the JWT has not expired.", tradeoff: "A database read adds per-request work. Caching authority would introduce a window of stale privileges." },
      { title: "A course-row lock for capacity", why: "Capacity spans many enrollment rows, so a UNIQUE constraint alone cannot enforce it. FOR UPDATE serializes the count-and-insert sequence for one course.", tradeoff: "Requests for the same course wait. Independent courses do not share that row lock, and conflicts remain explicit responses." },
      { title: "An outbox in the same transaction", why: "Publishing records a queue job atomically. Workers claim unlocked rows with SKIP LOCKED and fan out notifications without holding the HTTP request open.", tradeoff: "Queue work shares the database. Backoff, failure records, and idempotent notification inserts are still necessary." },
    ],
    implementation: [
      { title: "Two authorization gates", body: "The permission matrix checks the action's role, then service-level scope checks the specific record. Actor-scoped reads and writes refuse cross-user access independently of the frontend.", path: "backend/app/authz.py" },
      { title: "Choose concurrency mechanisms per invariant", body: "UNIQUE handles duplicate enrollment; FOR UPDATE handles capacity; ON CONFLICT updates attendance; optimistic retry numbers submission attempts; SKIP LOCKED lets workers claim different jobs.", path: "backend/app/services.py", snippet: "SELECT … FROM courses\nWHERE id = %s FOR UPDATE\n-- count and insert inside the same transaction" },
      { title: "Audit and retry with the write", body: "Audit records commit with domain mutations. The queue records attempts, returns failed jobs to pending with exponential backoff, and leaves exhausted jobs visible for inspection.", path: "backend/app/worker.py" },
    ],
    lessons: ["A passing concurrency test may mean the requests never overlapped. Removing the lock and reproducing over-capacity is what makes the protected test informative.", "A load script that logs in every iteration can benchmark password hashing and rate limits instead of the intended endpoint. The test harness needs scrutiny too."],
    mechanism: {
      title: "One course. Two competing requests.", caption: "Illustrative transaction ordering for the implemented enrollment lock. The recorded stress case separately admits exactly 10 of 40 students into 10 seats.",
      steps: [
        { label: "Authorize", title: "A token is not permission", body: "The backend reloads the actor and checks role and record scope. The UI is not a security boundary.", signal: "identity → role → scope" },
        { label: "Lock", title: "Request A holds the course row", body: "FOR UPDATE acquires a row lock before counting enrollments. Request B waits for that same row instead of trusting a stale count.", signal: "A: holds lock · B: waiting" },
        { label: "Commit", title: "Count, insert, audit, commit", body: "The seat check and insertion share one transaction. The audit write belongs to that transaction; a failure rolls the mutation back.", signal: "count → insert → audit → COMMIT" },
        { label: "Recheck", title: "The next request sees committed state", body: "When B acquires the lock it checks the updated course state. A full course produces an explicit conflict instead of an extra enrollment.", signal: "B: recheck capacity → 409 if full" },
      ],
    },
    architectureNote: "PostgreSQL owns locking, constraints, audit rows, and the outbox. Redis is optional for catalog caching and rate limiting; it does not provide the durable job queue.",
    mobileFigure: [{ label: "Client request", sub: "register / enroll / submit / grade" }, { label: "FastAPI", sub: "validation + actor lookup" }, { label: "Authorization", sub: "permission matrix + record scope" }, { label: "Transaction", sub: "course-row lock + audit" }, { label: "PostgreSQL", sub: "constraints + versioned submissions" }, { label: "Outbox worker", sub: "SKIP LOCKED · retry · notifications" }],
  },
  "hardware-prefetcher": {
    title: "Hardware Prefetcher",
    role: "M.Tech architecture project / research brief",
    thesis: "Bring the next cache line closer before the processor asks for it.",
    overview: "A hardware-prefetching design and evaluation direction described in the supplied project notes, using ChampSim, C++, and Linux. The predictor implementation, traces, configuration, and run outputs are not present in this workspace. This page documents the technical question and an evaluation plan; it does not stand in for completed experiments.",
    takeaway: "A correct prediction must also arrive in time to be useful.",
    repository: null,
    sourceNote: "Source: the supplied portfolio master notes. No local prefetcher repository or benchmark output was found. All architecture drawings here are conceptual and all performance results are not yet measured.",
    sources: [],
    decisions: [
      { title: "Evaluate against an explicit baseline", why: "Planned: compare the chosen predictor with a no-prefetch baseline on the same trace and simulator configuration.", tradeoff: "No trace set or reproducible baseline is supplied yet, so no comparative result can be stated." },
      { title: "Separate prediction from performance", why: "Planned: report IPC and MPKI alongside prefetch usefulness and traffic. Predicting an address is not itself a demonstrated speedup.", tradeoff: "Aggressive fetching can increase bandwidth pressure or evict useful lines. These effects need experiments, not an illustrative animation." },
      { title: "Keep the predictor policy open", why: "The notes establish the project area and tools, but not an implemented algorithm. A stride-like example below explains the idea without naming a final design.", tradeoff: "Storage budget, training rules, degree, and distance cannot be documented as implementation decisions until the source is available." },
    ],
    implementation: [
      { title: "ChampSim integration", body: "Named in the supplied notes. Predictor hooks, configuration, and build files are unavailable here, so the integration is unverified." },
      { title: "Predictor state and update rules", body: "Pending source inspection. No claim is made about a stride table, history table, replacement policy, or confidence mechanism." },
      { title: "Reproducible evaluation", body: "Planned: publish trace identifiers, warmup and ROI settings, baseline configuration, raw statistics, and the comparison procedure together." },
    ],
    lessons: ["The engineering question is not only whether the next address is predictable. Timeliness, cache pollution, and memory traffic determine whether a prediction helps.", "Until a baseline and raw run output are available, a visual explanation can communicate intent but cannot establish a performance result."],
    mechanism: {
      title: "From an access stream to a prediction", caption: "Conceptual equal-stride example only. This is not the project's verified algorithm, a simulator run, or a performance measurement.",
      steps: [
        { label: "Observe", title: "Demand accesses reveal a pattern", body: "The illustrative stream visits A, B, C, and D in order. Real traces contain interleaved accesses that may not form this clean pattern.", signal: "A → B → C → D" },
        { label: "Predict", title: "Form a candidate address", body: "In this conceptual example the next candidate is E. A real predictor needs documented state and rules to decide whether to issue it.", signal: "A → B → C → D → E?" },
        { label: "Fetch", title: "Request before demand", body: "A useful prefetch must reach the cache before the demand access. Issuing too early or too late can waste bandwidth or cache space.", signal: "prediction → request → cache" },
        { label: "Evaluate", title: "Measure against no prefetch", body: "Compare IPC, MPKI, and traffic under the same workload and measurement window. No values are available yet.", signal: "IPC / MPKI / traffic · not yet measured" },
      ],
    },
    architectureNote: "Planned experimental pipeline, not a verified implementation. ChampSim and the predictor are named in the notes; the trace set and measurement protocol still require source evidence.",
    mobileFigure: [{ label: "Demand stream", sub: "conceptual access history" }, { label: "Predictor", sub: "policy not verified" }, { label: "Prefetch request", sub: "candidate cache line" }, { label: "Cache", sub: "timeliness and pollution matter" }, { label: "Evaluation", sub: "no verified IPC or MPKI yet" }],
  },
};

/** View data for the six distinct mechanism illustrations. */
export interface MechanismVisualData {
  labels: string[];
  footnote?: string;
  shardCount?: number;
  command?: string;
  rows?: { label: string; ratio: number; ipc: string }[];
  weights?: { label: string; value: number }[];
  panels?: { label: string; value: string; detail: string; note?: string }[];
  lanes?: { label: string; states: string[]; queries: string[] }[];
  addresses?: string[];
  sequence?: string[];
}
export const mechanismVisuals: Record<string, MechanismVisualData> = {
  swiftkv: { labels: ["RESP / single node", "request in flight", "append → acknowledge", "64 independent shards"], command: "SET key value", shardCount: 64 },
  cachelab: {
    labels: ["Effective capacity / Δ IPC · Simulated"],
    rows: [{ label: "Baseline", ratio: 1, ipc: "+0.00%" }, { label: "FP-H", ratio: 1.972, ipc: "−0.09%" }, { label: "HyComp", ratio: 1.827, ipc: "−0.10%" }],
    footnote: "Same workload and core count. Baseline capacity is the normalized 1× reference.",
  },
  resumelens: {
    labels: ["Resume + job", "skills → canonical names", "Authoritative / fixed rules", "Configured weights; active categories are normalized.", "Outside the score boundary", "Optional LLM commentary", "Explains evidence · does not rewrite the score"],
    weights: [{ label: "Skills", value: 70 }, { label: "Experience", value: 15 }, { label: "Education", value: 15 }],
  },
  smartlab: {
    labels: [],
    panels: [
      { label: "Measured noise floor", value: "0.0053", detail: "MAE(log) · four timing repeats" },
      { label: "Untuned forest / validation", value: "184 MB", detail: "MAE(log) 0.0229", note: "Exceeds 50 MB budget" },
      { label: "Tuned boosting / test", value: "9.1 MB", detail: "MAE(log) 0.0205", note: "3.8× above the floor" },
    ],
  },
  campusflow: {
    labels: ["course row", "A owns row", "course row", "B rechecks"],
    lanes: [
      { label: "Request A", states: ["Authorize", "Row locked", "Committed", "Seat recorded"], queries: ["SELECT … FOR UPDATE", "SELECT … FOR UPDATE", "INSERT + audit → COMMIT", "INSERT + audit → COMMIT"] },
      { label: "Request B", states: ["Authorize", "Waiting", "Lock available", "Conflict if full"], queries: ["same course · independent request", "same course · independent request", "same course · independent request", "updated count → 409 if full"] },
    ],
  },
  "hardware-prefetcher": {
    labels: ["Conceptual access stream · equal stride"], addresses: ["A", "B", "C", "D", "E?"], sequence: ["Observe", "Predict", "Request", "Evaluate"],
    footnote: "A clean example explains intent. Real traces and a verified policy are still needed.",
  },
};
