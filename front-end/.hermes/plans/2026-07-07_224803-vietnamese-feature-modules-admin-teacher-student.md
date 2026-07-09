# Vietnamese Feature Modules Admin Teacher Student Refactor Plan

> **For Hermes:** Use frontend specialist kanban delegation after user confirmation. Do not implement before confirmation gate.

**Goal:** Refactor the current monolithic English Education Admin dashboard into UTF-8 Vietnamese UI, split by feature/role modules `admin`, `teacher`, and `student`, following `docs/PROJECT_ARCHITECTURE.md` and `docs/PROJECT_RULES.md`.

**Mission name:** `vi-feature-modules-dashboard`

**Architecture:** Keep Next.js App Router pages thin. Move rendering/data/types into `features/*` modules. Use presentational components without direct API calls. Because this project currently only has `app/page.tsx`, `app/layout.tsx`, and `app/globals.css`, create the missing architecture folders incrementally without changing dependencies or `package.json`.

**Tech Stack:** Next.js 16, React 19, TypeScript strict mode, Tailwind CSS v4. No new packages unless explicitly approved.

---

## Context read

Read files:

- `docs/PROJECT_ARCHITECTURE.md`
- `docs/PROJECT_RULES.md`
- `app/page.tsx`
- `tsconfig.json`
- `next.config.ts`
- `package.json`

Project docs found only these markdown files under `docs/`:

- `docs/PROJECT_ARCHITECTURE.md`
- `docs/PROJECT_RULES.md`

Missing docs referenced by rules:

- `DESIGN.md` is referenced but not present.
- `docs/PROJECT_PLANS.md` is required by rules but not present yet.
- `docs/FRONTEND_SYNC_VALIDATION.md` is referenced but not present.

## Requirements extracted from docs

### From `PROJECT_ARCHITECTURE.md`

- Desired structure:
  - `src/app`
  - `configs`
  - `providers`
  - `core/http`, `core/hooks`, `core/websocket`, `core/storage`, `core/query`, `core/utils`
  - `components/layouts`, `components/ui`, `components/shared`
  - `features/[feature-name]/service`, `hooks`, `types`, `schemas`
- App Router route segments should stay under `app/`.
- Business domain modules should live under `features/`.
- UI components render and handle interaction only.
- Hooks orchestrate behavior and query state.
- Services contain API request logic only.
- Avoid raw `fetch`/`axios` in pages, layouts, UI components, or feature services.

### From `PROJECT_RULES.md`

- Prefer Server Components by default.
- Keep business logic outside page components.
- Use TanStack Query/Zustand when those dependencies exist and API state is implemented.
- Do not modify unrelated business logic during UI redesign.
- Reuse existing UI primitives first. Current project has no `components/ui/*`, so create minimal local primitives only if necessary.
- UI direction: fresh, bright, friendly, modern cafe-style, clean, spacious, soft colors, responsive-first, premium but not luxury-dark.
- Avoid overly dark corporate dashboards, crowded marketplace layouts, excessive gradients/glassmorphism.
- Completion must update `docs/PROJECT_PLANS.md` with date, changes, verification result, remaining blockers/risks.

## Current problem

`app/page.tsx` is currently a 568-line monolithic English dashboard. It includes:

- local data arrays
- local types
- shared UI helpers
- admin layout
- teacher/student panels
- English visible copy

This violates the docs because page-level code contains too much business/UI organization and no `features/` isolation.

## Proposed file structure

Create these folders/files:

```txt
components/
  shared/
    badge.tsx
    panel.tsx
    form-control.tsx
  layouts/
    app-shell.tsx

features/
  admin/
    components/
      admin-command-center.tsx
      admin-sidebar.tsx
      admin-topbar.tsx
      admin-signals.tsx
      operational-work-queue.tsx
      today-rail.tsx
      bulk-actions-footer.tsx
    data/
      admin-dashboard.mock.ts
    types/
      admin-dashboard.types.ts
  teacher/
    components/
      teacher-capacity-panel.tsx
    data/
      teacher-capacity.mock.ts
    types/
      teacher.types.ts
  student/
    components/
      student-follow-up-panel.tsx
    data/
      student-follow-up.mock.ts
    types/
      student.types.ts

docs/
  PROJECT_PLANS.md
```

Keep `app/page.tsx` thin:

```tsx
import { AdminCommandCenter } from "@/features/admin/components/admin-command-center";

export default function Home() {
  return <AdminCommandCenter />;
}
```

