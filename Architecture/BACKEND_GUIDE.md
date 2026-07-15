# Backend Guide

## 1. Purpose

Defines backend architecture rules for `backend/`.

The backend is a **NestJS modular monolith**: one deployable process for now, organized by bounded contexts with clear ownership and replaceable boundaries.

## 2. Strategic Direction

Do not rebuild the backend around a generic admin CRUD engine. Avoid continuing `/api/v1/admin/management/:domain` or a catch-all `ManagementService` as the long-term backend core.

Build platform foundation first:

1. Identity & Access;
2. User Management;
3. one business-domain pilot, preferably News/Communication;
4. migrate remaining contexts one at a time.

## 3. Standard Module Shape

Use a vertical-slice module boundary:

```txt
src/modules/[context]/
├── [context].module.ts
├── [context].controller.ts
├── [context].service.ts              # application service / workflow
├── dto/                              # request/response DTOs
├── schemas/ or validation/           # validation schemas when used
├── persistence/ or repositories/      # owning module persistence only
├── ports/                            # public cross-module contracts when needed
└── tests/ or *.spec.ts
```

Only create folders the module actually needs.

## 4. Bounded Context Ownership

Read `MODULE_MAP.md` before creating or changing a backend module.

Rules:

- A bounded context owns its business rules and database models.
- Another context must not write directly to models it does not own.
- Cross-module reads/writes use exported application services, ports, or explicit contracts.
- Business domains reference identity/student IDs, not internal identity/student tables.
- If a module becomes a service later, its public boundary should already be understandable from code and docs.

## 5. Controller Rules

- Controllers map HTTP to application behavior.
- Controllers should not own business rules.
- Controllers should not contain persistence logic.
- Controllers validate and map request/response DTOs.
- Controllers call application services, not repositories directly.

## 6. Application Service Rules

- Services own business workflow and domain behavior.
- Services should be testable without HTTP.
- Services enforce authorization decisions or call an authorization provider before mutation.
- External provider calls should be isolated behind provider/adapter services.
- Do not add pass-through methods solely to keep a generic facade alive.

## 7. Persistence Rules

- Use Prisma inside the owning module.
- Do not share raw Prisma writes across module boundaries.
- Add a repository abstraction only after a real need exists: complex query grouping, test seam, second implementation, or extraction boundary.
- Persistence models are internal. Map to response DTOs before returning data to controllers.

## 8. DTO / Validation Rules

Separate these concepts:

| Concept | Purpose |
| --- | --- |
| Controller DTO | HTTP request/response boundary. |
| Internal command/query | Application-service input after validation/auth mapping. |
| Persistence model/entity | Database representation inside owner module. |
| Response DTO/read model | Public API shape returned to clients. |

No `Record<string, any>` or unvalidated payload at HTTP/application boundaries.

## 9. Identity & Access First

Identity & Access owns:

- accounts/users;
- credentials/password hashing;
- sessions and refresh tokens;
- roles and permissions;
- audit logs;
- bootstrap super-admin seed.

Other modules consume user IDs, actor summaries, and permission checks. They do not implement credentials or RBAC internally.

## 10. Quality Gates

| Change type | Minimum gate |
| --- | --- |
| Backend DTO/API | Unit tests, contract tests, lint without broad `--fix`, build, Prisma validate/generate when Prisma changes. |
| Authentication/RBAC | Positive and negative authorization tests; audit log test for sensitive mutations. |
| Persistence change | Prisma validate/generate, owning service tests, migration review. |
| Cross-module dependency | Public service/port test and `MODULE_MAP.md` update if ownership changes. |
