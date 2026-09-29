# PROJECT STATUS

Single source of truth for what is **actually done** in this portfolio.

This file exists so that nothing is ever oversold. If a box is not ticked, the
work does not exist yet. If a number is not marked **Measured**, it did not come
from a real run.

Last updated: 2026-09-29

> **A dated snapshot, kept as written.** This file was maintained inside a single
> working tree, and it describes the state on the date above, before the
> projects were published as separate repositories. Paths such as
> `smartlab/reports/` or `cachelab/data/` now refer to those repositories, and
> statements such as "no git remote" were true when written. Two headings that
> once misdescribed a project have been corrected: SwiftKV is single-node, and
> SmartLab predicts GPU kernel runtime.

---

## Status legend

| Mark  | Meaning |
|-------|---------|
| `[ ]` | Not started |
| `[~]` | In progress — code exists, not finished or not verified |
| `[x]` | Done — implemented **and** verified (tests written *and* run *and* passing) |
| `[!]` | Blocked — cannot be completed or verified in this environment (reason given) |

A box only becomes `[x]` after the command was actually executed and its output
recorded. "It should work" is `[~]`, never `[x]`.

## Evidence labels

Every number anywhere in this repository carries one of these labels:

| Label | Meaning |
|-------|---------|
| **Measured** | Produced by a real run on real hardware. Raw output is committed under the project's `docs/` or `results/`. |
| **Simulated** | Produced by gem5 (a simulator). Real output, but of a model — not silicon. |
| **Estimated** | Derived or extrapolated by calculation. The formula is shown. |
| **Predicted** | Output of an ML model. Never presented as a measurement. |
| **Not yet measured** | The test exists or is planned, but has not been run. |

---

## Environment constraints (discovered 2026-08-25)

These are real limits of the machine this portfolio is being built on. They are
recorded here because they change what can honestly be claimed.

| # | Constraint | Impact | How it is handled |
|---|-----------|--------|-------------------|
| 1 | **No Docker daemon access.** User `nishant` is not in the `docker` group and has no passwordless sudo. | Dockerfiles and Compose files can be *written* but **cannot be built or run** here. | They ship as reviewed-but-unverified config, marked `[!]`. Never claimed as "tested". |
| 2 | **Root filesystem 98% full** (8.6 GB free on `/`). | `npm`, `pip`, and conda default to `$HOME` on `/`. Filling it would break the machine. | All caches, envs and data are redirected to `/data`. See RUNBOOK. |
| 3 | **20 gem5 jobs currently running** (load avg ~18). | The HyComp research sweep is live. Killing or editing it would destroy days of compute. | CacheLab treats `HyComp/` as **read-only**. It never re-runs or modifies it. |
| 4 | **No PostgreSQL / Redis system packages**, and no root to install them. | ResumeLens and CampusFlow need a real database and cache. | Installed into a userspace **conda env on `/data`** (PostgreSQL 18, Redis 8 from conda-forge). Real servers, no root, no Docker. |
| 5 | **No k6 / wrk / ab / locust installed.** | Load testing needs a tool. | k6 ships as a single static binary (no root) → `/data/.../tools/bin`. SwiftKV uses a purpose-built C++ benchmark client, because no off-the-shelf tool speaks its TCP protocol. |
| 6 | **gcc 11.4** — C++20 is mostly supported, but `<format>` is not (needs gcc 13). | SwiftKV cannot use `std::format`. | Verified working: concepts, ranges, `std::jthread`, atomics. SwiftKV targets that subset. |

Resources available: **512 CPUs, 503 GB RAM, 5.5 TB free on `/data`.** Compute is
not a constraint; disk on `/` and permissions are.

---

## 1. SwiftKV — C++20 single-node key-value store

