# Contract Changes

- 2026-08-06: Hardened `PUT /admin/accounts/{account_id}/roles`: `role_ids` must be unique; assignments adding or removing critical role-derived permissions require `confirm_critical: true`.
- 2026-08-06: Added protected `GET /admin/audit-logs` with exact actor/action/context/resource/date filters, validated pagination/range, recursive secret metadata redaction, Next BFF consumption, and permission-aware admin UI.
- 2026-08-06: Added exact contracts, snake_case envelopes, DTO validation rules, error specs (400/401/403/409), and BFF allowlists for protected role administration (list/detail/create/rename/status/permissions) and account-role assignments.
- 2026-08-06: Synchronized C3 Academic Structure student transfers (POST /api/v1/admin/academic-structure/transfers) and cohort promotions (POST /api/v1/admin/academic-structure/promotions) contracts with validated snake_case request/response DTOs, academics.structure.manage permission, fixed-role policy, and audited writes.
- 2026-08-06: Implemented `GET/POST /admin/timetable` with required class, semester, week scope, validated lesson slots, explicit permissions, BFF consumption, and audited writes.

## Unreleased - 2026-07-26

- Completed validated and audited admin score list/filter/upsert plus reward/discipline creation with dedicated permissions and real `/admin/grades` UI.
- Canonicalized Homework admin routes to plural `/admin/homeworks`; added validated class/selected-student assignment, persisted per-student submission progress, audited update/archive, BFF allowlist, and real management UI.

- Added protected `GET /admin/students/{student_id}/attendance` using `academics.attendance.read`, Next.js BFF allowlisting, lazy student-profile rendering, and deterministic idempotent UAT attendance fixtures.
- Added protected student score, reward/discipline, and bus-route reads with dedicated permissions, lazy profile tabs, and idempotent UAT fixtures; removed the obsolete planned student-tab panel.
- Added protected academic year/semester list, create, update, and set-current operations with coherent transactional current context and audited mutations.
- Added additive grade-level, school-class, roster, and enrollment-history contracts; class assignment preserves legacy student grade/class compatibility fields transactionally.
- Completed Feedback admin list/detail/status update with validated DTOs, dedicated read/manage permissions, atomic status-update audit, search/status filtering, pagination, BFF routes, permission-aware management UI, and backend/frontend tests. Admin create is explicitly planned; app submit remains legacy/partial.
- Added dedicated `AdminFeedbackItem`, `AdminFeedbackList`, and `AdminFeedbackStatusUpdate` schemas; removed the untrusted `student_id` admin-list query, normalized legacy `received`/`closed` data to `new`/`resolved`, and synchronized canonical JSON/YAML plus root/frontend mirrors.
- Completed Notifications admin list/detail/create/update with validated DTOs, dedicated read/manage permissions, audit events, bounded filtering/pagination, BFF detail/PATCH routes, management UI, and backend/frontend tests.
- Added `x-required-permission` metadata for admin/app Notifications operations; app reads derive linked-student scope only from the authenticated actor, admin mutations write their audit event in the same transaction, and canonical JSON/YAML plus root/frontend mirrors stay synchronized.

## Unreleased - 2026-07-25

- Extended Next.js BFF router (`/api/admin/[resource]/[[...segments]]`) to proxy GET, POST, PUT, PATCH, and DELETE with query parameters, headers, and authentication tokens.
- Implemented DELETE `/api/v1/admin/news/:id` and integrated confirmation dialog with permission handling and cache invalidation on news management UI.
- Added persistent Admin Events routes (`/api/v1/admin/events`) and registration counters; status remains partial/planned until DTO validation, permission/audit, migrations, and negative tests are complete.
- Added Admin Feedback status update route (`PATCH /api/v1/admin/feedback/:id`); status remains partial/planned until validated admin detail/update contract and negative tests are complete.
- Converted Notifications, Feedback, Events, and News frontend modules to `@dangminhdev04032005/query-resource` architecture without raw TanStack Query keys or mock data fallbacks.
- Normalized Admin Dashboard (`/admin`) to fetch real server counts via lightweight GET queries.
- Replaced un-contracted static mock pages (Meals, Surveys, Clubs, Bus, Uniforms, Reports, System) with `PlannedSurface` to prevent fake button interactions.

## Unreleased - 2026-07-16

- Implemented the first Academics Attendance vertical slice for administrators:
  persisted class/date/period sessions, explicit per-student statuses, audited
  create/update operations, and typed management UI list/edit behavior.
- Added `academics.attendance.read` and `academics.attendance.manage`. Teacher
  access remains deferred until class-assignment ownership can be enforced.
- Added the implemented, read-only `GET /admin/academic-context/current` shell
  bootstrap endpoint for administrators. It returns one coherent current academic
  year and semester and requires `academics.context.read`.
- Implemented the Communication News vertical slice: admin CRUD, publish/hide,
  pin/reorder, and app reads filtered for the active student's all/grade/class/student
  audience.
- Added `communication.news.read`, `communication.news.manage`, and
  `communication.news.publish` authorization metadata and explicit publication
  lifecycle/audience request schemas.

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
- Added additive grade-level, school-class, roster, and enrollment-history contracts; class assignment preserves legacy student grade/class compatibility fields transactionally.
