# Module Map

`MODULE_MAP.md` is the operational map agents and developers consult before creating or changing code.

The backend is a NestJS modular monolith: one process, one API deployable, one PostgreSQL database for now. These bounded contexts are ownership boundaries first; they are not microservices yet.

## Bounded Contexts

| Bounded context | Owns | Public boundary / dependency rule |
| --- | --- | --- |
| Identity & Access | accounts/users, credentials, sessions, roles, permissions, audit | No dependency on business domains. Other modules consume identity IDs, user summaries, and permissions only. |
| Student Administration | students, guardians, account-student relationships | Owns student lifecycle and lookup APIs. Other modules reference student IDs and request read models through public services. |
| Academics | academic year/semester context, attendance, grades, timetable, homework | References student IDs; does not modify student ownership data. Owns academic context, records, and workflows. |
| Communication | news, notifications, feedback | Consumes audience/recipient queries through public services, not raw tables. Owns publication and notification workflows. |
| Billing | tuition, payment requests | References student IDs and emits payment state through explicit APIs/events. Does not own student lifecycle. |
| Student Services | meals, events, surveys, clubs, bus, uniforms | Starts as one context; split only when operational pressure exists. Owns optional service enrollment/requests. |

## Ownership Rules

1. A bounded context is the sole owner of its business rules and database models.
2. Another module must not write directly to models it does not own through Prisma.
3. Cross-module calls go through exported application services, ports, or HTTP contracts — never internal folders.
4. Business modules consume identity IDs/permissions; they do not implement credentials, sessions, or RBAC themselves.
5. Shared UI labels or DTO types do not imply shared business ownership.
6. A module can expose a read model for another module, but write operations remain with the owner.

## Dependency Direction

```txt
Identity & Access
  ↑ consumed by
Student Administration
  ↑ referenced by
Academics / Billing / Communication / Student Services
```

Communication and Student Services may need audiences or recipients. They should ask Student Administration or Identity & Access through public services instead of querying tables directly.

## API Direction

Preferred admin endpoints are domain-specific:

```txt
/api/v1/admin/users
/api/v1/admin/students
/api/v1/admin/news
/api/v1/admin/attendance
/api/v1/admin/tuition
```

Avoid growing generic catch-all endpoints such as:

```txt
/api/v1/admin/management/:domain
```

A temporary compatibility route may exist during migration, but it must not become the long-term domain owner.

## When To Add A New Module

Add or change a module only after answering:

1. Which bounded context owns this data and behavior?
2. Which user role/actor performs the operation?
3. Does this change affect contract, authorization, persistence, or another module?
4. What is the smallest complete vertical slice?
5. Which tests prove the owner behavior and the public boundary?

## Extraction Notes

If a bounded context is extracted later:

- move its owned tables to a database owned by the new service;
- keep opaque IDs at boundaries;
- replace in-process public-service calls with HTTP/events only at the boundary;
- add idempotency, retries, and outbox only for real asynchronous workflows;
- use an anti-corruption layer when integrating with a parent platform.
