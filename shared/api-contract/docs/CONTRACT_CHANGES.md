# Contract Changes

## Unreleased - 2026-07-13

- Added Zod request/query validation for Student Administration admin routes and active-student switching.
- Implemented and applied the Student Administration backend database migrations after approved development reset: baseline Identity & Access migration plus Student Administration tables, indexes, enum, and foreign keys.
- Implemented the backend Student Administration code slice for admin student CRUD, guardian account links, and app active-student context routes.
- Standardized resource path parameters to `{id}` when the resource segment already provides context, and moved secondary/action target IDs such as `homework_id` into request bodies instead of paths.
- Added frontend handoff documentation and a conservative implementation status matrix clarifying that the OpenAPI contract is a draft sync surface for review, generation, and mock integration, not proof that all backend endpoints are implemented.

## 1.0.0 - 2026-07-13

- Rewrote the shared OpenAPI contract for the Luong The Vinh school app/backend project.
- Added Management UI `/admin/...` endpoints and app/mobile display endpoints across Identity & Access, Student Administration, Communication, Academics, Billing, Student Services, and Uploads.
- Replaced stale hotel/auth-service/RBAC language with fixed role policy plus student/class ownership scopes.
- Added JSON/YAML mirrors, common envelopes, pagination, shared schemas, and consumer/scope vendor extensions.
- Marked the old Postman collection as deprecated and non-authoritative.

## 0.1.1

- Added `API_CATALOG.md` with module-level request/response contract for frontend integration.
- Documented success/error envelopes and public/private route behavior.

## 0.1.0

- Initialized shared API contract package.
- Added OpenAPI export pipeline from `services/auth-service`.
- Added verification and SDK preparation scripts.