| Area | Status |
|------|--------|
| Architecture design | `[x]` ARCHITECTURE.md |
| Storage engine (sharded hash table) | `[x]` written, tested |
| LRU cache (entry + byte bounds) | `[x]` written, tested |
| Protocol parser (RESP) | `[x]` written, tested |
| TCP server (epoll multi-reactor) | `[x]` written, tested |
| Concurrency model | `[x]` verified under ThreadSanitizer |
| Client library | `[x]` written, used by tests and benchmark |
| Persistence (append-only log) | `[x]` written, tested |
| Crash recovery + log compaction | `[x]` verified with SIGKILL |
| Observability (INFO + Prometheus metrics) | `[x]` written, tested |
| Server-side latency percentiles | `[x]` written, tested (M1) |
| HTTP endpoints `/health` `/ready` `/metrics` `/stats.json` | `[x]` written, tested (M1) |
| Web dashboard (live data, no hardcoded values) | `[x]` written, tested (M1) |
| Graceful shutdown (phased drain) | `[x]` written, tested (M2) |
| Mass-disconnect handling | `[x]` 5 scenarios pass (M2) |
| Descriptor-leak verification | `[x]` 4 scenarios pass (M2) |
| Benchmark client | `[x]` written, run |
| Performance characterisation harness (CPU/RSS/repeats) | `[x]` written, run (M3) |
| Throughput vs connections / mix / IO threads / persistence | `[x]` 170 runs, medians + IQR (M3) |
| BENCHMARK.md | `[x]` written from measured data (M3) |
| Unit tests | `[x]` 97 cases passing |
| Integration tests | `[x]` 30 cases, real sockets |
| Load test (10/50/100/200/500 clients) | `[x]` run, results committed |
| Stress test (to 4,000 connections) | `[x]` run, results committed |
| Reliability test (SIGKILL/restart) | `[x]` 9/9 checks pass |
| Security review + threat model | `[x]` SECURITY.md, 12 threats |
| README / ARCHITECTURE / RUNBOOK / TESTING / SECURITY / INTERVIEW | `[x]` written |
| **Multi-node cluster (3 nodes)** | `[ ]` **not built** |
| **Replication** | `[ ]` **not built** |
| **Node failure handling** | `[ ]` **not built** (single-node recovery is done) |
| CLI (`swiftkv-cli`) | `[ ]` not built — `redis-cli` works, protocol is compatible |
| `BGREWRITEAOF` command | `[ ]` compaction works but is not reachable as a command |
| Docker | `[!]` blocked — no daemon (constraint 1) |
| CI/CD | `[ ]` |

### Verified 2026-08-25 — commands actually run

| Check | Result |
|-------|--------|
| `ctest --test-dir build` | **212 cases, 57,981 assertions, 9/9 binaries pass** in 2.77 s |
| ThreadSanitizer | Clean — **0 races across all 9 suites** |
| AddressSanitizer + UBSan | Clean — **0 errors across all 9 suites** |
| Graceful shutdown under live `SIGTERM` | Drained cleanly in 23 ms; 55,859 keys recovered exactly |
| Compiler warnings | Zero (`-Wall -Wextra -Wpedantic -Wshadow -Wconversion`) |
| `scripts/run_reliability_test.sh` | **9/9 pass** under real `SIGKILL` |
| `scripts/run_load_test.sh all` | Completed; CSVs committed |

### Benchmark results — Measured

Environment: AMD EPYC 9754, 512 cores, gcc 11.4 `-O3`, loopback, **while 18 gem5
jobs were running** (load ~26). Raw data: `swiftkv/docs/results/`.

| Connections | Throughput | p50 | p99 | Errors |
|------------:|-----------:|----:|----:|-------:|
| 10 | 219,019 ops/s | 0.023 ms | 0.047 ms | 0 |
| 50 | **447,295 ops/s** | 0.063 ms | 0.153 ms | 0 |
| 100 | 400,100 ops/s | 0.180 ms | 0.383 ms | 0 |
| 500 | 294,793 ops/s | 1.030 ms | 1.097 ms | 0 |

Stress to 4,000 connections: throughput holds at ~380,000 ops/s, latency grows
linearly, **error rate 0.000% throughout**.

Caveat recorded in the README: the harness is closed-loop, so percentiles are
optimistic under saturation (coordinated omission).

### M3 performance characterisation — Measured 2026-08-26

170 runs, 36 configurations, 5 repeats each, medians with interquartile ranges.
Taken at load average ~4.1 (5 gem5 jobs), so **not comparable** with the table
above, which was taken at load ~26. Full report: `swiftkv/BENCHMARK.md`.

