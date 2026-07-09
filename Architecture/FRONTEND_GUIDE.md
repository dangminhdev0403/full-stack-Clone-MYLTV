# Frontend Guide

## 1. Purpose

Defines frontend architecture rules for `front-end/`.

The frontend currently uses Next.js App Router and feature-oriented UI folders. Keep the structure compatible with standalone deployment and future integration into a larger portal.

## 2. Current Shape

```txt
front-end/
├── app/
│   ├── login/
│   ├── admin/
│   └── page.tsx
├── components/
│   ├── layouts/
│   └── shared/
├── features/
│   ├── admin/
│   ├── student/
│   └── teacher/
└── docs/        # legacy/frontend-local docs; architecture source is now Architecture/
```

## 3. Route Rules

- Keep `app/**/page.tsx` thin.
- Route files should compose feature components.
- Protected routes should later use a centralized auth/routing policy.
- Do not scatter route permission rules across pages.

## 4. Feature Module Standard

```txt
features/[feature]/
├── components/
├── data/       # mock/static data only, until API-backed service exists
├── service/    # future API calls
├── hooks/      # feature orchestration
├── types/
└── schemas/    # validation when needed
```

Only create folders that the feature actually needs.

## 5. Data Rules

- Mock data must stay under `features/*/data/*.mock.ts`.
- API-backed calls should move to feature `service/` files.
- Do not call backend APIs directly from shared UI components.
- Keep shared components presentation-only.

## 6. Runtime Rules

- Default to Server Components.
- Use Client Components for events, forms, browser APIs, stateful widgets, charts, and client navigation.
- Use route handlers/server-safe boundaries later for session-sensitive requests.
