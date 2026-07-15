# School API Contract Sync Package

Shared API contract package for the Luong The Vinh school app/backend project.

This package lets clients synchronize without importing backend source. `openapi/v1/openapi.json` is authoritative; `openapi.yaml` and root `share_api.json` are compatibility mirrors verified for status drift.

## Structure

- `openapi/v1/openapi.json`: machine-readable OpenAPI 3.0.3 contract.
- `openapi/v1/openapi.yaml`: YAML mirror of the same contract.
- `docs/API_CATALOG.md`: human-readable endpoint map by bounded context.
- `docs/FRONTEND_HANDOFF.md`: frontend handoff for generation, filtering, mocks, and acceptance.
- `docs/IMPLEMENTATION_STATUS.md`: conservative backend availability tracker by bounded context.
- `docs/CONTRACT_CHANGES.md`: contract change history.
- `scripts/verify-contract.cjs`: lightweight contract verification.

## Consumer Rules

- Base path is `/api/v1`.
- External JSON fields are `snake_case`.
- Path parameters use `{id}` for the primary resource when the resource segment already identifies it, such as `/students/{id}`.
- Do not put multiple IDs in one path. Put secondary or action target IDs in the request body or query instead, such as `POST /students/{id}/homeworks/submit` with `homework_id` in the request body.
- Frontend web and app/mobile should generate or validate types from `openapi/v1/openapi.json`.
- Management UI uses the implemented `/users` User Management API and `/admin/students` Student Administration API. Other domain endpoints remain planned until a backend controller exists.
- Authorization is fixed-role plus linked-student/class scope. Do not build a full RBAC UI from this package.

## Frontend Handoff

Read `docs/FRONTEND_HANDOFF.md` before generating clients or wiring app screens. Endpoint availability is tracked in `docs/IMPLEMENTATION_STATUS.md`; this draft v1 contract supports review, generation, and mock integration, but it does not mean every backend endpoint is live.

## Verify

Run from `shared/api-contract`:

```bash
npm run verify
```

The verifier checks JSON/YAML equality and requires every authoritative and compatibility-mirror endpoint to be explicitly `implemented` or `planned`.