| Finding | Result |
|---------|--------|
| Peak throughput | **1,635,084 ops/s** at 64 event loops |
| Event-loop scaling | Near-linear to 16 (89%), useful to 32 (72%), flattens after |
| Throughput per CPU core | 60,000–68,000, constant until 64 loops |
| Latency knee (8 loops) | 32 connections — 530,194 ops/s, p99 0.074 ms |
| Reads vs writes | Reads **11% faster**; 4.3 MB vs 16.2 MB RSS |
| AOF `everysec` vs `never` | **Indistinguishable** (0.7%, inside run-to-run noise) |
| AOF `sync=always` | **102× slower** (3,497 ops/s, p50 25.9 ms) |
| Memory | 4.3–16.2 MB RSS; ~18 KB per connection |
| Errors across all 170 runs | **0** |

**A README claim was corrected by this work.** It previously reported writes
faster than reads from a single unrepeated run; the repeated measurement shows
the opposite, and the earlier hypothesis behind it was not supported.

### A real bug found and fixed

ThreadSanitizer caught `Server::stop()` closing the listening socket while the
acceptor thread was still calling `accept` on it. Beyond the race, the freed
descriptor number could be reused by a newly accepted client. Fixed by joining
the acceptor before closing the listener — which also cut the test suite from
12.3 s to 1.4 s.

---

## 2. CacheLab — gem5 LLC compression research (SRAM L3; no STT-RAM)

Built on **existing, already-running** HyComp research. Source data is read-only.

> **Workspace separation policy.** The gem5 research tree is a **separate,
> live project**. CacheLab never reads it directly and never writes to it. A
> one-way export copies finished runs into `cachelab/data/raw_export/`, and all
> downstream stages read only that copy. This is enforced by code and covered
> by tests, not left to convention.

| Area | Status |
|------|--------|
| Inventory of existing HyComp results | `[x]` complete (see below) |
| Safe read-only export from gem5 tree | `[x]` written, tested, run |
| gem5 `stats.txt` parser | `[x]` written, tested |
| Stats ingestion pipeline | `[x]` written, run on 82 runs |
| Data validity classification | `[x]` written, tested, run |
| Results + validity reports | `[x]` generated from real data |
| CLI (`export` / `build` / `status`) | `[x]` working |
| Reproducible experiment config | `[ ]` |
| Research dashboard | `[ ]` |
| Methodology page | `[ ]` |
| Novelty statement (evidence-backed) | `[ ]` |
| STT-RAM extension | `[!]` see finding below — **not present in the data** |
| README | `[x]` written 2026-09-29, during the GitHub migration |
| ARCHITECTURE / RUNBOOK / TESTING / INTERVIEW | `[ ]` |

**Verified 2026-08-25 — commands actually run:**

| Check | Result |
|-------|--------|
| Test suite | 57/57 pass |
| Export | 82 finished runs copied (164 files, 234 MB); 14 still-running runs skipped |
| Source tree integrity | Fingerprint **byte-identical** before and after export; all 19 gem5 jobs kept running |
| Dataset build | 82 runs ingested, **72 valid (87.8%)**, 10 excluded with published reasons |

### Finding: STT-RAM is not present in this research — Measured by inspection

The portfolio brief described CacheLab as *"STT-RAM + LLC compression"* with a
progression Baseline SRAM → STT-RAM → STT-RAM+Compression → STT-RAM+Write-Aware
Compression.

**That progression does not exist in the data.** The gem5 configuration files
state it explicitly:

> `spec2017_hycomp.py:35` — *"**The L3 is SRAM. There is no STT-RAM option
> anywhere in this script.**"*
> `l3cache.py:29` — *"This is an SRAM L3 only. There is deliberately no STT-RAM
> option anywhere in..."*

The existing work varies the **compression scheme on an SRAM L3** (4 MiB,
16-way, 20-cycle). It is strong research — 8 schemes including a brute-force
optimality reference — but it is not STT-RAM research.

CacheLab will therefore describe what was measured, and will not claim STT-RAM
results. Whether to add STT-RAM as a genuine simulated dimension, as a clearly
labelled analytical overlay, or not at all, is an open decision recorded in
CacheLab's README.

### Data validity outcome — Simulated

