# Tester task: QA admin routing, template pages, temporary login

Workspace: `C:/Users/Admin/Desktop/workspace/web_cloneMYLTV/front-end`

## Depends on
Frontend implementation card for routing Stitch EduManager admin pages and temporary login.

## QA scope
Verify the user request:
- Home `/` no longer shows the admin dashboard directly.
- `/login` exists, follows EduManager/Stitch style, and accepts arbitrary/empty input to enter `/admin` temporarily.
- `/admin` renders admin dashboard.
- Related admin pages exist and are linked from navigation:
  - `/admin/students`
  - `/admin/students/vu-danh-tung` or implemented student detail route
  - `/admin/attendance`
  - `/admin/grades`
  - `/admin/tuition`
- UI is Vietnamese and no mojibake is visible.
- No raw API/fake backend auth is introduced for temporary login.

## Required checks
- Inspect changed files and route structure.
- Run:
  - `pnpm exec tsc --noEmit`
  - `pnpm run lint`
  - `pnpm run build`
- Browser/dogfood routes where possible:
  - `/`
  - `/login`
  - submit arbitrary login data, confirm navigation to `/admin`
  - `/admin`
  - at least two admin subroutes
- Check no horizontal overflow and no Next.js overlay on main pages.
- If local SonarQube helper is available and reasonable for review, run:
  `~/AppData/Local/hermes/scripts/sonarqube-review.sh "$(pwd)" "front-end"`

## Deliverable summary
Return concise QA report with:
- Pass/fail per route
- Commands run and exit status
- Browser findings
- Any blockers/regressions
- Whether ready for user review
