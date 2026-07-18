# Completed Delivery Records

This file records completed repository deliveries that future sessions can recover directly from Git. It contains no credentials or transient runtime secrets.

## 2026-07-18 — Student detail tabs, profile UI, Tuition integration, and UAT account provisioning

### Status

Completed on branch `master`. The implementation is contained in these commits:

- `49b78f5` — `feat(billing): implement tuition management`
- `4305e4d` — `fix(billing): harden tuition review findings`
- `93eab71` — `feat(students): rebuild detail tabs and profile UI`

These commits have not been pushed or deployed as part of this delivery.

### Delivered behavior

#### Billing / Tuition

- Persisted Tuition charges with additive Prisma migration `20260718123000_add_billing_tuition`.
- Implemented permissioned list, detail, create, and update APIs.
- Monetary values are integer VND.
- Tuition status is derived by the backend: `unpaid`, `partial`, `paid`, or `waived`.
- Waived charges have zero outstanding balance and are excluded from receivable, collected, and outstanding summaries.
- Admin Tuition UI supports real summaries, filters, charge creation, payment updates, and responsive states.
- OpenAPI JSON/YAML and the API status mirror are synchronized.

#### Direct database UAT accounts and roles

- Added opt-in, idempotent Prisma seed provisioning for `super_admin`, `admin`, `teacher`, `parent`, and `student` accounts.
- Roles use the existing `AccountRole` enum; permission grants use `AccountPermission` records.
- Parent/student account links target the UAT student fixture.
- `SEED_UAT_ACCOUNTS=true` requires a dedicated `UAT_ACCOUNT_PASSWORD`; there is no bootstrap-password fallback.
- Passwords, hashes, tokens, and credentials are never logged or stored in this document.

#### Student detail UI

- Rebuilt the student header and profile/guardian cards to follow the approved light, card-based Vietnamese dashboard reference.
- Added URL-backed WAI-ARIA tabs with Arrow Left/Right, Home/End, roving focus, and browser history support.
- Profile data uses the implemented Student detail API.
- Tuition data lazy-loads only when the Tuition tab is active and the session has `billing.tuition.read`.
- Attendance, Grades, and Transport render designed `Đang phát triển` panels and issue zero API requests.
- Guardian and emergency-contact data comes only from the Student API; no unsupported or fabricated data is displayed.
- Phone links are normalized before generating `tel:` URLs.
- Edit and status dialogs use native modal behavior with Escape handling, focus trapping, and focus restoration where supported.

### Student-tab API readiness matrix

| Tab | Readiness | Network behavior |
| --- | --- | --- |
| Thông tin cá nhân | Implemented | Uses Student detail API |
| Chuyên cần | Planned | Zero-fetch `Đang phát triển` UI |
| Điểm số | Planned | Zero-fetch `Đang phát triển` UI |
| Học phí | Implemented | Lazy student-filtered Tuition request with permission check |
| Xe tuyến | Planned | Zero-fetch `Đang phát triển` UI |

The existing admin Attendance endpoint is not treated as a student-detail API because it lacks a student-scoped read model. It must not be loaded for a class and filtered in the browser.

### Verification completed

- Backend regression: 111/111 tests passed.
- Frontend full working-tree regression: 87/87 tests passed.
- Frontend staged snapshot: 80/80 tests passed.
- Student/Tuition focused regression: 33/33 tests passed.
- Final Student detail and Student Tuition focused tests: 13/13 passed.
- Backend and frontend production builds passed.
- Prisma validate, generate, and migration deployment passed.
- Contract verifier passed all 86 paths.
- Authenticated Tuition positive persistence E2E passed, including cleanup.
- Teacher Tuition read/create negative authorization E2E returned 403/403.
- UAT seed ran twice without duplicate accounts, links, permissions, or Tuition fixtures.
- Targeted ESLint and `git diff --check` passed.
- Sonar Quality Gate was OK after scoped findings were fixed.
- Static security checks found no hardcoded credentials, unsafe eval/exec, XSS primitives, or planned-tab requests.
- Independent read-only reviews passed with no security, logic, or accessibility blockers.

### Remaining limitation

Authenticated visual QA at 1440px, 768px, and 375px was not completed by the automation harness because secure credentials could not be entered without exposing them. The application builds and automated responsive/accessibility/network-readiness tests pass, but a future session with an existing authenticated browser session should perform final visual inspection and confirm browser Network behavior.

### Scope preservation

Unrelated dirty login, dashboard, package, architecture-roadmap, and image work was deliberately excluded from these commits. Future work must inspect the live worktree before staging and must not reset or overwrite those changes.