| Excluded | Runs | Reason |
|----------|------|--------|
| 2-core `505.mcf_r` (all 8 schemes) | 8 | ROI measured 20,000,000 instructions — exactly the sampling-window size — against a 250,000,000 target. Compression is deliberately not applied during sampling, so those ratios (1.0001 for ZCA, 1.0004 for BDI) are artefacts. |
| 8-core `519.lbm_r` (2 schemes) | 2 | Group has no baseline yet — that part of the sweep is still running. Will resolve on its own. |

This independently reproduces the `valid_roi=False` marking in the prior ad-hoc
analysis, arrived at from the raw stats rather than copied from it.

**What already exists upstream (verified by inspection, 2026-08-25):**

**What already exists upstream (verified by inspection, 2026-08-25):**

| Item | State |
|------|-------|
| Schemes compared | 8 — `none`, `zca`, `bdi`, `sc2`, `fph`, `cpack_z`, `brute_f`, `hycomp` |
| Benchmarks | 4 SPEC CPU2017 — `502.gcc_r`, `505.mcf_r`, `519.lbm_r`, `538.imagick_r` |
| Core counts | 2, 4, 8, 16 |
| Sweep jobs completed OK | 82 (2-core: 32, 4-core: 32, 8-core: 18) — **Simulated** |
| Parsed results | 64 rows for 2-core + 4-core, all 8 schemes × 4 benchmarks |
| 8-core sweep | In progress at time of writing |
| 16-core checkpoints | Previously failed (`NO_CHECKPOINT`, exit 137 = killed). Currently being retaken. |
| Metrics already parsed | IPC, ROI cycles/insts, L3 MPKI, L3 miss rate, compression ratio, databits ratio, resident blocks, compressions, failed compressions |

CacheLab **consumes** this. It does not re-run gem5.

---

## 3. ResumeLens — AI resume/job matching platform

| Area | Status |
|------|--------|
| Architecture design | `[x]` `resumelens/ARCHITECTURE.md` |
| Database schema + migrations | `[x]` migrations 001+002 applied to an empty PostgreSQL 18.6 database; column types, constraints, indexes and cascade asserted |
| Authentication | `[x]` scrypt (RFC 7914, per-user salt), opaque 256-bit session tokens stored as SHA-256, 12 h expiry, logout revokes — 20 tests |
| Authorization / user isolation | `[x]` ownership in the `WHERE` clause; 21 tests incl. IDOR, enumeration, 404-not-403; re-verified on live PostgreSQL |
| PDF upload + validation | `[x]` MIME, magic-byte, size, encryption, 50-page and decompressed-stream limits — 17 tests |
| Compression-bomb defence | `[x]` found and fixed: 64 KB bomb went from >120 s to rejected in 0.13 s |
| Resume parsing → structured JSON | `[x]` deterministic parser tested |
| Skill extraction + normalization | `[x]` documented alias vocabulary, tested |
| Deterministic scoring engine | `[x]` fixed rules + evidence, tested |
| LLM qualitative layer | `[~]` opt-in OpenAI adapter, 7 boundary tests incl. a complying-model injection test; **no live key or real request verified** |
| Analysis history | `[x]` list, read and delete endpoints, owner-scoped, plus frontend history view |
| Frontend (React/TS/Tailwind) | `[x]` auth, upload, history, delete; `npm run build` clean under strict TS; Tailwind v4 confirmed emitting CSS |
| Rate limiting | `[x]` sliding window: login 10/5 min, register 5/h per IP, analysis 20/h per user — 12 tests incl. 200-thread concurrency |
| Prompt-injection defence | `[x]` architectural: score is stored before the model is called. Tested with a model that fully complies with the injection |
| Data deletion / retention | `[~]` deletion complete (per-analysis, account, cascade, temp-file cleanup, 11 tests). **No automatic retention expiry** — deliberate and documented, not claimed |
| Response hardening | `[x]` nosniff, DENY, no-referrer, no-store; traceback and credential leakage tested |
| Unit + API tests | `[x]` **107 passed, 12 skipped** (SQLite) and **119 passed** (live PostgreSQL 18.6), 2026-09-26 |
| File-upload security tests | `[x]` spoofed MIME/magic, 6 malformed documents, bombs, page and text limits |
| Load test (P50/P95/P99) | `[ ]` |
| Security review + threat model | `[x]` `resumelens/SECURITY.md` — Threat→Risk→Mitigation→Test, every row naming a test that runs |
| Docker | `[!]` blocked — no daemon (constraint 1). Hardened (non-root UID, pinned base, no default DB password) but **never built or run** |
| CI/CD | `[ ]` |
| README / ARCHITECTURE / RUNBOOK / TESTING / SECURITY / INTERVIEW | `[x]` rewritten for the auth/isolation model; measured results only |

