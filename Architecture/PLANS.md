# web_cloneMYLTV Plans

## Current Architecture Direction

`web_cloneMYLTV` is a product workspace / monorepo with two deployables:

- `front-end/`: Next.js web application;
- `backend/`: NestJS API modular monolith;
- `share_api.json`: temporary shared API contract source;
- `Architecture/`: centralized architecture docs.

Build as a modular monolith now. Prepare possible microservice extraction through ownership, contracts, and tests — not premature distributed infrastructure.

## Roadmap

| Phase | Outcome |
| --- | --- |
| P0 — Architecture baseline | Update architecture docs, module map, contract conventions, and quality gates. |
| P1 — Identity & Access | User/account, password hashing, sessions, JWT/refresh flow, RBAC, audit log, seeded super-admin. |
| P2 — User Management | Admin-only user CRUD: list, detail, create, update, disable, role assignment. |
| P3 — News pilot | First complete business-domain vertical slice; use as migration template for Communication. |
| P4 — Context migration | Academics, Communication, Billing, and Student Services migrate one context at a time. |
| P5 — Contract automation | Adopt OpenAPI/generated types only after core endpoints are stable. |
| P6 — Extraction review | Assess scaling, deployment, ownership, and integration pressure before extracting any service. |

## P0 — Architecture Baseline

- [x] Create centralized `Architecture/` folder.
- [x] Add core architecture entry point.
- [x] Add frontend/backend/API/integration guide files.
- [x] Document modular-monolith-first, extraction-ready direction.
- [x] Add `MODULE_MAP.md` as the bounded-context ownership map.
- [ ] Align future implementation tasks to the module map before new business modules are created.

## P1 — Identity & Access

Goal: establish platform core before business-domain expansion.

Required capabilities:

- [ ] account/user model;
- [ ] password hashing and credential lifecycle;
- [ ] login/logout/refresh sessions;
- [ ] JWT/session validation;
- [ ] roles and permissions;
- [ ] audit logging for sensitive mutations;
- [ ] seeded `super_admin` or equivalent bootstrap flow;
- [ ] positive and negative authorization tests.

Decision checkpoint:

- [ ] choose how frontend session boundary stores/refreshes credentials without unsafe browser token storage.

## P2 — User Management

Goal: first admin platform feature after Identity & Access.

- [ ] list users;
- [ ] user detail;
- [ ] create user;
- [ ] update user profile/status;
- [ ] disable user;
- [ ] assign/revoke roles;
- [ ] contract tests and frontend API client update.

## P3 — News Pilot

Goal: first complete business-domain vertical slice and migration template.

- [ ] Communication context owns news/publication workflow;
- [ ] domain-specific admin endpoints replace generic management ownership;
- [ ] frontend feature client consumes contract;
- [ ] tests cover validation, authorization, and response shape.

## P4 — Context Migration

Migrate one bounded context at a time:

1. Student Administration;
2. Academics;
3. Billing;
4. Student Services;
5. remaining Communication flows.

Each migration must identify owner, public boundary, persistence impact, contract impact, and validation gates.

## P5 — Contract Automation

Adopt OpenAPI/generated types only after core endpoints are stable.

Decision checkpoint:

- [ ] keep `share_api.json` as temporary source;
- [ ] define OpenAPI generation source and CI gate;
- [ ] define generated frontend client/type import path;
- [ ] retire or downgrade `share_api.json` to reference-only.

## P6 — Extraction Review

Review extraction only after modular ownership exists.

Extract a context only if it has independent deployment, scaling, team ownership, availability, security, or integration pressure.

## Known Risks

- Existing backend work has signs of generic admin management patterns that should not become the long-term architecture.
- Frontend admin surfaces may still be organized around admin CRUD instead of domain-owned features.
- API contract exists as JSON but is not yet enforced by generated types or complete contract tests.
- There are unrelated dirty working-tree changes outside `Architecture/`; docs tasks should avoid touching them unless explicitly approved.
- Package/dependency policy must follow the strictest active instruction: repository `AGENTS.md` currently requires explicit approval before `package.json` edits.

## Historical Notes

- Early docs established a centralized `Architecture/` folder and monolith-first direction.
- Earlier backend/admin management work added broad `/api/v1/admin/management` readiness. Future work should migrate toward domain-specific bounded-context APIs instead of expanding that generic surface.
- Routine validation logs should stay in command output/CI, not accumulate in this roadmap unless they represent a milestone, architecture decision, or material risk.
