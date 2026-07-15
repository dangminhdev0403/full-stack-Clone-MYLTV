# web_cloneMYLTV Architecture Docs

This folder is the single architecture/documentation hub for `web_cloneMYLTV`.

The project is a product workspace/monorepo with two deployables:

- `front-end/`: Next.js web application.
- `backend/`: NestJS API application.

The **NestJS API** is the modular monolith. The repository itself is not one runtime layer. Keep this distinction clear so agents do not couple frontend, backend, contracts, and documentation as if they were one process.

## Read Order For AI/Developers

Follow the same read order defined by the repository root `AGENTS.md`:

1. Start with `README.md` for the documentation map.
2. Read `ARCHITECTURE.md` for the target runtime model and dependency direction.
3. Read `MODULE_MAP.md` before creating or changing a domain/module.
4. Read `RULES.md` before implementation or validation work.
5. Open only the guide matching the task:
   - frontend feature/UI work: `FRONTEND_GUIDE.md`
   - backend module/API work: `BACKEND_GUIDE.md`
   - API contract work: `CONTRACT_GUIDE.md`
   - modular-monolith extraction/integration decisions: `INTEGRATION_GUIDE.md`
6. Open `PLANS.md` only when the task involves planning, milestones, risks, or architecture decision checkpoints.

Do not load every markdown file by default.

## Documents

| File | Purpose |
| --- | --- |
| `ARCHITECTURE.md` | Core runtime model, deployables, boundaries, and dependency direction. |
| `MODULE_MAP.md` | Operational bounded-context map and ownership rules for agents/developers. |
| `RULES.md` | Enforceable development/documentation rules. |
| `PLANS.md` | Forward roadmap, decision checkpoints, and material risks. |
| `FRONTEND_GUIDE.md` | Next.js frontend structure, domain feature ownership, session/HTTP rules. |
| `BACKEND_GUIDE.md` | NestJS modular-monolith module ownership and vertical-slice rules. |
| `CONTRACT_GUIDE.md` | API contract ownership, envelopes, naming, versioning, and contract tests. |
| `INTEGRATION_GUIDE.md` | Guardrails for later module/microservice extraction. |

## Task Routing Table

| Task type | Read first | Main owner |
| --- | --- | --- |
| Architecture baseline or terminology change | `ARCHITECTURE.md`, `MODULE_MAP.md`, `RULES.md` | Architecture docs |
| Backend/API module work | `MODULE_MAP.md`, `BACKEND_GUIDE.md`, `CONTRACT_GUIDE.md` | NestJS API modular monolith |
| Frontend feature/UI work | `MODULE_MAP.md`, `FRONTEND_GUIDE.md`, `CONTRACT_GUIDE.md` | Next.js web deployable |
| API contract or DTO change | `CONTRACT_GUIDE.md`, `BACKEND_GUIDE.md`, `FRONTEND_GUIDE.md` | Versioned HTTP contract |
| Integration/extraction decision | `MODULE_MAP.md`, `INTEGRATION_GUIDE.md`, `PLANS.md` | Bounded-context owner |
| Roadmap/progress update | `PLANS.md`, relevant guide | Architecture planning |

## Current Strategic Direction

Build a modular monolith first. Prepare microservice extraction through clear ownership, stable contracts, and replaceable boundaries — not through premature distributed infrastructure.
