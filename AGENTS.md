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

## Hard Rules

- Do not create architecture docs outside `Architecture/`.
- Do not modify `package.json` unless explicitly approved by the user.
- Do not add dependencies unless explicitly approved by the user.
- Do not write secrets, tokens, passwords, API keys, or connection strings into docs or code.
- Frontend must not import backend source files directly.
- Backend must not depend on frontend implementation details.
- API behavior changes must update `share_api.json` or the future contract source in the same task.
- Mock data must stay clearly isolated and replaceable by API-backed services.

## Before Final Report

Report:

- files inspected;
- files changed;
- validation commands run and real results;
- docs updated;
- remaining risks/blockers.