## Vietnamese UTF-8 copy targets

Translate every visible English string in the dashboard. Examples:

| English | Vietnamese |
|---|---|
| Education Admin | Quản trị đào tạo |
| North Campus Ops | Vận hành cơ sở Bắc |
| Command | Điều hành |
| Overview | Tổng quan |
| Work queue | Hàng việc |
| Today | Hôm nay |
| Academics | Học vụ |
| Students | Học viên |
| Teachers | Giáo viên |
| Courses | Khóa học |
| Assessments | Đánh giá |
| Operations | Vận hành |
| Schedule | Lịch học |
| Attendance | Điểm danh |
| Approvals | Phê duyệt |
| Reports | Báo cáo |
| Spring term operations | Vận hành học kỳ xuân |
| Admin command center | Trung tâm điều hành quản trị |
| Global search | Tìm kiếm toàn hệ thống |
| Create action | Tạo việc xử lý |
| High priority alerts | Cảnh báo ưu tiên cao |
| Schedule conflicts | Trùng lịch |
| Attendance risk | Rủi ro chuyên cần |
| Teacher overload | Quá tải giáo viên |
| Pending approvals | Chờ phê duyệt |
| Term readiness | Sẵn sàng học kỳ |
| Operational work queue | Hàng việc vận hành |
| Export queue | Xuất hàng việc |
| Priority | Ưu tiên |
| Issue | Vấn đề |
| Area or cohort | Khu vực hoặc nhóm lớp |
| Owner | Phụ trách |
| Due | Hạn xử lý |
| Status | Trạng thái |
| Action | Thao tác |
| Critical | Khẩn cấp |
| High | Cao |
| Medium | Trung bình |
| Unassigned | Chưa phân công |
| In progress | Đang xử lý |
| Waiting | Đang chờ |
| Teacher capacity | Tải giáo viên |
| Student follow-up | Theo dõi học viên |
| Bulk actions | Thao tác hàng loạt |
```

Use Vietnamese names in mock data:

- `Nguyễn Minh Anh`
- `Trần Gia Huy`
- `Lê Bảo Ngọc`
- `Phạm Hoàng Nam`
- `Cô Linh Phạm`
- `Thầy Minh Quân`

Ensure all files are saved as UTF-8 without mojibake. Verify by reading files after write and searching for English strings.

## Step-by-step implementation plan

### Task 1: Create shared UI primitives

**Objective:** Extract reusable UI shell pieces from `app/page.tsx`.

**Files:**

- Create: `components/shared/badge.tsx`
- Create: `components/shared/panel.tsx`
- Create: `components/shared/form-control.tsx`

**Rules:**

- No API calls.
- Server Component by default.
- Type props with `ReactNode` where needed.
- Keep Tailwind classes consistent with bright/cafe-style direction.

### Task 2: Create admin domain types and data

**Objective:** Move admin dashboard types and mock data out of the page.

**Files:**

- Create: `features/admin/types/admin-dashboard.types.ts`
- Create: `features/admin/data/admin-dashboard.mock.ts`

**Content:**

- `Tone`
- `NavItem`
- `NavGroup`
- `Signal`
- `QueueItem`
- `TimelineItem`
- Vietnamese data arrays:
  - `navGroups`
  - `signals`
  - `queueItems`
  - `timeline`

### Task 3: Create teacher domain module

**Objective:** Isolate teacher capacity feature.

**Files:**

- Create: `features/teacher/types/teacher.types.ts`
- Create: `features/teacher/data/teacher-capacity.mock.ts`
- Create: `features/teacher/components/teacher-capacity-panel.tsx`

**Rules:**

- Vietnamese labels.
- No direct API call.
- Export one `TeacherCapacityPanel` component.

### Task 4: Create student domain module

**Objective:** Isolate student follow-up feature.

**Files:**

- Create: `features/student/types/student.types.ts`
- Create: `features/student/data/student-follow-up.mock.ts`
- Create: `features/student/components/student-follow-up-panel.tsx`

**Rules:**

- Vietnamese labels.
- No direct API call.
- Export one `StudentFollowUpPanel` component.

### Task 5: Create admin UI components

**Objective:** Split the admin page into feature components.

**Files:**

- Create: `features/admin/components/admin-sidebar.tsx`
- Create: `features/admin/components/admin-topbar.tsx`
- Create: `features/admin/components/admin-signals.tsx`
- Create: `features/admin/components/operational-work-queue.tsx`
- Create: `features/admin/components/today-rail.tsx`
- Create: `features/admin/components/bulk-actions-footer.tsx`
- Create: `features/admin/components/admin-command-center.tsx`

**Rules:**

- `AdminCommandCenter` composes admin + teacher + student panels.
- Preserve full-width responsive shell from the latest refactor.
- Keep dark sidebar if needed for hierarchy, but avoid overall dark corporate dashboard feel.
- Keep section IDs stable where possible: `overview`, `queue`, `today`, `students`, `teachers`, `approvals`, `reports`.

### Task 6: Thin the App Router page

**Objective:** Make `app/page.tsx` a thin route entry.

**Files:**

- Modify: `app/page.tsx`

**Target:**

```tsx
import { AdminCommandCenter } from "@/features/admin/components/admin-command-center";

