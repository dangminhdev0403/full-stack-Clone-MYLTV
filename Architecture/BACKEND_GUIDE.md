# Backend Guide

## 1. Purpose

Defines backend architecture rules for `backend/`.

The backend currently starts from a NestJS starter. It should evolve through modules and contracts, not by expanding the starter controller forever.

## 2. Current Shape

```txt
backend/
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
└── package.json
```

## 3. Standard Module Shape

When a real domain is implemented, use a module boundary:

```txt
src/[domain]/
├── [domain].module.ts
├── [domain].controller.ts
├── [domain].service.ts
├── dto/
├── entities/ or models/
└── tests/ or *.spec.ts
```

## 4. Controller Rules

- Controllers map HTTP to application behavior.
- Controllers should not own business rules.
- Controllers should not contain persistence logic.
- Keep request/response DTOs explicit.

## 5. Service Rules

- Services own business workflow and domain behavior.
- Services should be testable without HTTP.
- External provider calls should be isolated behind provider/adaptor services.

## 6. Monolith Rules

- A monolithic backend can contain multiple modules.
- Modules should not reach into each other's internals directly.
- Cross-module interaction should happen through exported providers or application services.
- If a module becomes an independent service later, its API/data boundary should already be understandable from docs and contracts.
