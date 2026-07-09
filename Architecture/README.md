# web_cloneMYLTV Architecture Docs

This folder is the single architecture/documentation hub for `web_cloneMYLTV`.

The project currently runs as a standalone monolithic application, with separate frontend and backend folders in the same repository/workspace. The documentation is written so the app can later be integrated as a microservice or product module inside a larger system without rewriting the core architecture rules.

## Read Order For AI/Developers

Follow the same read order defined by the repository root `AGENTS.md`:

1. Start with `README.md` for the documentation map.
2. Read `ARCHITECTURE.md` for the core system architecture.
3. Read `RULES.md` before implementation or validation work.
4. Open only the guide matching the task:
   - frontend feature/UI work: `FRONTEND_GUIDE.md`
   - backend module/API work: `BACKEND_GUIDE.md`
   - API contract work: `CONTRACT_GUIDE.md`
   - monolith-to-microservice decisions: `INTEGRATION_GUIDE.md`
5. Open `PLANS.md` only when the task involves planning/progress tracking.

Do not load every markdown file by default.

## Documents

| File | Purpose |
| --- | --- |
| `ARCHITECTURE.md` | Core architecture and system boundaries. |
| `RULES.md` | Development/documentation rules. |
| `PLANS.md` | Current plan, milestones, risks, and validation history. |
| `FRONTEND_GUIDE.md` | Next.js frontend structure and UI/runtime rules. |
| `BACKEND_GUIDE.md` | NestJS backend module/service rules. |
| `CONTRACT_GUIDE.md` | API contract ownership and frontend/backend sync rules. |
| `INTEGRATION_GUIDE.md` | Future integration path when extracting to microservice/module. |
