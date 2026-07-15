# Implementation Status

This file tracks backend availability for the draft v1 OpenAPI contract. It is conservative by default: an endpoint appearing in the contract does not mean it is live in the backend.

## Status Legend

| Status | Meaning |
| --- | --- |
| `contracted` | Appears in the OpenAPI contract. |
| `implemented` | Backend route exists, validates DTOs, has tests, and passes contract verification. |
| `partial` | Backend route or legacy behavior exists, but coverage, validation, or business behavior is incomplete for contract reliance. |
| `mock-only` | Frontend can mock from the contract; backend module is not ready for live integration. |
| `deprecated` | Compatibility surface only; use the preferred replacement for new work. |
| `blocked` | Awaiting schema, ownership, or module decision before implementation can proceed. |

## Bounded-Context Matrix

| Bounded context | Contract status | Backend implementation status | Frontend guidance |
| --- | --- | --- | --- |
| Identity & Access / Current Account | `contracted` | `implemented` for operations marked in OpenAPI | Login, refresh, logout, current actor, password, and linked-student context are the live scope. |
| User Management | `contracted` | `implemented` at `/users` | Admin dashboard uses the real `/api/v1/users` controller; `/admin/users` is not advertised as implemented. |
| Student Administration | `contracted` | `implemented` at `/admin/students` | Admin list/detail/mutations and linked-account replacement are live controller surfaces. Migration files exist, but this document does not claim they were applied to any database. |
| Communication | `contracted` | `planned` | Visible UI is an explicit backend-not-implemented surface and makes no generic API call. |
| Academics | `contracted` | `planned` | No backend implementation in the current scope. |
| Billing | `contracted` | `planned` | No backend implementation in the current scope. |
| Student Services | `contracted` | `planned` | No backend implementation in the current scope. |
| Uploads | `contracted` | `planned` | No backend implementation in the current scope. |

## Status Change Rule

Changing a context or endpoint to `implemented` requires all of these:

1. Backend route exists under the intended versioned API path.
2. Request DTO validation matches the contract.
3. Response shape matches the contract envelope and schema.
4. Authorization behavior matches fixed-role policy plus linked-student/class/resource scope.
5. Tests cover the implemented route, including relevant negative cases.
6. Contract verification passes.

If any item is missing, use `partial` or `mock-only` instead of `implemented`.