**Load test results:** Not yet measured.

**Measured, 2026-09-26:**

| Check | Result |
|---|---|
| Test suite, SQLite | 107 passed, 12 skipped, 12.35 s |
| Test suite, live PostgreSQL 18.6 | 119 passed, 0 skipped, 14.08 s |
| Frontend build | clean, strict TypeScript, 19 modules |
| Live uvicorn + PostgreSQL over HTTP | owner `200`, non-owner `404`, anonymous `401` |
| Compression bomb, 64 KB / 41 MB stream | rejected in 0.13 s (was: >120 s) |

> **Note:** an LLM API key is required for live qualitative commentary. The
> deterministic pipeline is verified without one, so it degrades gracefully
> rather than failing. The live provider path remains unverified.

> **Known gaps, stated plainly:** rate-limit counters are per process, so
> horizontal scaling weakens them; there is no automatic retention expiry, no
> password reset, no 2FA, no audit log and no encryption at rest; Docker is
> written but untested here.

---

## 4. SmartLab — GPU kernel runtime prediction

| Area | Status |
|------|--------|
| Problem definition + metric chosen before modelling | `[x]` `smartlab/ARCHITECTURE.md` §1, §6 |
| Dataset: UCI SGEMM GPU kernel performance | `[x]` 241,600 measured configurations, SHA-256 verified on fetch |
| Data validation | `[x]` schema, nulls, out-of-range, non-positive runtimes, duplicate configurations — 10 tests |
| EDA (6 questions, each driving a decision) | `[x]` `reports/EDA.md` + 4 figures |
| Measurement-noise floor | `[x]` **MAE(log) ≥ 0.0053, R² ≤ 0.99990**, from the 4 repeats per configuration |
| Feature engineering | `[x]` 14 raw + 26 derived, mechanistically motivated |
| Feature-engineering ablation | `[x]` measured: **23.9% lower test MAE** than raw parameters alone (0.0269 → 0.0205) |
| Train/validation/test split + leakage guards | `[x]` 60/20/20, verified; guards have tests that make them fire |
| Baseline model | `[x]` mean baseline MAE(log) 0.9605, R² 0 |
| Multiple models with stated rationale | `[x]` 5 candidates, each adding one capability |
| Hyperparameter tuning | `[x]` randomised search, 3-fold CV, accepted/rejected on validation |
| Evaluation (MAE / RMSE / R² / relative error) | `[x]` see `reports/RESULTS.md` |
| **Task-aligned selection metric** | `[x]` bootstrapped over 300 candidate pools — a single pool is n=1 and swung 0%→37% |
| Model size + latency as selection criteria | `[x]` the most accurate candidate is **184 MB** and was excluded by a 50 MB budget; the deployed model is **9.1 MB** |
| Error analysis | `[x]` by runtime decile, by parameter level, against measurement noise |
| Interpretability | `[x]` permutation importance; top feature is an engineered quantity |
| Learning curve | `[x]` 0.3% → 60% of the space; **saturates past ~15%** — the last doubling does not improve MAE |
| Extrapolation diagnostic | `[x]` unseen tile geometry **2.2x worse** (16 folds), a quarter withheld **4.4x worse** (5 seeds), reported separately |
| gem5 small-data counterexample | `[x]` R²=0.9999 shown to be an artefact; true extrapolation **R²=−1.29** |
| Reproducibility | `[x]` fixed seed, pinned versions, checksummed dataset, generated results — **full pipeline re-run reproduced every metric** |
| Model persistence + inference | `[x]` whole pipeline saved with metadata; CLI predict/rank |
| Tests | `[x]` **74 passed, 0 failed** in ~6s — per-file breakdown in `smartlab/TESTING.md` |
| README / ARCHITECTURE / RUNBOOK / TESTING / INTERVIEW | `[x]` written |
| Prediction web interface | `[ ]` CLI only — deliberate, the ML system is the product |
| Docker | `[ ]` not attempted (no daemon; would be `[!]`) |
| CI/CD | `[ ]` |

