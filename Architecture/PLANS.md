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
| P0 — Contract SSOT & Verification Baseline | Lock OpenAPI `openapi.json` as SSOT, verify JSON/YAML/mirror synchronization via `verify-contract.cjs`. |
| P1 — Integration Layer & 9 Implemented Slices | Connect 9 implemented endpoints (`Auth`, `Me`, `News`, `Attendance`, `Tuition`), single-flight token refresh, error envelopes, and mock adapters for 29 planned endpoints. |
| P2 — Communication & Academics Expansion | Schema validation, backend services, admin dashboard CRUD/publish, and app integration for Notifications, Feedback, Timetable, Scores, Homework, Reward/Discipline, Online Study. |
| P3 — Billing & Student Services Expansion | Connect Meals, Events, Surveys, Clubs, Bus Routes, Uniforms, Coin Fund, and Payment Requests with idempotency & unique write constraints. |
| P4 — Observability & Staging E2E Validation | Tracing (`request_id`), audit logging, rate limiting, and end-to-end smoke testing across Dashboard, Backend, and App. |

## P0 — Contract SSOT & Verification Baseline

- [x] Create centralized `Architecture/` folder.
- [x] Add core architecture entry point and frontend/backend/API/integration guide files.
- [x] Document modular-monolith-first, extraction-ready direction.
- [x] Add `MODULE_MAP.md` as the bounded-context ownership map.
- [x] Lock `shared/api-contract/openapi/v1/openapi.json` as Single Source of Truth (SSOT).
- [x] Verify script `shared/api-contract/scripts/verify-contract.cjs` passing cleanly.

## P1 — Identity & Access

Goal: establish platform core before business-domain expansion.

Required capabilities:

- [x] account/user model;
- [x] password hashing and credential lifecycle;
- [x] login/logout/refresh sessions;
- [x] JWT/session validation;
- [x] roles and permissions;
- [x] audit logging for sensitive mutations;
- [x] seeded `super_admin` or equivalent bootstrap flow;
- [x] positive and negative authorization tests.

Decision checkpoint:

- [x] choose how frontend session boundary stores/refreshes credentials without unsafe browser token storage.

## P2 — User Management

Goal: first admin platform feature after Identity & Access.

- [x] list users;
- [x] user detail;
- [x] create user;
- [x] update user profile/status;
- [x] disable user;
- [x] assign/revoke roles;
- [x] contract tests and frontend API client update.

## P3 — News Pilot & Communication

Goal: complete business-domain vertical slice and migration template.

- [x] Communication context owns news/publication workflow;
- [x] domain-specific admin endpoints replace generic management ownership;
- [x] frontend feature client consumes contract via `@dangminhdev04032005/query-resource`;
- [x] tests cover validation, authorization, and response shape.

## P4 — Context Migration & App Integration

Migrated bounded contexts:

1. [x] Student Administration;
2. [x] Academics (Attendance, Academic Context, Timetable, Scores);
3. [x] Billing (Tuition);
4. [x] Student Services (Meals, Events, Surveys, Clubs, Bus, Uniforms, Coin Fund);
5. [x] Communication (News, Notifications, Feedback).

All migrations identify owner, public boundary, persistence, contract synchronization, and validation gates.

## P5 — Contract SSOT Automation

OpenAPI SSOT contract enforced across all deployables.

Decision checkpoint requirements:

- [x] keep `shared/api-contract/openapi/v1/openapi.json` as authoritative SSOT source;
- [x] define `node scripts/verify-contract.cjs` verification command and CI gate;
- [x] synchronize `@dangminhdev04032005/query-resource` frontend clients;
- [x] synchronize `share_api.json` and `openapi.yaml` mirrors.

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
