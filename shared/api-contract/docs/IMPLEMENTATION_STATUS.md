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
| Identity & Access / Current Account | `contracted` | `implemented` for operations marked in OpenAPI | Login, refresh, logout, current actor, password, linked-student context, role administration, account-role assignment, and protected redacted audit-log viewing are live scope. |
| User Management | `contracted` | `implemented` at `/users` | Admin dashboard and user management page call BFF `/api/admin/users` backed by NestJS `/api/v1/users`. |
| Student Administration | `contracted` | `implemented` at `/admin/students` | Admin list/detail/mutations and linked-account management are live. |
| Communication (News, Notifications, Feedback) | `contracted` | News/Notifications and admin Feedback list/detail/status update `implemented`; Feedback submit `partial` | Admin Feedback list/detail/status update is live with DTO validation, read/manage permissions, atomic audit, pagination/filtering, BFF, UI, and tests. Admin create remains planned; app submit remains legacy/partial. |
| Academics (Context, Structure, Attendance, Scores, Timetable, Homework) | `contracted` | Academic context/grade/class/roster/transfer/promotion administration, Attendance, Scores, Timetable, and Homework `implemented` | Academic years, semesters, grade levels, classes, roster, transfer, promotion, enrollment history, score, timetable, homework, and student detail reads are live. |
| Billing (Tuition) | `contracted` | `implemented` at `/admin/tuition` | Administrative tuition charges list, create, detail, and update are live. |
| Student Services (Events) | `contracted` | `partial` at `/admin/events` | Persistent CRUD routes exist, but DTO validation, dedicated permission/audit, registration-list contract, migrations, and negative tests remain incomplete. |
| Student Services (Meals, Surveys, Clubs, Bus, Uniforms) | `contracted` | Protected student bus detail `implemented`; Admin CRUD `blocked` | Student profile bus assignment is live. Broad service management surfaces remain planned until full admin contracts are finalized. |
| Uploads | `contracted` | `implemented` at `/uploads` | File attachment saving and metadata response are live. |

## Status Change Rule

Changing a context or endpoint to `implemented` requires all of these:

1. Backend route exists under the intended versioned API path.
2. Request DTO validation matches the contract.
3. Response shape matches the contract envelope and schema.
4. Authorization behavior matches fixed-role policy plus linked-student/class/resource scope.
5. Tests cover the implemented route, including relevant negative cases.
6. Contract verification passes.

If any item is missing, use `partial` or `mock-only` instead of `implemented`.
