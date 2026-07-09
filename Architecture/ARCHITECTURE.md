# web_cloneMYLTV Architecture

## 1. Purpose

This document defines the core architecture for `web_cloneMYLTV`.

The project is currently a standalone monolithic application. It should remain simple while new, but the boundaries must be clear enough to allow future integration as a microservice or product module inside a larger platform.

Keep this file short. Detailed frontend, backend, API, and integration rules belong in companion files in this same `Architecture/` folder.

## 2. Current Runtime Model

```txt
web_cloneMYLTV/
├── front-end/        # Next.js frontend application
├── backend/          # NestJS backend application
├── share_api.json    # Shared API contract draft/source
└── Architecture/     # Architecture and project documentation
```

The application currently runs as a monolith-style product workspace:

- frontend and backend are developed together;
- frontend consumes backend APIs;
- API contract is tracked centrally;
- deployment may initially be standalone;
- extraction/integration should happen through API/module boundaries, not through ad-hoc coupling.

## 3. Core Principles

- Keep the monolith simple, but keep boundaries explicit.
- Frontend owns UI, routing, user interaction, browser state, and API consumption.
- Backend owns business rules, authorization, persistence, domain workflows, and external integrations.
- API contracts are the boundary between frontend and backend.
- Shared data shapes should be documented before broad implementation.
- Avoid cross-layer shortcuts that make later microservice extraction difficult.
- Do not put secrets or environment values in architecture docs.

## 4. Layer Responsibilities

| Layer | Responsibility |
| --- | --- |
| `front-end/app` | Next.js App Router routes, layouts, pages, loading/error boundaries. |
| `front-end/features` | Feature/domain UI modules, mock data, UI orchestration, feature-local types. |
| `front-end/components` | Reusable layout and presentation components. |
| `backend/src` | NestJS modules, controllers, services, providers, application bootstrap. |
| `share_api.json` | Shared API contract draft until a generated OpenAPI contract exists. |
| `Architecture/` | Architecture, rules, plans, integration guides, and contract governance. |

## 5. Standard Request Flow

```txt
User / Browser
  ↓
Next.js Route or Component
  ↓
Frontend Feature Hook / Service
  ↓
Shared API Contract
  ↓
NestJS Controller
  ↓
Backend Service / Domain Logic
  ↓
Database / External Provider / In-memory Mock
```

Rules:

- UI components should not hardcode backend URLs or response shapes.
- Backend controllers should be thin and delegate business behavior to services/modules.
- Contract changes must update `share_api.json` or the future generated contract source.
- Frontend mock data should be clearly marked and replaceable by API-backed services.

## 6. Monolith Boundary Model

This project may stay standalone for a long time. That is acceptable.

However, each domain should be written as if it may later become:

- a backend module inside this NestJS app;
- an internal service behind HTTP/event contracts;
- a frontend product surface inside a larger portal;
- a reusable API contract consumed by mobile/web clients.

Avoid:

- frontend importing backend source files directly;
- backend depending on frontend implementation details;
- storing business rules only in frontend mock data;
- spreading API contract definitions across unrelated files.

## 7. Product Surfaces

Known/expected surfaces:

| Surface | Current status | Notes |
| --- | --- | --- |
| Login | Frontend route exists | Temporary auth boundary until backend auth is implemented. |
| Admin dashboard | Frontend route exists | Currently mock/static UI. |
| Students | Frontend route exists | Should later bind to API contract. |
| Attendance | Frontend route exists | Should later bind to API contract. |
| Grades | Frontend route exists | Should later bind to API contract. |
| Tuition | Frontend route exists | Should later bind to API contract. |
| Backend API | NestJS starter exists | Should evolve by module boundaries, not single controller growth. |

This table is a planning aid, not a permanent domain registry. If it becomes large, move detailed status to `PLANS.md`.

## 8. Extension Rules

When adding a feature:

1. Define the product surface and user role.
2. Define or update the API contract.
3. Add a frontend feature module only with folders it actually needs.
4. Add a backend module/controller/service when real backend behavior is required.
5. Keep mock data isolated and replaceable.
6. Add validation notes to `PLANS.md`.
7. Keep extraction/integration impact visible in `INTEGRATION_GUIDE.md` when relevant.

## 9. Rules Summary

- Keep architecture docs in `Architecture/`.
- Keep the main architecture doc short.
- Keep frontend/backend boundaries explicit.
- Keep API contract as the integration point.
- Keep monolith-first development simple.
- Avoid decisions that block future microservice/module extraction.
