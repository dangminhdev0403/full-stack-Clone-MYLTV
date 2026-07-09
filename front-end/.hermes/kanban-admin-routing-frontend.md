# Frontend task: Route admin template pages and temporary login

Workspace: `C:/Users/Admin/Desktop/workspace/web_cloneMYLTV/front-end`
Template source of truth: `templates/stitch_edumanage_pro_admin_dashboard`

## User request
The current admin UI is only a dashboard and is incorrectly rendered at home route `/`. Move it under `/admin`, synchronize related admin tabs/pages from the Stitch template, and add `/login`. Temporary login may accept arbitrary input and allow entering the app; backend/auth will handle validation later.

## Hard constraints
- Do not modify `package.json`.
- Do not add dependencies.
- Do not create raw `fetch`/`axios` calls in UI/page.
- Do not create fake backend API/auth services.
- Static/demo data must live clearly under `features/admin/data/*.mock.ts` when needed.
- Keep visible UI Vietnamese and UTF-8 clean.
- Update `docs/PROJECT_PLANS.md` before completing.
- If implementation is complete and local checks pass, finish as `done` with a handoff summary. Do not block as `review-required`; downstream tester depends on this card.

## Required routes
- `/`: must no longer render admin dashboard. Prefer redirect to `/login` using Next server redirect or a simple neutral entry page linking to login/admin.
- `/login`: login page based on `templates/stitch_edumanage_pro_admin_dashboard/ng_nh_p_edumanager/code.html` and/or screenshot. Temporary client-side behavior: submit any/empty input and navigate to `/admin`. Do not store password/token. Clearly comment/docs this as temporary frontend-only bypass.
- `/admin`: dashboard overview based on current Stitch-derived dashboard.
- `/admin/students`: student list from `danh_s_ch_h_c_sinh_edumanager`.
- `/admin/students/vu-danh-tung` or `/admin/students/[id]`: student detail from `chi_ti_t_h_c_sinh_v_danh_t_ng_edumanager`.
- `/admin/attendance`: attendance management from `qu_n_l_chuy_n_c_n_edumanager`.
- `/admin/grades`: electronic gradebook from `s_i_m_i_n_t_edumanager`.
- `/admin/tuition`: tuition/payments from `h_c_ph_thanh_to_n_edumanager`.

## Implementation guidance
- Inspect the template HTML/screenshots before porting each page.
- Prefer shared admin shell/layout components for sidebar/topbar/navigation to avoid copy-paste.
- Sidebar/tabs must link to the correct `/admin/...` routes.
- Current active dashboard component is `features/admin/components/admin-command-center.tsx`; route it through `/admin`, not `/`.
- Existing `app/page.tsx` currently renders `AdminCommandCenter`; fix this.
- Keep app router conventions and Server Components by default. Use a small client component only where needed for login navigation/form behavior.

## Required verification
Run and include results in handoff:
- `pnpm exec tsc --noEmit`
- `pnpm run lint`
- `pnpm run build`
- UTF-8/mojibake audit for changed files
- Browser or DOM smoke where possible for `/`, `/login`, `/admin`, and at least two subroutes

## Deliverable summary must include
- Changed files
- Routes added/changed
- How temporary login works
- Verification command outputs/status
- Known risks/blockers
