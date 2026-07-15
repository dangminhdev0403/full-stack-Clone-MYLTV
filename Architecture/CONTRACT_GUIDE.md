# Contract Guide

## 1. Purpose

Defines API contract ownership for frontend/backend synchronization.

The contract is the only integration boundary between the Next.js web deployable and the NestJS API modular monolith.

## 2. Source of Truth

`shared/api-contract/openapi/v1/openapi.json` is the authoritative API contract. `openapi.yaml` is a synchronized machine-readable mirror, while root `share_api.json` is a temporary compatibility/catalog mirror. The verifier rejects JSON/YAML drift and missing implemented/planned status metadata.

## 3. Global API Conventions

| Convention | Rule |
| --- | --- |
| Prefix | `/api/v1` |
| External JSON | `snake_case` |
| Internal TypeScript/Prisma | `camelCase` |
| Mapping location | HTTP boundary / feature API client boundary |
| IDs | Opaque strings; clients must not infer database structure |
| Dates | ISO-8601 strings unless a contract section states otherwise |
| Pagination | Standard fields such as `items`, `page`, `page_size`, `total`, `has_next` |

## 4. Envelope Policy

Define and keep one success envelope and one error envelope across endpoints.

Recommended success shape:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Recommended error shape:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": []
  },
  "request_id": "opaque-request-id"
}
```

If legacy endpoints differ, document them as compatibility exceptions and migrate intentionally.

## 5. Endpoint Grouping

Prefer domain-specific admin endpoints:

```txt
/api/v1/admin/users
/api/v1/admin/students
/api/v1/admin/news
/api/v1/admin/attendance
/api/v1/admin/tuition
```

Avoid expanding generic long-term endpoints:

```txt
/api/v1/admin/management/:domain
```

A compatibility route may temporarily delegate to domain services, but it must not be the permanent owner of domain behavior.

## 6. Contract Change Policy

A contract change includes all of these in the same change set:

1. contract source update;
2. backend DTO validation;
3. backend implementation;
4. frontend feature API client update;
5. contract or compatibility test;
6. documented migration/compatibility note when behavior changes.

Frontend and backend may expose different read models for mobile/admin clients, but both should invoke the same owning domain application service when they represent the same business operation.

## 7. Validation Policy

- Request DTOs must validate required fields and types.
- Response DTO/read models must not leak persistence entities by accident.
- Error codes should be stable enough for frontend handling.
- Auth requirements must be explicit per endpoint.
- Contract tests should cover both positive and negative cases for critical endpoints.

## 8. Migration To OpenAPI

Adopt OpenAPI/generated types only after core endpoints are stable enough to avoid churn.

Decision checkpoint requirements:

- choose one authoritative contract source;
- define generation command and CI gate;
- define frontend client generation/import location;
- define how legacy `share_api.json` is retired or kept as non-authoritative reference.
