# Contract Guide

## 1. Purpose

Defines API contract ownership for frontend/backend synchronization.

`share_api.json` is currently the shared API contract draft. It should be treated as the integration boundary until replaced by OpenAPI or generated TypeScript contracts.

## 2. Current Contract Source

```txt
share_api.json
```

The file contains endpoint groups, request bodies, response shapes, auth requirements, and common errors for the school communication domain.

## 3. Contract Rules

- Contract changes must be intentional and documented.
- Frontend should not invent response fields not present in the contract.
- Backend should implement contract-compatible responses or update the contract first.
- Error shapes should remain consistent across endpoints.
- Auth requirements must be explicit per endpoint.

## 4. Future Contract Direction

When the project grows, replace or supplement `share_api.json` with:

- OpenAPI JSON/YAML generated from NestJS decorators; or
- generated TypeScript client/types; or
- a shared contract package.

Do not maintain multiple conflicting contract sources.

## 5. API Grouping Guidance

Keep API groups aligned to product/domain boundaries, for example:

- auth/account
- home/news
- notifications
- students
- attendance
- grades/scores
- tuition
- admin/management

If this project is later integrated as a microservice, these groups help decide whether it remains one service or splits by domain.