**Model metrics:** see the measured table in `smartlab/reports/RESULTS.md`.
Regenerate with `python -m smartlab.cli report`.

> **What this project is really about.** The headline model is accurate, but the
> findings worth defending are negative ones. First, the most accurate candidate
> (random forest, validation MAE 0.0229) serialises to a measured **184 MB** and
> is no better at the actual job than a boosting model — so the deployed model
> is chosen by task-aligned selection quality under a 50 MB budget, not by MAE.
> Second, the selection metric itself was initially measured on a single
> candidate pool, an n=1 statistic: bootstrapped, the deployed model's top-1
> choice is optimal in 48% of pools and 12.0% slower at the p90, so one pool
> could have reported almost anything. It is now bootstrapped over 300 pools.
> Third, the learning curve **saturates** past ~15% of the space, so the
> remaining error needs a better model, not more measurements.

> **Honest scope.** One GPU, one matrix size. The model interpolates within the
> configuration space it sampled and degrades 2.2x on an unseen tile geometry
> (4.4x when a quarter are withheld). It sits **3.8x above** the
> measurement-noise floor, so it is not noise-limited — there is real headroom
> left. Deployed artifact 9.1 MB; test MAE(log) 0.0205.

---

## 5. CampusFlow — campus management platform

| Area | Status |
|------|--------|
| Threat model written before the auth code | `[x]` `campusflow/THREAT_MODEL.md` — 15 threats, each with the test that checks it |
| Architecture design + decision records | `[x]` `campusflow/ARCHITECTURE.md` — alternatives named and rejected, not just choices listed |
| Database schema + migrations | `[x]` 12 tables, 8 triggers, 39 indexes, 22 CHECK constraints; forward-only SQL migrations, idempotent |
| PostgreSQL exercised for real | `[x]` **18.6**, actual server — every constraint, trigger, cascade and index tested against it |
| Authentication (JWT + scrypt) | `[x]` HS256 pinned, no default secret, scrypt n=2^15 with parameters stored per hash |
| **RBAC (student/faculty/admin)** | `[x]` declarative permission matrix + per-record scope checks, deny by default |
| Authorization tests | `[x]` **54** model tests + **69** API security tests |
| Student / faculty / admin modules | `[x]` complete workflows, not endpoint collections |
| Transactions + concurrency control | `[x]` UNIQUE, `SELECT FOR UPDATE`, `SKIP LOCKED`, optimistic retry — each justified |
| **Concurrency tests, races reproduced** | `[x]` **12/12**, including **2 negative controls** that assert the race happens without the fix |
| Redis caching | `[x]` catalog only, 60s, explicit invalidation; authorization data deliberately never cached |
| Rate limiting | `[x]` per-email **and** per-IP; Redis-backed shared backend implemented and tested (15 tests) |
| Background jobs | `[x]` transactional outbox in PostgreSQL, `FOR UPDATE SKIP LOCKED`, backoff, idempotent fan-out |
| Notifications | `[x]` delivered by the worker; recipients resolved at delivery time |
| Audit logging | `[x]` append-only, commits in the same transaction as its change, survives account deletion |
| Observability | `[x]` JSON logs, request ids, 3 separate streams, `/metrics`, `/health` vs `/ready` |
| Input validation | `[x]` `extra="forbid"` everywhere; every work-sizing input bounded |
| Pagination | `[x]` every collection; sort keys allow-listed, depth capped |
| Frontend (React/TS) | `[x]` builds clean under `strict`; 189 kB JS (57 kB gzipped) |
| API documentation | `[x]` generated OpenAPI at `/docs`; `GET /api/permissions` serves the live matrix |
| Unit + integration tests | `[x]` **284 passed, 1 skipped** in 27.8s |
| Load test | `[x]` k6 v1.3.0; concurrency sweep, worker scaling, per-endpoint cost |
| Security review | `[x]` `THREAT_MODEL.md` §2 and §3; 10 accepted risks listed with fixes |
| README / ARCHITECTURE / RUNBOOK / TESTING / THREAT_MODEL / INTERVIEW | `[x]` written |
| Docker | `[!]` **written, never built** — the account is not in the `docker` group and sudo needs a password (constraint 1). Verified: `docker ps` → `permission denied ... /var/run/docker.sock` |
| CI/CD | `[ ]` not set up |
| Timetabling (classrooms, schedule conflicts) | `[ ]` **deliberately out of scope** — a real scheduling problem; a shallow version would have diluted what is done properly |
| Password reset / 2FA / encryption at rest | `[ ]` out of scope, recorded as accepted risks A-4, A-5, A-6 |

