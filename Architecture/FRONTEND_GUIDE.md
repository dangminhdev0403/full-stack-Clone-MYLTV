# Frontend Guide

## 1. Purpose

Defines frontend architecture rules for `front-end/`.

The frontend is a Next.js web deployable. It owns UI, route composition, browser interaction, and API consumption. It does **not** own backend business rules, persistence, or authorization enforcement.

## 2. Target Shape

```txt
front-end/
├── app/
│   ├── login/
│   ├── admin/              # route shell / composition
│   └── page.tsx
├── components/
│   ├── layouts/
│   └── shared/             # presentation primitives only
├── features/
│   ├── users/
│   ├── students/
│   ├── news/
│   ├── attendance/
│   ├── grades/
│   ├── tuition/
│   └── ...                 # business-domain feature modules
└── docs/                   # legacy/frontend-local docs; Architecture/ is source of truth
```

`app/admin` is a shell. It should compose domain-owned features; it should not own all business logic.

## 3. Route Rules

- Keep `app/**/page.tsx` thin.
- Route files compose feature components.
- Protected routes should use a centralized route/session policy.
- Do not scatter role checks across page files.
- Backend permission enforcement remains authoritative even when frontend hides UI actions.

## 4. Feature Module Standard

```txt
features/[domain]/
├── components/
├── data/       # mock/static data only, until API-backed service exists
├── service/    # typed feature API client
├── hooks/      # feature orchestration
├── types/
└── schemas/    # response/form validation when needed
```

Only create folders the feature actually needs.

## 5. Data / API Rules

Avoid:

- a generic CRUD engine for every entity;
- direct fetch logic in presentation components;
- frontend mock data pretending to be business truth;
- response shapes invented separately from the contract.

Adopt:

- a central HTTP client;
- typed feature-local API clients;
- response schemas at the feature boundary when useful;
- domain forms and API clients kept feature-local;
- shared UI primitives only for layout/presentation.

## 6. Session / Security Rules

- Prefer server-safe session boundaries for session-sensitive operations.
- Avoid tokens in browser storage by default.
- Use route handlers/server actions where they improve session isolation.
- UI role checks are convenience controls; backend authorization is the source of truth.

## 7. Contract Alignment

Frontend API clients must follow `CONTRACT_GUIDE.md`:

- external JSON uses `snake_case`;
- internal UI types may use `camelCase` after mapping;
- contract changes require frontend client updates in the same change set;
- admin endpoints should be domain-specific, not a generic `/admin/management/:domain` pattern long-term.

## 8. Runtime Rules

- Default to Server Components.
- Use Client Components for events, forms, browser APIs, stateful widgets, charts, and client navigation.
- Keep shared components presentation-only.
- Keep API clients out of generic layout/presentation components.
