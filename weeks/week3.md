

## TL;DR

Ship a clean Express + TypeScript REST API that powers the Frontend Chat MVP from Week 2. In-memory storage (no DB yet), conversations + messages CRUD, validated inputs, consistent error responses, CORS configured, FE wired to real API.

## Learning goals

- Build a clean REST API in Node + Express + TypeScript.
- Apply correct HTTP semantics (methods, status codes).
- Separate concerns into router → controller → service layers.
- Return consistent error responses the frontend can rely on.
- Make the existing Frontend Chat MVP work end-to-end against your real backend.

## Spec

Implement the API contract documented in `API_CONTRACT.md` from Week 2. Endpoints (minimum):

- `POST /auth/login` — accept `{ userId }`, return a fake token + user (no real auth yet, that comes Week 4).
- `GET /conversations` — list conversations for current user, sorted by last message timestamp.
- `POST /conversations` — create a new conversation.
- `GET /conversations/:id/messages?cursor=...&limit=...` — paginated message history.
- `POST /conversations/:id/messages` — create a message in a conversation.

Plus operational concerns:

- Request logging middleware.
- JSON body parsing.
- Input validation (Zod or manual).
- Consistent error shape: `{ error: { code, message, details? } }`.
- CORS configured to allow the FE dev server origin.

## Tech constraints

- Node.js + Express + TypeScript (strict mode).
- In-memory storage only — a module-level Map / array is fine. No real DB this week.
- Clean layering: routes call controllers, controllers call services, services own the data.
- No business logic inside Express handlers.
- No `any`. Every function has an explicit return type.
- No NestJS yet (that's next week).

## Acceptance criteria

- [ ]  All endpoints implemented and matching the contract from Week 2.
- [ ]  Router → controller → service layering enforced (no DB / business logic in routes).
- [ ]  Inputs validated; invalid inputs return `400` with the consistent error shape.
- [ ]  Correct status codes used throughout (`201` on create, `204` on delete-no-content, `404` for missing resources, `409` on conflict).
- [ ]  Request logging middleware logs method + path + status + duration.
- [ ]  CORS works — the FE Chat MVP runs against this backend without code changes (other than API base URL).
- [ ]  FE Chat MVP from Week 2 runs end-to-end against this backend with the mock removed.
- [ ]  `npx tsc --noEmit` passes.

## Submission

- PR on your assigned GitHub repo.
- PR description: summary, list of endpoints, notable design choices.
- Repo runs end-to-end: BE on one terminal, FE on another, real chat conversation possible between two browser tabs.
- Mentor reviews the PR on Sunday.