# web_cloneMYLTV Rules

## 1. Documentation Rules

- Architecture documentation belongs in `Architecture/`.
- `ARCHITECTURE.md` is the runtime/boundary entry point.
- `MODULE_MAP.md` is the bounded-context ownership map.
- Use companion guide files for implementation details.
- Do not create scattered architecture docs under random source folders.
- README files may remain in `front-end/` and `backend/` as package entry points only.
- Routine validation evidence belongs in CI/test output, not long architecture diaries.

## 2. Repository / Dependency Rules

- Do not put secrets, tokens, passwords, API keys, or connection strings in docs or code.
- Do not introduce new production dependencies or major-version upgrades without explicit approval.
- Package script/config changes may be proposed when they are inside the approved task scope, but obey stricter repository instructions when present. In this repo, `AGENTS.md` currently requires explicit approval before editing `package.json`.
- Prefer small vertical slices over large catch-all files.
- Do not create generic controllers/services/repositories spanning unrelated domains.

## 3. Architecture Rules

- The repository is a product workspace/monorepo; it is not one runtime layer.
- The NestJS API is the modular monolith.
- The Next.js frontend is a separate web deployable.
- The database is owned by the API; frontend never accesses it directly.
- The versioned HTTP API is the only frontend/backend integration boundary.
- Build clear ownership before considering microservice extraction.

## 4. Backend Rules

- Use NestJS modules as backend bounded-context boundaries.
- A bounded context owns its business rules and database models.
- Controllers handle HTTP mapping only.
- Application services own business workflow.
- Do not let starter `AppController` or a generic `ManagementService` become a long-term domain owner.
- Another module must not write directly to models it does not own through Prisma.
- Cross-module calls go through exported application services, ports, or explicit HTTP/event contracts.
- Use Prisma inside the owning module. Add repository abstractions only when they solve a real boundary/testing/implementation need.

## 5. DTO / Type / Validation Rules

# web_cloneMYLTV Rules

## 1. Documentation Rules

- Architecture documentation belongs in `Architecture/`.
- `ARCHITECTURE.md` is the runtime/boundary entry point.
- `MODULE_MAP.md` is the bounded-context ownership map.
- Use companion guide files for implementation details.
- Do not create scattered architecture docs under random source folders.
- README files may remain in `front-end/` and `backend/` as package entry points only.
- Routine validation evidence belongs in CI/test output, not long architecture diaries.

## 2. Repository / Dependency Rules

- Do not put secrets, tokens, passwords, API keys, or connection strings in docs or code.
- Do not introduce new production dependencies or major-version upgrades without explicit approval.
- Package script/config changes may be proposed when they are inside the approved task scope, but obey stricter repository instructions when present. In this repo, `AGENTS.md` currently requires explicit approval before editing `package.json`.
- Prefer small vertical slices over large catch-all files.
- Do not create generic controllers/services/repositories spanning unrelated domains.

## 3. Architecture Rules

- The repository is a product workspace/monorepo; it is not one runtime layer.
- The NestJS API is the modular monolith.
- The Next.js frontend is a separate web deployable.
- The database is owned by the API; frontend never accesses it directly.
- The versioned HTTP API is the only frontend/backend integration boundary.
- Build clear ownership before considering microservice extraction.

## 4. Backend Rules

- Use NestJS modules as backend bounded-context boundaries.
- A bounded context owns its business rules and database models.
- Controllers handle HTTP mapping only.
- Application services own business workflow.
- Do not let starter `AppController` or a generic `ManagementService` become a long-term domain owner.
- Another module must not write directly to models it does not own through Prisma.
- Cross-module calls go through exported application services, ports, or explicit HTTP/event contracts.
- Use Prisma inside the owning module. Add repository abstractions only when they solve a real boundary/testing/implementation need.

## 5. DTO / Type / Validation Rules

- No `Record<string, any>` or unvalidated payload at HTTP/application boundaries.
- Controller DTO, internal command, response DTO, and persistence entity are separate concepts.
- Persistence entities are not API responses.
- Map `snake_case` external JSON to `camelCase` internal TypeScript/Prisma at the HTTP boundary.
- Every mutation requires validation, authorization, meaningful error mapping, and a test.

## 6. Frontend Rules

- Prefer Server Components by default.
- Use Client Components only for browser APIs, interaction state, effects, forms, or client navigation.
- For frontend client server-state, use `@dangminhdev04032005/query-resource`: `repository` → `resource` → `feature hook` → `component`. Do not write raw TanStack Query `queryKey`/`queryFn`/`mutationFn` configurations in pages or feature hooks directly. Raw hooks consume resource-generated options; the application `QueryClient` provider is exempt.
- Keep route files thin; route files compose feature components.
- `app/admin` is a shell, not the owner of all business logic.
- Organize feature code by business domain, not by a single admin mega-feature.
- Do not fetch APIs directly inside presentation components.
- Keep reusable UI components free of feature-specific service dependencies.
- Keep mock data clearly isolated and replaceable by API-backed services.

## 7. Contract Rules

- `shared/api-contract/openapi/v1/openapi.json` is authoritative; `openapi.yaml` and `share_api.json` are synchronized mirrors.
- API behavior changes must update the contract source in the same task.
- Frontend service code should follow the contract rather than inventing response shapes.
- Backend implementation should either satisfy the contract or update it before integration.
- A contract change includes DTO validation, implementation, frontend client update, and contract test in the same change set.

## 8. Validation Rules

For docs-only work:

- read changed docs;
- check file paths and references;
- check for stale contradictory terminology.

For backend DTO/API work:

- run unit tests, contract tests, lint without broad `--fix`, build, and Prisma validate/generate when Prisma changes.

For authentication/RBAC work:

- include positive and negative authorization tests;
- include audit log tests for sensitive mutations.

For frontend feature work:

- run feature tests and lint/type/build validation with documented environment variables.

For architecture decisions:

- update a short ADR or `PLANS.md` decision checkpoint;
- update `MODULE_MAP.md` when ownership/dependency changes.
