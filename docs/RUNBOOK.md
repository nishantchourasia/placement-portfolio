# Runbook

Where to find the commands for each project, and notes on the environment the
projects were developed in.

Every project is its own repository with its own runbook. This document is the
index, not a duplicate of them.

---

## 1. Per-project commands

Run each from that repository's root. The full, explained versions are in each
repository's own documents.

| Project | Build / install | Run | Test | Detail |
|---|---|---|---|---|
| **SwiftKV** | `cmake -S . -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build -j` | `./build/swiftkv-server --port 6380` | `ctest --test-dir build --output-on-failure` | `RUNBOOK.md` |
| **CacheLab** | `python3 -m venv .venv && .venv/bin/pip install pytest` | none (analysis library and CLI) | `.venv/bin/python -m pytest -q` | `README.md` |
| **ResumeLens** | `python3 -m venv .venv && .venv/bin/pip install -r backend/requirements.txt` and `npm --prefix frontend ci` | `./run_dev.sh` and `npm --prefix frontend run dev` | `.venv/bin/python -m pytest tests -q` | `RUNBOOK.md` |
| **SmartLab** | `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt` | `python -m smartlab.cli predict ...` | `.venv/bin/python -m pytest tests -q` | `RUNBOOK.md` |
| **CampusFlow** | `python3 -m venv .venv && .venv/bin/pip install -r backend/requirements.txt` and `npm --prefix frontend ci` | `bash run_dev.sh` and `npm --prefix frontend run dev` | `.venv/bin/python -m pytest tests -q` | `RUNBOOK.md` |
| **Site** (this repository) | `npm ci` | `npm run dev` | `npm run typecheck` | `README.md` |

**What was checked.** On 2026-09-29 the build and test commands for the five
projects were run from standalone copies of each repository, using fresh virtual
environments, and passed. ResumeLens's `./run_dev.sh` was smoke-tested against `/health`.
SwiftKV's server and CampusFlow's `run_dev.sh` were not started as part of that
check. CacheLab has no server, and SmartLab's training (about 15 minutes) was
not re-run.

CacheLab has no `RUNBOOK.md`; its README carries the reproduction steps.

## 2. PostgreSQL and Redis

ResumeLens and CampusFlow need a real PostgreSQL, and CampusFlow's tests also
use Redis. Each of those two repositories carries its own copy of `tools/`,
which installs both from conda-forge into a `.state/` directory inside the
repository, so neither root access nor Docker is needed (conda is):

```bash
bash tools/setup_services.sh     # once
bash tools/services.sh start
bash tools/services.sh status
bash tools/services.sh stop
```

Both use PostgreSQL on port 55432 and Redis on 56379 by default. If you run the
two projects' services at the same time, set `PGPORT` and `REDIS_PORT` for one
of them.

`bash tools/services.sh reset-db <name>` **deletes all data** in that database.
Use it only on databases meant to be thrown away, such as the `*_test` ones.

## 3. The development environment

The projects were built on a shared research machine, and its limits shaped
some of the work:

| Limit | Consequence |
|---|---|
| The root filesystem was nearly full | pip, npm and conda caches were redirected to another disk. `tools/env.sh` does this for the two service-based projects. On an ordinary machine it is unnecessary |
| No Docker daemon access | Docker configuration for ResumeLens and CampusFlow was written but **never built or run**. It is unverified |
| No root | PostgreSQL and Redis run from a userspace conda environment. They are the real servers, so the database tests are genuine |
| A live research sweep was running | CacheLab treats the gem5 research tree as strictly read-only, enforced in code and covered by tests |
| gcc 11.4 | SwiftKV uses C++20 without `std::format`, which arrived in gcc 13 |

## 4. Docker

Verifying the Docker configuration needs a machine where you do have Docker:

```bash
docker compose -f deployment/docker-compose.yml up --build    # in resumelens or campusflow
```

Both compose files require `POSTGRES_PASSWORD` (and CampusFlow also
`JWT_SECRET`) to be set, and refuse to start without them. Until it has been run
somewhere, treat the container packaging as unverified.

## 5. Deployment

Nothing is deployed. There is no hosted instance of any project and no CI.
