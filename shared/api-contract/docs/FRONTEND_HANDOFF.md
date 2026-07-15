# Frontend API Contract Handoff

## Status

This contract is a draft v1 for frontend review, type/client generation, and mock integration.

It is not proof that all backend endpoints are implemented or live today. Backend implementation is delivered module-by-module as bounded-context vertical slices, so frontend teams must check `docs/IMPLEMENTATION_STATUS.md` before wiring a screen to the live backend.

## Source Files

- Machine-readable source: `openapi/v1/openapi.json`
- YAML mirror: `openapi/v1/openapi.yaml`
- Human endpoint catalog: `docs/API_CATALOG.md`
- Backend availability tracker: `docs/IMPLEMENTATION_STATUS.md`

Use `openapi/v1/openapi.json` for generated types, generated clients, schema validation, and mock server setup.

## Consumer Filtering

Each operation carries an `x-consumer` extension. Filter operations by the consumer surface being built:

| `x-consumer` | Meaning |
| --- | --- |
| `app` | App/mobile endpoints only. |
| `management-ui` | Management UI endpoints only. |
| `app,management-ui` | Shared endpoints used by both app/mobile and Management UI. |
| `management-ui-compat` | Temporary Management UI compatibility endpoints. Prefer the matching `/admin/...` route for new work. |

Generated clients may include all operations, but feature code should import only the operations for its consumer and bounded context.

## Frontend Client Organization

Use `x-bounded-context` to organize feature API clients instead of building one large API module.

Recommended mapping:

```txt
features/auth/api
features/users/api
features/students/api
features/communication/api
features/academics/api
features/billing/api
features/student-services/api
features/uploads/api
```

Keep generated transport/types separate from feature-level API wrappers. Feature wrappers should own UI-friendly mapping, request defaults, and mock swapping, while the generated contract stays close to OpenAPI.

## Path And ID Convention

Use `{id}` for the primary resource when the resource segment already identifies the resource:

```txt
/students/{id}
/notifications/{id}
/services/events/{id}/register
```

Do not put multiple IDs in one path. Put secondary or action target IDs in the request body or query.

Preferred:

```txt
POST /students/{id}/homeworks/submit
body: {
  "homework_id": "homework_123",
  "content": "...",
  "attachments": []
}
```

Avoid:

```txt
POST /students/{id}/homeworks/{homework_id}/submit
```

## Auth, Roles, And Scope

Authorization remains fixed-role policy plus linked-student/class/resource scope.

Frontend may use `x-allowed-roles` and `x-scope` for UI affordances only, such as hiding unavailable navigation items or disabling actions before submission. The backend is the source of truth for authorization and must still reject unauthorized requests.

Do not build a full RBAC administration UI from this contract. App/mobile student-scoped endpoints should assume an active linked-student context, and backend ownership checks remain mandatory.

## Mock Strategy

Before a backend module exists, frontend should mock from the OpenAPI schemas and operation shapes.

- Keep mock data isolated from feature UI and easy to replace with API-backed services.
- Mock success and error envelopes, pagination, empty states, validation errors, and forbidden responses.
- Use `docs/IMPLEMENTATION_STATUS.md` to decide whether an endpoint is live, partial, or mock-only.
- For app/mobile student-scoped APIs, include a mock active student context.
- Do not encode final business authorization logic in frontend mocks beyond UI visibility.
- For compatibility endpoints marked `management-ui-compat`, mock the preferred `/admin/...` route for new screens unless a legacy screen still requires compatibility behavior.

## Frontend Acceptance Checklist

- Generated types/client come from `openapi/v1/openapi.json`.
- Endpoint imports are filtered by `x-consumer`.
- Feature API wrappers are organized by `x-bounded-context`.
- Management UI new work uses preferred `/admin/...` endpoints instead of `/users` compatibility routes.
- App/mobile code handles active linked-student scope.
- UI uses `x-allowed-roles` and `x-scope` only for affordances, not final authorization.
- Mock data is isolated and replaceable by live API services.
- Screens relying on live backend routes are checked against `docs/IMPLEMENTATION_STATUS.md`.
- API calls and mocks use the standard success/error envelopes.
- Path usage follows the `{id}` primary-resource convention and keeps secondary IDs in body/query.
