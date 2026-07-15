# web_cloneMYLTV Architecture

## 1. Executive Decision

`web_cloneMYLTV` should be rebuilt and extended as a **modular monolith at the backend core**, not as an early microservice system.

The existing frontend may remain a presentation/product surface while backend capabilities are introduced in clean vertical slices. The first backend platform slice is **Identity & Access**: users/accounts, credentials, sessions, roles, permissions, and audit logging.

Do **not** continue growing `/api/v1/admin/management/:domain` or a catch-all `ManagementService` as the long-term architecture. Admin routes should become domain-specific APIs backed by bounded-context application services.

## 2. Runtime Model

| Layer | Role | Ownership rule |
| --- | --- | --- |
| Repository | Product workspace / monorepo | Contains web, API, contract, and architecture docs. It is not one runtime layer. |
| Web | Next.js frontend deployable | Owns UI, route composition, browser interaction, and API consumption. |
| API | NestJS modular monolith | Owns business rules, authorization, persistence, and external integrations. |
| Database | PostgreSQL | Owned exclusively by the API. No frontend access and no future service shared writes. |
| Contract | Versioned HTTP API | The only frontend/backend integration boundary. |

This replaces the previous ambiguous wording that treated the whole repository like one monolithic runtime. The repository is a product workspace; the NestJS API is the modular monolith.

## 3. Repository Shape

```txt
web_cloneMYLTV/
├── front-end/        # Next.js web deployable
├── backend/          # NestJS API modular monolith
├── share_api.json    # Temporary shared API contract source
└── Architecture/     # Architecture and project documentation
```

## 4. Dependency Direction

```txt
User / Browser
  ↓
Next.js route / feature UI
  ↓
Feature API client + response schema
  ↓
Versioned HTTP contract (/api/v1)
  ↓
NestJS controller
  ↓
Bounded-context application service
  ↓
Owning module persistence / external provider
```

Rules:

- Frontend must not import backend source files directly.
- Backend must not depend on frontend implementation details.
- API contracts are the boundary between frontend and backend.
- Controllers stay thin; application services own business workflows.
- Cross-module backend calls go through exported application services or explicit ports, not internal folders.
- Persistence entities are not API responses; map at the boundary.

## 5. Bounded Context Direction

The API starts as one NestJS process and one database, but domains must have clear ownership.

Initial bounded contexts:

1. Identity & Access
2. Student Administration
3. Academics
4. Communication
5. Billing
6. Student Services

See `MODULE_MAP.md` for the operational ownership table and dependency rules.

Pragmatic rule: do not create fourteen microservices or fourteen heavy DDD modules. Begin with six bounded contexts in one NestJS process and one database.

## 6. Platform Core First

Before creating new business modules, establish the platform core:

1. accounts/users;
2. password hashing and credentials;
3. sessions/JWT/refresh flow;
4. roles and permissions;
5. authorization conventions;
6. audit logging for sensitive mutations;
7. seeded `super_admin` or equivalent bootstrap account.

Business domains should consume identity IDs and permissions, not own identity data.

## 7. Contract Boundary

`shared/api-contract/openapi/v1/openapi.json` is the authoritative contract. Root `share_api.json` remains a compatibility/catalog mirror during migration and must not conflict with OpenAPI implementation status.

Contract rules:

- API prefix: `/api/v1`.
- External JSON uses `snake_case`.
- Internal TypeScript and Prisma models use `camelCase`.
- Mapping happens at the HTTP boundary.
- Define one success envelope, one error envelope, pagination fields, date/datetime format, and opaque ID convention.
- A contract change includes DTO validation, backend implementation, frontend client update, and contract test in the same change set.

See `CONTRACT_GUIDE.md`.

## 8. Microservice Extraction Position

Microservice readiness is not Kafka, service mesh, API gateway complexity, or a generic repository layer. It is clear ownership and replaceable boundaries.

Extract a bounded context only when it has real independent needs:

- independent deployment;
- independent scaling;
- separate team/ownership pressure;
- availability/SLA isolation;
- integration needs that justify network boundaries.

Until then, keep the modular monolith simple.

## 9. Agent Operating Rule

Before editing code, an agent must state:

1. the bounded context owner;
2. the user role or actor;
3. whether the change affects API contract, authorization, persistence, or another module;
4. the smallest complete vertical slice needed.

Routine validation evidence belongs in test/CI output, not in architecture docs. Update `PLANS.md` only for milestones, architecture decisions, or material risks.