**Test results:** `284 passed, 1 skipped` in 27.8s against real PostgreSQL 18.6 and
Redis 8.10.1. The skip is a rate-limiter test that yields when a shared IP bucket
trips first; the property it covers is asserted separately as a unit test.

**Concurrency results (measured, `docs/results/concurrency_tests.txt`):**

| Scenario | Expected | Actual |
|---|---|---|
| 50 simultaneous enrollments, one student, one course | 1 enrollment | **1** (1 success, 49 conflicts) |
| 40 students into a 10-seat course | 10 enrolled | **10** (30 refused) |
| Same, with `FOR UPDATE` removed (negative control) | over-capacity | **over-capacity** — the race is real |
| 30 unlocked threads, same row, constraint only | 1 row | **1** (29 UniqueViolations) |
| 12 concurrent HTTP enrollments, 2-seat course | 2 | **2** `201` + 10 `409` |
| 8 workers, 8 queued jobs | each once | **each once** |

**Load test results (measured, `docs/results/`):** single uvicorn worker —
p50 **2.20 ms** at 1 VU, **110 ms** at 50 VUs, throughput flat at ~430 rps.
Scaling workers: 1 → **409 rps**, 2 → **811**, 4 → **825**, 8 → **824**. The
plateau after 2 workers was traced to per-request work, not worker count:
`/health` 1373 rps, `/api/auth/me` 1004 rps, `/api/courses` 839 rps. Measured on a
**shared** machine over loopback, so figures exclude network latency and are
noisier than a dedicated host — stated in `docs/results/environment.txt`.

> **What this project is really about.** The hard part is authorization, and the
> adversary is an authenticated insider — every student already has a valid token.
> Two things are worth defending in an interview. First, the permission model is a
> declarative matrix plus database-backed per-record scope checks, with the role
> re-read from PostgreSQL on **every request**, so a demotion takes effect
> immediately despite stateless tokens. Second, the concurrency claims are backed
> by **negative controls**: tests that remove the lock and assert the course *does*
> get over-subscribed. Without those, a passing race test might only mean the
> threads never overlapped.

> **A real bug the tests found.** The schema's "content is present" checks were
> `length(trim(x)) > 0`. SQL's `trim()` strips only spaces, so a submission of
> `E'\n\t '` passed. Every "not blank" column had the same flaw. Found only
> because `test_constraints.py` writes raw SQL directly to PostgreSQL, bypassing
> Pydantic. Now `CHECK (x ~ '[^[:space:]]')`, with a test covering all six columns.

> **Honest scope.** No timetabling, no file uploads, no password reset, no 2FA, no
> encryption at rest, no CI, and Docker is unverified. A token cannot be revoked
> before its 30-minute expiry, though disabling an account *is* immediate. Without
> Redis the rate limiter is per-process and permits N× the limit across N
> instances — reported at `/health` rather than glossed over.

---

## 6. Portfolio website

| Area | Status |
|------|--------|
| Hero / Projects / Technical focus / Research / About / Contact | `[x]` React 18 + TypeScript + Vite, plain CSS |
| Project detail pages (5) | `[x]` problem, approach, diagram, decisions, results, challenges, limitations |
| Project content wired to real results | `[x]` every figure copied from this file or a project's generated results, and rendered with its evidence label |
| Architecture diagrams | `[x]` inline SVG generated from each project's stage list |
| Accessibility | `[x]` **0 of 41 text styles below WCAG AA** in either theme; skip link; 9/9 tabbed elements show a focus ring under real key events; reduced motion respected |
| Responsive | `[x]` no horizontal overflow at 500 / 768 / 1024 / 1440 / 1920 px |
| SEO metadata | `[~]` title, description, Open Graph, Twitter, JSON-LD, robots.txt. **`og:url`, `og:image`, canonical and a sitemap are deliberately absent** — all four need a real domain |
| Production build | `[x]` clean under strict TypeScript; ~221 kB raw / **~72 kB gzipped** total |
| Console errors across 7 routes | `[x]` none |
| Automated test suite | `[ ]` not written — verification was scripted against headless Chrome, not committed as tests |
| Deployment | `[ ]` not deployed; no domain, and no git remote to publish from |

