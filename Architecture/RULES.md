# web_cloneMYLTV Rules

## 1. Documentation Rules

- Architecture documentation belongs in `Architecture/`.
- `ARCHITECTURE.md` is the entry point and must stay short.
- Use companion guide files for details.
- Do not create scattered architecture docs under random source folders.
- README files may remain in `front-end/` and `backend/` as package entry points only.

## 2. Implementation Rules

- Do not modify `package.json` unless explicitly approved.
- Do not introduce new dependencies without approval.
- Do not put secrets, tokens, passwords, or connection strings in docs.
- Prefer small module/feature boundaries over large catch-all files.
- Keep frontend mock data clearly separated from future API services.
- Keep backend business rules in services/modules, not controllers.

## 3. Frontend Rules

- Prefer Server Components by default.
- Use Client Components only for browser APIs, interaction state, effects, forms, or client navigation.
- Keep route files thin; route files compose feature components.
- Do not fetch APIs directly inside presentation components.
- Keep reusable UI components free of feature-specific service dependencies.

## 4. Backend Rules

- Use NestJS modules as the main backend boundary.
- Controllers handle HTTP mapping only.
- Services own business behavior.
- DTO/validation/contract rules should be explicit before API consumers depend on them.
- Do not let the starter `AppController` become a long-term domain controller.

## 5. Contract Rules

- `share_api.json` is the temporary shared API source until replaced by OpenAPI or generated contracts.
- API behavior changes must update the contract in the same task.
- Frontend service code should follow the contract rather than inventing response shapes.
- Backend implementation should either satisfy the contract or update it before integration.

## 6. Validation Rules

For docs-only work:

- read changed docs;
- check file paths;
- check references to renamed/moved files.

For code work:

- run the smallest reliable validation command for the touched app;
- record result in `PLANS.md` when the task changes architecture, API behavior, or tracked milestones.
