# Integration Guide

## 1. Purpose

Defines how `web_cloneMYLTV` should remain monolith-first while staying ready for future integration as a microservice or module.

## 2. Current Decision

Current mode: standalone monolithic product workspace.

This means:

- frontend and backend can be developed together;
- deployment can initially be simple;
- shared contracts can stay local;
- no service mesh, event bus, or distributed database complexity is required yet.

## 3. Future Integration Options

| Option | Meaning | When to choose |
| --- | --- | --- |
| Standalone app | Runs independently with its own frontend/backend. | Product remains separate. |
| Product module | Frontend/backend integrate into a larger platform but keep clear module boundaries. | Shared auth/platform is introduced. |
| Backend microservice | Backend exposes APIs to other apps/services. | Other systems need school communication APIs. |
| Frontend surface | Frontend becomes a route/surface inside a larger portal. | A parent platform owns shell/auth/navigation. |

## 4. Extraction Readiness Checklist

Before extracting/integrating:

- [ ] API contract is stable and documented.
- [ ] Auth ownership is clear.
- [ ] Database ownership is clear.
- [ ] Frontend route ownership is clear.
- [ ] Environment variables and secrets are documented outside source code.
- [ ] Backend modules do not depend on frontend internals.
- [ ] Frontend does not depend on backend source files.
- [ ] Integration tests or smoke checks exist for critical API flows.

## 5. What Not To Do Early

- Do not add distributed architecture before domain boundaries are known.
- Do not split services before the monolith has stable modules.
- Do not duplicate API contracts across many files.
- Do not let temporary mock data become the source of business truth.
- Do not hardcode platform-specific auth assumptions until integration target is known.
