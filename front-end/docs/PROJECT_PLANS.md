# PROJECT PLANS

## 2026-07-08 - route-stitch-edumanager-admin-pages

### What changed
- Moved the dashboard entry from `/` to `/admin`; `/` now uses a Next server redirect to `/login`.
- Added `/login` from the Stitch login direction with a temporary frontend-only bypass: submitting any or empty input navigates to `/admin`, stores no password/token, and calls no API.
- Added Stitch-synchronized admin routes: `/admin/students`, `/admin/students/[id]`, `/admin/attendance`, `/admin/grades`, and `/admin/tuition`.
- Added shared admin shell/navigation for routed admin pages, and kept demo data under `features/admin/data/admin-pages.mock.ts`.
- Updated dashboard sidebar links so the current overview links to real `/admin/...` pages instead of placeholders.

### Verification result
- Passed: `pnpm exec tsc --noEmit`.
- Passed: `pnpm run lint`.
- Passed: `pnpm run build`.
- Passed: UTF-8/mojibake audit for 18 changed app/admin/docs files.
- Passed: DOM route smoke for `/`, `/login`, `/admin`, `/admin/students`, `/admin/attendance`, `/admin/grades`, `/admin/tuition`, and `/admin/students/vu-danh-tung`.
- Passed: browser submit smoke confirmed temporary `/login` bypass navigates to `/admin` without backend calls.

### Remaining blockers / risks
- Login is intentionally a temporary frontend-only bypass until backend/auth integration is provided.
- Admin subpages use static mock data only and do not create frontend API or auth services.
- Build still reports the pre-existing Next.js workspace-root warning caused by multiple lockfiles; package/root config was not changed.

## 2026-07-08 - replace-admin-with-stitch-edumanager-template

### What changed
- Removed the disliked legacy admin command-center composition from the active route and replaced it with the local Stitch template at `templates/stitch_edumanage_pro_admin_dashboard`.
- Ported the Stitch `dashboard_t_ng_quan_edumanager` layout into `features/admin/components/admin-command-center.tsx`: fixed sidebar, academic topbar, quick filters, KPI cards, attendance line chart, tuition bar chart, recent activity rail, and floating create action.
- Applied the template design system from `academic_precision/DESIGN.md`: Be Vietnam Pro typography, `#f8fafc` workspace background, white rounded cards, low-contrast outlines, and primary academic blue.
- Removed old unused admin component files from `features/admin/components` so the page now uses the Stitch-derived dashboard only.
- Kept `app/page.tsx` as a thin App Router entry and did not add dependencies or modify `package.json`.

### Verification result
- Passed: `pnpm exec tsc --noEmit`.
- Passed: `pnpm run lint`.
- Passed: `pnpm run build`.
- Passed: UTF-8/mojibake audit for changed app, admin, data, and docs files.
- Passed: browser visual check at `http://localhost:3000`; page title is `EduManager - Tổng quan quản trị`, no Next.js error overlay, no horizontal overflow at 1264px viewport, and the visible layout matches the Stitch EduManager admin template.

### Remaining blockers / risks
- Build still reports the pre-existing Next.js workspace-root warning because multiple lockfiles exist (`C:\\Users\\Admin\\pnpm-lock.yaml` and project `pnpm-workspace.yaml`); package/root config was not changed.

## 2026-07-07 - vi-feature-modules-dashboard

### What changed
- Refactored the monolithic `app/page.tsx` dashboard into feature modules under `features/admin`, `features/teacher`, and `features/student`.
- Added shared presentation primitives under `components/shared` and the full-width command-center shell under `components/layouts`.
- Converted visible dashboard UI copy, metadata, and document language to Vietnamese while keeping static mock data clearly under `features/*/data/*.mock.ts`.
- Kept `app/page.tsx` as a thin App Router entry that imports `AdminCommandCenter`.

### Verification result
- Passed: `pnpm exec tsc --noEmit`.
- Passed: `pnpm run lint`.
- Passed: `pnpm run build`.
- Passed: UTF-8 and visible English-copy audit across `app`, `features`, and `components` for dashboard strings and mojibake markers.
- Fixed follow-up: tightened the `Hàng việc vận hành` table sizing so the `Thao tác` header and Vietnamese action buttons remain readable at the 1264px desktop QA viewport while preserving local horizontal scroll for narrower widths.

### Remaining blockers / risks
- `DESIGN.md` is referenced by `docs/PROJECT_RULES.md` but is not present, so the implementation follows the theme direction in `PROJECT_RULES.md`.
- `docs/FRONTEND_SYNC_VALIDATION.md` is referenced by `docs/PROJECT_RULES.md` but is not present.
- This workspace is not a git repository, so git diff and commit-level verification are unavailable.
- Codex CLI could not run because the workspace is outside a git repository unless bypassed, and the bypassed run lacked `OPENAI_API_KEY`; manual implementation was used after that blocker.
