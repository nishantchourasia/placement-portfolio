# Portfolio documents

Cross-project documents for five engineering projects, built to be inspected
rather than admired.

Nishant Chourasia, M.Tech CSE, IIT Jodhpur.

**The rule these documents are built on:** nothing is claimed unless it was run.
Every number is labelled *Measured*, *Simulated*, *Estimated*, *Predicted* or
*Not yet measured*, and every incomplete piece of work is listed as incomplete
in [PROJECT_STATUS.md](PROJECT_STATUS.md).

This directory belongs to the `placement-portfolio` repository, whose root is
the portfolio website. See its [README](../README.md) for the site itself.

---

## The five projects

Each project is its own repository.

| # | Project | What it is | Core skills |
|---|---------|-----------|-------------|
| 1 | **[SwiftKV](https://github.com/nishantchourasia/swiftkv)** | A **single-node** key-value store in C++20: epoll TCP server, sharded LRU store, RESP protocol, append-only-log persistence with crash recovery, benchmark and reliability harnesses | C++, sockets, concurrency, performance |
| 2 | **[CacheLab](https://github.com/nishantchourasia/cachelab)** | Analysis harness for a gem5 last-level-cache compression study on SPEC CPU2017: read-only export, stats parsing, validity gating, results reports. All results are **Simulated**, on an SRAM L3 | Computer architecture, gem5, experimental method |
| 3 | **[ResumeLens](https://github.com/nishantchourasia/resumelens)** | Resume-to-job matching: validated PDF upload, a deterministic score, optional LLM commentary, per-user data isolation. FastAPI, PostgreSQL, React | FastAPI, React, PostgreSQL, security |
| 4 | **[SmartLab](https://github.com/nishantchourasia/smartlab)** | Predicts GPU kernel runtime from 14 tuning parameters (UCI SGEMM dataset, 241,600 configurations); model selection under a size budget, noise-floor and extrapolation analysis | ML, feature engineering, evaluation |
| 5 | **[CampusFlow](https://github.com/nishantchourasia/campusflow)** | Campus management platform with role-based access: FastAPI, PostgreSQL transactions and row locking, Redis cache and rate limiter, background jobs, a written threat model | Backend, authorization, concurrency, security |

## Documents in this directory

| Document | What it holds |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Why these five projects, cross-cutting engineering decisions, one-page architecture summaries. A design document, corrected where it once disagreed with what was built |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | The completion ledger: per-area status, verification commands and results, known gaps. A dated snapshot |
| [RUNBOOK.md](RUNBOOK.md) | Where each project's commands live, and notes on the development environment |

---

## Current status

Each project is built and tested to the extent its own README records, with its
limitations stated. Across all five:

- **Docker configuration has never been built or run.** ResumeLens and
  CampusFlow ship it as written-but-unverified; SwiftKV and SmartLab have none.
  The development account had no Docker daemon access.
- **There is no CI** on any project.
- **CacheLab** holds real simulated data: 82 gem5 runs ingested, 72 valid. It
  contains no simulator and no STT-RAM implementation.
- **SwiftKV** is single-node. Clustering and replication are not built.

[PROJECT_STATUS.md](PROJECT_STATUS.md) is the place to trust for what is
finished.

## On honesty

Three things are deliberately not done:

1. **No invented numbers.** If a benchmark has not been run, the documents say
   "Not yet measured".
2. **No security theatre.** No project claims to be secure. Each documents a
   threat model as *Threat → Risk → Mitigation → Test*, and says plainly where a
   mitigation has no test behind it.
3. **No borrowed novelty.** CacheLab and SmartLab state what is new in the work
   and what reuses an existing technique.

## Development environment

The projects were built on a shared research machine. Two of its limits affect
what can be claimed: no Docker daemon access, and PostgreSQL and Redis run from
a userspace conda environment because there was no root to install them. They
are the real servers, so the database tests are genuine. Detail:
[ARCHITECTURE.md §3](ARCHITECTURE.md).

## Contact

Nishant Chourasia, M.Tech CSE, IIT Jodhpur
`m25cse020@iitj.ac.in`