**Verified 2026-09-29** — headless Chrome over the DevTools Protocol, against
the built output:

| Check | Result |
|---|---|
| Routes rendered without console errors | 7 / 7 |
| Distinct text styles below WCAG AA (light / dark) | **0 / 0** |
| Horizontal overflow, 5 breakpoints × 3 routes | none |
| Tabbed elements showing a visible focus ring | 9 / 9 |
| Elements hidden when `prefers-reduced-motion: reduce` | 0 |

Two real defects were found by that measurement and fixed: `--ink-3` measured
**4.02:1** in light mode — a WCAG AA failure that looked perfectly fine — and
the header nav would not shrink, pushing the theme toggle off-screen below
about 540 px.

> **Content reconciliation.** The site takes this file as the source of truth,
> so three claims made elsewhere are **not** repeated on it: SwiftKV is
> described as single-node (its README once opened with "distributed"; that was
> corrected on 2026-09-29, and clustering and replication remain `[ ]`); CacheLab makes no STT-RAM claim; and Docker is
> presented everywhere as configuration that was never built.

> **Links that do not exist.** There is no git remote, no LinkedIn reference and
> no committed resume PDF in this repository, so the site renders none of those
> buttons. They are held as `null` in `src/data/profile.ts` and listed in the
> contact section with the reason they are missing, rather than guessed at.

---

## Master documentation

| Document | Status |
|----------|--------|
| `README.md` | `[~]` |
| `ARCHITECTURE.md` | `[~]` |
| `RUNBOOK.md` | `[~]` |
| `TESTING.md` | `[ ]` |
| `SECURITY.md` | `[ ]` |
| `PROJECT_STATUS.md` | `[x]` this file |
| `.env.example` | `[ ]` |
| CI/CD workflows | `[ ]` |

## Shared tooling

| Item | Status |
|------|--------|
| `tools/env.sh` — redirect caches off root disk | `[x]` written and verified |
| `tools/setup_services.sh` — PostgreSQL 18 + Redis 8 via conda | `[x]` written and verified |
| `tools/services.sh` — start/stop/status/reset-db | `[x]` written; start/status/connection verified |
| `tools/setup_k6.sh` — k6 load-test binary | `[x]` written and verified (k6 v1.3.0) |
| `tools/run_all_tests.sh` | `[ ]` |
| `tools/run_all_load_tests.sh` | `[ ]` |

**Verified on 2026-08-25** — these commands were actually executed:

- PostgreSQL: `SELECT version()` → `PostgreSQL 18.6 on x86_64-conda-linux-gnu` ✅
- Redis: `PING` → `PONG`, and a `SET`/`GET` round-trip ✅
- k6: `k6 version` → `k6 v1.3.0` ✅

This resolves environment constraint #4: ResumeLens and CampusFlow will be
tested against a **real** PostgreSQL and Redis, not fakes — without root and
without Docker.

---

## Build order

Projects are built one module at a time, following the rule in the master
README: design → implement → test → run tests → security check → performance
check → document → only then move on.

1. **SwiftKV** — highest signal for SDE interviews; no external service
   dependencies; benchmarks are self-contained.
2. **CacheLab** — data already exists; mostly ingestion, validation and
   presentation. Low risk, high differentiation.
3. **ResumeLens** — needs the conda Postgres env stood up first.
4. **CampusFlow** — reuses the ResumeLens infrastructure patterns.
5. **SmartLab** — originally planned to train on CacheLab's cleaned dataset.
   That turned out to be unworkable: the usable gem5 data is 72 rows and the
   apparent accuracy on it is an artefact of workload identity, not a learned
   scheme effect. SmartLab therefore trains on the 241,600-row UCI SGEMM
   measurements and keeps the gem5 data as a *counterexample* instead. It no
   longer depends on CacheLab, and reads its CSV read-only.
6. **Portfolio website** — last, because it should only ever show real results.
