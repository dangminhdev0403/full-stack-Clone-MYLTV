# Integration Guide

## 1. Purpose

Defines how `web_cloneMYLTV` stays modular-monolith-first while remaining ready for future integration or microservice extraction.

## 2. Current Decision

Current mode: product workspace / monorepo with two deployables.

```txt
front-end/  → Next.js web deployable
backend/    → NestJS API modular monolith
```

This means:

- frontend and backend can be developed together;
- deployment can initially be simple;
- shared contracts can stay local;
- no service mesh, event bus, or distributed database complexity is required yet.

## 3. What Makes Extraction Easier

Extraction readiness comes from:

- bounded-context ownership;
- stable HTTP contracts;
- no shared writes to another context's data;
- public application-service boundaries;
- clear authorization and audit conventions;
- tests around public behavior.

It does **not** come from adding Kafka, a gateway, service discovery, or generic repositories before the domain boundaries are stable.

## 4. Future Integration Options

| Option | Meaning | When to choose |
| --- | --- | --- |
| Standalone app | Runs independently with its own frontend/backend. | Product remains separate. |
| Product module | Frontend/backend integrate into a larger platform but keep module boundaries. | Shared auth/platform is introduced. |
| Backend microservice | One bounded context exposes APIs to other apps/services. | Other systems need that context independently. |
| Frontend surface | Frontend becomes a route/surface inside a larger portal. | A parent platform owns shell/auth/navigation. |

## 5. Extraction Criteria

Extract a bounded context only when at least one real pressure exists:

- independent deployment cadence;
- independent scaling needs;
- separate team/ownership;
- availability/SLA isolation;
- security/compliance boundary;
- integration consumers that cannot be served cleanly in-process.

Do not extract just because a domain has a module folder.

## 6. Extraction Steps

When extraction is justified:

1. Confirm the context owns its business rules and tables.
2. Define the service contract from the existing public boundary.
3. Move owned tables to a database owned by the new service.
4. Remove shared writes to the old monolith database.
5. Replace in-process exported-service calls with HTTP or events only at the extraction boundary.
6. Add idempotency, retries, and transactional outbox only for real asynchronous workflows.
7. Add an anti-corruption layer when integrating with a parent platform so external models do not leak into domain code.
8. Keep compatibility endpoints until frontend/consumers migrate.

## 7. Extraction Readiness Checklist

- [ ] API contract is stable and documented.
- [ ] Auth ownership is clear.
- [ ] Database ownership is clear.
- [ ] Frontend route ownership is clear.
- [ ] Environment variables and secrets are documented outside source code.
- [ ] Backend modules do not depend on frontend internals.
- [ ] Frontend does not depend on backend source files.
- [ ] Integration tests or smoke checks exist for critical API flows.
- [ ] The bounded context has a public service/API boundary.
- [ ] No other module writes directly to the context's owned tables.

## 8. What Not To Do Early

- Do not add distributed architecture before domain boundaries are known.
- Do not split services before the monolith has stable modules.
- Do not duplicate API contracts across many files.
- Do not let temporary mock data become the source of business truth.
- Do not hardcode platform-specific auth assumptions until integration target is known.
- Do not keep shared database writes after extracting a service.