export default function Home() {
  return <AdminCommandCenter />;
}
```

### Task 7: UTF-8 and English-copy audit

**Objective:** Catch remaining English UI strings and encoding problems.

**Commands:**

```bash
python - <<'PY'
from pathlib import Path
paths = [Path('app'), Path('features'), Path('components')]
terms = ['Education Admin','Overview','Work queue','Today','Students','Teachers','Courses','Assessments','Operations','Schedule','Attendance','Approvals','Reports','Admin command center','Global search','Create action','Critical','High','Medium','Unassigned','In progress','Waiting']
for root in paths:
    for p in root.rglob('*.tsx'):
        text = p.read_text(encoding='utf-8')
        hits = [t for t in terms if t in text]
        if hits:
            print(p, hits)
PY
```

Expected: no hits except intentional technical identifiers if any.

### Task 8: Project docs sync

**Objective:** Satisfy `PROJECT_RULES.md` completion contract.

**Files:**

- Create or update: `docs/PROJECT_PLANS.md`

**Entry must include:**

- Date: `2026-07-07`
- Mission: `vi-feature-modules-dashboard`
- What changed
- Verification commands and results
- Remaining blockers/risks

### Task 9: Validation

**Commands:**

```bash
pnpm exec tsc --noEmit
pnpm run lint
pnpm run build
```

Expected:

- all exit code `0`
- no TypeScript errors
- no lint errors in changed files
- build succeeds

Optional after build:

- Open `http://localhost:3000`
- Check no obvious layout overflow
- Inspect Vietnamese text render visually

## Kanban frontend specialist handoff

Assignee: `frontend`

Recommended skills:

- `impeccable`
- `plan`
- `next-best-practices`
- `frontend-design`
- `design-taste-frontend`
- `ui-ux-pro-max`
- `management-module-frontend-integration`
- `operational-dashboard-implementation`
- `guestos-frontend-i18n`
- `requesting-code-review`
- `local-code-quality-gates`

Important instructions for the specialist:

- Read `docs/PROJECT_RULES.md` and `docs/PROJECT_ARCHITECTURE.md` before editing.
- Do not modify `package.json`.
- Do not add dependencies.
- Do not introduce raw `fetch`/`axios` in UI/page files.
- Do not create fake API services unless clearly named mock/static data.
- Keep all Vietnamese copy UTF-8.
- Update `docs/PROJECT_PLANS.md` before marking complete.
- Run `pnpm exec tsc --noEmit`, `pnpm run lint`, and `pnpm run build`.

## Acceptance criteria

- `app/page.tsx` is thin and imports `AdminCommandCenter`.
- There are separate role/feature folders:
  - `features/admin`
  - `features/teacher`
  - `features/student`
- The visible UI is Vietnamese, not English.
- UTF-8 Vietnamese text renders without mojibake.
- The full-width command-center layout is preserved.
- `docs/PROJECT_PLANS.md` exists and records the work.
- Typecheck, lint, and build pass.

## Risks and blockers

- `DESIGN.md` is referenced by docs but missing. Use `PROJECT_RULES.md` theme direction until user provides `DESIGN.md`.
- `docs/PROJECT_PLANS.md` is required but missing. It must be created during implementation.
- `docs/FRONTEND_SYNC_VALIDATION.md` is referenced but missing. Record this as a remaining blocker/risk.
- Current project does not include TanStack Query, Zustand, Axios, or Zod in `package.json`, despite docs mentioning them. Do not add them without approval. For now, keep static/mock data isolated under `features/*/data`.
- The directory is not a git repository, so git diff/commit validation is unavailable.
