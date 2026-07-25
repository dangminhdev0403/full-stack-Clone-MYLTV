# Agent Instructions for web_cloneMYLTV

These instructions are mandatory for Codex and any delegated coding agent working in this repository.

## Required Reading Before Changes

Before editing, creating, deleting, moving, or refactoring files, read:

1. `Architecture/README.md`
2. `Architecture/ARCHITECTURE.md`
3. `Architecture/RULES.md`
4. The task-specific guide:
   - frontend/UI work: `Architecture/FRONTEND_GUIDE.md`
   - backend/API work: `Architecture/BACKEND_GUIDE.md`
   - API contract work: `Architecture/CONTRACT_GUIDE.md`
   - service/module/microservice integration work: `Architecture/INTEGRATION_GUIDE.md`
   - planning/progress work: `Architecture/PLANS.md`

Do not load every markdown file by default. Load only the architecture entry point and the guide matching the task.

## Project Direction

- Current mode: standalone monolithic product workspace.
- Future-ready direction: may later integrate as a product module, backend microservice, or frontend surface inside a larger system.
- Keep the monolith simple, but keep frontend/backend/API boundaries explicit.

## Enforceable Coding Rules

- Do not create architecture docs outside `Architecture/`.
- Do not modify `package.json` or add dependencies unless explicitly approved by the user.
- Frontend server-state pattern is mandatory: `repository/client → resource (@dangminhdev04032005/query-resource) → feature hook → component`.
- Do not use direct `useEffect + fetch` in pages or components to fetch/mutate server data.
- Do not write raw TanStack Query `queryKey`/`queryFn`/`mutationFn` configurations in pages or feature hooks.
- Do not use fallback mock data on API errors. Always handle loading, empty, error, and retry states explicitly.
- All frontend admin operations must call Next BFF `/api/admin/...`, never direct `/api/v1/...`.
- Frontend must not import backend source files directly; backend must not depend on frontend code.
- External API contracts use `snake_case` and standard envelope `{ success, data, meta }`.
- Every API change must sync `openapi.json`, `openapi.yaml`, `share_api.json`, `API_CATALOG.md`, `IMPLEMENTATION_STATUS.md`, and `CONTRACT_CHANGES.md`.
- Mark endpoints `implemented` only when backend route, DTO validation, authorization, response contract, and tests are complete.
- Do not write secrets, tokens, passwords, API keys, or connection strings into docs or code.

## Before Final Report

Report:

- files inspected;
- files changed;
- validation commands run and real results;
- docs updated;
- remaining risks/blockers.
