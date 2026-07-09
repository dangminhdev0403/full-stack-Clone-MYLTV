# web_cloneMYLTV Plans

## Current Architecture Direction

`web_cloneMYLTV` starts as a standalone monolithic product workspace:

- `front-end/`: Next.js frontend
- `backend/`: NestJS backend
- `share_api.json`: shared API contract draft
- `Architecture/`: centralized architecture docs

The project should not be over-engineered early. Build as a monolith now, but keep API and module boundaries clean for possible future integration into a larger system.

## Initial Milestones

### P0 - Documentation and Boundary Setup

- [x] Create centralized `Architecture/` folder.
- [x] Add core architecture entry point.
- [x] Add frontend/backend/API/integration guide files.
- [x] Document monolith-first, microservice-ready direction.

### P1 - Backend Foundation

- [ ] Replace NestJS starter README with project-specific backend notes when backend work begins.
- [x] Split starter `AppController` into real domain modules as APIs are implemented.
- [ ] Add validation/DTO strategy.
- [x] Align backend endpoints with `share_api.json` for non-auth Android data endpoints.

Validation note 2026-07-08:

- Added Prisma/PostgreSQL foundation under `backend/prisma/` and NestJS API modules under `backend/src/school-api/` for non-auth Android data endpoints in `share_api.json`.
- Auth login/refresh/logout/password remains intentionally out of scope for the current backend data phase.
- Follow-up validation required on each backend change: `npx prisma generate` and `npm run build` from `backend/`.

Validation note 2026-07-09:

- Added backend admin management CRUD readiness endpoints under `/api/v1/admin/management` for students, news, notifications, attendance, tuition, grades, timetable, homeworks, meals, events, surveys, clubs, bus, and uniforms.
- The admin management payloads intentionally use the same snake_case data fields as `share_api.json` so frontend admin CRUD can create/update the data that feeds Android-facing endpoints.
- Runtime smoke note: `/api/v1/admin/management` inventory starts without DB access; Prisma-backed list endpoints require the local database schema tables to exist before returning non-500 data.

### P2 - Frontend API Integration

- [x] Keep current admin UI routes thin and feature-based for admin management domains.
- [x] Replace primary admin management mock list/detail data paths with API services when backend endpoints exist.
- [ ] Add central HTTP/client service layer before broad API integration.
- [ ] Keep login/auth temporary state documented until real backend auth is ready.

Validation note 2026-07-09:

- Frontend admin management routes now call backend `/api/v1/admin/management` inventory/list/detail endpoints through `features/admin/service/admin-management.service.ts` instead of rendering mock CRUD records as real data.
- Missing or DB-blocked backend domains render explicit blocker states with endpoint/error details; create/update boxes are visible but disabled/TODO-gated for the follow-up mutation task.
- Students, attendance, grades, tuition, news, notifications, timetable, homeworks, and service admin routes share the API-backed management surface; auth/login remains out of scope.

### P3 - Future Integration Readiness

- [ ] Define service/module ownership if integrating into a larger system.
- [ ] Decide whether this app remains standalone or becomes a service/module.
- [ ] Replace `share_api.json` with OpenAPI/generated contract if needed.
- [ ] Add deployment/runtime guide once infrastructure is known.

## Known Risks

- Backend is still close to NestJS starter state.
- Frontend currently contains mock/static admin data.
- API contract exists as JSON but is not yet enforced by generated types or backend tests.
- There are nested git/workspace indicators; repository ownership should be confirmed before push/commit workflows.
